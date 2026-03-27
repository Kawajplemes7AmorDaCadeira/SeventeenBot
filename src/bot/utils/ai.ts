import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

export async function generateCelebrationImage(gameName: string, winAmount: number): Promise<string | null> {
  try {
    const ai = getAiClient();
    const prompt = `A celebratory and high-energy cinematic image of a lucky character (like a Shiba Inu or a cool casino boss) celebrating a massive win of ${winAmount.toLocaleString()} Odiondos in a game of ${gameName}. The atmosphere is vibrant, with gold coins, neon lights, and a sense of extreme luck and fortune. 4k resolution, highly detailed, vibrant colors.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error('Error generating celebration image:', error);
    return null;
  }
}
