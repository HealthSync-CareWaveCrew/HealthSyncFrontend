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
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <h2 className="text-3xl font-bold text-black mb-2">
          Customer Reviews & Ratings
        </h2>
        <p className="text-black/70">
          Share your experience with MediScan AI and help others make informed decisions
        </p>
      </div>

      {/* Navigation Tabs */}
      <nav className="bg-primary-4 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-primary-2/30 flex gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-primary-2 to-primary-1 text-white shadow-lg'
              : 'text-black hover:bg-primary-3/50'
          }`}
        >
          All Reviews
        </button>
        <button
          onClick={() => setActiveTab('write')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
            activeTab === 'write'
              ? 'bg-gradient-to-r from-primary-2 to-primary-1 text-white shadow-lg'
              : 'text-black hover:bg-primary-3/50'
          }`}
        >
          Write Review
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
            activeTab === 'manage'
              ? 'bg-gradient-to-r from-primary-2 to-primary-1 text-white shadow-lg'
              : 'text-black hover:bg-primary-3/50'
          }`}
        >
          My Reviews
        </button>
      </nav>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats (Always visible) */}
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
