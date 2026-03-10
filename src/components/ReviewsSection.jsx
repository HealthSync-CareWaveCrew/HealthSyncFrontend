import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReviews } from '../Redux/Features/reviewSlice';

function ReviewsSection() {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.review);

  useEffect(() => {
    // Fetch reviews with filters to get only approved and visible reviews
    dispatch(fetchAllReviews({ isApproved: true, isVisible: true }));
  }, [dispatch]);

  // Get top 3 reviews by rating
  const topReviews = reviews
    .filter(review => review.isApproved && review.isVisible)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  if (loading) {
    return (
      <div id="reviews" className="section section-light" data-aos="zoom-in">
        <div className="section section-light">
          <h2 className="section-title">Inspiring Stories</h2>
          <div className="grid grid-3">
            {[1, 2, 3].map((i) => (
              <div className="card" key={i}>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-16 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="reviews" className="section section-light" data-aos="zoom-in">
        <div className="section section-light">
          <h2 className="section-title">Inspiring Stories</h2>
          <div className="grid grid-3">
            <div className="card">
              <p>Unable to load reviews at this time.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="reviews" className="section section-light" data-aos="zoom-in">
      <div className="section section-light">
        <h2 className="section-title">Inspiring Stories</h2>
        <div className="grid grid-3">
          {topReviews.length > 0 ? (
            topReviews.map((review) => (
              <div className="card" key={review._id}>
                <h4>{review.user?.name || 'Anonymous'}</h4>
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                </div>
                <p>{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="card col-span-3">
              <p>No reviews available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewsSection;