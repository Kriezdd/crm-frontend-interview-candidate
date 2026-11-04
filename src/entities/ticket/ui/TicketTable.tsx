import { Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { employees, statusLabels, type Ticket } from '../api/mock-api';
type Props = { items: Ticket[]; loading: boolean; selectedId: string | null; onSelect: (id: string) => void };
export function TicketTable({ items, loading, selectedId, onSelect }: Props) {
 const columns: ColumnsType<Ticket> = [
  { title: 'Заявка', key: 'title', render: (_, row) => <Button type="link" className="ticket-link" onClick={() => onSelect(row.id)}>#{row.id} · {row.title}</Button> },
  { title: 'Клиент', dataIndex: 'customer' },
  { title: 'Статус', dataIndex: 'status', render: (status: Ticket['status']) => <Tag color={status === 'active' ? 'blue' : status === 'closed' ? 'green' : 'default'}>{statusLabels[status]}</Tag> },
  { title: 'Ответственный', dataIndex: 'assigneeId', render: (id: string) => employees.find((employee) => employee.id === id)?.name },
 ];
 return <Table<Ticket> rowKey="id" columns={columns} dataSource={items} loading={loading} pagination={false} scroll={{ x: 720 }} locale={{ emptyText: 'Ничего не найдено. Измените фильтры.' }} rowClassName={(row) => row.id === selectedId ? 'ticket-selected' : ''}/>;
}
