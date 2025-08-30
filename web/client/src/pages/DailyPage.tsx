import React, { useEffect, useState } from 'react';
import { Row, Col, DatePicker, Select, Card, Table, message } from 'antd';
import dayjs from 'dayjs';
import { useDailyUsage, useDailySummary } from '../hooks/useApiData';
import CostTrendChart from '../components/charts/CostTrendChart';
import ModelBreakdownChart from '../components/charts/ModelBreakdownChart';
import StatCard from '../components/StatCard';
import type { DailyUsageData, ApiQueryParams } from '../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DailyPage: React.FC = () => {
	const [queryParams, setQueryParams] = useState<ApiQueryParams>({
		mode: 'auto',
		instances: false,
		sortOrder: 'desc',
	});

	const dailyUsage = useDailyUsage();
	const dailySummary = useDailySummary();

	useEffect(() => {
		// Load data when component mounts or params change
		dailyUsage.refetch(queryParams);
		dailySummary.refetch(queryParams);
	}, [queryParams]);

	const handleDateRangeChange = (dates: any) => {
		if (dates && dates.length === 2) {
			setQueryParams(prev => ({
				...prev,
				from: dates[0].format('YYYY-MM-DD'),
				to: dates[1].format('YYYY-MM-DD'),
			}));
		} else {
			setQueryParams(prev => ({
				...prev,
				from: undefined,
				to: undefined,
			}));
		}
	};

	const handleModeChange = (mode: 'auto' | 'calculate' | 'display') => {
		setQueryParams(prev => ({ ...prev, mode }));
	};

	const handleInstancesToggle = (instances: boolean) => {
		setQueryParams(prev => ({ ...prev, instances }));
	};

	// Prepare data for charts
	const rawChartData = dailyUsage.data?.data || [];
	
	// Apply client-side filtering
	const chartData = rawChartData.filter(day => {
		const dayDate = dayjs(day.date);
		
		// Apply date range filter if specified
		if (queryParams.from && queryParams.to) {
			const fromDate = dayjs(queryParams.from);
			const toDate = dayjs(queryParams.to).endOf('day');
			if (dayDate.isBefore(fromDate, 'day') || dayDate.isAfter(toDate, 'day')) return false;
		} else if (queryParams.from) {
			const fromDate = dayjs(queryParams.from);
			if (!dayDate.isSameOrAfter(fromDate, 'day')) return false;
		} else if (queryParams.to) {
			const toDate = dayjs(queryParams.to).endOf('day');
			if (!dayDate.isSameOrBefore(toDate, 'day')) return false;
		}
		
		return true;
	});
	
	// Debug logging
	console.log('Daily page - queryParams:', queryParams);
	console.log('Daily page - rawChartData length:', rawChartData.length);
	console.log('Daily page - filtered chartData length:', chartData.length);
	console.log('Daily page - first few filtered dates:', chartData.slice(0, 3).map(d => d.date));

	// Calculate client-side summary stats from filtered data
	const clientSummaryStats = {
		totalDays: chartData.length,
		totalCost: chartData.reduce((sum, day) => sum + (day.totalCostUSD || 0), 0),
		totalTokens: chartData.reduce((sum, day) => sum + (day.totalTokens || 0), 0),
		avgCostPerDay: 0, // Will calculate below
	};
	clientSummaryStats.avgCostPerDay = clientSummaryStats.totalDays > 0 
		? clientSummaryStats.totalCost / clientSummaryStats.totalDays 
		: 0;
	
	// Debug the calculation
	console.log('Daily page - clientSummaryStats:', clientSummaryStats);

	const modelBreakdownData = chartData.reduce((acc, day) => {
		day.modelBreakdown?.forEach(model => {
			const existing = acc.find(item => item.model === model.model);
			if (existing) {
				existing.costUSD += model.costUSD;
				existing.tokens += model.tokens;
			} else {
				acc.push({
					model: model.model,
					costUSD: model.costUSD,
					tokens: model.tokens,
				});
			}
		});
		return acc;
	}, [] as Array<{ model: string; costUSD: number; tokens: number }>);

	// Table columns for detailed view
	const columns = [
		{
			title: 'Date',
			dataIndex: 'date',
			key: 'date',
			render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
			sorter: (a: DailyUsageData, b: DailyUsageData) => dayjs(a.date).unix() - dayjs(b.date).unix(),
		},
		{
			title: 'Cost (USD)',
			dataIndex: 'totalCostUSD',
			key: 'totalCostUSD',
			render: (cost: number) => `$${cost.toFixed(4)}`,
			sorter: (a: DailyUsageData, b: DailyUsageData) => a.totalCostUSD - b.totalCostUSD,
		},
		{
			title: 'Tokens',
			dataIndex: 'totalTokens',
			key: 'totalTokens',
			render: (tokens: number) => tokens.toLocaleString(),
			sorter: (a: DailyUsageData, b: DailyUsageData) => a.totalTokens - b.totalTokens,
		},
		{
			title: 'Models',
			key: 'models',
			render: (record: DailyUsageData) => 
				record.modelBreakdown?.map(m => m.model.replace('claude-', '')).join(', ') || '-',
		},
	];

	return (
		<div>
			{/* Filters */}
			<Card className="dashboard-card">
				<div className="filter-controls">
					<RangePicker
						onChange={handleDateRangeChange}
						format="YYYY-MM-DD"
						placeholder={['Start Date', 'End Date']}
					/>
					<Select
						value={queryParams.mode}
						onChange={handleModeChange}
						placeholder="Cost Mode"
					>
						<Option value="auto">Auto</Option>
						<Option value="calculate">Calculate</Option>
						<Option value="display">Display</Option>
					</Select>
					<Select
						value={queryParams.instances}
						onChange={handleInstancesToggle}
						placeholder="Show Instances"
					>
						<Option value={false}>Summary Only</Option>
						<Option value={true}>Include Instances</Option>
					</Select>
				</div>
			</Card>

			{/* Summary Stats */}
			<Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Total Cost"
						value={clientSummaryStats.totalCost}
						prefix="$"
						precision={4}
						loading={dailyUsage.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Total Tokens"
						value={clientSummaryStats.totalTokens}
						formatter={(value) => Number(value).toLocaleString()}
						loading={dailyUsage.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Total Days"
						value={clientSummaryStats.totalDays}
						precision={0}
						loading={dailyUsage.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Avg Cost/Day"
						value={clientSummaryStats.avgCostPerDay}
						prefix="$"
						precision={4}
						loading={dailyUsage.loading}
					/>
				</Col>
			</Row>

			{/* Charts */}
			<Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
				<Col xs={24} lg={16}>
					<CostTrendChart
						data={chartData}
						loading={dailyUsage.loading}
						title="Daily Cost and Token Trends"
						showTokens={true}
					/>
				</Col>
				<Col xs={24} lg={8}>
					<ModelBreakdownChart
						data={modelBreakdownData}
						loading={dailyUsage.loading}
						title="Model Cost Distribution"
						showBy="cost"
					/>
				</Col>
			</Row>

			{/* Detailed Table */}
			<Card title="Daily Usage Details" className="dashboard-card">
				<Table
					dataSource={chartData}
					columns={columns}
					rowKey="date"
					loading={dailyUsage.loading}
					pagination={{
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: (total) => `Total ${total} days`,
					}}
					scroll={{ x: 800 }}
				/>
			</Card>
		</div>
	);
};

export default DailyPage;