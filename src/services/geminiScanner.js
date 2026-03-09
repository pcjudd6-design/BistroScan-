import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Gemini API key is missing. Please set REACT_APP_GEMINI_KEY in your environment.");
}
const genAI = new GoogleGenerativeAI(apiKey || "placeholder");

export const scanWithGemini = async (base64Image) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
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
    `;

    const image = {
      inlineData: {
        data: base64Image.split(',')[1] || base64Image,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, image]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to ensure it's valid JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Gemini response");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw error;
  }
};
