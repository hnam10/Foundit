import { z } from 'zod';
import { buildAiRequestHeaders, getAiProviderConfig } from './aiProvider';

export const ITEM_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Bags & Luggage',
  'Books & Stationery',
  'IDs & Cards',
  'Keys',
  'Wallets & Purses',
  'Jewelry & Accessories',
  'Water Bottles',
  'Other',
] as const;

const itemImageSuggestionSchema = z.object({
  title: z.string().trim().min(1).max(100).nullable(),
  category: z.enum(ITEM_CATEGORIES).nullable(),
  color: z.string().trim().min(1).max(30).nullable(),
  brand: z.string().trim().min(1).max(50).nullable(),
  description: z.string().trim().min(1).max(1000).nullable(),
});

export type ItemImageSuggestion = z.infer<typeof itemImageSuggestionSchema>;

interface OpenAIResponsesPayload {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
}

function extractOutputText(payload: OpenAIResponsesPayload): string | null {
  for (const item of payload.output ?? []) {
    if (item.type !== 'message') continue;
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && content.text) {
        return content.text;
      }
    }
  }
  return null;
}

/**
 * Image tokens dominate the cost of an analysis. `low` sends one downscaled
 * view, which is enough for item type and colour; set ITEM_IMAGE_DETAIL=high
 * when small logos or printed text need to be read.
 */
export function resolveImageDetail(
  env: NodeJS.ProcessEnv = process.env
): 'low' | 'high' {
  return env.ITEM_IMAGE_DETAIL?.trim().toLowerCase() === 'high'
    ? 'high'
    : 'low';
}

export function isItemImageAnalysisConfigured(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return getAiProviderConfig(env) !== null;
}

export async function analyzeItemImage(
  imageUrl: string
): Promise<ItemImageSuggestion> {
  const config = getAiProviderConfig();
  if (!config) {
    throw new Error('No remote AI provider is configured.');
  }

  const response = await fetch(`${config.baseUrl}/responses`, {
    method: 'POST',
    headers: buildAiRequestHeaders(config),
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      model: config.visionModel,
      store: false,
      max_output_tokens: 500,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: [
                'Create a concise draft for a lost-and-found item form from this photo.',
                `Category must be one of: ${ITEM_CATEGORIES.join(', ')}.`,
                'Only identify a brand when its logo or name is clearly visible; otherwise use null.',
                'Describe visible attributes only. Do not invent ownership details or hidden damage.',
              ].join(' '),
            },
            {
              type: 'input_image',
              image_url: imageUrl,
              detail: resolveImageDetail(),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'found_item_draft',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: ['string', 'null'] },
              category: {
                anyOf: [
                  { type: 'string', enum: [...ITEM_CATEGORIES] },
                  { type: 'null' },
                ],
              },
              color: { type: ['string', 'null'] },
              brand: { type: ['string', 'null'] },
              description: { type: ['string', 'null'] },
            },
            required: ['title', 'category', 'color', 'brand', 'description'],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `${config.name} image analysis failed (${response.status}).`
    );
  }

  const payload = (await response.json()) as OpenAIResponsesPayload;
  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new Error('Image analysis returned no structured output.');
  }

  return itemImageSuggestionSchema.parse(JSON.parse(outputText));
}
