import React, { useEffect, useState } from 'react';
import { Row, Col, DatePicker, Select, Card, Table, Tag, Switch } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useBlocksUsage, useBlocksSummary } from '../hooks/useApiData';
import CostTrendChart from '../components/charts/CostTrendChart';
import ModelBreakdownChart from '../components/charts/ModelBreakdownChart';
import StatCard from '../components/StatCard';
import type { BlocksUsageData, ApiQueryParams } from '../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const BlocksPage: React.FC = () => {
	const [queryParams, setQueryParams] = useState<ApiQueryParams>({
		mode: 'auto',
		sortOrder: 'desc',
		active: false,
		recent: false,
	});

	const blocksUsage = useBlocksUsage();
	const blocksSummary = useBlocksSummary();

	useEffect(() => {
		blocksUsage.refetch(queryParams);
		blocksSummary.refetch(queryParams);
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

	const handleActiveToggle = (active: boolean) => {
		setQueryParams(prev => ({ ...prev, active }));
	};

	const handleRecentToggle = (recent: boolean) => {
		setQueryParams(prev => ({ ...prev, recent }));
	};

	// Prepare data for charts
	const blocksData = blocksUsage.data?.data || [];
	
	// Transform blocks data for trend chart
	const chartData = blocksData.map(block => ({
		date: dayjs(block.startTime).format('YYYY-MM-DD HH:mm'),
		totalCostUSD: block.costUSD,
		totalTokens: block.totalTokens,
		modelBreakdown: block.models.map(model => ({
			model,
			costUSD: block.costUSD / block.models.length, // Rough approximation
			tokens: block.totalTokens / block.models.length,
		})),
	}));

	const modelBreakdownData = blocksData.reduce((acc, block) => {
		block.models?.forEach(model => {
			const existing = acc.find(item => item.model === model);
			if (existing) {
				existing.costUSD += block.costUSD / block.models.length;
				existing.tokens += block.totalTokens / block.models.length;
			} else {
				acc.push({
					model: model,
					costUSD: block.costUSD / block.models.length,
					tokens: block.totalTokens / block.models.length,
				});
			}
		});
		return acc;
	}, [] as Array<{ model: string; costUSD: number; tokens: number }>);

	// Table columns
	const columns = [
		{
			title: 'Block Period',
			key: 'period',
			render: (record: BlocksUsageData) => (
				<div>
					<div style={{ fontWeight: 'bold' }}>
						{dayjs(record.startTime).format('MMM DD, YYYY HH:mm')}
					</div>
					<div style={{ fontSize: '12px', color: '#666' }}>
						to {dayjs(record.endTime).format('MMM DD, YYYY HH:mm')}
					</div>
				</div>
			),
			sorter: (a: BlocksUsageData, b: BlocksUsageData) => 
				dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
		},
		{
			title: 'Status',
			dataIndex: 'isActive',
			key: 'isActive',
			render: (isActive: boolean) => (
				<Tag color={isActive ? 'green' : 'default'} icon={isActive ? <ClockCircleOutlined /> : null}>
					{isActive ? 'Active' : 'Completed'}
				</Tag>
			),
			filters: [
				{ text: 'Active', value: true },
				{ text: 'Completed', value: false },
			],
			onFilter: (value: any, record: BlocksUsageData) => record.isActive === value,
		},
		{
			title: 'Cost (USD)',
			dataIndex: 'costUSD',
			key: 'costUSD',
			render: (cost: number) => `$${cost.toFixed(4)}`,
			sorter: (a: BlocksUsageData, b: BlocksUsageData) => a.costUSD - b.costUSD,
		},
		{
			title: 'Tokens',
			dataIndex: 'totalTokens',
			key: 'totalTokens',
			render: (tokens: number) => tokens.toLocaleString(),
			sorter: (a: BlocksUsageData, b: BlocksUsageData) => a.totalTokens - b.totalTokens,
		},
		{
			title: 'Duration',
			key: 'duration',
			render: (record: BlocksUsageData) => {
				const duration = dayjs(record.endTime).diff(dayjs(record.startTime), 'hours', true);
				return `${duration.toFixed(1)} hours`;
			},
		},
		{
			title: 'Models',
			key: 'models',
			render: (record: BlocksUsageData) => (
				<div>
					{record.models?.map(model => (
						<Tag key={model} style={{ marginBottom: '2px' }}>
							{model.replace('claude-', '')}
						</Tag>
					)) || '-'}
				</div>
			),
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
					<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
						<div>
							<Switch
								checked={queryParams.active}
								onChange={handleActiveToggle}
								size="small"
							/>
							<span style={{ marginLeft: '8px' }}>Active Only</span>
						</div>
						<div>
							<Switch
								checked={queryParams.recent}
								onChange={handleRecentToggle}
								size="small"
							/>
							<span style={{ marginLeft: '8px' }}>Recent (3 days)</span>
						</div>
					</div>
				</div>
			</Card>

			{/* Summary Stats */}
			<Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Total Cost"
						value={blocksSummary.data?.totalCost || 0}
						prefix="$"
						precision={4}
						loading={blocksSummary.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Total Tokens"
						value={blocksSummary.data?.totalTokens || 0}
						formatter={(value) => Number(value).toLocaleString()}
						loading={blocksSummary.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Total Blocks"
						value={blocksSummary.data?.totalBlocks || 0}
						precision={0}
						loading={blocksSummary.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Avg Cost/Block"
						value={blocksSummary.data?.avgCostPerBlock || 0}
						prefix="$"
						precision={4}
						loading={blocksSummary.loading}
					/>
				</Col>
			</Row>

			{/* Active Block Alert */}
			{blocksSummary.data?.activeBlock && (
				<Card 
					title="Current Active Block" 
					className="dashboard-card"
					style={{ 
						border: '2px solid #52c41a',
						background: '#f6ffed'
					}}
				>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={8}>
							<div>
								<strong>Started:</strong><br />
								{dayjs(blocksSummary.data.activeBlock.blockStart).format('MMM DD, YYYY HH:mm')}
							</div>
						</Col>
						<Col xs={24} sm={8}>
							<div>
								<strong>Current Cost:</strong><br />
								${blocksSummary.data.activeBlock.totalCostUSD.toFixed(4)}
							</div>
						</Col>
						<Col xs={24} sm={8}>
							<div>
								<strong>Current Tokens:</strong><br />
								{blocksSummary.data.activeBlock.totalTokens.toLocaleString()}
							</div>
						</Col>
					</Row>
				</Card>
			)}

			{/* Charts */}
			<Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
				<Col xs={24} lg={16}>
					<CostTrendChart
						data={chartData}
						loading={blocksUsage.loading}
						title="5-Hour Block Cost Trends"
						showTokens={true}
					/>
				</Col>
				<Col xs={24} lg={8}>
					<ModelBreakdownChart
						data={modelBreakdownData}
						loading={blocksUsage.loading}
						title="Model Usage in Blocks"
						showBy="cost"
					/>
				</Col>
			</Row>

			{/* Detailed Table */}
			<Card title="5-Hour Block Details" className="dashboard-card">
				<Table
					dataSource={blocksData}
					columns={columns}
					rowKey={(record) => `${record.startTime}-${record.endTime}`}
					loading={blocksUsage.loading}
					pagination={{
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: (total) => `Total ${total} blocks`,
					}}
					scroll={{ x: 1200 }}
				/>
			</Card>
		</div>
	);
};

export default BlocksPage;