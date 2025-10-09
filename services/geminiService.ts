
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// Ensure the API key is available, as per guidelines.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editImageWithAI = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    // The API should return an image part. Find it and return its data.
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        const fullBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        return fullBase64;
      }
    }

    // If no image part is found in a successful response, it's an unexpected outcome.
    console.warn("AI response did not contain an image part.", response);
    return null;

  } catch (error) {
    console.error("Error editing image with AI:", error);
    // Provide a more user-friendly error message.
    throw new Error("Failed to communicate with the AI service. Please try again later.");
  }
};
