import { loadAppointments, resetAppointments, saveAppointments } from '../lib/appointment-store';
import type { Appointment, AppointmentStatus } from '../types/appointment';

const list = document.querySelector<HTMLElement>('#appointment-list');
const search = document.querySelector<HTMLInputElement>('#search-appointments');
const filter = document.querySelector<HTMLSelectElement>('#filter-status');
const feedback = document.querySelector<HTMLElement>('#admin-feedback');
const dialog = document.querySelector<HTMLDialogElement>('#appointment-dialog');
const details = document.querySelector<HTMLElement>('#appointment-details');

const labels: Record<AppointmentStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

let appointments = loadAppointments();

function formatDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' }).format(new Date(year, month - 1, day));
}

function updateStats(): void {
  const counts = {
    total: appointments.length,
    pending: appointments.filter((item) => item.status === 'pending').length,
    confirmed: appointments.filter((item) => item.status === 'confirmed').length,
    cancelled: appointments.filter((item) => item.status === 'cancelled').length,
  };
  for (const [key, value] of Object.entries(counts)) {
    const element = document.querySelector<HTMLElement>(`#stat-${key}`);
    if (element) element.textContent = String(value);
  }
}

function makeDetail(label: string, value: string): HTMLElement {
  const wrapper = document.createElement('div');
  const term = document.createElement('dt');
  const description = document.createElement('dd');
  term.textContent = label;
  description.textContent = value || '—';
  wrapper.append(term, description);
  return wrapper;
}

function showDetails(appointment: Appointment): void {
  if (!dialog || !details) return;
  details.replaceChildren(
    makeDetail('Nome completo', appointment.fullName),
    makeDetail('Email', appointment.email),
    makeDetail('Telefone', appointment.phone),
    makeDetail('Serviço', appointment.service),
    makeDetail('Data preferida', formatDate(appointment.preferredDate)),
    makeDetail('Hora preferida', appointment.preferredTime),
    makeDetail('Estado', labels[appointment.status]),
    makeDetail('Mensagem administrativa', appointment.message),
  );
  dialog.showModal();
}

function renderList(): void {
  if (!list) return;
  const query = search?.value.trim().toLocaleLowerCase('pt-PT') ?? '';
  const selectedStatus = filter?.value ?? 'all';
  const visible = appointments.filter((appointment) => {
    const searchable = [appointment.fullName, appointment.email, appointment.phone, appointment.service]
      .join(' ').toLocaleLowerCase('pt-PT');
    return searchable.includes(query) && (selectedStatus === 'all' || appointment.status === selectedStatus);
  });

  list.replaceChildren();
  if (visible.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = appointments.length === 0 ? 'Ainda não existem pedidos. Pode repor os dados de demonstração.' : 'Não foram encontradas marcações com estes filtros.';
    list.append(empty);
    return;
  }

  for (const appointment of visible) {
    const card = document.createElement('article');
    card.className = 'appointment-card';

    const summary = document.createElement('div');
    summary.className = 'appointment-summary';
    const name = document.createElement('h3');
    name.textContent = appointment.fullName;
    const meta = document.createElement('p');
    meta.textContent = `${appointment.service} · ${formatDate(appointment.preferredDate)} às ${appointment.preferredTime}`;
    const contact = document.createElement('p');
    contact.className = 'appointment-contact';
    contact.textContent = `${appointment.email} · ${appointment.phone}`;
    const badge = document.createElement('span');
    badge.className = `status-badge status-${appointment.status}`;
    badge.textContent = labels[appointment.status];
    summary.append(name, meta, contact, badge);

    const actions = document.createElement('div');
    actions.className = 'appointment-actions';
    const detailsButton = document.createElement('button');
    detailsButton.className = 'text-button';
    detailsButton.type = 'button';
    detailsButton.textContent = 'Ver detalhes';
    detailsButton.addEventListener('click', () => showDetails(appointment));

    const statusLabel = document.createElement('label');
    statusLabel.className = 'status-control';
    const statusText = document.createElement('span');
    statusText.textContent = 'Estado';
    const statusSelect = document.createElement('select');
    statusSelect.setAttribute('aria-label', `Estado da marcação de ${appointment.fullName}`);
    for (const status of ['pending', 'confirmed', 'cancelled'] as AppointmentStatus[]) {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = labels[status];
      option.selected = appointment.status === status;
      statusSelect.append(option);
    }
    statusSelect.addEventListener('change', () => {
      appointments = appointments.map((item) => item.id === appointment.id
        ? { ...item, status: statusSelect.value as AppointmentStatus }
        : item);
      persistAndRender('Estado da marcação actualizado.');
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'text-button text-danger';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Apagar';
    deleteButton.addEventListener('click', () => {
      if (!window.confirm(`Apagar o pedido de ${appointment.fullName}?`)) return;
      appointments = appointments.filter((item) => item.id !== appointment.id);
      persistAndRender('Pedido apagado.');
    });

    const stateField = document.createElement('div');
    stateField.append(statusText, statusSelect);
    statusLabel.append(stateField);
    actions.append(detailsButton, statusLabel, deleteButton);
    card.append(summary, actions);
    list.append(card);
  }
}

function persistAndRender(message: string): void {
  try {
    saveAppointments(appointments);
    if (feedback) feedback.textContent = message;
  } catch {
    if (feedback) feedback.textContent = 'Não foi possível guardar as alterações no armazenamento local.';
  }
  updateStats();
  renderList();
}

search?.addEventListener('input', renderList);
filter?.addEventListener('change', renderList);
document.querySelector<HTMLButtonElement>('#reset-demo')?.addEventListener('click', () => {
  if (!window.confirm('Repor os dados fictícios? As alterações locais serão substituídas.')) return;
  try {
    appointments = resetAppointments();
    if (feedback) feedback.textContent = 'Dados de demonstração repostos.';
    updateStats();
    renderList();
  } catch {
    if (feedback) feedback.textContent = 'Não foi possível repor os dados neste navegador.';
  }
});
document.querySelector<HTMLButtonElement>('#close-dialog')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

updateStats();
renderList();
