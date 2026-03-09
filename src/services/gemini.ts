import { GoogleGenAI, Type } from "@google/genai";
import { Invoice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const extractInvoiceData = async (base64Image: string): Promise<Partial<Invoice>> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
          {
            text: "Extract the following details from this restaurant invoice. If a field is not found, leave it blank. Categorize the invoice into one of: Food, Beverage, Supplies, Equipment, Utilities, Other.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vendorName: { type: Type.STRING },
          invoiceNumber: { type: Type.STRING },
          date: { type: Type.STRING, description: "ISO format date YYYY-MM-DD" },
          category: { type: Type.STRING },
          subtotal: { type: Type.NUMBER },
          tax: { type: Type.NUMBER },
          totalAmount: { type: Type.NUMBER },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                unitPrice: { type: Type.NUMBER },
                total: { type: Type.NUMBER },
              },
            },
          },
        },
      },
    },
  });

  try {
    const text = response.text;
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to extract data from invoice");
  }
};
