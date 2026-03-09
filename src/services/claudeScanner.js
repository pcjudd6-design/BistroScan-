import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.CLAUDE_API_KEY;
if (!apiKey) {
  console.error("Claude API key is missing. Please set REACT_APP_CLAUDE_KEY in your environment.");
}
const anthropic = new Anthropic({
  apiKey: apiKey || "placeholder",
  dangerouslyAllowBrowser: true, // Required for browser-side SDK usage
});

export const scanWithClaude = async (base64Image) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image.split(',')[1] || base64Image,
              },
            },
            {
              type: "text",
              text: `
                Extract data from this restaurant invoice and return it as a valid JSON object.
                JSON structure:
                {
                  "vendor_name": "string",
                  "invoice_date": "YYYY-MM-DD",
                  "invoice_number": "string or null",
                  "subtotal": number,
                  "tax_amount": number,
                  "total_amount": number,
                  "category": "Food|Beverage|Supplies|Utilities|Labor|Other",
                  "confidence": number 0-100,
                  "line_items": [
                    { "description": "string", "quantity": number, "unit_price": number, "total": number }
                  ],
                  "notes": "any issues"
                }
              `,
            },
          ],
        },
      ],
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Claude response");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Claude Scan Error:", error);
    throw error;
  }
};
