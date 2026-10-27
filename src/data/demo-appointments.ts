import type { Appointment } from '../types/appointment';

function localDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Registos demonstrativos, renovados quando o utilizador repõe os dados. */
export const demoAppointments: Appointment[] = [
  {
    id: 'demo-appointment-1',
    fullName: 'Ana Demonstração',
    email: 'ana.demonstracao@example.invalid',
    phone: '000 000 001',
    service: 'Consulta geral',
    preferredDate: localDateOffset(2),
    preferredTime: '09:30',
    message: 'Preferência por contacto por email.',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-appointment-2',
    fullName: 'Rui Exemplo',
    email: 'rui.exemplo@example.invalid',
    phone: '000 000 002',
    service: 'Consulta de acompanhamento',
    preferredDate: localDateOffset(4),
    preferredTime: '11:00',
    message: '',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-appointment-3',
    fullName: 'Marta Teste',
    email: 'marta.teste@example.invalid',
    phone: '000 000 003',
    service: 'Outro serviço',
    preferredDate: localDateOffset(6),
    preferredTime: '15:30',
    message: 'Pedido de informação sobre horários disponíveis.',
    status: 'cancelled',
    createdAt: new Date().toISOString(),
  },
];
