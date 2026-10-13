import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const originalApiKey = process.env.OPENAI_API_KEY;
const originalOpenRouterApiKey = process.env.OPENROUTER_API_KEY;

describe('item image analysis', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.OPENAI_API_KEY = 'sk-test';
    delete process.env.OPENROUTER_API_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
    if (originalOpenRouterApiKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = originalOpenRouterApiKey;
    }
  });

  test('returns a validated structured suggestion', async () => {
    const suggestion = {
      title: 'Portable Charger',
      category: 'Electronics',
      color: 'Light pink',
      brand: 'Belkin',
      description: 'Light pink portable charger with an attached cable.',
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          output: [
            {
              type: 'message',
              content: [
                { type: 'output_text', text: JSON.stringify(suggestion) },
              ],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const { analyzeItemImage } = await import('../src/lib/itemImageAnalysis');

    await expect(
      analyzeItemImage('https://example.test/item.jpg')
    ).resolves.toEqual(suggestion);

    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(request.body));
    expect(body.store).toBe(false);
    expect(body.input[0].content[1]).toEqual({
      type: 'input_image',
      image_url: 'https://example.test/item.jpg',
      detail: 'low',
    });
    expect(body.text.format.type).toBe('json_schema');
  });

  test('uses high image detail only when ITEM_IMAGE_DETAIL asks for it', async () => {
    const { resolveImageDetail } = await import('../src/lib/itemImageAnalysis');

    expect(resolveImageDetail({})).toBe('low');
    expect(resolveImageDetail({ ITEM_IMAGE_DETAIL: ' HIGH ' })).toBe('high');
    expect(resolveImageDetail({ ITEM_IMAGE_DETAIL: 'auto' })).toBe('low');
  });

  test('rejects a category outside the supported list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            output: [
              {
                type: 'message',
                content: [
                  {
                    type: 'output_text',
                    text: JSON.stringify({
                      title: 'Umbrella',
                      category: 'Weather Gear',
                      color: null,
                      brand: null,
                      description: 'A folding umbrella.',
                    }),
                  },
                ],
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );

    const { analyzeItemImage } = await import('../src/lib/itemImageAnalysis');

    await expect(
      analyzeItemImage('https://example.test/item.jpg')
    ).rejects.toThrow();
  });
});
