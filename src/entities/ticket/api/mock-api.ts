export type Status = 'new' | 'active' | 'closed';
export type Employee = { id: string; name: string };
export type Ticket = {
  id: string;
  title: string;
  customer: string;
  status: Status;
  assigneeId: string;
};
export type Filters = { q: string; status: Status | ''; assigneeId: string };
export type Page = { items: Ticket[]; nextCursor: string | null; total: number };
export type TicketPatch = Pick<Ticket, 'status' | 'assigneeId'>;

export const employees: Employee[] = [
  { id: 'anna', name: 'Анна Иванова' },
  { id: 'max', name: 'Максим Петров' },
  { id: 'olga', name: 'Ольга Смирнова' },
];
export const statusLabels: Record<Status, string> = {
  new: 'Новая',
  active: 'В работе',
  closed: 'Закрыта',
};
export const emptyFilters: Filters = { q: '', status: '', assigneeId: '' };

export class ApiError extends Error {
  status: number;
  fieldErrors: Partial<Record<keyof TicketPatch, string>>;
  constructor(
    status: number,
    message: string,
    fieldErrors: Partial<Record<keyof TicketPatch, string>> = {},
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const statuses: Status[] = ['new', 'active', 'closed'];
const titles = ['Доступ к CRM', 'Ошибка в счёте', 'Смена тарифа', 'Новый договор'];
const customers = ['Север', 'Маяк', 'Вектор', 'Орбита', 'Спектр'];

// Создаётся отдельно для изоляции тестов. В приложении используйте экспорт api.
export function createApi(latency = 350) {
  const seed = (): Ticket[] =>
    Array.from({ length: 84 }, (_, i) => ({
      id: String(i + 1),
      title: `${titles[i % titles.length]} №${i + 1}`,
      customer: customers[i % customers.length],
      status: statuses[i % 3],
      assigneeId: employees[Math.floor(i / 3) % employees.length].id,
    }));
  let rows = seed();
  let failNext = false;
  const pause = async (signal?: AbortSignal) => {
    // Имитирует транспорт: отменённый запрос не возвращает результат.
    await new Promise<void>((resolve) => setTimeout(resolve, latency));
    if (signal?.aborted) throw new DOMException('Запрос отменён', 'AbortError');
    if (failNext) {
      failNext = false;
      throw new ApiError(503, 'Сервис временно недоступен. Повторите попытку.');
    }
  };
  return {
    async list(
      filters: Filters,
      cursor: string | null = null,
      signal?: AbortSignal,
    ): Promise<Page> {
      await pause(signal);
      const q = filters.q.trim().toLocaleLowerCase();
      const matching = rows.filter(
        (row) =>
          (!q || `${row.title} ${row.customer}`.toLocaleLowerCase().includes(q)) &&
          (!filters.status || row.status === filters.status) &&
          (!filters.assigneeId || row.assigneeId === filters.assigneeId),
      );
      const offset = cursor === null ? 0 : Number(cursor);
      if (!Number.isInteger(offset) || offset < 0) throw new ApiError(400, 'Некорректный курсор');
      const end = offset + 12;
      return {
        items: matching.slice(offset, end).map((row) => ({ ...row })),
        nextCursor: end < matching.length ? String(end) : null,
        total: matching.length,
      };
    },
    async get(id: string, signal?: AbortSignal): Promise<Ticket> {
      await pause(signal);
      const ticket = rows.find((row) => row.id === id);
      if (!ticket) throw new ApiError(404, 'Заявка не найдена');
      return { ...ticket };
    },
    async update(id: string, patch: TicketPatch): Promise<Ticket> {
      await pause();
      const ticket = rows.find((row) => row.id === id);
      if (!ticket) throw new ApiError(404, 'Заявка не найдена');
      const errors: Partial<Record<keyof TicketPatch, string>> = {};
      if (!employees.some((employee) => employee.id === patch.assigneeId))
        errors.assigneeId = 'Выберите сотрудника';
      if (!statuses.includes(patch.status)) errors.status = 'Выберите статус';
      if (patch.status === 'closed' && patch.assigneeId === 'max') {
        errors.assigneeId = 'Максим не может принимать закрытые заявки';
      }
      if (Object.keys(errors).length) throw new ApiError(422, 'Проверьте поля', errors);
      Object.assign(ticket, patch);
      return { ...ticket };
    },
    failNextRequest() {
      failNext = true;
    },
    reset() {
      rows = seed();
      failNext = false;
    },
  };
}

// Общий сервер для вкладок не нужен: это локальная имитация API одного сеанса.
export const api = createApi();
