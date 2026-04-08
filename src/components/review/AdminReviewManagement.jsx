import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllReviewsAdmin,
  toggleVisibility,
  deleteReview,
  clearSuccess,
  clearError,
} from '../../Redux/Features/reviewSlice';
import TableGrid from '../../libraries/TableGrid';
import StarRating from './StarRating';import PopupModal from './PopupModal';import { MdDelete, MdVisibility, MdVisibilityOff, MdPreview, MdClose } from 'react-icons/md';
import { FaEye } from 'react-icons/fa';
import { createPortal } from 'react-dom';

function AdminReviewManagement() {
  const dispatch = useDispatch();
  const { reviews, loading, error, success } = useSelector(
    (state) => state.review
  );
console.log("reviewssssssssssssssssssssssss",reviews);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

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

  const handleDelete = (id) => {
    setDeleteTarget({ id });
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget?.id) {
      await dispatch(deleteReview({ id: deleteTarget.id, userEmail: null }));
      setDeleteTarget(null);
    }
  };

  const handleViewReview = (review) => {
    setViewTarget(review);
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

    const datas = useMemo(() => {
    return reviews.map((item) => ({
      ...item,
      userName: item.user?.name || '-',
      userEmail: item.user?.email || '',
    }));
  }, [reviews]);

  const columns = useMemo(
    () => [
      {
        field: 'userName',
        header: 'User',
        type: 'text',
        width: 220,
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{row.userName || 'Unknown'}</span>
            <span className="text-xs text-gray-500">{row.userEmail || 'No email'}</span>
          </div>
        ),
      },
      {
        field: 'rating',
        header: 'Rating',
        type: 'number',
        width: 120,
        render: (row) => (
          <div className="flex items-center gap-2">
            <StarRating rating={row.rating} readonly size="sm" />
            <span className="text-xs text-gray-500">{row.rating ?? '-'}</span>
          </div>
        ),
      },
      {
        field: 'title',
        header: 'Title',
        type: 'text',
        width: 260,
      },
      {
        field: 'comment',
        header: 'Review',
        type: 'text',
        width: 340,
        render: (row) => (
          <p className="text-sm text-gray-600 line-clamp-2 max-w-[420px] overflow-hidden">
            {row.comment || 'No review comment'}
          </p>
        ),
      },
      {
        field: 'createdAt',
        header: 'Date',
        type: 'date',
        width: 180,
        render: (row) => <span className="text-sm text-gray-600">{formatDate(row.createdAt)}</span>,
      },
      {
        field: 'isVisible',
        header: 'Visibility',
        type: 'status',
        width: 150,
        render: (row) => (
          <button
            onClick={() => handleToggleVisibility(row._id, row.isVisible)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
            title={row.isVisible ? 'Hidden this review' : 'Show this review'}
          >
            {row.isVisible ? (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                <MdVisibility size={16} />
                <span>Visible</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                <MdVisibilityOff size={16} />
                <span>Hidden</span>
              </div>
            )}
          </button>
        ),
      },
    ],
    []
  );

  const quickActions = useMemo(
    () => [
      {
        name: 'View review',
        icon: FaEye,
        onClick: (row) => handleViewReview(row),
        // color: 'text-blue-600',
      },
      {
        name: 'Delete review',
        icon: MdDelete,
        onClick: (row) => setDeleteTarget({ id: row._id }),
        color: 'text-red-500',
      },
    ],
    []
  );

  const actions = (row) => [
    {
      label: 'View Review',
      icon: <FaEye className="" />,
      onClick: () => handleViewReview(row),
    },
    {
      label: 'Delete Review',
      icon: <MdDelete className="text-red-600" />,
      onClick: () => setDeleteTarget({ id: row._id }),
    },
  ];

  const filterbars = useMemo(
    () => [
      {
        key: 'isVisible',
        label: 'Visibility',
        type: 'multiselect',
        options: [
          { label: 'All', value: 'all' },
          { label: 'Visible', value: true },
          { label: 'Hidden', value: false },
        ],
            width: "fit-content",
        menuMinWidth: 0,
        menuMaxHeight: 420,
        menuClassName: "inline-block w-fit min-w-0",
      },
    ],
    []
  );

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
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Review Management</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage all reviews with visibility, approval, and delete actions.
            </p>
          </div>
          <div className="text-sm text-gray-500">Showing {reviews.length} reviews</div>
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

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <TableGrid
          data={datas}
          columns={columns}
          quickActions={quickActions}
          actions={actions}
          filterbars={filterbars}
          showAll={true}
          minRows={5}
        />
      </div>

      {/* View Review Modal */}
      {viewTarget && (
         createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Review Details</h2>
                <button
                  onClick={() => setViewTarget(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-1/10 flex items-center justify-center">
                    <span className="text-primary-1 font-semibold text-lg">
                      {viewTarget.userName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{viewTarget.userName || 'Unknown User'}</h4>
                    <p className="text-sm text-gray-500">{viewTarget.userEmail || 'No email'}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 py-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Rating:</span>
                  <StarRating rating={viewTarget.rating} readonly size="sm" />
                  <span className="text-sm text-gray-500">{viewTarget.rating || 0} stars</span>
                </div>

                {/* Title */}
                <div className="py-2 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Title</h3>
                  <p className="text-gray-800 font-medium">{viewTarget.title || 'No title'}</p>
                </div>

                {/* Review Comment */}
                <div className="py-2 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Review</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">{viewTarget.comment || 'No review comment'}</p>
                </div>

                {/* Date */}
                <div className="py-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Date:</span>
                  <p className="text-sm text-gray-700 mt-1">{formatDate(viewTarget.createdAt)}</p>
                </div>

                {/* Visibility Status */}
                <div className="py-2 border-t border-gray-200">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    viewTarget.isVisible ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {viewTarget.isVisible ? (
                      <>
                        <MdVisibility size={14} />
                        Visible
                      </>
                    ) : (
                      <>
                        <MdVisibilityOff size={14} />
                        Hidden
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>,
         document.body
        )
      )}

      <PopupModal
        isOpen={!!deleteTarget}
        type="confirm"
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default AdminReviewManagement;