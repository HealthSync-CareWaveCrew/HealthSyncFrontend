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
    // user:"",
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
        userName: '',
        userEmail: '',
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
  }, [success, dispatch, onSuccess]);

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
    <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
      <h3 className="text-2xl font-bold text-black mb-6">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            // onChange={handleChange}
            disabled
            required
            maxLength={50}
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Your Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="userEmail"
            value={formData.userEmail}
            // onChange={handleChange}
            disabled
            required
            placeholder="john@example.com"
            className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
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
          <label className="block text-sm font-medium text-black mb-2">
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
            className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            required
            maxLength={1000}
            rows={5}
            placeholder="Share your experience with MediScan AI..."
            className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1 resize-none"
          />
          <p className="text-xs text-black/60 mt-1">
            {formData.comment.length}/1000 characters
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-black px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-black px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary-2 to-primary-1 text-white font-bold rounded-xl hover:from-primary-2/90 hover:to-primary-1/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
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
