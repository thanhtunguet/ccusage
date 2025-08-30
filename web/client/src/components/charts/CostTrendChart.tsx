import React from 'react';
import { Line } from '@ant-design/charts';
import { Card, Spin, Empty } from 'antd';
import dayjs from 'dayjs';

interface CostTrendChartProps {
	data: Array<{
		date: string;
		totalCostUSD: number;
		totalTokens: number;
		modelBreakdown?: Array<{
			model: string;
			costUSD: number;
		}>;
	}>;
	loading?: boolean;
	title?: string;
	height?: number;
	showTokens?: boolean;
}

const CostTrendChart: React.FC<CostTrendChartProps> = ({
	data,
	loading,
	title = 'Cost Trend',
	height = 400,
	showTokens = false,
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

	// Transform data for the chart
	const chartData = data.filter(item => item && item.date).flatMap(item => {
		const entries = [
			{
				date: item.date,
				value: item.totalCostUSD || 0,
				type: 'Cost (USD)',
			},
		];

		if (showTokens) {
			entries.push({
				date: item.date,
				value: (item.totalTokens || 0) / 1000, // Scale tokens to thousands for better visualization
				type: 'Tokens (K)',
			});
		}

		return entries;
	});

	const config = {
		data: chartData,
		height,
		xField: 'date',
		yField: 'value',
		seriesField: 'type',
		smooth: true,
		color: ['#1890ff', '#52c41a'],
		point: {
			size: 3,
		},
		tooltip: {
			formatter: (datum: any) => {
				const value = datum.type === 'Cost (USD)' 
					? `$${datum.value.toFixed(4)}`
					: `${(datum.value * 1000).toLocaleString()} tokens`;
				
				return {
					name: datum.type,
					value,
				};
			},
		},
		xAxis: {
			type: 'time',
			tickCount: 8,
			label: {
				formatter: (text: string) => {
					return dayjs(text).format('MMM DD');
				},
			},
		},
		yAxis: {
			label: {
				formatter: (text: string) => {
					const num = parseFloat(text);
					if (num >= 1000) {
						return `${(num / 1000).toFixed(1)}K`;
					}
					return num.toFixed(2);
				},
			},
		},
		legend: {
			position: 'top-right' as const,
		},
		animation: {
			appear: {
				animation: 'path-in',
				duration: 1000,
			},
		},
	};

	return (
		<Card title={title} className="dashboard-card">
			<div className="chart-container">
				<Line {...config} />
			</div>
		</Card>
	);
};

export default CostTrendChart;