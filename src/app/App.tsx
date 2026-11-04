import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { TicketsPage } from '../pages/tickets';
import 'antd/dist/reset.css';
import './styles.css';
export function App() {
 return <ConfigProvider locale={ruRU} theme={{ token: { colorPrimary: '#245bbd', borderRadius: 8 } }}><TicketsPage /></ConfigProvider>;
}
