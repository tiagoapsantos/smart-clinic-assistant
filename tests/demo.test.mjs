import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const temp=await mkdtemp(resolve(tmpdir(),'clinic-test-'));
for(const [input,output] of [['src/data/demo-appointments.ts','demo.mjs'],['src/lib/appointment-store.ts','store.mjs']]){
 let source=await readFile(input,'utf8');source=source.replace("'../data/demo-appointments'","'./demo.mjs'");
 await writeFile(resolve(temp,output),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
}
const store=await import(pathToFileURL(resolve(temp,'store.mjs')).href);
const {demoAppointments}=await import(pathToFileURL(resolve(temp,'demo.mjs')).href);
let memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
after(()=>rm(temp,{recursive:true,force:true}));
const fixture=()=>demoAppointments.map(x=>({...x}));
const create=()=>store.createDemoAppointment('demo-appointment-1','Consulta geral','2026-11-05','09:30');
test('cenário fixo cria apenas identidade e mensagem fictícias',()=>{const i=create();assert.equal(i.email,'ana.demonstracao@example.invalid');assert.equal(i.status,'pending');assert.match(i.id,/^[0-9a-f-]{36}$/);});
test('opções arbitrárias, data impossível e hora inválida são rejeitadas',()=>{for(const args of [['real','Consulta geral','2026-11-05','09:30'],['demo-appointment-1','Diagnóstico','2026-11-05','09:30'],['demo-appointment-1','Consulta geral','2026-02-30','09:30'],['demo-appointment-1','Consulta geral','2026-11-05','24:00']])assert.throws(()=>store.createDemoAppointment(...args));});
test('contactos e texto livre alterados são rejeitados antes de persistir',()=>{for(const field of ['fullName','email','phone','message']){const i=create();i[field]='Texto real não permitido';assert.throws(()=>store.saveAppointments([i]));}});
test('persistência contém só metadados de cenários e preserva gestão de estados',()=>{memory.clear();const i=create();i.status='confirmed';store.saveAppointments([i]);const raw=memory.get(store.STORAGE_KEY);assert.ok(!raw.includes('fullName')&&!raw.includes('email')&&!raw.includes('message'));assert.equal(store.loadAppointments()[0].status,'confirmed');assert.equal(store.loadAppointments()[0].fullName,'Ana Demonstração');});
test('chave antiga nunca é lida ou apagada e conteúdo inválido não é apresentado',()=>{memory.clear();const legacy='smart-clinic-assistant:appointments:v1';memory.set(legacy,'private legacy placeholder');assert.equal(store.loadAppointments().length,3);assert.equal(memory.get(legacy),'private legacy placeholder');memory.set(store.STORAGE_KEY,JSON.stringify([{...create(),fullName:'arbitrary'}]));assert.equal(store.loadAppointments()[0].id,'demo-appointment-1');});
test('limites, IDs duplicados e estados desconhecidos são rejeitados',()=>{assert.throws(()=>store.saveAppointments(Array.from({length:51},create)));const i=create();assert.throws(()=>store.saveAppointments([i,i]));i.status='unknown';assert.throws(()=>store.saveAppointments([i]));});
test('remoção, reposição e falha de armazenamento',()=>{memory.clear();store.saveAppointments([]);assert.deepEqual(store.loadAppointments(),[]);assert.equal(store.resetAppointments().length,3);const previous=globalThis.localStorage;globalThis.localStorage={getItem(){throw Error('blocked')},setItem(){throw Error('quota')}};assert.equal(store.loadAppointments().length,3);assert.throws(()=>store.saveAppointments(fixture()));globalThis.localStorage=previous;});
test('caminhos e CSP do build estático não dependem da raiz',async()=>{for(const page of ['index.html','admin/index.html','404.html']){const html=await readFile('dist/'+page,'utf8');assert.match(html,/connect-src &#39;none&#39;|connect-src 'none'/);assert.doesNotMatch(html,/<script(?![^>]*src=)[^>]*>/);for(const [,path] of html.matchAll(/(?:href|src)="([^"#]+)"/g)){assert.ok(path.startsWith('/smart-clinic-assistant/'),path);await readFile('dist/'+(path.slice('/smart-clinic-assistant/'.length)||'index.html').replace(/admin\/$/,'admin/index.html'));}}assert.equal((await readFile('dist/.nojekyll')).length,0);});
