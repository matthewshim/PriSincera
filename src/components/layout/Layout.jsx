import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TelescopeCursor from '../hero/TelescopeCursor';

function Layout() {
  return (
    <>
      <TelescopeCursor />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;
