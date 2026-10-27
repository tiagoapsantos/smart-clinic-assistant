export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

/** Dados administrativos de uma marcação; não guardar informação clínica. */
export interface Appointment {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: AppointmentStatus;
  createdAt: string;
}
