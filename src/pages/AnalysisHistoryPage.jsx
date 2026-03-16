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
        options:["image","clinical"],
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
            className={`px-2 py-1 rounded text-xs font-semibold ${
              row.match
                ? 'bg-green-200 text-green-800'
                : 'bg-red-200 text-red-800'
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
        render: (row) => row.predictedDisease,
      },
      {
        field: 'confidence',
        header: 'Confidence',
        type: 'text',
        filterType: 'text',
        width: 140,
        render: (row) => (
          <span className="font-semibold">{row.confidence}</span>
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
            <div className="text-sm">{row.userName}</div>
            <div className="text-xs text-black/60">{row.userEmail}</div>
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
        <span className="text-xs">{new Date(row.createdAt).toLocaleString()}</span>
      ),
    });

    return baseColumns;
  }, [isAdmin]);

  // Define filter bars
  const filterbars = useMemo(() => {
    const bars = [
      {
        field: 'type',
        label: 'Type',
        type: 'dropdown',
        options: [
          { label: 'Image', value: 'image' },
          { label: 'Clinical', value: 'clinical' },
        ],
      },
    ];

    if (isAdmin) {
      bars.push({
        field: 'matchStatus',
        label: 'Match Status',
        type: 'dropdown',
        options: [
          { label: 'Match', value: 'Match' },
          { label: 'No Match', value: 'No Match' },
        ],
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
        // color: 'blue',
      },
      {
        name: 'Report',
        icon: MdPictureAsPdf,
        onClick: (row) => handleGenerateReport(row),
      },
    ];

    // if (isAdmin) {
      actions.push({
        name: 'Delete',
        icon: MdDelete,
        onClick: (row) => handleDelete(row),
        // color: 'red',
      });
    // }

    return actions;
  }, [isAdmin]);

    const rowMenuActions = (row) => [
      { label: 'View', icon: <IoEye />, onClick: () => handleViewDetails(row) },
      { label: 'Report', icon: <MdPictureAsPdf />, onClick: () => handleGenerateReport(row) },
      { label: 'Delete', icon: <MdDelete />, onClick: () => handleDelete(row) },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <h2 className="text-3xl font-bold text-black mb-2">{pageTitle}</h2>
        <p className="text-black/70">{pageDescription}</p>
      </div>

      {actionMessage && (
        <div className="bg-green-500/20 border border-green-500 text-black px-4 py-3 rounded-xl">
          {actionMessage}
        </div>
      )}

      {historyError && (
        <div className="bg-red-500/20 border border-red-500 text-black px-4 py-3 rounded-xl">
          {historyError}
        </div>
      )}

      {historyLoading ? (
        <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-1"></div>
          </div>
        </div>
      ) : (
        <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
          <TableGrid
            columns={columns}
            data={analyses}
            quickActions={quickActions}
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

      <PopupModal
        isOpen={Boolean(deleteTarget)}
        type="confirm"
        title="Delete Analysis"
        message="Are you sure you want to delete this analysis record?"
        onClose={handleCloseDeletePopup}
        onConfirm={handleConfirmDelete}
        confirmText={deleteLoading ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
      />
    </div>
  );
}
