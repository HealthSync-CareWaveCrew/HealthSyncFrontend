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
    const { user } = useSelector(
    (state) => state.auth
  );

  const [userEmail, setUserEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
  });

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

  // const handleEmailSubmit = (e) => {
  //   e.preventDefault();
  //   if (userEmail.trim()) {
  //     dispatch(fetchUserReviews(userEmail));
  //     setEmailSubmitted(true);
  //   }
  // };

useEffect(() => {
  if (user?.id) {
    dispatch(fetchUserReviews());
  }
}, [user, dispatch]);

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
        updateData: { ...editFormData, userEmail },
      })
    );
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setIsDeletePopupOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      dispatch(deleteReview({ id: deleteTargetId, userEmail }));
    }

    setDeleteTargetId(null);
    setIsDeletePopupOpen(false);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditFormData({ rating: 0, title: '', comment: '' });
  };

  // if (!emailSubmitted) {
  //   return (
  //     <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
  //       <h3 className="text-2xl font-bold text-black mb-6">Manage Your Reviews</h3>

  //       <form onSubmit={handleEmailSubmit} className="space-y-4">
  //         <div>
  //           <label className="block text-sm font-medium text-black mb-2">
  //             Enter your email to view and manage your reviews
  //           </label>
  //           <input
  //             type="email"
  //             value={userEmail}
  //             onChange={(e) => setUserEmail(e.target.value)}
  //             required
  //             placeholder="your@email.com"
  //             className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
  //           />
  //         </div>

  //         <button
  //           type="submit"
  //           className="w-full py-3 px-6 bg-gradient-to-r from-primary-2 to-primary-1 text-white font-bold rounded-xl hover:from-primary-2/90 hover:to-primary-1/90 transition-all duration-300 shadow-lg"
  //         >
  //           View My Reviews
  //         </button>
  //       </form>
  //     </div>
  //   );
  // }

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
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-black">
            Your Reviews ({userReviews.length})
          </h3>
          {/* <button
            onClick={() => {
              setEmailSubmitted(false);
              setUserEmail('');
            }}
            className="px-4 py-2 bg-primary-3 text-black rounded-lg hover:bg-primary-2/50 transition-colors text-sm"
          >
            Change Email
          </button> */}
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

      {userReviews.length === 0 ? (
        <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
          <div className="text-center py-12">
            <p className="text-black/60 text-lg">
              You haven't written any reviews yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {userReviews.map((review) => (
            <div key={review._id}>
              {editingReview === review._id ? (
                <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
                  <h4 className="text-lg font-bold text-black mb-4">
                    Edit Review
                  </h4>

                  <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
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
                      <label className="block text-sm font-medium text-black mb-2">
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
                        className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
                      />
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
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
                        className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1 resize-none"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-primary-2 to-primary-1 text-white font-bold rounded-xl hover:from-primary-2/90 hover:to-primary-1/90 transition-all duration-300 shadow-lg"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-3 bg-primary-3 text-black rounded-xl hover:bg-primary-2/50 transition-colors"
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
