import React from 'react';
import { Pie } from '@ant-design/charts';
import { Card, Spin, Empty } from 'antd';

interface ModelBreakdownChartProps {
	data: Array<{
		model: string;
		costUSD: number;
		tokens: number;
	}>;
	loading?: boolean;
	title?: string;
	height?: number;
	showBy?: 'cost' | 'tokens';
}

const ModelBreakdownChart: React.FC<ModelBreakdownChartProps> = ({
	data,
	loading,
	title = 'Model Usage Breakdown',
	height = 400,
	showBy = 'cost',
}) => {
	if (loading) {
		return (
			<Card title={title} className="dashboard-card">
				<div className="loading-container">
					<Spin size="large" />
				</div>
			</Card>
		);
	}

	if (!data || data.length === 0) {
		return (
			<Card title={title} className="dashboard-card">
				<Empty description="No data available" />
			</Card>
		);
	}

	// Filter out invalid data items
	const validData = data.filter(item => 
		item && 
		typeof item === 'object' && 
		item.model && 
		typeof item.model === 'string' &&
		item.model.trim().length > 0 &&
		(item.costUSD > 0 || item.cost > 0 || item.tokens > 0)
	);

	if (validData.length === 0) {
		return (
			<Card title={title} className="dashboard-card">
				<Empty description="No valid model data" />
			</Card>
		);
	}

	// Transform data for the chart
	const chartData = validData.map(item => {
		const cleanModelName = (item.model || 'unknown').trim().replace('claude-', '');
		const fullModelName = (item.model || 'unknown').trim();
		
		return {
			model: cleanModelName || 'unknown', // Ensure we never have empty strings
			value: showBy === 'cost' ? (item.costUSD || item.cost || 0) : (item.tokens || 0),
			fullModel: fullModelName || 'unknown',
			cost: item.costUSD || item.cost || 0,
			costUSD: item.costUSD || item.cost || 0,
			tokens: item.tokens || 0,
		};
	});

	// Define colors for different models
	const getModelColor = (model: string): string => {
		const modelStr = (model || '').toLowerCase();
		if (modelStr.includes('sonnet-4')) return '#1890ff';
		if (modelStr.includes('opus-4')) return '#722ed1';
		if (modelStr.includes('haiku')) return '#52c41a';
		if (modelStr.includes('sonnet-3')) return '#13c2c2';
		if (modelStr.includes('opus-3')) return '#eb2f96';
		return '#fa8c16';
	};

	const config = {
		data: chartData,
		height,
		angleField: 'value',
		colorField: 'model',
		color: chartData.map(item => getModelColor(item.fullModel)),
		radius: 0.8,
		innerRadius: 0.4,
		label: {
			visible: true,
		},
		tooltip: {
			formatter: (datum: any) => {
				if (!datum || typeof datum !== 'object') {
					return { name: 'unknown', value: 'No data' };
				}
				
				const cost = datum.cost || datum.costUSD || datum.data?.cost || datum.data?.costUSD || 0;
				const tokens = datum.tokens || datum.data?.tokens || 0;
				const costValue = `$${cost.toFixed(4)}`;
				const tokensValue = tokens.toLocaleString();
				
				return {
					name: datum.fullModel || datum.model || datum.data?.fullModel || datum.data?.model || 'unknown',
					value: showBy === 'cost' 
						? `${costValue} (${tokensValue} tokens)`
						: `${tokensValue} tokens (${costValue})`,
				};
			},
		},
		legend: {
			position: 'right' as const,
			itemWidth: 12,
			formatter: (text: string, item: any) => {
				return item.fullModel;
			},
		},
		statistic: {
			title: false,
			content: {
				style: {
					fontSize: '20px',
					fontWeight: 'bold',
				},
				formatter: () => {
					const total = chartData.reduce((sum, item) => sum + item.value, 0);
					return showBy === 'cost' 
						? `$${total.toFixed(2)}`
						: `${total.toLocaleString()}`;
				},
			},
		},
		animation: {
			appear: {
				animation: 'bounce-in',
				duration: 1000,
			},
		},
	};

	return (
		<Card title={title} className="dashboard-card">
			<div className="chart-container">
				<Pie {...config} />
			</div>
		</Card>
	);
};

export default ModelBreakdownChart;