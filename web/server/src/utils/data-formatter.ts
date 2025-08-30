import type { ApiQuery } from './query-parser.ts';

// These interfaces match the expected API response format for the frontend
export interface ApiResponse<T> {
	data: T;
	meta: {
		total: number;
		query: ApiQuery;
		timestamp: string;
	};
}

export interface DailyUsageData {
	date: string;
	totalCostUSD: number;
	totalTokens: number;
	modelBreakdown: ModelBreakdown[];
	projects?: ProjectBreakdown[];
}

export interface MonthlyUsageData {
	month: string;
	totalCostUSD: number;
	totalTokens: number;
	modelBreakdown: ModelBreakdown[];
	projects?: ProjectBreakdown[];
}

export interface SessionUsageData {
	sessionId: string;
	projectPath: string;
	lastActivity: string;
	totalCost: number;
	inputTokens: number;
	outputTokens: number;
	cacheCreationTokens: number;
	cacheReadTokens: number;
	totalTokens: number;
	modelsUsed: string[];
	modelBreakdown: ModelBreakdown[];
	versions: string[];
}

export interface BlocksUsageData {
	id: string;
	startTime: string;
	endTime: string;
	actualEndTime?: string;
	isActive: boolean;
	isGap?: boolean;
	costUSD: number;
	inputTokens: number;
	outputTokens: number;
	cacheCreationTokens: number;
	cacheReadTokens: number;
	totalTokens: number;
	models: string[];
	usageLimitResetTime?: string;
}

export interface ModelBreakdown {
	model: string;
	costUSD: number;
	tokens: number;
	inputTokens: number;
	outputTokens: number;
	cacheCreationTokens?: number;
	cacheReadTokens?: number;
}

export interface ProjectBreakdown {
	projectName: string;
	costUSD: number;
	tokens: number;
	modelBreakdown: ModelBreakdown[];
}

export function createDailyApiResponse(usageData: any[], query: ApiQuery): ApiResponse<DailyUsageData[]> {
	// Transform the data from the CLI format to API format
	const transformedData: DailyUsageData[] = usageData.map(day => ({
		date: day.date,
		totalCostUSD: day.totalCost || 0,
		totalTokens: day.totalTokens || (day.inputTokens || 0) + (day.outputTokens || 0) + (day.cacheCreationTokens || 0) + (day.cacheReadTokens || 0),
		modelBreakdown: transformModelBreakdown(day.modelBreakdown || []),
		projects: query.instances ? transformProjectBreakdown(day.projects || []) : undefined,
	}));

	return {
		data: transformedData,
		meta: {
			total: transformedData.length,
			query,
			timestamp: new Date().toISOString(),
		},
	};
}

export function createMonthlyApiResponse(usageData: any[], query: ApiQuery): ApiResponse<MonthlyUsageData[]> {
	const transformedData: MonthlyUsageData[] = usageData.map(month => ({
		month: month.month,
		totalCostUSD: month.totalCost || 0,
		totalTokens: (month.inputTokens || 0) + (month.outputTokens || 0) + (month.cacheCreationTokens || 0) + (month.cacheReadTokens || 0),
		modelBreakdown: transformModelBreakdown(month.modelBreakdowns || []),
		projects: query.instances ? transformProjectBreakdown(month.projects || []) : undefined,
	}));

	return {
		data: transformedData,
		meta: {
			total: transformedData.length,
			query,
			timestamp: new Date().toISOString(),
		},
	};
}

export function createSessionApiResponse(usageData: any[], query: ApiQuery): ApiResponse<SessionUsageData[]> {
	const transformedData: SessionUsageData[] = usageData.map(session => ({
		sessionId: session.sessionId,
		projectPath: session.projectPath,
		lastActivity: session.lastActivity,
		totalCost: session.totalCost || 0,
		inputTokens: session.inputTokens || 0,
		outputTokens: session.outputTokens || 0,
		cacheCreationTokens: session.cacheCreationTokens || 0,
		cacheReadTokens: session.cacheReadTokens || 0,
		totalTokens: (session.inputTokens || 0) + (session.outputTokens || 0) + (session.cacheCreationTokens || 0) + (session.cacheReadTokens || 0),
		modelsUsed: session.modelsUsed || [],
		modelBreakdown: session.modelBreakdowns || [],
		versions: session.versions || [],
	}));

	return {
		data: transformedData,
		meta: {
			total: transformedData.length,
			query,
			timestamp: new Date().toISOString(),
		},
	};
}

export function createBlocksApiResponse(usageData: any[], query: ApiQuery): ApiResponse<BlocksUsageData[]> {
	const transformedData: BlocksUsageData[] = usageData.map(block => ({
		id: block.id,
		startTime: block.startTime.toISOString(),
		endTime: block.endTime.toISOString(),
		actualEndTime: block.actualEndTime?.toISOString(),
		isActive: block.isActive || false,
		isGap: block.isGap || false,
		costUSD: block.costUSD || 0,
		inputTokens: block.tokenCounts?.inputTokens || 0,
		outputTokens: block.tokenCounts?.outputTokens || 0,
		cacheCreationTokens: block.tokenCounts?.cacheCreationInputTokens || 0,
		cacheReadTokens: block.tokenCounts?.cacheReadInputTokens || 0,
		totalTokens: (block.tokenCounts?.inputTokens || 0) + (block.tokenCounts?.outputTokens || 0) + (block.tokenCounts?.cacheCreationInputTokens || 0) + (block.tokenCounts?.cacheReadInputTokens || 0),
		models: block.models || [],
		usageLimitResetTime: block.usageLimitResetTime?.toISOString(),
	}));

	return {
		data: transformedData,
		meta: {
			total: transformedData.length,
			query,
			timestamp: new Date().toISOString(),
		},
	};
}

function transformModelBreakdown(modelData: any[]): ModelBreakdown[] {
	return modelData.map(model => ({
		model: model.modelName || model.model,
		costUSD: model.cost || model.costUSD || 0,
		tokens: (model.inputTokens || 0) + (model.outputTokens || 0) + (model.cacheCreationTokens || 0) + (model.cacheReadTokens || 0),
		inputTokens: model.inputTokens || 0,
		outputTokens: model.outputTokens || 0,
		cacheCreationTokens: model.cacheCreationTokens || 0,
		cacheReadTokens: model.cacheReadTokens || 0,
	}));
}

function transformProjectBreakdown(projectData: any[]): ProjectBreakdown[] {
	return projectData.map(project => ({
		projectName: project.projectName,
		costUSD: project.costUSD || project.totalCostUSD || 0,
		tokens: project.tokens || project.totalTokens || 0,
		modelBreakdown: transformModelBreakdown(project.modelBreakdown || []),
	}));
}