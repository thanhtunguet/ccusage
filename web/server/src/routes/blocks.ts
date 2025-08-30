import { Hono } from 'hono';
import { loadSessionBlockData } from '../../../../src/data-loader.ts';
import { createBlocksApiResponse } from '../utils/data-formatter.ts';
import { parseApiQuery } from '../utils/query-parser.ts';

export const blocksRoutes = new Hono();

// GET /api/blocks - Get 5-hour blocks usage data
blocksRoutes.get('/', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		const usageData = await loadSessionBlockData({
			mode: query.mode,
			instances: query.instances,
			dateRange: query.dateRange,
			projectFilter: query.projectFilter,
			modelFilter: query.modelFilter,
			sortOrder: query.sortOrder,
			active: query.active,
			recent: query.recent,
			tokenLimit: query.tokenLimit,
		});

		const response = createBlocksApiResponse(usageData, query);
		
		return c.json(response);
	} catch (error) {
		console.error('Error loading blocks data:', error);
		return c.json({ 
			error: 'Failed to load blocks usage data',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});

// GET /api/blocks/summary - Get blocks summary statistics
blocksRoutes.get('/summary', async (c) => {
	try {
		const query = parseApiQuery(c.req.query());
		
		const usageData = await loadSessionBlockData({
			mode: query.mode,
			dateRange: query.dateRange,
			projectFilter: query.projectFilter,
			modelFilter: query.modelFilter,
			active: query.active,
			recent: query.recent,
		});

		const totalBlocks = usageData.length;
		const totalCost = usageData.reduce((sum, block) => sum + block.costUSD, 0);
		const totalTokens = usageData.reduce((sum, block) => 
			sum + block.tokenCounts.inputTokens + block.tokenCounts.outputTokens + 
			(block.tokenCounts.cacheCreationInputTokens || 0) + (block.tokenCounts.cacheReadInputTokens || 0), 0);
		const avgCostPerBlock = totalBlocks > 0 ? totalCost / totalBlocks : 0;
		
		// Identify active block
		const activeBlock = usageData.find(block => block.isActive);
		
		return c.json({
			totalBlocks,
			totalCost,
			totalTokens,
			avgCostPerBlock,
			activeBlock: activeBlock ? {
				blockStart: activeBlock.startTime.toISOString(),
				blockEnd: activeBlock.endTime.toISOString(),
				totalCostUSD: activeBlock.costUSD,
				totalTokens: activeBlock.tokenCounts.inputTokens + activeBlock.tokenCounts.outputTokens + 
					(activeBlock.tokenCounts.cacheCreationInputTokens || 0) + (activeBlock.tokenCounts.cacheReadInputTokens || 0),
				isActive: activeBlock.isActive,
			} : null,
		});
	} catch (error) {
		console.error('Error loading blocks summary:', error);
		return c.json({ 
			error: 'Failed to load blocks summary',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, 500);
	}
});