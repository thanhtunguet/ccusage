import { Hono } from 'hono';
import { loadMonthlyUsageData } from '../../../../src/data-loader.ts';
import { createMonthlyApiResponse } from '../utils/data-formatter.ts';
import { parseApiQuery } from '../utils/query-parser.ts';

export const monthlyRoutes = new Hono();

// GET /api/monthly - Get monthly usage data
monthlyRoutes.get('/', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		const usageData = await loadMonthlyUsageData({
			mode: query.mode,
			instances: query.instances,
			dateRange: query.dateRange,
			projectFilter: query.projectFilter,
			modelFilter: query.modelFilter,
			sortOrder: query.sortOrder,
		});

		const response = createMonthlyApiResponse(usageData, query);
		
		return c.json(response);
	} catch (error) {
		console.error('Error loading monthly data:', error);
		return c.json({ 
			error: 'Failed to load monthly usage data',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});

// GET /api/monthly/summary - Get monthly summary statistics
monthlyRoutes.get('/summary', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		const usageData = await loadMonthlyUsageData({
			mode: query.mode,
			dateRange: query.dateRange,
			projectFilter: query.projectFilter,
			modelFilter: query.modelFilter,
		});

		const totalMonths = usageData.length;
		const totalCost = usageData.reduce((sum, month) => sum + month.totalCostUSD, 0);
		const totalTokens = usageData.reduce((sum, month) => sum + month.totalTokens, 0);
		const avgCostPerMonth = totalMonths > 0 ? totalCost / totalMonths : 0;
		
		return c.json({
			totalMonths,
			totalCost,
			totalTokens,
			avgCostPerMonth,
			dateRange: {
				from: usageData[0]?.month,
				to: usageData[usageData.length - 1]?.month,
			},
		});
	} catch (error) {
		console.error('Error loading monthly summary:', error);
		return c.json({ 
			error: 'Failed to load monthly summary',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});