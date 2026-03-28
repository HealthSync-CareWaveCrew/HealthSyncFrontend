import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserReviews } from '../Redux/Features/reviewSlice';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userReviews, loading: reviewsLoading } = useSelector((state) => state.review);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserReviews());
  }, [dispatch]);

  // Mock data for predictions
  const predictionsData = [
    { month: 'Jan', image: 3, text: 2, total: 5 },
    { month: 'Feb', image: 5, text: 3, total: 8 },
    { month: 'Mar', image: 7, text: 5, total: 12 },
    { month: 'Apr', image: 4, text: 3, total: 7 },
    { month: 'May', image: 9, text: 6, total: 15 },
    { month: 'Jun', image: 6, text: 4, total: 10 },
  ];

  // Mock data for payment plans
  const paymentData = [
    { name: 'Basic', value: 30, color: '#E36A6A' },
    { name: 'Premium', value: 45, color: '#FFB2B2' },
    { name: 'Enterprise', value: 25, color: '#FFF2D0' },
  ];

  const reviewsSummary = {
    total: userReviews.length,
    averageRating: userReviews.length > 0 ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1) : 0,
    recent: userReviews.slice(0, 3),
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, <span className="text-primary-1">{user?.name || 'User'}</span>!
        </h1>
        <p className="text-gray-500">Here's a summary of your activity</p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Past Predictions Section */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Past Predictions</h3>
            <button
              onClick={() => navigate('/predictions-history')}
              className="px-3 py-1.5 text-sm text-primary-1 hover:text-primary-2 transition-colors font-medium"
            >
              View More →
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="image" 
                  stroke="#E36A6A" 
                  strokeWidth={2}
                  name="Image Predictions"
                  dot={{ fill: '#E36A6A', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="text" 
                  stroke="#FFB2B2" 
                  strokeWidth={2}
                  name="Text Predictions"
                  dot={{ fill: '#FFB2B2', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-1"></span>
              Image: {predictionsData.reduce((sum, p) => sum + p.image, 0)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-2"></span>
              Text: {predictionsData.reduce((sum, p) => sum + p.text, 0)}
            </span>
            <span className="font-semibold text-primary-1">
              Total: {predictionsData.reduce((sum, p) => sum + p.total, 0)}
            </span>
          </div>
        </div>

        {/* Payment Plans Section */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Payment Plans</h3>
            <button
              onClick={() => navigate('/billing')}
              className="px-3 py-1.5 text-sm text-primary-1 hover:text-primary-2 transition-colors font-medium"
            >
              View More →
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
            Current plan: <span className="font-semibold text-primary-1">Premium</span> (Expires: Dec 2026)
          </p>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Reviews</h3>
            <button
              onClick={() => navigate('/reviews')}
              className="px-3 py-1.5 text-sm text-primary-1 hover:text-primary-2 transition-colors font-medium"
            >
              View More →
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-600">Total Reviews</span>
              <span className="font-semibold text-gray-800">{reviewsSummary.total}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-600">Average Rating</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-800">{reviewsSummary.averageRating}</span>
                <span className="text-yellow-400">★</span>
              </div>
            </div>
            {reviewsSummary.recent.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2 text-sm">Recent Reviews</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {reviewsSummary.recent.map((review) => (
                    <div key={review._id} className="text-sm p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-800 font-medium">{review.title}</span>
                        <span className="text-yellow-500 text-xs">{'★'.repeat(review.rating)}</span>
                      </div>
                      <p className="text-gray-500 text-xs line-clamp-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 text-center border border-gray-100 group">
          <div className="w-12 h-12 bg-primary-1/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-primary-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Image Predictions</h4>
          <p className="text-3xl font-bold text-primary-1">{predictionsData[predictionsData.length - 1].image}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 text-center border border-gray-100 group">
          <div className="w-12 h-12 bg-primary-1/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-primary-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Text Predictions</h4>
          <p className="text-3xl font-bold text-primary-1">{predictionsData[predictionsData.length - 1].text}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 text-center border border-gray-100 group">
          <div className="w-12 h-12 bg-primary-1/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-primary-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Active Plan</h4>
          <p className="text-3xl font-bold text-primary-1">Premium</p>
          <p className="text-xs text-gray-400 mt-1">Valid till Dec 2026</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 text-center border border-gray-100 group">
          <div className="w-12 h-12 bg-primary-1/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-primary-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Reviews Given</h4>
          <p className="text-3xl font-bold text-primary-1">{reviewsSummary.total}</p>
          <p className="text-xs text-gray-400 mt-1">Avg rating: {reviewsSummary.averageRating}</p>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;