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


export const generateVideoFromImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      image: {
        imageBytes: base64ImageData,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
      },
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!downloadLink) {
      console.warn("AI response did not contain a video URI.", operation);
      return null;
    }
    
    // The component will be responsible for fetching with the API key
    return downloadLink;

  } catch (error) {
    console.error("Error generating video with AI:", error);
    throw new Error("Failed to communicate with the AI video service. Please try again later.");
  }
};
