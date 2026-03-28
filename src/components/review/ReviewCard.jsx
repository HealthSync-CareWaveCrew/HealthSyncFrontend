// ReviewCard.jsx
import StarRating from './StarRating';
import { FaTrash, FaEdit, FaUser } from 'react-icons/fa';

function ReviewCard({ review, showActions = false, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-1/10 flex items-center justify-center">
            <FaUser className="text-primary-1" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{review.user?.name || 'Anonymous'}</h4>
            <p className="text-xs text-gray-500">{review.user?.email}</p>
          </div>
        </div>
        <div className="text-right">
          <StarRating rating={review.rating} readonly size="sm" />
          <p className="text-xs text-gray-400 mt-1">{formatDate(review.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <h3 className="text-md font-semibold text-gray-800 mb-2">{review.title}</h3>
        <p className="text-gray-600 leading-relaxed">{review.comment}</p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          {onEdit && (
            <button
              onClick={() => onEdit(review)}
              className="px-3 py-1.5 text-sm text-primary-1 hover:text-primary-2 transition-colors flex items-center gap-1"
            >
              <FaEdit className="w-3 h-3" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(review._id)}
              className="px-3 py-1.5 text-sm text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <FaTrash className="w-3 h-3" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ReviewCard;