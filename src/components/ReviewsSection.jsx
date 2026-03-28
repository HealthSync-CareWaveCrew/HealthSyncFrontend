// ReviewsSection.jsx - Light Butter Background (primary-3)
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReviews } from '../Redux/Features/reviewSlice';

function ReviewsSection() {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.review);

  useEffect(() => {
    dispatch(fetchAllReviews({ isApproved: true, isVisible: true }));
  }, [dispatch]);

  const topReviews = reviews
    .filter(review => review.isApproved && review.isVisible)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section id="reviews" className="py-20 px-4 bg-primary-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-1 text-center mb-12">
            Inspiring Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-primary-2/20">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="reviews" className="py-20 px-4 bg-primary-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-1 text-center mb-12">
            Inspiring Stories
          </h2>
          <div className="bg-white rounded-2xl border border-primary-2/20 p-8 text-center">
            <p className="text-gray-600">Unable to load reviews at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-20 px-4 bg-primary-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-1 text-center mb-12">
          Inspiring Stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topReviews.length > 0 ? (
            topReviews.map((review, index) => (
              <div
                key={review._id}
                className="bg-white p-6 rounded-2xl border border-primary-2/20 shadow-lg hover:shadow-xl transition-all hover:-translate-y-3 hover:border-primary-1"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <h4 className="font-semibold text-gray-800 mb-2">
                  {review.user?.name || 'Anonymous'}
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">({review.rating}/5)</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-3 bg-white p-8 rounded-2xl border border-primary-2/20 text-center">
              <p className="text-gray-600">No reviews available yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ReviewsSection;