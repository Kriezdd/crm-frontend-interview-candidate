import { Alert, Descriptions, Typography } from 'antd';
import { employees, statusLabels, type Ticket } from '../../../entities/ticket';
type Props = { ticket: Ticket; onSaved: (ticket: Ticket) => void };
// Этап 1: заменить просмотр формой и вызвать onSaved после успешной мутации.
// Можно использовать Form Ant Design или знакомую библиотеку форм.
export function TicketEditor({ ticket }: Props) {
 return <>
  <Typography.Title level={5}>#{ticket.id} · {ticket.title}</Typography.Title>
  <Descriptions column={1} items={[
   { key: 'customer', label: 'Клиент', children: ticket.customer },
   { key: 'status', label: 'Статус', children: statusLabels[ticket.status] },
   { key: 'assignee', label: 'Ответственный', children: employees.find(({ id }) => id === ticket.assigneeId)?.name },
  ]}/>
  <Alert type="info" message="Здесь будет форма изменения статуса и ответственного."/>
 </>;
}
