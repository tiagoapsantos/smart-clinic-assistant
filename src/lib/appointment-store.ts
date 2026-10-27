import { demoAppointments } from '../data/demo-appointments';
import type { Appointment, AppointmentStatus } from '../types/appointment';
export const STORAGE_KEY = 'smart-clinic-assistant:demo-only:v2';
export const MAX_APPOINTMENTS = 50;
export const services = ['Consulta geral', 'Consulta de acompanhamento', 'Outro serviço'];
const statuses: AppointmentStatus[] = ['pending', 'confirmed', 'cancelled'];
function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date=new Date(value+'T00:00:00.000Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10)===value;
}
export function createDemoAppointment(scenarioId: string, service: string, date: string, time: string): Appointment {
  const scenario=demoAppointments.find(item=>item.id===scenarioId);
  if(!scenario || !services.includes(service) || !validDate(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Seleccione apenas opções válidas de demonstração.');
  return {...scenario,id:crypto.randomUUID(),service,preferredDate:date,preferredTime:time,status:'pending',createdAt:new Date().toISOString()};
}
function scenarioFor(item: Appointment) {
  return demoAppointments.find(s=>s.fullName===item.fullName && s.email===item.email && s.phone===item.phone && s.message===item.message);
}
function encode(item: Appointment) {
  const scenario=scenarioFor(item);
  if(!scenario || !/^(?:demo-appointment-[123]|[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})$/.test(item.id) || !services.includes(item.service) || !validDate(item.preferredDate) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(item.preferredTime) || !statuses.includes(item.status) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(item.createdAt) || !Number.isFinite(Date.parse(item.createdAt)))throw new Error('Apenas dados fictícios predefinidos são permitidos.');
  return {id:item.id,scenarioId:scenario.id,service:item.service,preferredDate:item.preferredDate,preferredTime:item.preferredTime,status:item.status,createdAt:item.createdAt};
}
function copyDemo(): Appointment[] { return demoAppointments.map(item=>({...item})); }
/** Nunca lê a antiga chave que aceitava texto livre. Guarda apenas opções de cenários. */
export function saveAppointments(items: Appointment[]): void {
  if(items.length>MAX_APPOINTMENTS || new Set(items.map(i=>i.id)).size!==items.length)throw new Error('Limite de 50 pedidos fictícios ou identificadores inválidos.');
  const encoded=items.map(encode);
  localStorage.setItem(STORAGE_KEY,JSON.stringify(encoded));
}
export function loadAppointments(): Appointment[] {
  try {
    const stored=localStorage.getItem(STORAGE_KEY);
    if(stored===null){const initial=copyDemo();saveAppointments(initial);return initial;}
    const rows: unknown=JSON.parse(stored);
    if(!Array.isArray(rows)||rows.length>MAX_APPOINTMENTS)throw new Error('Formato inválido');
    const allowed=['id','scenarioId','service','preferredDate','preferredTime','status','createdAt'];
    const items=rows.map(row=>{
      if(!row || typeof row!=='object' || Object.keys(row).length!==allowed.length || !allowed.every(k=>typeof row[k]==='string'))throw new Error('Formato inválido');
      const scenario=demoAppointments.find(s=>s.id===row.scenarioId);
      if(!scenario)throw new Error('Cenário inválido');
      const item={...scenario,id:row.id,service:row.service,preferredDate:row.preferredDate,preferredTime:row.preferredTime,status:row.status,createdAt:row.createdAt};
      encode(item);return item;
    });
    if(new Set(items.map(i=>i.id)).size!==items.length)throw new Error('Identificadores duplicados');
    return items;
  }catch{return copyDemo();}
}
export function resetAppointments(): Appointment[] {const items=copyDemo();saveAppointments(items);return items;}
