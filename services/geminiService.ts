
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, Verdict, TextAnalysisResult } from "../types.ts";

/**
 * Utility to extract JSON from potentially Markdown-formatted strings.
 */
const extractJson = (text: string) => {
  try {
    // Improved cleaning to handle edge cases in model output
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").replace(/^[^{]*/, "").replace(/[^}]*$/, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", text);
    throw new Error("The forensic engine returned an unreadable response format.");
  }
};

/**
 * Factory function to ensure GoogleGenAI is instantiated only when needed.
 */
const getAI = () => {
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSyntheticImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string> => {
  const ai = getAI();
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
        aspectRatio: aspectRatio as any,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data returned from model");
};

export const generateSyntheticVideo = async (prompt: string): Promise<string> => {
  const ai = getAI();
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
  if (!downloadLink) throw new Error("Video generation failed or URI not found.");
  
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateForensicCertificate = async (result: AnalysisResult): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a detailed forensic certificate for Case ID ${result.id}. 
    Verdict: ${result.verdict}. 
    AI Probability: ${result.deepfakeProbability}%. 
    Include detailed findings: ${JSON.stringify(result.explanations)}. 
    Format with professional headers and ASCII borders.`,
  });
  return response.text || "Failed to generate text report.";
};

export const reverseSignalGrounding = async (file: File): Promise<any> => {
  const ai = getAI();
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: file.type, data: base64Data } },
        { text: "Locate the primary source of this image using Google Search. Return JSON: {summary, originalEvent, manipulationDetected, confidence, findings: [{type, detail}]}" }
      ]
    },
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });

  const data = extractJson(response.text || "{}");
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => (chunk as any).web)
    .map(chunk => ({ title: (chunk as any).web?.title || "Verified Source", url: (chunk as any).web?.uri || "" })) || [];

  return { ...data, sources };
};

export const analyzeMedia = async (file: File, metadata: any): Promise<AnalysisResult> => {
  const ai = getAI();
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  const isVideo = file.type.includes('video');

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: file.type, data: base64Data } },
        { text: `YOU ARE A HIGH-LEVEL NEURAL FORENSIC INVESTIGATOR. 
        Your task is to detect if this media is AI-GENERATED or MANIPULATED. 
        
        CRITICAL INVESTIGATION PARAMETERS:
        1. SKEPTICISM: Assume the media is a deepfake until proven otherwise.
        2. ANATOMICAL CHECK: Count fingers, check eye pupil symmetry, hair-to-background blending, and ear complexity. AI often fails here.
        3. PHYSICS & LIGHTING: Check for subsurface scattering on skin. Does light bounce realistically? Check for "ai-sheen" (over-smoothed, plasticky textures).
        4. BACKGROUNDS: Look for impossible geometry, warped text in the background, or inconsistent depth-of-field blur patterns.
        5. VIDEO ARTIFACTS: ${isVideo ? "Identify temporal flickering, facial mask 'tearing' during fast movement, and motion-blur inconsistencies." : "Look for GAN checkerboard artifacts and dithering patterns in shadows."}
        
        JSON STRUCTURE REQUIRED:
        {
          "verdict": "REAL" | "LIKELY_FAKE",
          "deepfakeProbability": 0-100,
          "confidence": 0-100,
          "summary": "Detailed forensic summary of why you reached this conclusion.",
          "userRecommendation": "Actionable advice for the user.",
          "analysisSteps": {
            "integrity": {"score": 0-100, "explanation": "Metadata and container scan result"},
            "consistency": {"score": 0-100, "explanation": "Lighting and shadow consistency audit"},
            "aiPatterns": {"score": 0-100, "explanation": "Presence of neural network generation fingerprints"},
            "temporal": {"score": 0-100, "explanation": "Motion and frame-to-frame stability"}
          },
          "explanations": [
            {
              "point": "Specific finding title",
              "detail": "Detailed technical explanation of the specific anomaly found.",
              "category": "visual" | "audio" | "temporal" | "integrity",
              "timestamp": "MM:SS"
            }
          ]
        }` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are the world's most advanced deepfake detection engine. You have a paranoid level of skepticism. You never miss 'plasticky' skin textures, asymmetric pupils, or background warping. You are highly technical and precise.",
      thinkingConfig: { thinkingBudget: 32768 } // Max budget for pro for deepest reasoning
    }
  });

  const data = extractJson(response.text || "{}");
  
  // TIGHTENED VERDICT LOGIC: 
  // If the model reports > 20% probability, it is flagged as LIKELY_FAKE to ensure safety.
  let finalVerdict = Verdict.LIKELY_FAKE; 
  const prob = data.deepfakeProbability ?? 50;
  
  if (prob < 20 && data.verdict === 'REAL') {
    finalVerdict = Verdict.REAL;
  } else {
    finalVerdict = Verdict.LIKELY_FAKE;
  }

  return {
    id: Math.random().toString(36).substr(2, 9).toUpperCase(),
    timestamp: Date.now(),
    verdict: finalVerdict,
    confidence: data.confidence ?? 50,
    confidenceLevel: (data.confidence > 85 ? 'High' : data.confidence < 50 ? 'Low' : 'Medium') as any,
    deepfakeProbability: prob,
    summary: data.summary || "Forensic analysis complete.",
    userRecommendation: data.userRecommendation || "Verify manually.",
    analysisSteps: data.analysisSteps || {
      integrity: { score: 50, explanation: "Analyzing...", confidenceQualifier: "Medium" },
      consistency: { score: 50, explanation: "Analyzing...", confidenceQualifier: "Medium" },
      aiPatterns: { score: 50, explanation: "Analyzing...", confidenceQualifier: "Medium" },
      temporal: { score: 50, explanation: "Analyzing...", confidenceQualifier: "Medium" }
    },
    explanations: Array.isArray(data.explanations) ? data.explanations : [],
    manipulationType: data.manipulationType || (prob > 20 ? "Neural Synthesis" : "N/A"),
    guidance: data.guidance || "Caution advised.",
    fileMetadata: metadata
  };
};

export const analyzeText = async (text: string, mode: 'AI_DETECT' | 'FACT_CHECK'): Promise<TextAnalysisResult> => {
  const ai = getAI();
  const isFactCheck = mode === 'FACT_CHECK';
  const response = await ai.models.generateContent({
    model: isFactCheck ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
    contents: text,
    config: {
      responseMimeType: "application/json",
      systemInstruction: isFactCheck 
        ? "Verify claims using Google Search. Return JSON: {claims: [{claim, status, sourceUrl, category}], summary}"
        : "Detect AI text. Return JSON: {aiProbability, verdictLabel, aiSignals, humanSignals, summary, linguisticMarkers}",
      tools: isFactCheck ? [{ googleSearch: {} }] : []
    }
  });

  const result = extractJson(response.text || "{}");
  return {
    likelihoodRange: result.aiProbability ? `${result.aiProbability}%` : "0%",
    aiProbability: result.aiProbability ?? 0,
    verdictLabel: result.verdictLabel || "STRICT",
    ambiguityNote: "",
    aiSignals: result.aiSignals || [],
    humanSignals: result.humanSignals || [],
    isFactual: result.isFactual ?? 'STRICT',
    summary: result.summary || "Analysis complete.",
    claims: result.claims || [],
    linguisticMarkers: result.linguisticMarkers || [],
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => (chunk as any).web).map(chunk => ({ 
        title: (chunk as any).web?.title || "Source", 
        url: (chunk as any).web?.uri || "" 
      })) || []
  };
};

export const startAssistantChat = () => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a world-class forensic assistant. You help users understand deepfake detection, text analysis, and source verification. Use Google Search for up-to-date facts.",
      tools: [{ googleSearch: {} }]
    }
  });
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const ai = getAI();
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(audioBlob);
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: audioBlob.type, data: base64Data } },
        { text: "Transcribe this audio precisely." }
      ]
    }
  });

  return response.text || "";
};
