import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';

const customerMenu = [
  { label: 'Dashboard', to: '/dashboard', icon: 'D' },
  { label: 'Home', to: '/', icon: 'H' },
  { label: 'Reviews', to: '/reviews', icon: 'R' },
  { label: 'My Analysis', to: '/analysis-history', icon: 'AH' },
  { label: 'My Predictions', to: '/my-predictions', icon: 'MP' },
  { label: 'Payment', to: '/payment', icon: 'P' },
];

const adminMenu = [
  { label: 'Disease Management', to: '/admin/disease-management', icon: 'DM' },
  { label: 'Analysis Management', to: '/admin/analysis-history', icon: 'AM' },
  { label: 'Reviews Management', to: '/admin/reviews-management', icon: 'RM' },
  { label: 'Predictions', to: '/predictions', icon: 'P' },
  { label: 'Payment', to: '/payment', icon: 'P' },
];

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminSection = location.pathname.startsWith('/admin');
  const menuItems = isAdminSection ? adminMenu : customerMenu;

  return (
    <>
      <Header />

      <div className="min-h-screen pt-24 px-2 md:px-4 pb-6">
        <div className="max-w-screen-2xl mx-auto">
          <aside className="hidden md:block fixed left-4 xl:left-auto top-0 h-screen pt-24 z-40">
            <div className="group h-full">
              <div className="h-full w-20 group-hover:w-72 transition-all duration-300 bg-primary-4/95 backdrop-blur-md rounded-2xl border border-primary-2/30 shadow-2xl p-3 overflow-hidden flex flex-col">
                <div className="mb-3 min-h-10 flex items-center justify-center group-hover:justify-start px-2">
                  <h2 className="text-sm font-bold text-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {isAdminSection ? 'Admin Menu' : 'Customer Menu'}
                  </h2>
                </div>

                <nav className="space-y-2 flex-1">
                  {menuItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 h-12 px-3 rounded-xl font-semibold transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-2 to-primary-1 text-white shadow-lg'
                            : 'text-black hover:bg-primary-3/60'
                        }`
                      }
                    >
                      <span className="w-8 h-8 shrink-0 rounded-lg bg-white/70 border border-primary-2/30 text-xs font-bold flex items-center justify-center">
                        {item.icon}
                      </span>
                      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {item.label}
                      </span>
                    </NavLink>
                  ))}
                </nav>

                  {/* <button
                    onClick={() => navigate('/')}
                    className="mt-3 flex items-center gap-3 h-12 px-3 rounded-xl font-semibold text-red-700 hover:bg-red-100 transition-all duration-300"
                  >
                    <span className="w-8 h-8 shrink-0 rounded-lg bg-red-100 border border-red-200 text-xs font-bold flex items-center justify-center">
                      LO
                    </span>
                    <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Logout
                    </span>
                  </button> */}
              </div>
            </div>
          </aside>

          <aside className="md:hidden fixed top-24 left-2 right-2 z-40 bg-primary-4/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-primary-2/30">
            <nav className="flex gap-2 overflow-auto hide-scrollbar">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-2 to-primary-1 text-white shadow-lg'
                        : 'text-black hover:bg-primary-3/60'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {/* {isAdminSection && (
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 rounded-xl font-semibold whitespace-nowrap text-red-700 hover:bg-red-100 transition-all duration-300"
                >
                  Logout
                </button>
              )} */}
            </nav>
          </aside>

          <main className="min-w-0 pt-20 md:pt-0 md:pl-24">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

export default AppShell;
