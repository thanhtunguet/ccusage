import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from './components/layout/Header';
import AppSidebar from './components/layout/Sidebar';
import DailyPage from './pages/DailyPage';
import MonthlyPage from './pages/MonthlyPage';
import SessionPage from './pages/SessionPage';
import BlocksPage from './pages/BlocksPage';
import LivePage from './pages/LivePage';

const { Content } = Layout;

function App() {
	return (
		<Layout style={{ minHeight: '100vh' }}>
			<AppSidebar />
			<Layout>
				<AppHeader />
				<Content style={{ margin: '16px' }}>
					<Routes>
						<Route path="/" element={<DailyPage />} />
						<Route path="/daily" element={<DailyPage />} />
						<Route path="/monthly" element={<MonthlyPage />} />
						<Route path="/sessions" element={<SessionPage />} />
						<Route path="/blocks" element={<BlocksPage />} />
						<Route path="/live" element={<LivePage />} />
					</Routes>
				</Content>
			</Layout>
		</Layout>
	);
}

export default App;