// UserReviews.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserReviews,
  updateReview,
  deleteReview,
  clearSuccess,
  clearError,
} from '../../Redux/Features/reviewSlice';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import PopupModal from './PopupModal';

function UserReviews() {
  const dispatch = useDispatch();
  const { userReviews, loading, error, success } = useSelector(
    (state) => state.review
  );
  const { user } = useSelector((state) => state.auth);

  const [editingReview, setEditingReview] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
  });

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserReviews());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (success) {
      setEditingReview(null);
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

  const handleEdit = (review) => {
    setEditingReview(review._id);
    setEditFormData({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
    });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    dispatch(
      updateReview({
        id: editingReview,
        updateData: editFormData,
      })
    );
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setIsDeletePopupOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      dispatch(deleteReview({ id: deleteTargetId }));
    }
    setDeleteTargetId(null);
    setIsDeletePopupOpen(false);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditFormData({ rating: 0, title: '', comment: '' });
  };

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
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Your Reviews ({userReviews.length})
          </h3>
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

      {userReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              You haven't written any reviews yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {userReviews.map((review) => (
            <div key={review._id}>
              {editingReview === review._id ? (
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Edit Review
                  </h4>

                  <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <StarRating
                        rating={editFormData.rating}
                        onRatingChange={(rating) =>
                          setEditFormData({ ...editFormData, rating })
                        }
                        size="md"
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            title: e.target.value,
                          })
                        }
                        required
                        maxLength={100}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1"
                      />
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review
                      </label>
                      <textarea
                        value={editFormData.comment}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            comment: e.target.value,
                          })
                        }
                        required
                        maxLength={1000}
                        rows={5}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1 resize-none"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 px-4 bg-primary-1 text-white font-semibold rounded-lg hover:bg-primary-2 transition-all duration-300 shadow-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <ReviewCard
                  review={review}
                  showActions
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <PopupModal
        isOpen={isDeletePopupOpen}
        type="confirm"
        title="Delete Review"
        message="Are you sure you want to delete this review?"
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

export default UserReviews;