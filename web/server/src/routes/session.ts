import { Hono } from 'hono';
import { loadSessionData } from '../../../../src/data-loader.ts';
import { createSessionApiResponse } from '../utils/data-formatter.ts';
import { parseApiQuery } from '../utils/query-parser.ts';

export const sessionRoutes = new Hono();

// GET /api/session - Get session usage data
sessionRoutes.get('/', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		const usageData = await loadSessionData({
			mode: query.mode,
			instances: query.instances,
			dateRange: query.dateRange,
			projectFilter: query.projectFilter,
			modelFilter: query.modelFilter,
			sortOrder: query.sortOrder,
		});

		const response = createSessionApiResponse(usageData, query);
		
		return c.json(response);
	} catch (error) {
		console.error('Error loading session data:', error);
		return c.json({ 
			error: 'Failed to load session usage data',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});

// GET /api/session/summary - Get session summary statistics
sessionRoutes.get('/summary', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		const usageData = await loadSessionData({
			mode: query.mode,
			dateRange: query.dateRange,
			projectFilter: query.projectFilter,
			modelFilter: query.modelFilter,
		});

		const totalSessions = usageData.length;
		const totalCost = usageData.reduce((sum, session) => sum + session.totalCost, 0);
		const totalTokens = usageData.reduce((sum, session) => 
			sum + session.inputTokens + session.outputTokens + session.cacheCreationTokens + session.cacheReadTokens, 0);
		const avgCostPerSession = totalSessions > 0 ? totalCost / totalSessions : 0;
		
		// Get unique projects
		const uniqueProjects = [...new Set(usageData.map(session => session.projectPath))];
		
		return c.json({
			totalSessions,
			totalCost,
			totalTokens,
			avgCostPerSession,
			totalProjects: uniqueProjects.length,
			projects: uniqueProjects,
		});
	} catch (error) {
		console.error('Error loading session summary:', error);
		return c.json({ 
			error: 'Failed to load session summary',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});