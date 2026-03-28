import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllReviewsAdmin,
  toggleVisibility,
  toggleApproval,
  deleteReview,
  clearSuccess,
  clearError,
} from '../../Redux/Features/reviewSlice';
import StarRating from './StarRating';
import PopupModal from './PopupModal';

function AdminReviewManagement() {
  const dispatch = useDispatch();
  const { reviews, loading, error, success } = useSelector(
    (state) => state.review
  );

  const [filterBy, setFilterBy] = useState('all'); // 'all', 'visible', 'hidden', 'approved', 'pending'
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllReviewsAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleToggleVisibility = (id, currentStatus) => {
    dispatch(toggleVisibility({ id, isVisible: !currentStatus }));
  };

  const handleToggleApproval = (id, currentStatus) => {
    dispatch(toggleApproval({ id, isApproved: !currentStatus }));
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setIsDeletePopupOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      dispatch(deleteReview({ id: deleteTargetId, userEmail: null }));
    }
    setDeleteTargetId(null);
    setIsDeletePopupOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter reviews based on selected filter
  const filteredReviews = reviews.filter((review) => {
    if (filterBy === 'visible') return review.isVisible;
    if (filterBy === 'hidden') return !review.isVisible;
    if (filterBy === 'approved') return review.isApproved;
    if (filterBy === 'pending') return !review.isApproved;
    return true; // 'all'
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-1"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Review Management
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredReviews.length} of {reviews.length} reviews
            </p>
          </div>

          {/* Filter Dropdown */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1 bg-white"
          >
            <option value="all">All Reviews</option>
            <option value="visible">Visible Only</option>
            <option value="hidden">Hidden Only</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No reviews found.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-100"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary-1/10 flex items-center justify-center">
                      <span className="text-primary-1 font-semibold">
                        {review.userName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{review.userName}</h4>
                      <p className="text-sm text-gray-500">{review.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} readonly size="sm" />
                    <span className="text-xs text-gray-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      review.isVisible
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {review.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      review.isApproved
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {review.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{review.title}</h3>
                <p className="text-gray-600 leading-relaxed">{review.comment}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleToggleVisibility(review._id, review.isVisible)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    review.isVisible
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {review.isVisible ? 'Hide Review' : 'Show Review'}
                </button>

                <button
                  onClick={() => handleToggleApproval(review._id, review.isApproved)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    review.isApproved
                      ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {review.isApproved ? 'Unapprove' : 'Approve'}
                </button>

                <button
                  onClick={() => handleDelete(review._id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Delete Permanently
                </button>
              </div>

              {/* Timestamps */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>
                    <span className="font-medium text-gray-500">Created:</span> {formatDate(review.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Updated:</span> {formatDate(review.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PopupModal
        isOpen={isDeletePopupOpen}
        type="confirm"
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onClose={() => {
          setDeleteTargetId(null);
          setIsDeletePopupOpen(false);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default AdminReviewManagement;