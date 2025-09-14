// FIX: Implemented geminiService to provide feedback on user's writing using the Gemini API.
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Word } from '../types';

// The API key is obtained from the environment variable `process.env.API_KEY`.
// It is assumed to be pre-configured and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface WritingFeedback {
  rating: number;
  feedback: string;
}

export const checkWriting = async (imageDataUrl: string, word: Word): Promise<WritingFeedback> => {
  const defaultErrorResponse = { rating: 0, feedback: 'I had a little trouble thinking. Please try again! Good try!' };
  
  if (!imageDataUrl.startsWith('data:image/png;base64,')) {
    console.error('Invalid image data URL format');
    return { rating: 0, feedback: 'Something went wrong with the image. Please try again!' };
  }
  const base64ImageData = imageDataUrl.replace('data:image/png;base64,', '');

  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64ImageData,
    },
  };

  const textPart = {
    text: `You are a friendly and encouraging Chinese teacher for a 5-year-old child named Lucia.
This image contains two layers:
1. A faint, light gray character in the background. This is a tracing guide.
2. Darker, hand-drawn strokes made by the child. This is the child's writing.

Your task is to evaluate ONLY the child's darker, hand-drawn strokes. You MUST completely IGNORE the faint gray tracing guide in your analysis. Your feedback should ONLY be about the darker lines.

Analyze the child's writing of "${word.chinese}" (pinyin: ${word.pinyin}, English: ${word.english}).

Based ONLY on the dark strokes:
1. Rate the writing on a scale of 0 to 3. (3=Great, 2=Good, 1=Okay, 0=Unrecognizable).
2. Provide one simple, positive, and encouraging sentence of feedback.
3. If there's a small mistake, gently mention one thing to improve.
4. Keep the feedback very short and simple.
5. ALWAYS end your feedback with "Great job!" or "Good try!".

You MUST return your answer as a JSON object with two keys: "rating" (a number from 0 to 3) and "feedback" (a short string).

Example for a great attempt: {"rating": 3, "feedback": "Wow, you followed the lines perfectly! Great job!"}
Example for a near miss: {"rating": 2, "feedback": "That's very close! Try making the dot on top a little smaller. Good try!"}
Example for a poor attempt: {"rating": 1, "feedback": "That's a good start. Let's try drawing this one again together! Good try!"}
`,
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                rating: { type: Type.INTEGER, description: 'A rating from 0 to 3.' },
                feedback: { type: Type.STRING, description: 'Encouraging feedback text.' }
            }
        }
      }
    });

    const responseText = response.text;
    
    // FIX: Safely handle cases where the API response is empty or blocked.
    if (!responseText) {
      console.error("Failed to get a valid response from Gemini. The response might have been empty or blocked.", JSON.stringify(response, null, 2));
      return { rating: 0, feedback: "The AI teacher is thinking... please try drawing again!" };
    }

    let result: WritingFeedback;
    try {
        result = JSON.parse(responseText);
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", e, responseText);
        return { rating: 0, feedback: "I had a little trouble thinking. Let's try again!" };
    }
    
    // Ensure the rating is within the expected 0-3 range.
    const rating = Math.max(0, Math.min(3, result.rating || 0));
    const feedback = result.feedback || "Good try! Let's do it again.";
    
    return { rating, feedback };

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return defaultErrorResponse;
  }
};