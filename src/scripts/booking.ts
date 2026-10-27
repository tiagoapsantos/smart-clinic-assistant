import { loadAppointments,saveAppointments,createDemoAppointment } from '../lib/appointment-store';
import { demoAppointments } from '../data/demo-appointments';
const form=document.querySelector<HTMLFormElement>('#appointment-form');
const feedback=document.querySelector<HTMLElement>('#form-feedback');
const dateInput=document.querySelector<HTMLInputElement>('#preferred-date');
const person=document.querySelector<HTMLSelectElement>('#demo-person');
if(form&&feedback&&dateInput&&person){
 const today=new Date();dateInput.min=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
 const syncPerson=()=>{const p=demoAppointments.find(p=>p.id===person.value)!;for(const [id,value] of [['full-name',p.fullName],['email',p.email],['phone',p.phone],['message',p.message]]){const field=document.getElementById(id) as HTMLInputElement|HTMLTextAreaElement;field.value=value;}};
 person.addEventListener('change',syncPerson);
 form.addEventListener('submit',event=>{
  event.preventDefault();feedback.textContent='';if(!form.reportValidity())return;
  try{const values=new FormData(form);const item=createDemoAppointment(person.value,String(values.get('service')),String(values.get('preferredDate')),String(values.get('preferredTime')));saveAppointments([item,...loadAppointments()]);form.reset();syncPerson();feedback.textContent='Pedido fictício guardado neste navegador. Não foi enviada nem criada uma marcação real.';}
  catch(error){feedback.textContent='Não foi possível guardar a simulação. Limite: 50 pedidos fictícios; o navegador também pode bloquear o armazenamento.';}
 });
}
