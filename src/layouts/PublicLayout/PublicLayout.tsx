import { Outlet } from 'react-router-dom';
import { MainHeader } from '../../components/Layout/MainHeader';
import { Footer } from '../../components/Layout/Footer';

export function PublicLayout() {
  return (
    <div className="public-layout">
      <MainHeader />
      <main className="public-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
