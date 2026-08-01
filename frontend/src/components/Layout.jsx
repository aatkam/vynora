import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-column"><Outlet /></main>
      <RightPanel />
      <MobileNav />
    </div>
  );
}
