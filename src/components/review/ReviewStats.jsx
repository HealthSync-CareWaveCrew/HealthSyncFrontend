// ReviewStats.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviewStats } from '../../Redux/Features/reviewSlice';
import StarRating from './StarRating';

function ReviewStats() {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state?.review);

  useEffect(() => {
    dispatch(fetchReviewStats());
  }, [dispatch]);

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-1"></div>
        </div>
      </div>
    );
  }

  const { totalReviews, averageRating, ratingDistribution } = stats;

  const getRatingPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Customer Reviews</h3>

      {totalReviews === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet</p>
        </div>
      ) : (
        <>
          {/* Overall Rating */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary-1 mb-2">
              {averageRating}
            </div>
            <StarRating rating={Math.round(averageRating)} readonly size="lg" />
            <p className="text-gray-500 mt-2">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[
                star === 5
                  ? 'fiveStar'
                  : star === 4
                  ? 'fourStar'
                  : star === 3
                  ? 'threeStar'
                  : star === 2
                  ? 'twoStar'
                  : 'oneStar'
              ];
              const percentage = getRatingPercentage(count);

              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-14">
                    <span className="text-sm text-gray-700 font-medium">{star}</span>
                    <svg
                      className="w-4 h-4 fill-primary-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>

                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-1 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <span className="text-sm text-gray-500 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ReviewStats;