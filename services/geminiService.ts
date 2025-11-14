
import { GoogleGenAI, Modality } from "@google/genai";
import type { Character } from "../types";

export const generateStoryImage = async (prompt: string, characters: Character[]): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imageParts = characters
    .filter(c => c.isSelected && c.imageBase64 && c.image)
    .map((c, index) => ({
      inlineData: {
        data: c.imageBase64!,
        mimeType: c.image!.type,
      },
    }));
  
  const characterNames = characters
    .filter(c => c.isSelected)
    .map(c => `Character ${c.id}`)
    .join(', ');

  // A little prompt engineering to guide the model
  const fullPrompt = `${prompt}. Please use the provided image(s) as reference for ${characterNames}. Maintain their appearance and style consistently.`;

  if (imageParts.length === 0) {
      throw new Error("Please select at least one character reference and upload an image for it.");
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [...imageParts, { text: fullPrompt }],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data; // The base64 string
    }
  }

  throw new Error("No image was generated. The model may have refused the request due to safety settings.");
};
