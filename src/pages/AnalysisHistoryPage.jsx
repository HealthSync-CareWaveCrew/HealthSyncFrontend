import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAnalysisAPI } from '../Redux/Api/api';
import { fetchAnalysisHistoryThunk } from '../Redux/Features/analysisSlice';
import TableGrid from '../libraries/TableGrid';
import { IoEye } from 'react-icons/io5';
import { MdDownload } from 'react-icons/md';

export default function AnalysisHistoryPage({ isAdmin = false }) {
  const dispatch = useDispatch();
  const { historyList, historyLoading, historyError } = useSelector((state) => state.analysis);
  
  const [actionMessage, setActionMessage] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

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

  const handleDelete = async (rowData) => {
    const shouldDelete = window.confirm('Delete this analysis record?');
    if (!shouldDelete) return;

    try {
      await deleteAnalysisAPI(rowData._id);
      setActionMessage('Analysis deleted successfully.');
      fetchAnalysisHistory();
    } catch (deleteError) {
      const errorMsg =
        deleteError.response?.data?.message ||
        deleteError.message ||
        'Failed to delete analysis.';
      alert(errorMsg);
    }
  };

  const handleViewDetails = (rowData) => {
    setSelectedAnalysis(rowData);
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
        handler: handleViewDetails,
        color: 'blue',
      },
    ];

    // if (isAdmin) {
      actions.push({
        name: 'Delete',
        icon: MdDownload,
        handler: handleDelete,
        color: 'red',
      });
    // }

    return actions;
  }, [isAdmin]);

    const rowMenuActions = (row) => [
    { label: "View", icon: <IoEye />, onClick: () => alert(`View`) },
    { label: "Download", icon: <MdDownload />, onClick: () => alert(`Download`) },
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

      {/* Details Drawer */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm">
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-2 to-primary-1 text-white p-6 border-b border-primary-2/30">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Analysis Details</h3>
                <button
                  onClick={() => setSelectedAnalysis(null)}
                  className="text-2xl leading-none hover:opacity-70 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Type & Disease */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-black/70">Analysis Type</label>
                  <p className="text-black capitalize mt-1">{selectedAnalysis.type}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-black/70">Disease</label>
                  <p className="text-black mt-1">
                    {selectedAnalysis.diseaseType || selectedAnalysis.disease?.name || '-'}
                  </p>
                </div>
              </div>

              {/* Match Status */}
              <div className="bg-primary-4 rounded-lg p-4">
                <label className="text-sm font-semibold text-black/70">Match Status</label>
                <p className="mt-2">
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold inline-block ${
                      selectedAnalysis.results?.match
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {selectedAnalysis.results?.match ? 'Match Found' : 'No Match'}
                  </span>
                </p>
              </div>

              {/* Prediction Results */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-black/70">Predicted Disease</label>
                  <p className="text-black mt-1 font-medium">
                    {selectedAnalysis.results?.disease || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-black/70">Confidence</label>
                  <p className="mt-1 text-lg font-semibold text-primary-1">
                    {selectedAnalysis.results?.confidence || '-'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedAnalysis.results?.description && (
                <div>
                  <label className="text-sm font-semibold text-black/70">Description</label>
                  <p className="text-black mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedAnalysis.results.description}
                  </p>
                </div>
              )}

              {/* Reason (for mismatch) */}
              {selectedAnalysis.results?.reason && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <label className="text-sm font-semibold text-yellow-900/70">Reason</label>
                  <p className="text-yellow-900 mt-2 text-sm">
                    {selectedAnalysis.results.reason}
                  </p>
                </div>
              )}

              {/* Form Data (for clinical) */}
              {selectedAnalysis.formData &&
                selectedAnalysis.type === 'clinical' &&
                Object.keys(selectedAnalysis.formData).length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-black/70">Clinical Data</label>
                    <div className="mt-2 space-y-2 bg-primary-4 rounded-lg p-4">
                      {Object.entries(selectedAnalysis.formData).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-black/70 capitalize">{key}:</span>
                          <span className="text-black font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* User Info (admin view) */}
              {isAdmin && selectedAnalysis.user && (
                <div className="bg-primary-4 rounded-lg p-4">
                  <label className="text-sm font-semibold text-black/70">User</label>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-black font-medium">{selectedAnalysis.user.name}</p>
                    <p className="text-black/70">{selectedAnalysis.user.email}</p>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="text-xs text-black/50 border-t border-primary-2/30 pt-4">
                <p>Created: {new Date(selectedAnalysis.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Overlay click to close */}
          <div className="absolute inset-0 z-40" onClick={() => setSelectedAnalysis(null)} />
        </div>
      )}
    </div>
  );
}
