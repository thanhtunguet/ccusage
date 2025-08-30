import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Ant Design theme configuration
const theme = {
	token: {
		colorPrimary: '#1890ff',
		colorSuccess: '#52c41a',
		colorWarning: '#faad14',
		colorError: '#f5222d',
		borderRadius: 6,
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	},
	components: {
		Layout: {
			headerBg: '#001529',
			siderBg: '#001529',
		},
	},
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ConfigProvider theme={theme}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ConfigProvider>
	</React.StrictMode>
);