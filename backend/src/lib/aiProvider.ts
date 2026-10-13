export type AiProviderName = 'openrouter' | 'openai';

export interface AiProviderConfig {
  name: AiProviderName;
  apiKey: string;
  baseUrl: string;
  embeddingModel: string;
  visionModel: string;
}

/** Prefers OpenAI, falls back to OpenRouter, and returns null when neither key is set. */
export function getAiProviderConfig(
  env: NodeJS.ProcessEnv = process.env
): AiProviderConfig | null {
  const openAiKey = env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    return {
      name: 'openai',
      apiKey: openAiKey,
      baseUrl: 'https://api.openai.com/v1',
      embeddingModel:
        env.OPENAI_EMBEDDING_MODEL?.trim() || 'text-embedding-3-small',
      visionModel: env.OPENAI_VISION_MODEL?.trim() || 'gpt-5.6-luna',
    };
  }

  const openRouterKey = env.OPENROUTER_API_KEY?.trim();
  if (!openRouterKey) {
    return null;
  }

  return {
    name: 'openrouter',
    apiKey: openRouterKey,
    baseUrl: 'https://openrouter.ai/api/v1',
    embeddingModel:
      env.OPENROUTER_EMBEDDING_MODEL?.trim() || 'openai/text-embedding-3-small',
    visionModel: env.OPENROUTER_VISION_MODEL?.trim() || 'openai/gpt-5.6-luna',
  };
}

export function buildAiRequestHeaders(
  config: AiProviderConfig,
  env: NodeJS.ProcessEnv = process.env
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };

  if (config.name === 'openrouter') {
    const referer = env.OPENROUTER_SITE_URL?.trim();
    const title = env.OPENROUTER_APP_NAME?.trim();
    if (referer) headers['HTTP-Referer'] = referer;
    if (title) headers['X-Title'] = title;
  }

  return headers;
}
