import React, { useEffect, useState } from 'react';
import { Row, Col, DatePicker, Select, Card, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useSessionUsage, useSessionSummary } from '../hooks/useApiData';
import CostTrendChart from '../components/charts/CostTrendChart';
import ModelBreakdownChart from '../components/charts/ModelBreakdownChart';
import StatCard from '../components/StatCard';
import type { SessionUsageData, ApiQueryParams } from '../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SessionPage: React.FC = () => {
	const [queryParams, setQueryParams] = useState<ApiQueryParams>({
		mode: 'auto',
		sortOrder: 'desc',
	});

	const sessionUsage = useSessionUsage();
	const sessionSummary = useSessionSummary();

	useEffect(() => {
		sessionUsage.refetch(queryParams);
		sessionSummary.refetch(queryParams);
	}, [queryParams, sessionUsage.refetch, sessionSummary.refetch]);

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

	const handleProjectFilter = (projects: string[]) => {
		setQueryParams(prev => ({ ...prev, project: projects.length > 0 ? projects : undefined }));
	};

	// Prepare data for charts
	const sessionsData = sessionUsage.data?.data || [];
	
	// Transform session data for cost trend chart (group by date)
	const dailySessionData = sessionsData.reduce((acc, session) => {
		const date = dayjs(session.lastActivity).format('YYYY-MM-DD');
		const existing = acc.find(item => item.date === date);
		if (existing) {
			existing.totalCostUSD += session.totalCost;
			existing.totalTokens += session.totalTokens;
		} else {
			acc.push({
				date,
				totalCostUSD: session.totalCost,
				totalTokens: session.totalTokens,
			});
		}
		return acc;
	}, [] as Array<{ date: string; totalCostUSD: number; totalTokens: number }>)
		.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

	const modelBreakdownData = sessionsData.reduce((acc, session) => {
		session.modelBreakdown?.forEach(model => {
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

	// Get unique projects for filter
	const uniqueProjects = [...new Set(sessionsData.map(session => session.projectPath))];

	// Table columns
	const columns = [
		{
			title: 'Session ID',
			dataIndex: 'sessionId',
			key: 'sessionId',
			render: (sessionId: string) => (
				<span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
					{sessionId.substring(0, 8)}...
				</span>
			),
		},
		{
			title: 'Project',
			dataIndex: 'projectPath',
			key: 'projectPath',
			render: (projectPath: string) => (
				<Tag color="blue">{projectPath}</Tag>
			),
			filters: uniqueProjects.map(project => ({ text: project, value: project })),
			onFilter: (value: any, record: SessionUsageData) => record.projectPath === value,
		},
		{
			title: 'Date',
			dataIndex: 'lastActivity',
			key: 'lastActivity',
			render: (lastActivity: string) => dayjs(lastActivity).format('MMM DD, YYYY'),
			sorter: (a: SessionUsageData, b: SessionUsageData) => dayjs(a.lastActivity).unix() - dayjs(b.lastActivity).unix(),
		},
		{
			title: 'Cost (USD)',
			dataIndex: 'totalCost',
			key: 'totalCost',
			render: (cost: number) => `$${cost.toFixed(4)}`,
			sorter: (a: SessionUsageData, b: SessionUsageData) => a.totalCost - b.totalCost,
		},
		{
			title: 'Tokens',
			dataIndex: 'totalTokens',
			key: 'totalTokens',
			render: (tokens: number) => tokens.toLocaleString(),
			sorter: (a: SessionUsageData, b: SessionUsageData) => a.totalTokens - b.totalTokens,
		},
		{
			title: 'Models',
			key: 'models',
			render: (record: SessionUsageData) => (
				<div>
					{record.modelsUsed?.map(model => (
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
					<Select
						mode="multiple"
						placeholder="Filter by Projects"
						onChange={handleProjectFilter}
						style={{ minWidth: '300px' }}
					>
						{uniqueProjects.map(project => (
							<Option key={project} value={project}>
								{project}
							</Option>
						))}
					</Select>
				</div>
			</Card>

			{/* Summary Stats */}
			<Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Total Cost"
						value={sessionSummary.data?.totalCost || 0}
						prefix="$"
						precision={4}
						loading={sessionSummary.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Total Tokens"
						value={sessionSummary.data?.totalTokens || 0}
						formatter={(value) => Number(value).toLocaleString()}
						loading={sessionSummary.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Total Sessions"
						value={sessionSummary.data?.totalSessions || 0}
						precision={0}
						loading={sessionSummary.loading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Avg Cost/Session"
						value={sessionSummary.data?.avgCostPerSession || 0}
						prefix="$"
						precision={4}
						loading={sessionSummary.loading}
					/>
				</Col>
			</Row>

			{/* Cost Trend Chart */}
		<Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
			<Col xs={24}>
				<CostTrendChart
					data={dailySessionData}
					loading={sessionUsage.loading}
					title="Session Cost Trends by Date"
					showTokens={true}
				/>
			</Col>
		</Row>

		{/* Model Breakdown and Project Stats */}
			<Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
				<Col xs={24} lg={12}>
					<ModelBreakdownChart
						data={modelBreakdownData}
						loading={sessionUsage.loading}
						title="Model Usage Distribution"
						showBy="cost"
					/>
				</Col>
				<Col xs={24} lg={12}>
					<Card title="Projects Overview" className="dashboard-card">
						<div style={{ maxHeight: '350px', overflowY: 'auto' }}>
							{Array.from(new Set(sessionsData.map(s => s.projectPath))).map(project => {
								const projectSessions = sessionsData.filter(s => s.projectPath === project);
								const totalCost = projectSessions.reduce((sum, s) => sum + s.totalCost, 0);
								const totalTokens = projectSessions.reduce((sum, s) => sum + s.totalTokens, 0);
								
								return (
									<div key={project} style={{ 
										display: 'flex', 
										justifyContent: 'space-between', 
										padding: '8px 0',
										borderBottom: '1px solid #f0f0f0'
									}}>
										<span>{project}</span>
										<div style={{ color: '#666', textAlign: 'right' }}>
											<div>{projectSessions.length} sessions</div>
											<div style={{ fontSize: '12px' }}>
												${totalCost.toFixed(4)} • {totalTokens.toLocaleString()} tokens
											</div>
										</div>
									</div>
								);
							})}
							{sessionsData.length === 0 && <div>No session data available</div>}
						</div>
					</Card>
				</Col>
			</Row>

			{/* Detailed Table */}
			<Card title="Session Details" className="dashboard-card">
				<Table
					dataSource={sessionsData}
					columns={columns}
					rowKey="sessionId"
					loading={sessionUsage.loading}
					pagination={{
						pageSize: 20,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: (total) => `Total ${total} sessions`,
					}}
					scroll={{ x: 1200 }}
				/>
			</Card>
		</div>
	);
};

export default SessionPage;