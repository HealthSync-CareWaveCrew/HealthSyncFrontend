import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Add these
import { getCurrentUser, logout as logoutApi } from '../Redux/Api/api';
import { forceLogout } from '../Redux/Features/authSlice'; // Import forceLogout
import EditProfileModal from '../components/User/EditProfileModal';
import toast from 'react-hot-toast';

function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    checkUser();
    
    // Add click outside listener
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAuthenticated]); // Re-run when auth state changes

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await getCurrentUser();
        // Extract user from the correct nested structure: response.data.data.user
        const userData = response.data?.data?.user;
        setUser(userData);
        console.log('User data loaded:', userData);
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
      
      // Try to call logout API
      try {
        await logoutApi();
      } catch (error) {
        console.log('Logout API error, continuing with local logout');
      }
      
      // Clear Redux state immediately
      dispatch(forceLogout());
      
      // Clear local state
      setUser(null);
      setIsMenuOpen(false);
      
      // Clear all storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      sessionStorage.clear();
      
      toast.dismiss('header-logout');
      toast.success('Logged out successfully!', {
        duration: 1500,
        icon: '👋'
      });
      
      // Hard redirect to login
      // setTimeout(() => {
      //   window.location.href = '/login';
      // }, 500);
      
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Even if everything fails, clear everything
      dispatch(forceLogout());
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      
      toast.dismiss('header-logout');
      toast.error('Logged out', { duration: 1500 });
      
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
    // Also update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Get initials from user name
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary-4/95 backdrop-blur-md border-b border-primary-2/30 shadow-lg">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <Link
              to="/"
              className="flex items-center gap-4 hover:opacity-80 transition-opacity"
            >
              <span className="text-5xl">⚕️</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black">
                  Health Sync
                </h1>
                <p className="text-primary-1 mt-1 text-xs md:text-base">
                  Advanced Medical Imaging & Analysis System
                </p>
              </div>
            </Link>

            {/* Auth Buttons or User Menu */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              ) : user ? (
                // User Menu
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 focus:outline-none hover:bg-primary-4/20 p-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {/* User Avatar with Initials */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-1 to-primary-2 text-white flex items-center justify-center font-semibold text-sm shadow-md">
                      {getUserInitials()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-black">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-primary-1 truncate max-w-[150px]">
                        {user.email}
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-primary-1 transition-transform duration-200 ${
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
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-primary-2/20 overflow-hidden animate-fadeIn">
                      {/* User Info - Mobile Only */}
                      <div className="md:hidden p-4 bg-gradient-to-r from-primary-4/10 to-primary-4/5 border-b border-primary-2/20">
                        <p className="font-semibold text-black">{user.name}</p>
                        <p className="text-sm text-primary-1 truncate">{user.email}</p>
                        {user.role && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary-1/10 text-primary-1 rounded-full capitalize">
                            {user.role}
                          </span>
                        )}
                      </div>

                      {/* User Info - Desktop in dropdown */}
                      <div className="hidden md:block p-4 bg-gradient-to-r from-primary-4/10 to-primary-4/5 border-b border-primary-2/20">
                        <p className="font-semibold text-black">{user.name}</p>
                        <p className="text-sm text-primary-1 truncate">{user.email}</p>
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
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-primary-4/20 transition-colors flex items-center gap-3"
                        >
                          <svg className="w-4 h-4 text-primary-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Edit Profile</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            navigate('/');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-primary-4/20 transition-colors flex items-center gap-3"
                        >
                          <svg className="w-4 h-4 text-primary-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>Dashboard</span>
                        </button>

                        <hr className="my-2 border-primary-2/20" />

                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
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
                    className="px-4 py-2 text-sm font-medium text-primary-1 hover:text-primary-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 text-sm font-medium text-white bg-primary-1 rounded-lg hover:bg-primary-2 transition-colors shadow-md hover:shadow-lg"
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
    </>
  );
}

export default Header;