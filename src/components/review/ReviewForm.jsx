// ReviewForm.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReview, clearSuccess, clearError } from '../../Redux/Features/reviewSlice';
import StarRating from './StarRating';
import PopupModal from './PopupModal';

function ReviewForm({ onSuccess }) {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.review);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    userName: user?.name || '',
    userEmail: user?.email || '',
    rating: 0,
    title: '',
    comment: '',
  });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (success) {
      setFormData({
        userName: user?.name || '',
        userEmail: user?.email || '',
        rating: 0,
        title: '',
        comment: '',
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }

      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch, onSuccess, user]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      setShowPopup(true);
      return;
    }

    dispatch(createReview(formData));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            disabled
            required
            placeholder="John Doe"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1 disabled:opacity-70"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="userEmail"
            value={formData.userEmail}
            disabled
            required
            placeholder="john@example.com"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1 disabled:opacity-70"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <StarRating
            rating={formData.rating}
            onRatingChange={(rating) => setFormData({ ...formData, rating })}
            size="lg"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Summarize your experience"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            required
            maxLength={1000}
            rows={5}
            placeholder="Share your experience with HealthSync..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.comment.length}/1000 characters
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-primary-1 text-white font-semibold rounded-lg hover:bg-primary-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>

      <PopupModal
        isOpen={showPopup}
        title="Missing Rating"
        message="Please select a rating."
        onClose={() => setShowPopup(false)}
      />
    </div>
  );
}

export default ReviewForm;