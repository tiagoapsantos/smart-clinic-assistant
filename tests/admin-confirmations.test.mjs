import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve,dirname } from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

// DOM mínimo para executar os handlers reais do dashboard, sem copiar a lógica.
class Element {
  constructor(tag='div'){this.tagName=tag;this.children=[];this.listeners=new Map();this.textContent='';this.value='';}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=[...children];}
  setAttribute(){}
  addEventListener(type,handler){this.listeners.set(type,handler);}
  trigger(type){this.listeners.get(type)?.({target:this});}
}
function descendants(element){return [element,...element.children.flatMap(descendants)];}
function dashboard(answer){
  const elements=new Map();
  for(const id of ['appointment-list','search-appointments','filter-status','admin-feedback','appointment-dialog','appointment-details','reset-demo','close-dialog','stat-total','stat-pending','stat-confirmed','stat-cancelled'])elements.set('#'+id,new Element());
  elements.get('#filter-status').value='all';
  const memory=new Map([['other-app:key','preservar'],['smart-clinic-assistant:appointments:v1','legacy-placeholder']]);
  let writes=0;const prompts=[];
  const context=vm.createContext({crypto:globalThis.crypto,document:{querySelector:selector=>elements.get(selector)??null,createElement:tag=>new Element(tag)},window:{confirm:message=>{prompts.push(message);return answer;}},localStorage:{getItem:key=>memory.get(key)??null,setItem:(key,value)=>{writes++;memory.set(key,value);}}});
  const modules=new Map();
  function load(file){
    file=resolve(file);if(modules.has(file))return modules.get(file).exports;
    const module={exports:{}};modules.set(file,module);
    const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    const run=vm.runInContext('(function(require,module,exports){'+code+'\n})',context,{filename:file});
    run(specifier=>load(resolve(dirname(file),specifier+'.ts')),module,module.exports);return module.exports;
  }
  const store=load('src/lib/appointment-store.ts');
  const {demoAppointments}=load('src/data/demo-appointments.ts');
  const seeded=demoAppointments.map(item=>({...item,status:'confirmed'}));
  seeded.push(store.createDemoAppointment('demo-appointment-2','Outro serviço','2026-11-05','12:00'));
  store.saveAppointments(seeded);writes=0;
  load('src/scripts/admin.ts');
  const raw=()=>memory.get(store.STORAGE_KEY);
  const buttons=()=>descendants(elements.get('#appointment-list')).filter(e=>e.tagName==='button'&&e.textContent==='Apagar');
  return {store,demoAppointments,seeded,elements,memory,prompts,raw,buttons,writes:()=>writes};
}
function checkOtherKeys(h){assert.equal(h.memory.get('other-app:key'),'preservar');assert.equal(h.memory.get('smart-clinic-assistant:appointments:v1'),'legacy-placeholder');}

test('Apagar + cancelar: nenhum pedido, contador ou dado persistido muda',()=>{
 const h=dashboard(false);const before=h.raw();const cards=h.elements.get('#appointment-list').children;
 h.buttons()[1].trigger('click');
 assert.deepEqual(h.prompts,['Apagar o pedido de Rui Exemplo?']);
 assert.equal(h.raw(),before);assert.equal(h.writes(),0);
 assert.equal(h.elements.get('#stat-total').textContent,'4');
 assert.equal(h.elements.get('#appointment-list').children,cards);
 assert.equal(h.elements.get('#admin-feedback').textContent,'');checkOtherKeys(h);
});

test('Apagar + aceitar: remove só o pedido escolhido e persiste após releitura',()=>{
 const h=dashboard(true);const target=h.seeded[1].id;
 h.buttons()[1].trigger('click');
 assert.equal(h.prompts.length,1);assert.equal(h.writes(),1);
 const persisted=h.store.loadAppointments();
 assert.equal(persisted.length,3);assert.ok(!persisted.some(item=>item.id===target));
 assert.deepEqual(Array.from(persisted,i=>i.id),Array.from(h.seeded).filter(i=>i.id!==target).map(i=>i.id));
 assert.equal(h.elements.get('#stat-total').textContent,'3');
 assert.equal(h.elements.get('#stat-confirmed').textContent,'2');
 assert.equal(h.elements.get('#appointment-list').children.length,3);
 assert.equal(h.elements.get('#admin-feedback').textContent,'Pedido apagado.');checkOtherKeys(h);
});

test('Repor + cancelar: preserva pedidos adicionais, estados e armazenamento',()=>{
 const h=dashboard(false);const before=h.raw();const cards=h.elements.get('#appointment-list').children;
 h.elements.get('#reset-demo').trigger('click');
 assert.deepEqual(h.prompts,['Repor os dados fictícios? As alterações locais serão substituídas.']);
 assert.equal(h.raw(),before);assert.equal(h.writes(),0);
 assert.equal(h.elements.get('#stat-total').textContent,'4');
 assert.equal(h.elements.get('#stat-confirmed').textContent,'3');
 assert.equal(h.elements.get('#appointment-list').children,cards);
 assert.equal(h.elements.get('#admin-feedback').textContent,'');checkOtherKeys(h);
});

test('Repor + aceitar: restaura exactamente os três exemplos e os seus estados',()=>{
 const h=dashboard(true);h.elements.get('#reset-demo').trigger('click');
 assert.equal(h.prompts.length,1);assert.equal(h.writes(),1);
 assert.equal(JSON.stringify(h.store.loadAppointments()),JSON.stringify(h.demoAppointments));
 for(const [stat,value] of [['total','3'],['pending','1'],['confirmed','1'],['cancelled','1']])assert.equal(h.elements.get('#stat-'+stat).textContent,value);
 assert.equal(h.elements.get('#appointment-list').children.length,3);
 assert.equal(h.elements.get('#admin-feedback').textContent,'Dados de demonstração repostos.');checkOtherKeys(h);
});
