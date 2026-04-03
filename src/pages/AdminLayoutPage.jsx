import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PopupModal from '../components/PopupModal';

function AdminLayoutPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Simple password protection; replace with real auth in production.
  const ADMIN_PASSWORD = 'admin123';

  const handleLogin = (event) => {
    event.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      return;
    }

    setShowPopup(true);
  };

  // if (!isAuthenticated) {
  //   return (
  //     <div className="max-w-md mx-auto space-y-6">
  //       <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-primary-2/30">
  //         <h2 className="text-2xl font-bold text-black mb-6 text-center">
  //           Admin Login
  //         </h2>

  //         <form onSubmit={handleLogin} className="space-y-4">
  //           <div>
  //             <label className="block text-sm font-medium text-black mb-2">
  //               Admin Password
  //             </label>
  //             <input
  //               type="password"
  //               value={password}
  //               onChange={(event) => setPassword(event.target.value)}
  //               required
  //               placeholder="Enter admin password"
  //               className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
  //             />
  //           </div>

  //           <button
  //             type="submit"
  //             className="w-full py-3 px-6 bg-gradient-to-r from-primary-2 to-primary-1 text-white font-bold rounded-xl hover:from-primary-2/90 hover:to-primary-1/90 transition-all duration-300 shadow-lg"
  //           >
  //             Login
  //           </button>
  //         </form>

  //         <p className="text-xs text-black/60 mt-4 text-center">
  //           Default password: admin123
  //         </p>
  //       </div>

  //       <PopupModal
  //         isOpen={showPopup}
  //         title="Login Failed"
  //         message="Incorrect password!"
  //         onClose={() => setShowPopup(false)}
  //       />
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <div>
          <h2 className="text-3xl font-bold text-black mb-2">Admin Dashboard</h2>
          <p className="text-black/70">
            Manage diseases, users, review system activity, monitor
            subscriptions and payments
          </p>
        </div>
      </div>

      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayoutPage;
