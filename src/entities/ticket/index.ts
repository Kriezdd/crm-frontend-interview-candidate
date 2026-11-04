export { api, ApiError, employees, emptyFilters, statusLabels } from './api/mock-api';
export type { Ticket, TicketPatch, Status, Employee, Filters, Page } from './api/mock-api';
export { TicketTable } from './ui/TicketTable';
export {
  ticketsApi,
  useGetTicketsQuery,
  useGetTicketQuery,
  useUpdateTicketMutation,
} from './api/tickets-api';
export type { TicketApiError } from './api/tickets-api';
