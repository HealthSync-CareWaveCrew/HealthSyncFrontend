import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserReviews } from '../Redux/Features/reviewSlice';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userReviews, loading: reviewsLoading } = useSelector((state) => state.review);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserReviews());
  }, [dispatch]);

  // Mock data for predictions (replace with actual API call)
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
    { name: 'Basic', value: 30, color: '#8884d8' },
    { name: 'Premium', value: 45, color: '#82ca9d' },
    { name: 'Enterprise', value: 25, color: '#ffc658' },
  ];

  // Mock data for reviews summary
  const reviewsSummary = {
    total: userReviews.length,
    averageRating: userReviews.length > 0 ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1) : 0,
    recent: userReviews.slice(0, 3),
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <h1 className="text-2xl font-bold text-black mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-black/60">Here's a summary of your activity</p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Past Predictions Section */}
        <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-black">Past Predictions</h3>
            <button
              onClick={() => navigate('/predictions-history')} // Add route if needed
              className="px-4 py-2 bg-primary-1 text-white rounded-lg hover:bg-primary-2 transition-colors text-sm"
            >
              View More
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                {/* <Tooltip 
                  formatter={(value, name) => [value, name === 'image' ? 'Image Predictions' : 'Text Predictions']}
                  labelFormatter={(label) => `Month: ${label}`}
                /> */}
                <Tooltip labelFormatter={(label) => `Month: ${label}`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="image" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Image Predictions"
                />
                <Line 
                  type="monotone" 
                  dataKey="text" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Text Predictions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-sm text-black/60 mt-2">
            <span>Image predictions: {predictionsData.reduce((sum, p) => sum + p.image, 0)}</span>
            <span>Text predictions: {predictionsData.reduce((sum, p) => sum + p.text, 0)}</span>
            <span>Total: {predictionsData.reduce((sum, p) => sum + p.total, 0)}</span>
          </div>
        </div>

        {/* Payment Plans Section */}
        <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-black">Payment Plans</h3>
            <button
              onClick={() => navigate('/billing')} // Add route if needed
              className="px-4 py-2 bg-primary-1 text-white rounded-lg hover:bg-primary-2 transition-colors text-sm"
            >
              View More
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-black/60 mt-2">
            Current plan: Premium (Expires: Dec 2026)
          </p>
        </div>

        {/* Reviews Section */}
        <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30 lg:col-span-2 xl:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-black">Your Reviews</h3>
            <button
              onClick={() => navigate('/reviews')}
              className="px-4 py-2 bg-primary-1 text-white rounded-lg hover:bg-primary-2 transition-colors text-sm"
            >
              View More
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-black/80">Total Reviews:</span>
              <span className="font-semibold text-black">{reviewsSummary.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black/80">Average Rating:</span>
              <span className="font-semibold text-black">{reviewsSummary.averageRating} ⭐</span>
            </div>
            {reviewsSummary.recent.length > 0 && (
              <div>
                <h4 className="font-semibold text-black mb-2">Recent Reviews:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {reviewsSummary.recent.map((review) => (
                    <div key={review._id} className="text-sm text-black/70">
                      <div className="flex justify-between">
                        <span>{review.title}</span>
                        <span>{'⭐'.repeat(review.rating)}</span>
                      </div>
                      <p className="truncate">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30 text-center">
          <h4 className="text-lg font-bold text-black mb-2">Image Predictions</h4>
          <p className="text-3xl font-bold text-primary-1">{predictionsData[predictionsData.length - 1].image}</p>
          <p className="text-sm text-black/60">This month</p>
        </div>
        <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30 text-center">
          <h4 className="text-lg font-bold text-black mb-2">Text Predictions</h4>
          <p className="text-3xl font-bold text-primary-1">{predictionsData[predictionsData.length - 1].text}</p>
          <p className="text-sm text-black/60">This month</p>
        </div>
        <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30 text-center">
          <h4 className="text-lg font-bold text-black mb-2">Active Plan</h4>
          <p className="text-3xl font-bold text-primary-1">Premium</p>
          <p className="text-sm text-black/60">Valid till Dec 2026</p>
        </div>
        <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30 text-center">
          <h4 className="text-lg font-bold text-black mb-2">Reviews Given</h4>
          <p className="text-3xl font-bold text-primary-1">{reviewsSummary.total}</p>
          <p className="text-sm text-black/60">Avg rating: {reviewsSummary.averageRating}</p>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;