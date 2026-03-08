import StarRating from './StarRating';

function ReviewCard({ review, showActions = false, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-2 to-primary-1 flex items-center justify-center text-white font-bold flex-shrink-0">
            {getInitials(review.userName)}
          </div>

          {/* User Info */}
          <div>
            <h4 className="font-semibold text-black">{review.userName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} readonly size="sm" />
              <span className="text-sm text-black/60">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit && onEdit(review)}
              className="px-3 py-1 bg-primary-3 text-black rounded-lg hover:bg-primary-2/50 transition-colors text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(review._id)}
              className="px-3 py-1 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Review Title */}
      <h3 className="text-lg font-bold text-black mb-2">{review.title}</h3>

      {/* Review Comment */}
      <p className="text-black/80 leading-relaxed">{review.comment}</p>

      {/* Admin indicators */}
      {!review.isVisible && (
        <div className="mt-3 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-700 rounded-lg text-sm">
          Hidden by Admin
        </div>
      )}
      {!review.isApproved && (
        <div className="mt-3 inline-block px-3 py-1 bg-red-500/20 text-red-600 rounded-lg text-sm ml-2">
          Pending Approval
        </div>
      )}
    </div>
  );
}

export default ReviewCard;
