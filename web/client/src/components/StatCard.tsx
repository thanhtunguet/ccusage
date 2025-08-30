import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
	title: string;
	value: number | string;
	prefix?: React.ReactNode;
	suffix?: string;
	precision?: number;
	loading?: boolean;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	formatter?: (value: number | string) => string;
}

const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	prefix,
	suffix,
	precision = 2,
	loading = false,
	trend,
	formatter,
}) => {
	const formattedValue = formatter ? formatter(value) : value;

	return (
		<Card className="stat-card dashboard-card" loading={loading}>
			<Statistic
				title={title}
				value={formattedValue}
				prefix={prefix}
				suffix={suffix}
				precision={typeof value === 'number' ? precision : 0}
				valueStyle={{ 
					color: trend 
						? trend.isPositive 
							? '#52c41a' 
							: '#f5222d'
						: '#1890ff',
					fontSize: '28px',
					fontWeight: 'bold',
				}}
			/>
			{trend && (
				<div style={{ 
					marginTop: '8px', 
					fontSize: '14px',
					color: trend.isPositive ? '#52c41a' : '#f5222d',
				}}>
					{trend.isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
					<span style={{ marginLeft: '4px' }}>
						{Math.abs(trend.value).toFixed(1)}% from last period
					</span>
				</div>
			)}
		</Card>
	);
};

export default StatCard;