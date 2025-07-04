/**
 * Prefetch claude data for the current user.
 */

import type { ModelPricing } from './_types.ts';
import type { HttpClient } from './http/client.ts';
import { LITELLM_PRICING_URL } from './_consts.ts';
import { modelPricingSchema } from './_types.ts';
import { httpClient } from './http/index.ts';

/**
 * Retrieves and validates pricing data for Claude models from the LiteLLM API.
 *
 * Sends an HTTP request to the pricing endpoint, filters for models whose names start with 'claude-', and returns a record mapping those model names to their validated pricing information.
 *
 * @returns A promise resolving to a record of Claude model names and their pricing information.
 * @throws If the HTTP request fails or returns a non-OK status.
 */
export async function prefetchClaudePricing(client: HttpClient = httpClient): Promise<Record<string, ModelPricing>> {
	const response = await client.fetch(LITELLM_PRICING_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch pricing data: ${response.statusText}`);
	}

	const data = await response.json() as Record<string, unknown>;

	const prefetchClaudeData: Record<string, ModelPricing> = {};

	// Cache all models that start with 'claude-'
	for (const [modelName, modelData] of Object.entries(data)) {
		if (modelName.startsWith('claude-') && modelData != null && typeof modelData === 'object') {
			const parsed = modelPricingSchema.safeParse(modelData);
			if (parsed.success) {
				prefetchClaudeData[modelName] = parsed.data;
			}
		}
	}

	return prefetchClaudeData;
}
