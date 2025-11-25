import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateLyricsHelp = async (
  currentLyrics: string,
  instruction: string,
  type: 'rhyme' | 'continue' | 'critique'
): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  const model = 'gemini-2.5-flash';
  
  let prompt = "";
  if (type === 'rhyme') {
    prompt = `Give me a list of 5 creative multi-syllabic rhymes for the last word in this line: "${instruction}". Format them as a simple list.`;
  } else if (type === 'continue') {
    prompt = `Continue these rap lyrics with 4 more bars that match the flow and tone:\n\n${currentLyrics}`;
  } else if (type === 'critique') {
    prompt = `Act as a strict hip-hop producer. Critique these lyrics in 2 sentences. Focus on flow, rhyme scheme, and impact:\n\n${currentLyrics}`;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a legendary hip-hop lyricist and producer. You understand rhyme schemes, flow patterns, and slang. Keep responses concise and practical for a songwriter.",
      }
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Text Error:", error);
    return "Failed to generate AI suggestion.";
  }
};

export const generateCoverArt = async (title: string, lyrics: string): Promise<string | null> => {
  if (!apiKey) return null;

  const model = 'gemini-2.5-flash-image';
  const prompt = `A cool, high-quality hip-hop album cover for a song titled "${title}". The vibe should match these lyrics: ${lyrics.substring(0, 100)}... Make it artistic, vibrant, and suitable for a music streaming platform. No text on image.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return null;
  }
};
