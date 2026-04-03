import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PopupModal from '../components/PopupModal';
import { generateAnalysisReportPdf } from '../libraries/analysisReportPdf';
import {
  clearDeleteError,
  deleteAnalysisThunk,
  fetchAnalysisHistoryThunk,
} from '../Redux/Features/analysisSlice';
import TableGrid from '../libraries/TableGrid';
import { IoEye } from 'react-icons/io5';
import { MdDelete, MdPictureAsPdf } from 'react-icons/md';

export default function AnalysisHistoryPage({ isAdmin = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { historyList, historyLoading, historyError, deleteLoading } = useSelector(
    (state) => state.analysis
  );

  const [actionMessage, setActionMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  const pageTitle = useMemo(
    () => (isAdmin ? 'Analysis Management' : 'My Analysis History'),
    [isAdmin]
  );

  const pageDescription = useMemo(
    () =>
      isAdmin
        ? 'View all analysis records, filter them, and delete records when needed.'
        : 'View and filter your own analysis history.',
    [isAdmin]
  );

  const fetchAnalysisHistory = () => {
    setActionMessage('');
    dispatch(fetchAnalysisHistoryThunk());
  };

  // Transform data to include top-level fields for TableGrid filtering
  const analyses = useMemo(() => {
    return historyList.map((item) => ({
      ...item,
      match: item.results?.match,
      matchStatus: item.results?.match ? 'Match' : 'No Match',
      predictedDisease: item.results?.disease || '-',
      confidence: item.results?.confidence || '-',
      userName: item.user?.name || '-',
      userEmail: item.user?.email || '',
    }));
  }, [historyList]);

  useEffect(() => {
    fetchAnalysisHistory();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDelete = (rowData) => {
    setActionMessage('');
    dispatch(clearDeleteError());
    setDeleteTarget(rowData);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return;

    try {
      await dispatch(deleteAnalysisThunk(deleteTarget._id)).unwrap();
      setActionMessage('Analysis deleted successfully.');
      setDeleteTarget(null);
    } catch (deleteError) {
      const errorMsg =
        deleteError?.message ||
        deleteError.message ||
        'Failed to delete analysis.';
      alert(errorMsg);
    }
  };

  const handleCloseDeletePopup = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  const handleViewDetails = (rowData) => {
    if (!rowData?._id) return;
    const basePath = isAdmin ? '/admin' : '/customer';
    navigate(`${basePath}/analysis/${rowData._id}`);
  };

  const handleGenerateReport = async (rowData) => {
    try {
      await generateAnalysisReportPdf(rowData, { isAdmin });
    } catch (reportError) {
      const errorMsg = reportError?.message || 'Failed to generate report.';
      alert(errorMsg);
    }
  };

  // Define columns for TableGrid
  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: 'type',
        header: 'Type',
        type: 'status',
        width: 100,
        options: ["image", "clinical"],
        render: (row) => (
          <span className={`px-2 py-1 rounded text-xs font-medium ${row.type === 'image'
            ? 'bg-primary-1/10 text-primary-1'
            : 'bg-primary-2/10 text-primary-2'
            }`}>
            {row.type === 'image' ? 'Image' : 'Clinical'}
          </span>
        ),
      },
      {
        field: 'diseaseType',
        header: 'Disease',
        type: 'text',
        filterType: 'text',
        width: 150,
        render: (row) => row.diseaseType || row.disease?.name || '-',
      },
      {
        field: 'matchStatus',
        header: 'Match',
        type: 'text',
        filterType: 'dropdown',
        width: 100,
        render: (row) => (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${row.match
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
              }`}
          >
            {row.matchStatus}
          </span>
        ),
      },
      {
        field: 'predictedDisease',
        header: 'Predicted',
        type: 'text',
        filterType: 'text',
        width: 150,
        render: (row) => (
          <span className="font-medium text-gray-700">{row.predictedDisease}</span>
        ),
      },
      {
        field: 'confidence',
        header: 'Confidence',
        type: 'text',
        filterType: 'text',
        width: 140,
        render: (row) => (
          <span className="font-semibold text-primary-1">{row.confidence}</span>
        ),
      },
    ];

    if (isAdmin) {
      baseColumns.push({
        field: 'userName',
        header: 'User',
        type: 'text',
        filterType: 'text',
        width: 180,
        render: (row) => (
          <div>
            <div className="text-sm font-medium text-gray-800">{row.userName}</div>
            <div className="text-xs text-gray-400">{row.userEmail}</div>
          </div>
        ),
      });
    }

    baseColumns.push({
      field: 'createdAt',
      header: 'Date',
      type: 'date',
      filterType: 'date',
      width: 200,
      render: (row) => (
        <span className="text-sm text-gray-500">{new Date(row.createdAt).toLocaleString()}</span>
      ),
    });

    return baseColumns;
  }, [isAdmin]);

  // Define filter bars
  const filterbars = useMemo(() => {
    const bars = [
      {
        key: 'type',
        label: 'Type',
        options: [
          "Image",
          "Clinical"
        ],
        // type: "multiselect",
        width: "fit-content",
        menuMinWidth: 0,
        menuMaxHeight: 420,
        menuClassName: "inline-block w-fit min-w-0",
      },
    ];

    if (isAdmin) {
      bars.push({
        key: 'matchStatus',
        label: 'Match Status',
        options: ["Match","No Match"],
        width: "fit-content",
        menuMinWidth: 0,
        menuMaxHeight: 420,
        menuClassName: "inline-block w-fit min-w-0",
      });
    }

    return bars;
  }, [isAdmin]);

  // Define quick actions (row actions)
  const quickActions = useMemo(() => {
    const actions = [
      {
        name: 'View Details',
        icon: IoEye,
        onClick: (row) => handleViewDetails(row),
      },
      {
        name: 'Report',
        icon: MdPictureAsPdf,
        onClick: (row) => handleGenerateReport(row),
      },
      {
        name: 'Delete',
        icon: MdDelete,
        onClick: (row) => handleDelete(row),
      },
    ];

    return actions;
  }, [isAdmin]);

  const rowMenuActions = (row) => [
    { label: 'View', icon: <IoEye className="text-primary-1" />, onClick: () => handleViewDetails(row) },
    { label: 'Report', icon: <MdPictureAsPdf className="text-primary-1" />, onClick: () => handleGenerateReport(row) },
    { label: 'Delete', icon: <MdDelete className="text-red-500" />, onClick: () => handleDelete(row) },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{pageTitle}</h2>
        <p className="text-gray-500">{pageDescription}</p>
      </div>

      {/* Success Message */}
      {actionMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {actionMessage}
        </div>
      )}

      {/* Error Message */}
      {historyError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {historyError}
        </div>
      )}

      {/* Table Section */}
      {historyLoading ? (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-1"></div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <TableGrid
            columns={columns}
            data={analyses}
            quickActions={isMobile ? [] : quickActions}
            actions={rowMenuActions}
            filterbars={filterbars}
            dateFilter={true}
            showAll={true}
            minRows={10}
            rowHeight={48}
            headerHeight={40}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <PopupModal
        isOpen={Boolean(deleteTarget)}
        type="confirm"
        title="Delete Analysis"
        message="Are you sure you want to delete this analysis record? This action cannot be undone."
        onClose={handleCloseDeletePopup}
        onConfirm={handleConfirmDelete}
        confirmText={deleteLoading ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
      />
    </div>
  );
}