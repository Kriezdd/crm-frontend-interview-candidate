import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  api,
  ApiError,
  type Filters,
  type Page,
  type Ticket,
  type TicketPatch,
} from './mock-api.ts';

export type TicketApiError = {
  status: number;
  message: string;
  fieldErrors: Partial<Record<keyof TicketPatch, string>>;
};

async function request<T>(
  operation: () => Promise<T>,
): Promise<{ data: T } | { error: TicketApiError }> {
  try {
    return { data: await operation() };
  } catch (error) {
    return {
      error:
        error instanceof ApiError
          ? { status: error.status, message: error.message, fieldErrors: error.fieldErrors }
          : {
              status: 500,
              message: error instanceof Error ? error.message : 'Не удалось выполнить запрос',
              fieldErrors: {},
            },
    };
  }
}

export const ticketsApi = createApi({
  reducerPath: 'ticketsApi',
  baseQuery: fakeBaseQuery<TicketApiError>(),
  endpoints: (build) => ({
    getTickets: build.query<Page, { filters: Filters; cursor?: string | null }>({
      queryFn: ({ filters, cursor = null }, { signal }) =>
        request(() => api.list(filters, cursor, signal)),
    }),
    getTicket: build.query<Ticket, string>({
      queryFn: (id, { signal }) => request(() => api.get(id, signal)),
    }),
    updateTicket: build.mutation<Ticket, { id: string; patch: TicketPatch }>({
      queryFn: ({ id, patch }) => request(() => api.update(id, patch)),
      // Этап 1: выбрать политику обновления кеша карточки и списков после успеха.
      // Инвалидация и ручное обновление намеренно не реализованы.
    }),
  }),
});

export const { useGetTicketsQuery, useGetTicketQuery, useUpdateTicketMutation } = ticketsApi;
