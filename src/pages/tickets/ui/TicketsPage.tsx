import { useEffect, useState } from 'react';
import { Alert, Button, Card, Empty, Space, Spin, Typography } from 'antd';
import { api, emptyFilters, TicketTable, type Filters, type Page, type Ticket } from '../../../entities/ticket';
import { TicketEditor } from '../../../features/edit-ticket';
import { TicketFilters } from '../../../features/filter-tickets';
export function TicketsPage() {
  // Этап 2: синхронизировать применённые фильтры с URL и Back/Forward.
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters });
  const [page, setPage] = useState<Page | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [reload, setReload] = useState(0);

  // Базовая загрузка уже готова. Кеш-библиотеку можно подключить по желанию.
  useEffect(() => {
    const controller = new AbortController();
    setListLoading(true);
    setListError('');
    setPage(null);
    api.list(filters, null, controller.signal)
      .then(setPage)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setListError(String(error));
      })
      .finally(() => { if (!controller.signal.aborted) setListLoading(false); });
    return () => controller.abort();
  }, [filters, reload]);

  useEffect(() => {
    setTicket(null);
    setDetailError('');
    if (!selectedId) { setDetailLoading(false); return; }
    const controller = new AbortController();
    setDetailLoading(true);
    api.get(selectedId, controller.signal)
      .then(setTicket)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setDetailError(String(error));
      })
      .finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [selectedId, reload]);

 return <main className="tickets-page">
  <header className="page-header"><div><Typography.Text type="secondary">CRM · Практическое интервью</Typography.Text><Typography.Title level={2}>Реестр заявок</Typography.Title></div>
   <Button onClick={() => { api.reset(); setSelectedId(null); setReload((n) => n + 1); }}>Сбросить данные</Button></header>
  <Alert type="info" showIcon message="Готовая заготовка: первая страница, фильтры в памяти, просмотр карточки. Этапы — в условиях задания."/>
  <TicketFilters value={filters} onChange={setFilters}/>
  <div className="tickets-layout">
   <section aria-label="Список заявок"><Card title={`Заявки${page ? ` · ${page.total}` : ''}`} extra={<Button onClick={() => setReload((n) => n + 1)}>Обновить</Button>}>
    {listError && <Alert type="error" role="alert" message={listError}/>}
    <TicketTable items={page?.items ?? []} loading={listLoading} selectedId={selectedId} onSelect={setSelectedId}/>
    {page && <div className="load-more"><Typography.Text type="secondary">Загружено {page.items.length} из {page.total}</Typography.Text>
     {page.nextCursor !== null && <Button disabled>Загрузить ещё — этап 3</Button>}</div>}
   </Card></section>
   <aside aria-label="Карточка заявки"><Card title="Карточка заявки" extra={selectedId && <Button onClick={() => setSelectedId(null)}>Закрыть</Button>}>
    {!selectedId && <Empty description="Выберите заявку в таблице." image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
    {detailLoading && <Spin tip="Загружаем карточку…"><div style={{ minHeight: 100 }}/></Spin>}
    {detailError && <Alert type="error" role="alert" message={detailError} action={<Button onClick={() => setReload((n) => n + 1)}>Повторить</Button>}/>}
    {ticket && <TicketEditor key={ticket.id} ticket={ticket} onSaved={() => {
     // Этап 1: отразить результат мутации в карточке и реестре.
    }}/>}
   </Card></aside>
  </div>
  <footer className="demo-controls"><Space direction="vertical"><Button onClick={() => api.failNextRequest()}>Следующий запрос завершится ошибкой 503</Button>
   <Typography.Text type="secondary">Данные живут в памяти этой вкладки. Перезагрузка возвращает исходные данные.</Typography.Text></Space></footer>
 </main>;
}
