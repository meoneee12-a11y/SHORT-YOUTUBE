
import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "../types.ts";

export const generateAIResponse = async (prompt: string, config: AIConfig, videoData?: { data: string, mimeType: string }): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [{ text: prompt }];
    if (videoData) {
      parts.push({
        inlineData: videoData
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature,
      },
    });

    if (!response || !response.text) {
      throw new Error("Empty response from AI engine.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const message = error?.message || "Internal Engine Error";
    return `Error: ${message}`;
  }
};

export const generateSceneImage = async (prompt: string, stylePrompt: string, characterProfile: string = "", aspectRatio: string = "16:9"): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Obsessive consistency engineering
    const fullPrompt = `IMAGE GENERATION MASTER COMMAND:
MAIN SUBJECT IDENTITY (MANDATORY): ${characterProfile}
SCENE DESCRIPTION: ${prompt}
VISUAL STYLE: ${stylePrompt}

CORE CONSTRAINTS:
- YOU MUST MAINTAIN 100% IDENTITY CONSISTENCY. The subject in this image must be EXACTLY the same person as defined in the IDENTITY SPEC above.
- NO DEVIATION in clothing color, hair style, or facial features.
- ABSOLUTELY NO TEXT, NO LOGOS, NO WATERMARKS, NO SUBTITLES.
- Cinematic lighting, professional composition, photorealistic textures.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

export const generateVeoVideo = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};
