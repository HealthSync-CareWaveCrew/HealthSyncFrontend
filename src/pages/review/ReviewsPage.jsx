// ReviewsPage.jsx
import { useState } from 'react';
import ReviewStats from '../../components/review/ReviewStats';
import ReviewForm from '../../components/review/ReviewForm';
import ReviewList from '../../components/review/ReviewList';
import UserReviews from '../../components/review/UserReviews';

function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'write', 'manage'

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Customer Reviews & Ratings
        </h2>
        <p className="text-gray-500">
          Share your experience with HealthSync and help others make informed decisions
        </p>
      </div>

      {/* Navigation Tabs */}
      <nav className="bg-white rounded-xl shadow-md p-2 border border-gray-100 flex gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'all'
              ? 'bg-primary-1 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Reviews
        </button>
        <button
          onClick={() => setActiveTab('write')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'write'
              ? 'bg-primary-1 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Write Review
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'manage'
              ? 'bg-primary-1 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          My Reviews
        </button>
      </nav>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <ReviewStats />
          </div>
        </div>

        {/* Right Column - Dynamic Content */}
        <div className="lg:col-span-2">
          {activeTab === 'all' && <ReviewList />}
          {activeTab === 'write' && (
            <ReviewForm onSuccess={() => setActiveTab('all')} />
          )}
          {activeTab === 'manage' && <UserReviews />}
        </div>
      </div>
    </div>
  );
}

export default ReviewsPage;