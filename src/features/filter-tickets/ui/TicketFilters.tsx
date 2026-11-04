import { Button, Form, Input, Select } from 'antd';
import { employees, emptyFilters, statusLabels, type Filters } from '../../../entities/ticket';
type Props = { value: Filters; onChange: (value: Filters) => void };
export function TicketFilters({ value, onChange }: Props) {
 return <Form layout="vertical" className="ticket-filters" aria-label="Фильтры">
  <Form.Item label="Поиск" htmlFor="ticket-search"><Input id="ticket-search" value={value.q} placeholder="Тема или клиент" onChange={(e) => onChange({ ...value, q: e.target.value })}/></Form.Item>
  <Form.Item label="Статус" htmlFor="ticket-status"><Select id="ticket-status" value={value.status} onChange={(status: Filters['status']) => onChange({ ...value, status })} options={[{ value: '', label: 'Все статусы' }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))]}/></Form.Item>
  <Form.Item label="Ответственный" htmlFor="ticket-assignee"><Select id="ticket-assignee" value={value.assigneeId} onChange={(assigneeId: string) => onChange({ ...value, assigneeId })} options={[{ value: '', label: 'Все сотрудники' }, ...employees.map(({ id, name }) => ({ value: id, label: name }))]}/></Form.Item>
  <Form.Item><Button onClick={() => onChange({ ...emptyFilters })}>Сбросить фильтры</Button></Form.Item>
 </Form>;
}
