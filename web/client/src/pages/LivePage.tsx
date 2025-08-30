import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Card, Switch, Button, Alert, Badge } from 'antd';
import { ReloadOutlined, PauseOutlined, PlayCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import CostTrendChart from '../components/charts/CostTrendChart';
import StatCard from '../components/StatCard';
import apiService from '../services/api';

const LivePage: React.FC = () => {
	const [isLive, setIsLive] = useState(true);
	const [lastUpdate, setLastUpdate] = useState<string>(dayjs().format('HH:mm:ss'));
	const [currentData, setCurrentData] = useState<any>(null);
	const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
	const [trendData, setTrendData] = useState<any[]>([]);
	const [trendLoading, setTrendLoading] = useState(false);
	
	// Fetch current data function
	const fetchCurrentData = useCallback(async () => {
		try {
			setConnectionStatus('connecting');
			const data = await apiService.getCurrentUsage();
			setCurrentData(data.current);
			setLastUpdate(dayjs().format('HH:mm:ss'));
			setConnectionStatus('connected');
		} catch (error) {
			console.error('Failed to fetch current data:', error);
			setConnectionStatus('disconnected');
		}
	}, []);

	// Fetch trend data function
	const fetchTrendData = useCallback(async () => {
		try {
			setTrendLoading(true);
			const endDate = dayjs();
			const startDate = endDate.subtract(7, 'day');
			
			const data = await apiService.getDailyUsage({
				from: startDate.format('YYYY-MM-DD'),
				to: endDate.format('YYYY-MM-DD'),
				mode: 'auto',
			});
			
			setTrendData(data.data || []);
		} catch (error) {
			console.error('Failed to fetch trend data:', error);
			setTrendData([]);
		} finally {
			setTrendLoading(false);
		}
	}, []);

	// Initial data load
	useEffect(() => {
		fetchCurrentData();
		fetchTrendData();
	}, []);

	// Auto-refresh effect
	useEffect(() => {
		if (!isLive) return;

		const interval = setInterval(() => {
			fetchCurrentData();
			fetchTrendData();
		}, 30000); // Refresh every 30 seconds

		return () => clearInterval(interval);
	}, [isLive, fetchCurrentData, fetchTrendData]);

	const handleManualRefresh = () => {
		fetchCurrentData();
		fetchTrendData();
	};

	const toggleLiveMode = () => {
		setIsLive(!isLive);
	};

	// Calculate today's stats from trend data
	const todayData = trendData.find(day => 
		dayjs(day.date).isSame(dayjs(), 'day')
	);

	// Calculate this week's stats from trend data
	const weekTotalCost = trendData.reduce((sum, day) => sum + day.totalCostUSD, 0);
	const weekTotalTokens = trendData.reduce((sum, day) => sum + day.totalTokens, 0);

	// Get status color
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'connected': return 'green';
			case 'disconnected': return 'red';
			case 'connecting': return 'orange';
			default: return 'gray';
		}
	};

	return (
		<div>
			{/* Live Controls */}
			<Card className="dashboard-card">
				<div style={{ 
					display: 'flex', 
					justifyContent: 'space-between', 
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: '16px'
				}}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
						<Badge 
							status={getStatusColor(connectionStatus)} 
							text={`Status: ${connectionStatus}`} 
						/>
						<span style={{ color: '#666' }}>
							Last updated: {lastUpdate}
						</span>
					</div>
					
					<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<Switch 
								checked={isLive} 
								onChange={toggleLiveMode}
								checkedChildren={<PlayCircleOutlined />}
								unCheckedChildren={<PauseOutlined />}
							/>
							<span>Live Updates</span>
						</div>
						
						<Button 
							icon={<ReloadOutlined />} 
							onClick={handleManualRefresh}
							loading={connectionStatus === 'connecting'}
						>
							Refresh Now
						</Button>
					</div>
				</div>
			</Card>

			{/* Status Alert */}
			{connectionStatus === 'disconnected' && (
				<Alert
					message="Connection Lost"
					description="Unable to fetch live data. Please check your connection and try refreshing."
					type="error"
					showIcon
					style={{ marginBottom: '16px' }}
				/>
			)}

			{/* Real-time Stats */}
			<Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Today's Cost"
						value={todayData?.totalCostUSD || 0}
						prefix="$"
						precision={4}
						loading={trendLoading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="Today's Tokens"
						value={todayData?.totalTokens || 0}
						formatter={(value) => Number(value).toLocaleString()}
						loading={trendLoading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="This Week's Cost"
						value={weekTotalCost}
						prefix="$"
						precision={4}
						loading={trendLoading}
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						title="This Week's Tokens"
						value={weekTotalTokens}
						formatter={(value) => Number(value).toLocaleString()}
						loading={trendLoading}
					/>
				</Col>
			</Row>

			{/* Current Session Info */}
			{currentData && (
				<Card title="Current Session" className="dashboard-card">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={8}>
							<div>
								<strong>Session Cost:</strong><br />
								${currentData.totalCost?.toFixed(4) || '0.0000'}
							</div>
						</Col>
						<Col xs={24} sm={8}>
							<div>
								<strong>Session Tokens:</strong><br />
								{((currentData.inputTokens || 0) + 
								  (currentData.outputTokens || 0) + 
								  (currentData.cacheCreationTokens || 0) + 
								  (currentData.cacheReadTokens || 0)).toLocaleString()}
							</div>
						</Col>
						<Col xs={24} sm={8}>
							<div>
								<strong>Active Models:</strong><br />
								{currentData.modelsUsed?.map((model: string) => 
									model.replace('claude-', '')
								).join(', ') || 'None'}
							</div>
						</Col>
					</Row>
				</Card>
			)}

			{/* Live Trend Chart */}
			<Row gutter={[16, 16]}>
				<Col xs={24}>
					<CostTrendChart
						data={trendData}
						loading={trendLoading}
						title="Recent Usage Trends (Last 7 Days)"
						showTokens={true}
					/>
				</Col>
			</Row>

			{/* Usage Alerts */}
			<Card title="Usage Alerts" className="dashboard-card">
				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					{weekTotalCost > 10 && (
						<Alert
							message="High Weekly Usage"
							description={`This week's cost ($${weekTotalCost.toFixed(2)}) exceeds $10.00`}
							type="warning"
							showIcon
						/>
					)}
					
					{todayData && todayData.totalCostUSD > 5 && (
						<Alert
							message="High Daily Usage"
							description={`Today's cost ($${todayData.totalCostUSD.toFixed(2)}) exceeds $5.00`}
							type="info"
							showIcon
						/>
					)}
					
					{weekTotalTokens > 1000000 && (
						<Alert
							message="High Token Usage"
							description={`This week's token usage (${weekTotalTokens.toLocaleString()}) exceeds 1M tokens`}
							type="info"
							showIcon
						/>
					)}
					
					{weekTotalCost === 0 && weekTotalTokens === 0 && (
						<Alert
							message="No Recent Activity"
							description="No usage detected in the last 7 days"
							type="info"
							showIcon
						/>
					)}
				</div>
			</Card>
		</div>
	);
};

export default LivePage;