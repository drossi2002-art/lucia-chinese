import { GoogleGenAI } from "@google/genai";

// FIX: The use of `import.meta.env` caused a TypeScript error. Switched to `process.env.API_KEY`
// to resolve the error and align with the coding guidelines, which mandate this method
// for accessing the API key. The guidelines also state to assume the key is always present.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getExampleSentence(phrase: string): Promise<string> {
  const model = "gemini-2.5-flash";

  const prompt = `You are creating examples for a 7-year-old girl named Lucia learning Chinese. For the English phrase "${phrase}", create one very short, simple, and fun example sentence in English that a 7-year-old would understand. Make it encouraging and related to a cute animal if possible. For example, for "Thank you", you could say "When a friendly dog gives you a flower, you can say thank you!". Keep the sentence under 20 words.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    // Using the direct .text property as per the latest API guidance
    const text = response.text;

    if (!text) {
        throw new Error("Received an empty response from Gemini API.");
    }
    
    return text.trim();
  } catch (error) {
    console.error(`Error calling Gemini API for phrase "${phrase}":`, error);
    // Provide a user-friendly fallback message
    return "I'm thinking... hmm, I can't think of one right now! But you're doing great!";
  }
}
