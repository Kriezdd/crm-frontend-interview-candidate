import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query';
import { Alert, Button, Card, Empty, Space, Spin, Typography } from 'antd';
import {
  api,
  emptyFilters,
  TicketTable,
  ticketsApi,
  useGetTicketsQuery,
  useGetTicketQuery,
  type Filters,
} from '../../../entities/ticket';
import { TicketEditor } from '../../../features/edit-ticket';
import { TicketFilters } from '../../../features/filter-tickets';
export function TicketsPage() {
  // Дополнительный сценарий: перенести применённые фильтры в URL.
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dispatch = useDispatch();
  const ticketsQuery = useGetTicketsQuery({ filters });
  const ticketQuery = useGetTicketQuery(selectedId ?? skipToken);
  // currentData относится только к текущим аргументам: прежняя выборка/карточка не мелькает при переключении.
  const page = ticketsQuery.currentData;
  const ticket = ticketQuery.currentData;
  const errorMessage = (error: unknown) =>
    error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : 'Не удалось загрузить данные';
  return (
    <main className="tickets-page">
      <header className="page-header">
        <div>
          <Typography.Text type="secondary">CRM · Практическое интервью</Typography.Text>
          <Typography.Title level={2}>Реестр заявок</Typography.Title>
        </div>
        <Button
          onClick={() => {
            api.reset();
            setSelectedId(null);
            dispatch(ticketsApi.util.resetApiState());
          }}
        >
          Сбросить данные
        </Button>
      </header>
      <Alert
        type="info"
        showIcon
        message="Готовая заготовка: первая страница, фильтры в памяти, просмотр карточки. Основная задача — форма и актуальные данные."
      />
      <TicketFilters value={filters} onChange={setFilters} />
      <div className="tickets-layout">
        <section aria-label="Список заявок">
          <Card
            title={`Заявки${page ? ` · ${page.total}` : ''}`}
            extra={<Button onClick={() => ticketsQuery.refetch()}>Обновить</Button>}
          >
            {ticketsQuery.isError && (
              <Alert type="error" role="alert" message={errorMessage(ticketsQuery.error)} />
            )}
            <TicketTable
              items={page?.items ?? []}
              loading={ticketsQuery.isFetching}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            {page && (
              <div className="load-more">
                <Typography.Text type="secondary">
                  Загружено {page.items.length} из {page.total}
                </Typography.Text>
                {page.nextCursor !== null && (
                  <Button disabled>Загрузить ещё — дополнительный сценарий</Button>
                )}
              </div>
            )}
          </Card>
        </section>
        <aside aria-label="Карточка заявки">
          <Card
            title="Карточка заявки"
            extra={selectedId && <Button onClick={() => setSelectedId(null)}>Закрыть</Button>}
          >
            {!selectedId && (
              <Empty
                description="Выберите заявку в таблице."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
            {ticketQuery.isFetching && !ticket && (
              <Spin tip="Загружаем карточку…">
                <div style={{ minHeight: 100 }} />
              </Spin>
            )}
            {ticketQuery.isError && (
              <Alert
                type="error"
                role="alert"
                message={errorMessage(ticketQuery.error)}
                action={<Button onClick={() => ticketQuery.refetch()}>Повторить</Button>}
              />
            )}
            {ticket && (
              <TicketEditor
                key={ticket.id}
                ticket={ticket}
                onSaved={() => {
                  // ЗАДАНИЕ: отразить результат сохранения в карточке и реестре.
                  // Можно использовать этот callback или настроить обновление в ticketsApi.
                }}
              />
            )}
          </Card>
        </aside>
      </div>
      <footer className="demo-controls">
        <Space direction="vertical">
          <Button onClick={() => api.failNextRequest()}>
            Следующий запрос завершится ошибкой 503
          </Button>
          <Typography.Text type="secondary">
            Данные живут в памяти этой вкладки. Перезагрузка возвращает исходные данные.
          </Typography.Text>
        </Space>
      </footer>
    </main>
  );
}
