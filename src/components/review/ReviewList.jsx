import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReviews } from '../Redux/Features/reviewSlice';
import ReviewCard from './ReviewCard';

function ReviewList() {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.review);

  useEffect(() => {
    dispatch(fetchAllReviews());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-1"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <div className="bg-red-500/20 border border-red-500 text-black px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <div className="text-center py-12">
          <p className="text-black/60 text-lg">No reviews yet. Be the first to review!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-primary-2/30">
        <h3 className="text-xl font-bold text-black">
          All Reviews ({reviews.length})
        </h3>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    </div>
  );
}

export default ReviewList;
