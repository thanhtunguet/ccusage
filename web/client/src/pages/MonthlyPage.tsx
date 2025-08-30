import React, { useEffect, useState } from 'react';
import { Row, Col, DatePicker, Select, Card, Table } from 'antd';
import dayjs from 'dayjs';
import { useMonthlyUsage, useMonthlySummary } from '../hooks/useApiData';
import CostTrendChart from '../components/charts/CostTrendChart';
import ModelBreakdownChart from '../components/charts/ModelBreakdownChart';
import StatCard from '../components/StatCard';
import type { MonthlyUsageData, ApiQueryParams } from '../services/api';

const { MonthPicker } = DatePicker;
const { Option } = Select;

const MonthlyPage: React.FC = () => {
	const [queryParams, setQueryParams] = useState<ApiQueryParams>({
		mode: 'auto',
		instances: false,
		sortOrder: 'desc',
	});

	const monthlyUsage = useMonthlyUsage();
	const monthlySummary = useMonthlySummary();

	useEffect(() => {
		monthlyUsage.refetch(queryParams);
		monthlySummary.refetch(queryParams);
	}, [queryParams, monthlyUsage.refetch, monthlySummary.refetch]);

	const handleModeChange = (mode: 'auto' | 'calculate' | 'display') => {
		setQueryParams(prev => ({ ...prev, mode }));
	};

	const handleInstancesToggle = (instances: boolean) => {
		setQueryParams(prev => ({ ...prev, instances }));
	};

	// Transform monthly data for charts (add date field for compatibility)
	const chartData = (monthlyUsage.data?.data || []).map(item => ({
		...item,
		date: `${item.month}-01`, // Convert YYYY-MM to YYYY-MM-DD for chart compatibility
	}));

	const modelBreakdownData = chartData.reduce((acc, month) => {
		month.modelBreakdown?.forEach(model => {
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

	const columns = [
		{
			title: 'Month',
			dataIndex: 'month',
			key: 'month',
			render: (month: string) => dayjs(`${month}-01`).format('MMMM YYYY'),
			sorter: (a: MonthlyUsageData, b: MonthlyUsageData) => 
				dayjs(`${a.month}-01`).unix() - dayjs(`${b.month}-01`).unix(),
		},
		{
			title: 'Cost (USD)',
			dataIndex: 'totalCostUSD',
			key: 'totalCostUSD',
			render: (cost: number) => `$${cost.toFixed(4)}`,
			sorter: (a: MonthlyUsageData, b: MonthlyUsageData) => a.totalCostUSD - b.totalCostUSD,
		},
		{
			title: 'Tokens',
			dataIndex: 'totalTokens',
			key: 'totalTokens',
			render: (tokens: number) => tokens.toLocaleString(),
			sorter: (a: MonthlyUsageData, b: MonthlyUsageData) => a.totalTokens - b.totalTokens,
		},
		{
			title: 'Models',
			key: 'models',
			render: (record: MonthlyUsageData) => 
				record.modelBreakdown?.map(m => m.model.replace('claude-', '')).join(', ') || '-',
		},
	];

	return (
		<div>
			{/* Filters */}
			<Card className="dashboard-card">
				<div className="filter-controls">
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
						value={monthlySummary.data?.totalCost || 0}
						prefix="$"
						precision={4}
						loading={monthlySummary.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Total Tokens"
						value={monthlySummary.data?.totalTokens || 0}
						formatter={(value) => Number(value).toLocaleString()}
						loading={monthlySummary.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Total Months"
						value={monthlySummary.data?.totalMonths || 0}
						precision={0}
						loading={monthlySummary.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Avg Cost/Month"
						value={monthlySummary.data?.avgCostPerMonth || 0}
						prefix="$"
						precision={4}
						loading={monthlySummary.loading}
					/>
				</Col>
			</Row>

			{/* Charts */}
			<Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
				<Col xs={24} lg={16}>
					<CostTrendChart
						data={chartData}
						loading={monthlyUsage.loading}
						title="Monthly Cost and Token Trends"
						showTokens={true}
					/>
				</Col>
				<Col xs={24} lg={8}>
					<ModelBreakdownChart
						data={modelBreakdownData}
						loading={monthlyUsage.loading}
						title="Model Cost Distribution"
						showBy="cost"
					/>
				</Col>
			</Row>

			{/* Detailed Table */}
			<Card title="Monthly Usage Details" className="dashboard-card">
				<Table
					dataSource={monthlyUsage.data?.data || []}
					columns={columns}
					rowKey="month"
					loading={monthlyUsage.loading}
					pagination={{
						pageSize: 12,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: (total) => `Total ${total} months`,
					}}
					scroll={{ x: 800 }}
				/>
			</Card>
		</div>
	);
};

export default MonthlyPage;