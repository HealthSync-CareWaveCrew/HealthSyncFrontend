import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser, logout as logoutApi } from '../Redux/Api/api';
import { forceLogout } from '../Redux/Features/authSlice';
import EditProfileModal from '../components/User/EditProfileModal';
import toast from 'react-hot-toast';
import { FaHandHoldingHeart, FaUser, FaHome, FaSignOutAlt, FaUserEdit } from 'react-icons/fa';

function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    checkUser();
    
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAuthenticated]);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await getCurrentUser();
        const userData = response.data?.data?.user;
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
  if (isLoggingOut) return;
  
  setIsLoggingOut(true);
  
  try {
    toast.loading('Logging out...', { id: 'header-logout' });
    
    try {
      await logoutApi();
    } catch (error) {
      console.log('Logout API error, continuing with local logout');
    }
    
    dispatch(forceLogout());
    setUser(null);
    setIsMenuOpen(false);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    
    toast.dismiss('header-logout');
    toast.success('Logged out successfully!', { duration: 1500, icon: '👋' });
    
    // Redirect to login page
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
    
  } catch (error) {
    console.error('Logout failed:', error);
    dispatch(forceLogout());
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    
    toast.dismiss('header-logout');
    toast.error('Logged out', { duration: 1500 });
    
    // Redirect to login page immediately on error
    window.location.href = '/login';
    
  } finally {
    setIsLoggingOut(false);
  }
};

  const handleEditProfile = () => {
    setIsMenuOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const getUserInitials = () => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2x mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <FaHandHoldingHeart className="text-2xl text-primary-1" />
              <div>
                <h1 className="text-xl font-bold text-primary-1">
                  Health<span className="text-gray-800">Sync</span>
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  AI-Powered Medical Analysis
                </p>
              </div>
            </Link>

            {/* Auth Buttons or User Menu */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : user ? (
                // User Menu
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 focus:outline-none hover:bg-gray-50 p-1 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {/* User Avatar with Initials */}
                    <div className="w-8 h-8 rounded-full bg-primary-1 text-white flex items-center justify-center font-semibold text-sm">
                      {getUserInitials()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-800">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">
                        {user.email}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        isMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && !isLoggingOut && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                      {/* User Info */}
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        {user.role && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary-1/10 text-primary-1 rounded-full capitalize">
                            {user.role}
                          </span>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={handleEditProfile}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <FaUserEdit className="w-4 h-4 text-gray-500" />
                          <span>Edit Profile</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            navigate('/');
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <FaHome className="w-4 h-4 text-gray-500" />
                          <span>Dashboard</span>
                        </button>

                        <hr className="my-1 border-gray-200" />

                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 disabled:opacity-50"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Sign In / Sign Up Buttons
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-1.5 text-sm font-medium text-primary-1 hover:text-primary-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 text-sm font-medium text-white bg-primary-1 rounded-md hover:bg-primary-2 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdate={handleProfileUpdate}
      />

      {/* Add padding to body to account for fixed header */}
      <div className="pt-16" />
    </>
  );
}

export default Header;