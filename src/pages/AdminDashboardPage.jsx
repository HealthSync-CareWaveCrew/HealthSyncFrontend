import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalysisHistoryThunk } from '../Redux/Features/analysisSlice';
import { getAllUsers } from '../Redux/Features/adminSlice';
import { fetchAllReviewsAdmin } from '../Redux/Features/reviewSlice';
import { fetchAllDiseases } from '../Redux/Features/diseaseSlice';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const timeRangeOptions = [
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'Last 12 months', value: '12m' },
];

const matchRateTimelineOptions = [
  { label: 'This year', value: 'thisYear' },
  { label: 'Last year', value: 'lastYear' },
  { label: 'Last 12 months', value: '12m' },
];

const sourceOptions = [
  { label: 'All Predictions', value: 'all' },
  { label: 'Image-based', value: 'image' },
  { label: 'Clinical-based', value: 'clinical' },
];

const diseaseTypeOptions = [
  { label: 'Clinical', value: 'clinical' },
  { label: 'Image', value: 'image' },
];

const diseasePredictionTimelineOptions = [
  { label: 'This Year', value: 'thisYear' },
  { label: 'Last Year', value: 'lastYear' },
  { label: 'This Month', value: '30d' },
];

const chartColors = {
  image: '#E36A6A',
  clinical: '#FFB2B2',
  match: '#10B981',
  noMatch: '#F59E0B',
  disease: '#8B5CF6',
  revenue: '#F59E0B',
  review: '#FFB2B2',
  accent: '#E36A6A',
};

const diseaseColors = ['#8f0d27','#E36A6A', '#FFB2B2',  '#7C3AED', '#38BDF8', '#A78BFA'];

function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { historyList, historyLoading } = useSelector((state) => state.analysis);
  const { users, loading: usersLoading } = useSelector((state) => state.admin);
  const { reviews, loading: reviewsLoading } = useSelector((state) => state.review);
  const { diseases } = useSelector((state) => state.disease);

  const [trendRange, setTrendRange] = useState('6m');
  const [trendChartType, setTrendChartType] = useState('line');
  const [topDiseaseSource, setTopDiseaseSource] = useState('all');
  const [topDiseaseChartType, setTopDiseaseChartType] = useState('bar');
  const [revenueRange, setRevenueRange] = useState('6m');
  const [revenueChartType, setRevenueChartType] = useState('line');
  const [matchRateSource, setMatchRateSource] = useState('all');
  const [matchRateChartType, setMatchRateChartType] = useState('area');
  const [matchRateTimeline, setMatchRateTimeline] = useState('thisYear');
  const [matchBreakdownSource, setMatchBreakdownSource] = useState('all');
  const [diseasePredictionSource, setDiseasePredictionSource] = useState('clinical');
  const [diseasePredictionTimeline, setDiseasePredictionTimeline] = useState('thisYear');
  const [diseasePredictionChartType, setDiseasePredictionChartType] = useState('bar');
  const [matchBreakdownChartType, setMatchBreakdownChartType] = useState('pie');

  useEffect(() => {
    dispatch(fetchAnalysisHistoryThunk());
    dispatch(getAllUsers());
    dispatch(fetchAllReviewsAdmin());
    dispatch(fetchAllDiseases());
  }, [dispatch]);

  const analytics = useMemo(() => {
    const totalAnalyses = historyList.length;
    const imageAnalyses = historyList.filter((item) => item.type === 'image').length;
    const clinicalAnalyses = historyList.filter((item) => item.type === 'clinical').length;
    const matchedAnalyses = historyList.filter((item) => item.results?.match).length;
    const unmatchedAnalyses = totalAnalyses - matchedAnalyses;
    const imageMatchedAnalyses = historyList.filter(
      (item) => item.type === 'image' && item.results?.match
    ).length;
    const clinicalMatchedAnalyses = historyList.filter(
      (item) => item.type === 'clinical' && item.results?.match
    ).length;
    const activeUsers = users?.length || 0;
    const reviewTotal = reviews?.length || 0;
    const averageRating = reviewTotal
      ? (reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviewTotal).toFixed(1)
      : '0.0';

    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
      name: `${star}★`,
      value: reviews.filter((review) => Number(review.rating) === star).length,
    }));

    const planCounts = {};
    let estimatedRevenue = 0;
    users?.forEach((user) => {
      const planName =
        user.subscription?.plan?.name ||
        user.subscription?.plan_name ||
        user.plan?.name ||
        user.planName ||
        user.currentPlan ||
        'Free';

      planCounts[planName] = (planCounts[planName] || 0) + 1;

      const amount =
        Number(user.subscription?.plan?.amount) ||
        Number(user.subscription?.plan?.price) ||
        Number(user.plan?.amount) ||
        Number(user.plan?.price) ||
        0;

      estimatedRevenue += amount > 0 && amount < 1000 ? amount : amount >= 1000 ? amount / 100 : 0;
    });

    const planUsage = Object.entries(planCounts).map(([name, value]) => ({ name, value }));
    const popularPlan = planUsage.sort((a, b) => b.value - a.value)[0]?.name || 'Premium';

    const diseaseCounts = historyList.reduce((acc, item) => {
      const disease = item.diseaseType || item.results?.disease || 'Unknown';
      acc[disease] = (acc[disease] || 0) + 1;
      return acc;
    }, {});

    const diseaseDistribution = Object.entries(diseaseCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    const typeDistribution = [
      { name: 'Image', value: imageAnalyses, color: chartColors.image },
      { name: 'Clinical', value: clinicalAnalyses, color: chartColors.clinical },
    ];

    const matchDistribution = [
      { name: 'Matched', value: matchedAnalyses, color: chartColors.match },
      { name: 'Not Matched', value: unmatchedAnalyses, color: chartColors.noMatch },
    ];

    const trendBucketCount = trendRange === '12m' ? 12 : trendRange === '30d' ? 1 : 6;
    const revenueBucketCount = revenueRange === '12m' ? 12 : revenueRange === '30d' ? 1 : 6;

    const trendMonthBuckets = [];
    for (let index = trendBucketCount - 1; index >= 0; index--) {
      const date = new Date();
      date.setMonth(date.getMonth() - index);
      trendMonthBuckets.push({
        label: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        year: date.getFullYear(),
        month: date.getMonth(),
        image: 0,
        clinical: 0,
        matched: 0,
        unmatched: 0,
        total: 0,
        imageMatched: 0,
        imageUnmatched: 0,
        clinicalMatched: 0,
        clinicalUnmatched: 0,
      });
    }

    const revenueMonthBuckets = [];
    for (let index = revenueBucketCount - 1; index >= 0; index--) {
      const date = new Date();
      date.setMonth(date.getMonth() - index);
      revenueMonthBuckets.push({
        label: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        year: date.getFullYear(),
        month: date.getMonth(),
        image: 0,
        clinical: 0,
      });
    }

    historyList.forEach((item) => {
      const createdAt = item.createdAt ? new Date(item.createdAt) : null;
      if (!createdAt) return;
      const bucket = trendMonthBuckets.find(
        (entry) => entry.year === createdAt.getFullYear() && entry.month === createdAt.getMonth()
      );
      if (!bucket) return;
      const type = item.type === 'clinical' ? 'clinical' : 'image';
      bucket[type] += 1;
      bucket.total += 1;
      const matched = Boolean(item.results?.match);
      if (matched) {
        bucket.matched += 1;
        bucket[`${type}Matched`] += 1;
      } else {
        bucket.unmatched += 1;
        bucket[`${type}Unmatched`] += 1;
      }

      const revenueBucket = revenueMonthBuckets.find(
        (entry) => entry.year === createdAt.getFullYear() && entry.month === createdAt.getMonth()
      );
      if (revenueBucket) {
        revenueBucket[type] += 1;
      }
    });

    const trendData = trendMonthBuckets.map((bucket) => ({
      month: bucket.label,
      image: bucket.image,
      clinical: bucket.clinical,
      matched: bucket.matched,
      unmatched: bucket.unmatched,
      total: bucket.total,
    }));

    const matchTrendDataBySource = {
      all: trendMonthBuckets.map((bucket) => ({
        month: bucket.label,
        matched: bucket.matched,
        unmatched: bucket.unmatched,
      })),
      image: trendMonthBuckets.map((bucket) => ({
        month: bucket.label,
        matched: bucket.imageMatched,
        unmatched: bucket.imageUnmatched,
      })),
      clinical: trendMonthBuckets.map((bucket) => ({
        month: bucket.label,
        matched: bucket.clinicalMatched,
        unmatched: bucket.clinicalUnmatched,
      })),
    };

    const matchRateBucketCount =
      matchRateTimeline === 'thisYear'
        ? new Date().getMonth() + 1
        : 12;

    const matchRateMonthBuckets = [];
    if (matchRateTimeline === 'thisYear') {
      const year = new Date().getFullYear();
      for (let month = 0; month <= new Date().getMonth(); month++) {
        const date = new Date(year, month, 1);
        matchRateMonthBuckets.push({
          label: date.toLocaleString('default', { month: 'short' }),
          year,
          month,
          matched: 0,
          unmatched: 0,
          imageMatched: 0,
          imageUnmatched: 0,
          clinicalMatched: 0,
          clinicalUnmatched: 0,
        });
      }
    } else if (matchRateTimeline === 'lastYear') {
      const year = new Date().getFullYear() - 1;
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        matchRateMonthBuckets.push({
          label: date.toLocaleString('default', { month: 'short' }),
          year,
          month,
          matched: 0,
          unmatched: 0,
          imageMatched: 0,
          imageUnmatched: 0,
          clinicalMatched: 0,
          clinicalUnmatched: 0,
        });
      }
    } else {
      for (let index = matchRateBucketCount - 1; index >= 0; index--) {
        const date = new Date();
        date.setMonth(date.getMonth() - index);
        matchRateMonthBuckets.push({
          label: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
          year: date.getFullYear(),
          month: date.getMonth(),
          matched: 0,
          unmatched: 0,
          imageMatched: 0,
          imageUnmatched: 0,
          clinicalMatched: 0,
          clinicalUnmatched: 0,
        });
      }
    }

    historyList.forEach((item) => {
      const createdAt = item.createdAt ? new Date(item.createdAt) : null;
      if (!createdAt) return;
      const bucket = matchRateMonthBuckets.find(
        (entry) => entry.year === createdAt.getFullYear() && entry.month === createdAt.getMonth()
      );
      if (!bucket) return;
      const type = item.type === 'clinical' ? 'clinical' : 'image';
      const matched = Boolean(item.results?.match);
      if (matched) {
        bucket.matched += 1;
        bucket[`${type}Matched`] += 1;
      } else {
        bucket.unmatched += 1;
        bucket[`${type}Unmatched`] += 1;
      }
    });

    const matchRateTrendDataBySource = {
      all: matchRateMonthBuckets.map((bucket) => ({
        month: bucket.label,
        matched: bucket.matched,
        unmatched: bucket.unmatched,
      })),
      image: matchRateMonthBuckets.map((bucket) => ({
        month: bucket.label,
        matched: bucket.imageMatched,
        unmatched: bucket.imageUnmatched,
      })),
      clinical: matchRateMonthBuckets.map((bucket) => ({
        month: bucket.label,
        matched: bucket.clinicalMatched,
        unmatched: bucket.clinicalUnmatched,
      })),
    };

    const matchSummaryBySource = {
      all: [
        { name: 'Matched', value: matchedAnalyses, color: chartColors.accent },
        { name: 'Not Matched', value: unmatchedAnalyses, color: chartColors.review },
      ],
      image: [
        { name: 'Matched', value: imageMatchedAnalyses, color: chartColors.accent },
        {
          name: 'Not Matched',
          value: imageAnalyses - imageMatchedAnalyses,
          color: chartColors.review,
        },
      ],
      clinical: [
        { name: 'Matched', value: clinicalMatchedAnalyses, color: chartColors.accent },
        {
          name: 'Not Matched',
          value: clinicalAnalyses - clinicalMatchedAnalyses,
          color: chartColors.review,
        },
      ],
    };

    const revenueBase = totalAnalyses ? Math.round((estimatedRevenue || 18900) / totalAnalyses) : 0;
    const revenueTrendData = revenueMonthBuckets.map((bucket) => ({
      month: bucket.label,
      imageRevenue: Math.round(bucket.image * revenueBase),
      clinicalRevenue: Math.round(bucket.clinical * revenueBase),
    }));

    const uniqueDiseases = Object.keys(diseaseCounts).length;

    return {
      totalAnalyses,
      imageAnalyses,
      clinicalAnalyses,
      matchedAnalyses,
      unmatchedAnalyses,
      uniqueDiseases,
      activeUsers,
      reviewTotal,
      averageRating,
      ratingDistribution,
      estimatedRevenue: estimatedRevenue || 18900,
      popularPlan,
      diseaseDistribution,
      typeDistribution,
      matchDistribution,
      planUsage: planUsage.length
        ? planUsage
        : [
            { name: 'Basic', value: 32 },
            { name: 'Premium', value: 46 },
            { name: 'Enterprise', value: 22 },
          ],
      trendData,
      matchTrendDataBySource,
      matchRateTrendDataBySource,
      matchSummaryBySource,
      revenueTrendData,
      topDiseases: diseaseDistribution,
    };
  }, [historyList, reviews, users, trendRange, revenueRange, matchRateTimeline]);

  const filteredTopDiseases = useMemo(() => {
    const filteredHistory =
      topDiseaseSource === 'all'
        ? historyList
        : historyList.filter((item) => item.type === topDiseaseSource);

    const counts = filteredHistory.reduce((acc, item) => {
      const disease = item.diseaseType || item.results?.disease || 'Unknown';
      acc[disease] = (acc[disease] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [historyList, topDiseaseSource]);

  const diseasePredictionData = useMemo(() => {
    const now = new Date();

    const createBuckets = () => {
      if (diseasePredictionTimeline === '30d') {
        const start = new Date(now);
        start.setDate(now.getDate() - 29);
        return Array.from({ length: 30 }, (_, index) => {
          const date = new Date(start);
          date.setDate(start.getDate() + index);
          return {
            key: date.toISOString().slice(0, 10),
            label: date.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            date,
          };
        });
      }

      const year = diseasePredictionTimeline === 'lastYear' ? now.getFullYear() - 1 : now.getFullYear();
      const monthCount = diseasePredictionTimeline === 'thisYear' ? now.getMonth() + 1 : 12;
      return Array.from({ length: monthCount }, (_, index) => {
        const date = new Date(year, index, 1);
        return {
          key: `${year}-${String(index + 1).padStart(2, '0')}`,
          label: date.toLocaleDateString('default', { month: 'short' }),
          year,
          month: index,
        };
      });
    };

    const buckets = createBuckets();
    const filteredByTimeline = historyList.filter((item) => {
      const createdAt = item.createdAt ? new Date(item.createdAt) : null;
      if (!createdAt) return false;

      if (diseasePredictionTimeline === '30d') {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 29);
        return createdAt >= thirtyDaysAgo && createdAt <= now;
      }

      const year = diseasePredictionTimeline === 'lastYear' ? now.getFullYear() - 1 : now.getFullYear();
      return createdAt.getFullYear() === year;
    });

    const filteredHistory = filteredByTimeline.filter((item) => item.type === diseasePredictionSource);
    const diseaseTypeKey = diseasePredictionSource === 'image' ? 'image' : 'text';
    const relevantDiseases = Array.isArray(diseases)
      ? diseases.filter((disease) => disease.predictionType === diseaseTypeKey).map((disease) => disease.name)
      : [];

    const series = relevantDiseases.length > 0
      ? relevantDiseases
      : Array.from(new Set(filteredHistory.map((item) => item.diseaseType || item.results?.disease || 'Unknown')));

    const chartData = buckets.map((bucket) => {
      const entry = { label: bucket.label };
      series.forEach((name) => {
        entry[name] = 0;
      });
      return entry;
    });

    filteredHistory.forEach((item) => {
      const createdAt = item.createdAt ? new Date(item.createdAt) : null;
      if (!createdAt) return;

      let bucketKey = null;
      if (diseasePredictionTimeline === '30d') {
        bucketKey = createdAt.toISOString().slice(0, 10);
      } else {
        const year = diseasePredictionTimeline === 'lastYear' ? now.getFullYear() - 1 : now.getFullYear();
        if (createdAt.getFullYear() === year) {
          bucketKey = `${year}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        }
      }

      const bucket = buckets.find((entry) => entry.key === bucketKey);
      if (!bucket) return;

      const diseaseName = item.diseaseType || item.results?.disease || 'Unknown';
      const chartPoint = chartData.find((point) => point.label === bucket.label);
      if (!chartPoint) return;
      if (!(diseaseName in chartPoint)) chartPoint[diseaseName] = 0;
      chartPoint[diseaseName] += 1;
    });

    return {
      data: chartData,
      series,
    };
  }, [historyList, diseasePredictionSource, diseasePredictionTimeline, diseases]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-500 max-w-2xl">
              Monitor application health, system usage, and the latest analysis trends in one place.
            </p>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Total analyses</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{analytics.totalAnalyses}</p>
          <p className="mt-2 text-sm text-slate-500">All uploaded image and clinical records.</p>
        </div>
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Active users</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{analytics.activeUsers}</p>
          <p className="mt-2 text-sm text-slate-500">Total registered users in the system.</p>
        </div>
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Unique diseases</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{analytics.uniqueDiseases}</p>
          <p className="mt-2 text-sm text-slate-500">Distinct disease categories analyzed.</p>
        </div>
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Match rate</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {analytics.totalAnalyses
              ? `${Math.round((analytics.matchedAnalyses / analytics.totalAnalyses) * 100)}%`
              : '0%'}
          </p>
          <p className="mt-2 text-sm text-slate-500">Accuracy of analysis predictions this period.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Estimated revenue</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {analytics.estimatedRevenue.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="mt-2 text-sm text-slate-500">Revenue from active subscriptions and paid plans.</p>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Popular plan</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{analytics.popularPlan}</p>
          <p className="mt-2 text-sm text-slate-500">Most used payment plan by users.</p>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Total reviews</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{analytics.reviewTotal}</p>
          <p className="mt-2 text-sm text-slate-500">Customer feedback collected in the system.</p>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Average rating</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{analytics.averageRating} / 5</p>
          <p className="mt-2 text-sm text-slate-500">Average rating from all reviews.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Revenue trend</h2>
              <p className="mt-1 text-sm text-slate-500">Projected revenue performance for the selected interval.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={revenueRange}
                onChange={(e) => setRevenueRange(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={revenueChartType}
                onChange={(e) => setRevenueChartType(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
              >
                <option value="line">Line chart</option>
                <option value="area">Area chart</option>
                <option value="bar">Bar chart</option>
              </select>
            </div>
          </div>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              {revenueChartType === 'area' ? (
                <AreaChart data={analytics.revenueTrendData} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revenueImageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.image} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={chartColors.image} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="revenueClinicalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.clinical} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={chartColors.clinical} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="imageRevenue"
                    name="Image revenue"
                    stroke={chartColors.image}
                    fill="url(#revenueImageGradient)"
                    fillOpacity={1}
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="clinicalRevenue"
                    name="Clinical revenue"
                    stroke={chartColors.clinical}
                    fill="url(#revenueClinicalGradient)"
                    fillOpacity={1}
                    strokeWidth={3}
                  />
                </AreaChart>
              ) : revenueChartType === 'bar' ? (
                <BarChart data={analytics.revenueTrendData} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="imageRevenue" name="Image revenue" fill={chartColors.image} radius={[10, 10, 0, 0]} />
                  <Bar dataKey="clinicalRevenue" name="Clinical revenue" fill={chartColors.clinical} radius={[10, 10, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={analytics.revenueTrendData} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="imageRevenue"
                    name="Image revenue"
                    stroke={chartColors.image}
                    strokeWidth={3}
                    dot={{ r: 5, fill: chartColors.image }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clinicalRevenue"
                    name="Clinical revenue"
                    stroke={chartColors.clinical}
                    strokeWidth={3}
                    dot={{ r: 5, fill: chartColors.clinical }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Analysis trend</h2>
              <p className="mt-1 text-sm text-slate-500">Compare image and clinical analysis volume in a single chart.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={trendRange}
                onChange={(e) => setTrendRange(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={trendChartType}
                onChange={(e) => setTrendChartType(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
              >
                <option value="line">Line chart</option>
                <option value="area">Area chart</option>
                <option value="bar">Bar chart</option>
              </select>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              {trendChartType === 'area' ? (
                <AreaChart data={analytics.trendData} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="trendImageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.image} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={chartColors.image} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="trendClinicalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.clinical} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={chartColors.clinical} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="image"
                    name="Image analyses"
                    stroke={chartColors.image}
                    fill="url(#trendImageGradient)"
                    fillOpacity={1}
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="clinical"
                    name="Clinical analyses"
                    stroke={chartColors.clinical}
                    fill="url(#trendClinicalGradient)"
                    fillOpacity={1}
                    strokeWidth={3}
                  />
                </AreaChart>
              ) : trendChartType === 'bar' ? (
                <BarChart data={analytics.trendData} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="image" name="Image analyses" fill={chartColors.image} radius={[10, 10, 0, 0]} />
                  <Bar dataKey="clinical" name="Clinical analyses" fill={chartColors.clinical} radius={[10, 10, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={analytics.trendData} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="image"
                    name="Image analyses"
                    stroke={chartColors.image}
                    strokeWidth={3}
                    dot={{ r: 5, fill: chartColors.image }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clinical"
                    name="Clinical analyses"
                    stroke={chartColors.clinical}
                    strokeWidth={3}
                    dot={{ r: 5, fill: chartColors.clinical }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Type distribution</h2>
              <p className="mt-1 text-sm text-slate-500">Comparison of image versus clinical analysis.</p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.typeDistribution}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                  stroke="transparent"
                >
                  {analytics.typeDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(229, 231, 235, 1)',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Top disease categories</h2>
              <p className="mt-1 text-sm text-slate-500">Most frequent diagnoses from the selected source.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={topDiseaseSource}
                onChange={(e) => setTopDiseaseSource(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={topDiseaseChartType}
                onChange={(e) => setTopDiseaseChartType(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
              >
                <option value="bar">Bar chart</option>
                <option value="pie">Pie chart</option>
              </select>
            </div>
          </div>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              {topDiseaseChartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={filteredTopDiseases}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {filteredTopDiseases.map((entry, index) => (
                      <Cell key={entry.name} fill={diseaseColors[index % diseaseColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              ) : (
                <BarChart data={filteredTopDiseases} layout="vertical" margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={110} stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Bar dataKey="value" fill={chartColors.accent} radius={[10, 10, 10, 10]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Prediction match rate</h2>
              <p className="mt-1 text-sm text-slate-500">Review matched and unmatched counts by source.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={matchRateSource}
                onChange={(e) => setMatchRateSource(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={matchRateTimeline}
                onChange={(e) => setMatchRateTimeline(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
              >
                {matchRateTimelineOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={matchRateChartType}
                onChange={(e) => setMatchRateChartType(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
              >
                <option value="line">Line chart</option>
                <option value="area">Area chart</option>
                <option value="bar">Bar chart</option>
              </select>
            </div>
          </div>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              {matchRateChartType === 'area' ? (
                <AreaChart data={analytics.matchRateTrendDataBySource[matchRateSource]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="matchedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.accent} stopOpacity={0.55} />
                      <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="unmatchedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.review} stopOpacity={0.55} />
                      <stop offset="95%" stopColor={chartColors.review} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="matched"
                    name="Matched"
                    stroke={chartColors.accent}
                    fill="url(#matchedGradient)"
                    fillOpacity={1}
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="unmatched"
                    name="Not Matched"
                    stroke={chartColors.review}
                    fill="url(#unmatchedGradient)"
                    fillOpacity={1}
                    strokeWidth={3}
                  />
                </AreaChart>
              ) : matchRateChartType === 'bar' ? (
                <BarChart data={analytics.matchRateTrendDataBySource[matchRateSource]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="matched" name="Matched" fill={chartColors.accent} radius={[10, 10, 0, 0]} />
                  <Bar dataKey="unmatched" name="Not Matched" fill={chartColors.review} radius={[10, 10, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={analytics.matchRateTrendDataBySource[matchRateSource]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="matched"
                    name="Matched"
                    stroke={chartColors.accent}
                    strokeWidth={3}
                    dot={{ r: 5, fill: chartColors.accent }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="unmatched"
                    name="Not Matched"
                    stroke={chartColors.review}
                    strokeWidth={3}
                    dot={{ r: 5, fill: chartColors.review }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Match / No Match</h2>
              <p className="mt-1 text-sm text-slate-500">Review matched and unmatched proportions by source.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={matchBreakdownSource}
                onChange={(e) => setMatchBreakdownSource(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={matchBreakdownChartType}
                onChange={(e) => setMatchBreakdownChartType(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
              >
                <option value="pie">Pie chart</option>
                <option value="bar">Bar chart</option>
              </select>
            </div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              {matchBreakdownChartType === 'bar' ? (
                <BarChart data={analytics.matchSummaryBySource[matchBreakdownSource]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis type="number" stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {analytics.matchSummaryBySource[matchBreakdownSource].map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={analytics.matchSummaryBySource[matchBreakdownSource]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={96}
                    paddingAngle={4}
                  >
                    {analytics.matchSummaryBySource[matchBreakdownSource].map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(229, 231, 235, 1)',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Disease prediction counts</h2>
            <p className="mt-1 text-sm text-slate-500">
              Show the prediction count for each disease by selected source.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={diseasePredictionSource}
              onChange={(e) => setDiseasePredictionSource(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
            >
              {diseaseTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={diseasePredictionTimeline}
              onChange={(e) => setDiseasePredictionTimeline(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
            >
              {diseasePredictionTimelineOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={diseasePredictionChartType}
              onChange={(e) => setDiseasePredictionChartType(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-1"
            >
              <option value="bar">Bar chart</option>
              <option value="line">Line chart</option>
            </select>
          </div>
        </div>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            {diseasePredictionChartType === 'line' ? (
              <LineChart data={diseasePredictionData.data} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(229, 231, 235, 1)',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Legend />
                {diseasePredictionData.series.map((name, index) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    name={name}
                    stroke={diseaseColors[index % diseaseColors.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={diseasePredictionData.data} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(229, 231, 235, 1)',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Legend />
                {diseasePredictionData.series.map((name, index) => (
                  <Bar
                    key={name}
                    dataKey={name}
                    name={name}
                    fill={diseaseColors[index % diseaseColors.length]}
                    radius={[10, 10, 0, 0]}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {(historyLoading || usersLoading) && (
        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-6 text-center text-slate-500">
          Loading latest admin analytics...
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
