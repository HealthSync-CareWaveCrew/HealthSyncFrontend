import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import { MdDashboard, MdRateReview } from 'react-icons/md';
import { FaHeartbeat, FaHistory, FaMoneyCheck, FaUsers } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const customerMenu = [
  { label: 'Dashboard', to: '/dashboard', icon: <MdDashboard /> },
  { label: 'Home', to: '/', icon: <FaHeartbeat /> },
  { label: 'Reviews', to: '/reviews', icon: <MdRateReview /> },
  { label: 'My Analysis', to: '/analysis-history', icon: <FaHistory /> },
  { label: 'Payment', to: '/payment', icon: <FaMoneyCheck /> },
];

const adminMenu = [ 
  { label: 'Dashboard', to: '/admin/dashboard', icon: <MdDashboard /> },
  { label: 'Disease Management', to: '/admin/disease-management', icon: <FaHeartbeat /> },
  { label: 'Analysis Management', to: '/admin/analysis-history', icon: <FaHistory /> },
  { label: 'Reviews Management', to: '/admin/reviews-management', icon: <MdRateReview /> },
  { label: 'Users Management', to: '/admin/users-management', icon: <FaUsers /> },
  { label: 'Payments Management', to: '/admin/payments-management', icon: <FaMoneyCheck /> },
];

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdminSection = location.pathname.startsWith('/admin');
  const menuItems = isAdminSection ? adminMenu : customerMenu;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle menu item click
  const handleMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <Header />

      <div className="min-h-screen pt-12 px-2 md:px-4 pb-6 bg-white">
        <div className="max-w-screen-2xl mx-auto">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden fixed bottom-4 right-4 z-50 bg-primary-1 text-white p-3 rounded-full shadow-lg hover:bg-primary-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Sidebar */}
          <div className="group hidden md:block">
            <div className="fixed inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30" />
            <aside className="fixed left-4 xl:left-auto top-0 h-screen pt-24 z-40">
              <div className="min-h-[85vh] w-20 group-hover:w-72 transition-all duration-300 bg-primary-1 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-3 overflow-hidden flex flex-col mb-3">
                <div className="mb-3 min-h-10 flex items-center justify-center group-hover:justify-start px-2">
                  <h2 className="text-sm font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                            ? 'bg-white/20 text-white shadow-lg'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <span className="w-8 h-8 shrink-0 rounded-lg bg-white/20 border border-white/30 text-white flex items-center justify-center">
                        {item.icon}
                      </span>
                      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {item.label}
                      </span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            </aside>
          </div>

          {/* Mobile Sidebar - Overlay */}
          {isMobileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <aside className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-primary-1 shadow-2xl md:hidden transform transition-transform duration-300">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-white/20">
                    <h2 className="text-lg font-bold text-white">
                      {isAdminSection ? 'Admin Menu' : 'Customer Menu'}
                    </h2>
                  </div>
                  <nav className="flex-1 overflow-y-auto py-4">
                    {menuItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        onClick={handleMenuClick}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg font-semibold transition-all duration-300 ${
                            isActive
                              ? 'bg-white/20 text-white shadow-lg'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`
                        }
                      >
                        <span className="w-6 h-6 shrink-0 rounded-lg flex items-center justify-center">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </aside>
            </>
          )}

          <main className="min-w-0 pt-20 md:pt-0 md:pl-24">
            <Outlet />
          </main>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}

export default AppShell;