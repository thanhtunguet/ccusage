import { Hono } from 'hono';
import { loadDailyUsageData } from '../../../../src/data-loader.ts';
import { createDailyApiResponse } from '../utils/data-formatter.ts';
import { parseApiQuery } from '../utils/query-parser.ts';

export const dailyRoutes = new Hono();

// GET /api/daily - Get daily usage data
dailyRoutes.get('/', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		const usageData = await loadDailyUsageData({
			mode: query.mode,
			instances: query.instances,
			dateRange: query.dateRange,
			projectFilter: query.projectFilter,
			modelFilter: query.modelFilter,
			sortOrder: query.sortOrder,
		});

		const response = createDailyApiResponse(usageData, query);
		
		return c.json(response);
	} catch (error) {
		console.error('Error loading daily data:', error);
		return c.json({ 
			error: 'Failed to load daily usage data',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});

// GET /api/daily/summary - Get daily summary statistics  
dailyRoutes.get('/summary', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		const usageData = await loadDailyUsageData({
			mode: query.mode,
			dateRange: query.dateRange,
			projectFilter: query.projectFilter,
			modelFilter: query.modelFilter,
		});

		// Calculate summary statistics
		const totalDays = usageData.length;
		const totalCost = usageData.reduce((sum, day) => sum + day.totalCostUSD, 0);
		const totalTokens = usageData.reduce((sum, day) => sum + day.totalTokens, 0);
		const avgCostPerDay = totalDays > 0 ? totalCost / totalDays : 0;
		
		return c.json({
			totalDays,
			totalCost,
			totalTokens,
			avgCostPerDay,
			dateRange: {
				from: usageData[0]?.date,
				to: usageData[usageData.length - 1]?.date,
			},
		});
	} catch (error) {
		console.error('Error loading daily summary:', error);
		return c.json({ 
			error: 'Failed to load daily summary',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});