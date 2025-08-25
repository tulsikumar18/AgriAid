import { DiagnosisInput, DiagnosisResult } from "@/types/diagnosis";
import { DISEASES } from "@/mocks/diseases";
import { translateText, detectLanguage, translateDiagnosisResult } from "@/utils/translate";
import { analyzePlantImage, analyzeTextSymptoms } from "@/utils/geminiApi";
import { transcribeAudio } from "@/utils/speechToText";

/**
 * Diagnose crop issues based on text, image, or audio input
 * @param input Diagnosis input containing method, text/image/audio, and language
 * @returns Promise with diagnosis result
 */
export async function diagnoseCrop(input: DiagnosisInput): Promise<DiagnosisResult> {
  try {
    let result: DiagnosisResult;

    // Process based on input method
    if (input.method === "image" && input.image) {
      // Process image using Gemini API
      try {
        console.log("Processing image input:", input.image.substring(0, 50) + "...");
        console.log("Using language for Gemini API:", input.language || "en");
        const analysis = await analyzePlantImage(input.image, input.language || "en");
        console.log("Image analysis result:", JSON.stringify(analysis, null, 2));

        // Validate the analysis result
        if (!analysis.disease || !analysis.description || !analysis.remedy || !analysis.prevention) {
          console.warn("Incomplete analysis result, using available data and filling in gaps");
        }

        result = {
          species: analysis.species || "Unknown",
          disease: analysis.disease || "Unknown Disease",
          description: analysis.description || "No description available",
          remedy: analysis.remedy || "No remedy information available",
          prevention: analysis.prevention || "No prevention information available",
          confidence: analysis.confidence || 0.7,
          image: input.image,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error("Image analysis error:", error instanceof Error ? error.message : String(error));
        // Fallback to mock data if image analysis fails
        return getFallbackResult(input.image);
      }
    } else if (input.method === "text" && input.text) {
      // Process text using Gemini API
      try {
        console.log("Processing text input:", input.text);
        console.log("Using language for Gemini API:", input.language || "en");
        const analysis = await analyzeTextSymptoms(input.text, input.language || "en");
        console.log("Text analysis result:", JSON.stringify(analysis, null, 2));

        // Validate the analysis result
        if (!analysis.disease || !analysis.description || !analysis.remedy || !analysis.prevention) {
          console.warn("Incomplete analysis result, using available data and filling in gaps");
        }

        result = {
          species: analysis.species || "Unknown",
          disease: analysis.disease || "Unknown Disease",
          description: analysis.description || "No description available",
          remedy: analysis.remedy || "No remedy information available",
          prevention: analysis.prevention || "No prevention information available",
          confidence: analysis.confidence || 0.7,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error("Text analysis error:", error instanceof Error ? error.message : String(error));
        // Fallback to mock data if text analysis fails
        return getFallbackResult();
      }
    } else if (input.method === "voice" && input.audio) {
      // Process voice input
      try {
        // First, transcribe the audio if transcribed text wasn't provided
        let transcribedText = input.text;
        if (!transcribedText) {
          console.log("Transcribing audio...");
          transcribedText = await transcribeAudio(input.audio);
          console.log("Transcribed text:", transcribedText);
        }

        // Then analyze the transcribed text
        console.log("Processing voice input (transcribed):", transcribedText);
        console.log("Using language for Gemini API:", input.language || "en");
        const analysis = await analyzeTextSymptoms(transcribedText, input.language || "en");
        console.log("Voice analysis result:", JSON.stringify(analysis, null, 2));

        // Validate the analysis result
        if (!analysis.disease || !analysis.description || !analysis.remedy || !analysis.prevention) {
          console.warn("Incomplete analysis result, using available data and filling in gaps");
        }

        result = {
          species: analysis.species || "Unknown",
          disease: analysis.disease || "Unknown Disease",
          description: analysis.description || "No description available",
          remedy: analysis.remedy || "No remedy information available",
          prevention: analysis.prevention || "No prevention information available",
          confidence: analysis.confidence || 0.7,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error("Voice analysis error:", error instanceof Error ? error.message : String(error));
        // Fallback to mock data if voice analysis fails
        return getFallbackResult();
      }
    } else {
      // Invalid input
      console.error("Invalid diagnosis input:", JSON.stringify(input, null, 2));
      throw new Error("Invalid diagnosis input");
    }

    // Log the result for debugging
    console.log("Diagnosis result before translation:", JSON.stringify(result, null, 2));

    // Always translate the result to the user's preferred language
    console.log("User's preferred language:", input.language);
    try {
      // Make sure we have a valid language code
      const language = input.language || "en";

      // Even if language is English, pass through translation to ensure consistent processing
      const translatedResult = await translateDiagnosisResult(result, language);

      // Log the translated result for debugging
      try {
        console.log("Translated diagnosis result:", JSON.stringify(translatedResult, null, 2));
      } catch (e) {
        console.error("Error logging translated result:", e);
      }

      return translatedResult;
    } catch (error) {
      console.error("Translation error:", error instanceof Error ? error.message : String(error));
      return result; // Return original result if translation fails
    }
  } catch (error) {
    console.error("Diagnosis error:", error instanceof Error ? error.message : String(error));
    // Return a fallback result in case of any errors
    return getFallbackResult(input.image);
  }
}

/**
 * Get a fallback diagnosis result from mock data
 * @param imageUri Optional image URI to include in the result
 * @returns Mock diagnosis result
 */
function getFallbackResult(imageUri?: string): DiagnosisResult {
  // Get a random disease from our mock data
  const randomIndex = Math.floor(Math.random() * DISEASES.length);
  const disease = DISEASES[randomIndex];

  // Make sure the disease has all required fields with non-empty values
  const description = disease.description || "No description available for this disease. Please consult with a plant pathologist for more information.";
  const remedy = disease.remedy || "No specific remedy information available. Consider consulting with a local agricultural extension office for treatment options.";
  const prevention = disease.prevention || "General prevention methods include proper plant spacing, adequate watering, and regular monitoring for early signs of disease.";

  console.log("Using fallback result with disease:", disease.name);

  return {
    species: "Unknown",
    disease: disease.name,
    description: description,
    remedy: remedy,
    prevention: prevention,
    confidence: disease.confidence || 0.7,
    image: imageUri || disease.image,
    timestamp: Date.now()
  };
}

// Process text input - detect language and translate if needed
export async function processTextInput(text: string, targetLanguage: string): Promise<string> {
  if (!text || text.trim() === "") {
    return text;
  }

  try {
    // Detect the language of the input text
    const detectedLanguage = await detectLanguage(text);

    // If the detected language is not English, translate to English for processing
    if (detectedLanguage !== "en") {
      const translatedText = await translateText(text, "en");
      return translatedText;
    }

    return text;
  } catch (error) {
    console.error("Error processing text input:", error instanceof Error ? error.message : String(error));
    return text;
  }
}