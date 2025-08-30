import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
	CalendarOutlined,
	BarChartOutlined,
	FolderOutlined,
	BlockOutlined,
	EyeOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const AppSidebar: React.FC = () => {
	const [collapsed, setCollapsed] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	const menuItems = [
		{
			key: '/daily',
			icon: <CalendarOutlined />,
			label: 'Daily Usage',
		},
		{
			key: '/monthly',
			icon: <BarChartOutlined />,
			label: 'Monthly Overview',
		},
		{
			key: '/sessions',
			icon: <FolderOutlined />,
			label: 'Sessions',
		},
		{
			key: '/blocks',
			icon: <BlockOutlined />,
			label: '5-Hour Blocks',
		},
		{
			key: '/live',
			icon: <EyeOutlined />,
			label: 'Live Monitoring',
		},
	];

	const handleMenuClick = ({ key }: { key: string }) => {
		navigate(key);
	};

	// Get current selected key based on location
	const selectedKey = location.pathname === '/' ? '/daily' : location.pathname;

	return (
		<Sider 
			trigger={null} 
			collapsible 
			collapsed={collapsed}
			style={{
				background: '#001529',
			}}
		>
			<div style={{ 
				height: 64, 
				display: 'flex', 
				alignItems: 'center', 
				justifyContent: collapsed ? 'center' : 'space-between',
				padding: collapsed ? 0 : '0 16px',
				borderBottom: '1px solid #1f2937'
			}}>
				{!collapsed && (
					<div style={{ 
						color: '#fff', 
						fontSize: '18px', 
						fontWeight: 'bold' 
					}}>
						ccusage
					</div>
				)}
				<div
					style={{ 
						color: '#fff', 
						cursor: 'pointer', 
						padding: '8px',
						borderRadius: '4px',
						transition: 'background-color 0.2s',
					}}
					onClick={() => setCollapsed(!collapsed)}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = 'transparent';
					}}
				>
					{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
				</div>
			</div>
			
			<Menu
				theme="dark"
				mode="inline"
				selectedKeys={[selectedKey]}
				items={menuItems}
				onClick={handleMenuClick}
				style={{ borderRight: 0 }}
			/>
		</Sider>
	);
};

export default AppSidebar;