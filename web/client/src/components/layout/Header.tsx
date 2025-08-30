import React from 'react';
import { Layout, Typography, Space, Button } from 'antd';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader: React.FC = () => {
	const handleRefresh = () => {
		window.location.reload();
	};

	return (
		<Header style={{ 
			background: '#fff', 
			padding: '0 24px',
			borderBottom: '1px solid #f0f0f0',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between'
		}}>
			<Title level={3} style={{ margin: 0, color: '#001529' }}>
				ccusage Dashboard
			</Title>
			
			<Space>
				<Button 
					icon={<ReloadOutlined />} 
					onClick={handleRefresh}
					type="text"
				>
					Refresh
				</Button>
				<Button 
					icon={<SettingOutlined />} 
					type="text"
				>
					Settings
				</Button>
			</Space>
		</Header>
	);
};

export default AppHeader;