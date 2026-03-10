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
      // Admin delete doesn't need email verification
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
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-1"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-primary-2/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-xl font-bold text-black">
            Admin - All Reviews ({filteredReviews.length}/{reviews.length})
          </h3>

          {/* Filter Dropdown */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 bg-white border border-primary-2/30 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-1"
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
        <div className="bg-green-500/20 border border-green-500 text-black px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-black px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
          <div className="text-center py-12">
            <p className="text-black/60 text-lg">No reviews found.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-black text-lg">{review.userName}</h4>
                  <p className="text-sm text-black/60">{review.userEmail}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={review.rating} readonly size="sm" />
                    <span className="text-sm text-black/60">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2 flex-wrap justify-end">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm ${
                      review.isVisible
                        ? 'bg-green-500/20 text-green-700'
                        : 'bg-yellow-500/20 text-yellow-700'
                    }`}
                  >
                    {review.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-sm ${
                      review.isApproved
                        ? 'bg-blue-500/20 text-blue-700'
                        : 'bg-red-500/20 text-red-600'
                    }`}
                  >
                    {review.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <h3 className="text-lg font-bold text-black mb-2">{review.title}</h3>
              <p className="text-black/80 leading-relaxed mb-4">{review.comment}</p>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleToggleVisibility(review._id, review.isVisible)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    review.isVisible
                      ? 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30'
                      : 'bg-green-500/20 text-green-700 hover:bg-green-500/30'
                  }`}
                >
                  {review.isVisible ? 'Hide Review' : 'Show Review'}
                </button>

                <button
                  onClick={() => handleToggleApproval(review._id, review.isApproved)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    review.isApproved
                      ? 'bg-red-500/20 text-red-600 hover:bg-red-500/30'
                      : 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30'
                  }`}
                >
                  {review.isApproved ? 'Unapprove' : 'Approve'}
                </button>

                <button
                  onClick={() => handleDelete(review._id)}
                  className="px-4 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors font-semibold"
                >
                  Delete Permanently
                </button>
              </div>

              {/* Timestamps */}
              <div className="mt-4 pt-4 border-t border-primary-2/30">
                <div className="grid grid-cols-2 gap-2 text-xs text-black/60">
                  <div>
                    <span className="font-semibold">Created:</span> {formatDate(review.createdAt)}
                  </div>
                  <div>
                    <span className="font-semibold">Updated:</span> {formatDate(review.updatedAt)}
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
        message="Are you sure you want to permanently delete this review?"
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
