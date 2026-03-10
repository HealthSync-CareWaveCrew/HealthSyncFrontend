import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReviews } from '../../Redux/Features/reviewSlice';
import ReviewCard from './ReviewCard';

function ReviewList() {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.review);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    dispatch(fetchAllReviews());
  }, [dispatch]);

  // Filter reviews based on search term
  const filteredReviews = reviews.filter((review) => {
    const term = searchTerm.toLowerCase();
    return (
      review.user?.name?.toLowerCase().includes(term) ||
      review.user?.email?.toLowerCase().includes(term) ||
      review.comment?.toLowerCase().includes(term) ||
      review.title?.toLowerCase().includes(term)
    );
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedReviews.length / itemsPerPage);
  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

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
      {/* Search and Sort Controls */}
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-primary-2/30">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-primary-2/30 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-primary-2/30 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Reviews Header */}
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-primary-2/30">
        <h3 className="text-xl font-bold text-black">
          All Reviews ({sortedReviews.length})
        </h3>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {paginatedReviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 bg-primary-1 text-white rounded-lg disabled:opacity-50 hover:bg-primary-2 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 mx-1 text-black">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-primary-1 text-white rounded-lg disabled:opacity-50 hover:bg-primary-2 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewList;
