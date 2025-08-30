import type { CostMode, SortOrder } from '../../../../src/_types.ts';

export interface ApiQuery {
	mode: CostMode;
	instances: boolean;
	dateRange?: {
		from: string;
		to: string;
	};
	projectFilter?: string[];
	modelFilter?: string[];
	sortOrder: SortOrder;
	active?: boolean;
	recent?: boolean;
	tokenLimit?: number | 'max';
}

export function parseApiQuery(queryParams: Record<string, string | string[] | undefined>): ApiQuery {
	const {
		mode = 'auto',
		instances = 'false',
		from,
		to,
		project,
		model,
		sortOrder = 'desc',
		active = 'false',
		recent = 'false',
		tokenLimit,
	} = queryParams;

	// Parse date range
	const dateRange = from && to ? {
		from: Array.isArray(from) ? from[0] : from,
		to: Array.isArray(to) ? to[0] : to,
	} : undefined;

	// Parse filters
	const projectFilter = project ? (Array.isArray(project) ? project : [project]) : undefined;
	const modelFilter = model ? (Array.isArray(model) ? model : [model]) : undefined;

	// Parse token limit
	let parsedTokenLimit: number | 'max' | undefined;
	if (tokenLimit) {
		const tokenLimitValue = Array.isArray(tokenLimit) ? tokenLimit[0] : tokenLimit;
		parsedTokenLimit = tokenLimitValue === 'max' ? 'max' : Number(tokenLimitValue);
	}

	return {
		mode: mode as CostMode,
		instances: instances === 'true',
		dateRange,
		projectFilter,
		modelFilter,
		sortOrder: sortOrder as SortOrder,
		active: active === 'true',
		recent: recent === 'true',
		tokenLimit: parsedTokenLimit,
	};
}