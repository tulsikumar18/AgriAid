import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

// Gemini API key
const GEMINI_API_KEY = "AIzaSyDwB_le4SphgM4d1rZReqnxVJWbp1vO2m8";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-1.5-flash";

interface GeminiTextRequest {
  contents: {
    role: string;
    parts: {
      text: string;
    }[];
  }[];
}

interface GeminiImageRequest {
  contents: {
    role: string;
    parts: {
      text?: string;
      inline_data?: {
        mime_type: string;
        data: string;
      };
    }[];
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: any[];
  };
}

/**
 * Analyzes plant disease from an image using Gemini API
 * @param imageUri URI of the image to analyze
 * @param targetLanguage Target language code (e.g., "hi" for Hindi)
 * @returns Object containing plant species, disease name, description, and treatment
 */
export async function analyzePlantImage(imageUri: string, targetLanguage: string = "en"): Promise<{
  species: string;
  disease: string;
  description: string;
  remedy: string;
  prevention: string;
  confidence: number;
}> {
  try {
    // Convert image to base64
    const base64Image = await imageToBase64(imageUri);

    // Map language codes to full language names for better results
    const languageNames: Record<string, string> = {
      "en": "English",
      "hi": "Hindi",
      "te": "Telugu",
      "kn": "Kannada",
      "ta": "Tamil",
      "mr": "Marathi"
    };

    const languageName = languageNames[targetLanguage] || "English";

    // Prepare the request with language-specific instructions
    const prompt = `Analyze this plant image and identify any diseases or issues.
Provide the following information in JSON format with these exact keys:
{
  "disease": "Disease or issue name (simple, non-scientific)",
  "description": "3-4 bullet points about the disease/issue (use • as bullet point)",
  "remedy": "3-4 bullet points of treatment remedies (use • as bullet point)",
  "prevention": "3-4 bullet points of prevention methods (use • as bullet point)"
}

CRITICAL INSTRUCTIONS ABOUT REMEDY SECTION:
- You MUST provide detailed remedy information in the "remedy" field
- NEVER return "No remedy information available" or similar phrases
- If specific remedies are uncertain, provide general plant care recommendations or common treatments
- Include both home remedies (like neem oil, baking soda solutions) and commercial options (fungicides, etc.)
- The remedy section is the most important part of your response and must always be complete

IMPORTANT FORMATTING INSTRUCTIONS:
1. Format all content as bullet points (using • symbol)
2. Each section MUST have 3-4 concise, valuable bullet points
3. Use simple, non-technical language and avoid scientific terms
4. Write for a general audience with no plant expertise
5. Respond in ${languageName} language - ALL content should be in ${languageName} only
6. Do not include any English text in your response unless the requested language is English
7. Ensure the JSON format is maintained even when translating to ${languageName}

Remember: The remedy section is REQUIRED and must contain useful treatment information.`;

    const requestBody: GeminiImageRequest = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ]
    };

    // Make API request
    const response = await fetch(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: GeminiResponse = await response.json();

    // Check if the response was blocked
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
    }

    // Extract the text response
    const textResponse = data.candidates[0]?.content.parts[0]?.text;

    if (!textResponse) {
      throw new Error("No response from Gemini API");
    }

    // Parse the JSON response
    // The response might not be perfect JSON, so we need to extract it
    let jsonStr = textResponse;

    // If the response contains markdown code blocks, extract the JSON
    if (textResponse.includes("```json")) {
      const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonStr = jsonMatch[1];
      }
    } else if (textResponse.includes("```")) {
      // Try to extract from any code block
      const jsonMatch = textResponse.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonStr = jsonMatch[1];
      }
    }

    // Parse the JSON
    let parsedResponse;
    try {
      // Clean up the JSON string to handle bullet points and other special characters
      const cleanedJsonStr = jsonStr
        .replace(/•/g, '') // Remove bullet points
        .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '') // Remove various bullet point characters
        .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
        .trim();

      console.log("Attempting to parse cleaned JSON:", cleanedJsonStr);
      parsedResponse = JSON.parse(cleanedJsonStr);
      console.log("Successfully parsed JSON:", parsedResponse);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);

      // Try a more aggressive approach to extract JSON
      try {
        // Look for patterns that might indicate JSON structure
        const jsonPattern = /\{[\s\S]*"disease"[\s\S]*"description"[\s\S]*"remedy"[\s\S]*"prevention"[\s\S]*\}/i;
        const match = textResponse.match(jsonPattern);

        if (match) {
          const potentialJson = match[0]
            .replace(/•/g, '') // Remove bullet points
            .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '') // Remove various bullet point characters
            .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
            .trim();

          console.log("Attempting to parse extracted JSON pattern:", potentialJson);
          parsedResponse = JSON.parse(potentialJson);
          console.log("Successfully parsed extracted JSON pattern:", parsedResponse);
        } else {
          throw new Error("No JSON pattern found");
        }
      } catch (extractError) {
        console.error("Failed to extract and parse JSON pattern:", extractError);
        console.log("Falling back to text extraction");
        return extractStructuredInfo(textResponse);
      }
    }

    // Extract the data
    const species = parsedResponse.species || parsedResponse["Plant species"] || "";
    const disease = parsedResponse.disease || parsedResponse["Disease name"] || "";
    const description = parsedResponse.description || parsedResponse["Description"] || "";
    let remedy = parsedResponse.treatment || parsedResponse.remedy || parsedResponse["Treatment"] || parsedResponse["Treatment remedies"] || "";
    const prevention = parsedResponse.prevention || parsedResponse["Prevention"] || parsedResponse["Prevention methods"] || "";

    // If no remedy is available, generate some common remedies based on the disease
    if (!remedy || (typeof remedy === 'string' && (remedy.toLowerCase().includes("no remedy") || remedy.toLowerCase().includes("not available")))) {
      console.log("No remedy information available in image analysis, generating common remedies");
      remedy = generateCommonRemedies(disease, description);
    } else if (Array.isArray(remedy) && remedy.length === 0) {
      console.log("Empty remedy array in image analysis, generating common remedies");
      remedy = generateCommonRemedies(disease, description);
    } else if (remedy === undefined) {
      console.log("Undefined remedy in image analysis, generating common remedies");
      remedy = generateCommonRemedies(disease, description);
    }

    // Return the structured data
    return {
      species,
      disease,
      description,
      remedy,
      prevention,
      confidence: 0.85 // Default confidence value
    };
  } catch (error) {
    console.error("Error analyzing plant image:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Analyzes plant symptoms from text using Gemini API
 * @param text Description of plant symptoms
 * @param targetLanguage Target language code (e.g., "hi" for Hindi)
 * @returns Object containing likely disease, description, and treatment
 */
export async function analyzeTextSymptoms(text: string, targetLanguage: string = "en"): Promise<{
  species: string;
  disease: string;
  description: string;
  remedy: string;
  prevention: string;
  confidence: number;
}> {
  try {
    // Map language codes to full language names for better results
    const languageNames: Record<string, string> = {
      "en": "English",
      "hi": "Hindi",
      "te": "Telugu",
      "kn": "Kannada",
      "ta": "Tamil",
      "mr": "Marathi"
    };

    const languageName = languageNames[targetLanguage] || "English";

    // Prepare the request with language-specific instructions
    const prompt = `Based on these plant symptoms: "${text}", identify the most likely plant disease or issue.
Provide the following information in JSON format with these exact keys:
{
  "disease": "Disease or issue name (simple, non-scientific)",
  "description": "3-4 bullet points about the disease/issue (use • as bullet point)",
  "remedy": "3-4 bullet points of treatment remedies (use • as bullet point)",
  "prevention": "3-4 bullet points of prevention methods (use • as bullet point)"
}

CRITICAL INSTRUCTIONS ABOUT REMEDY SECTION:
- You MUST provide detailed remedy information in the "remedy" field
- NEVER return "No remedy information available" or similar phrases
- If specific remedies are uncertain, provide general plant care recommendations or common treatments
- Include both home remedies (like neem oil, baking soda solutions) and commercial options (fungicides, etc.)
- The remedy section is the most important part of your response and must always be complete

IMPORTANT FORMATTING INSTRUCTIONS:
1. Format all content as bullet points (using • symbol)
2. Each section MUST have 3-4 concise, valuable bullet points
3. Use simple, non-technical language and avoid scientific terms
4. Write for a general audience with no plant expertise
5. Respond in ${languageName} language - ALL content should be in ${languageName} only
6. Do not include any English text in your response unless the requested language is English
7. Ensure the JSON format is maintained even when translating to ${languageName}

Remember: The remedy section is REQUIRED and must contain useful treatment information.`;

    const requestBody: GeminiTextRequest = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    // Make API request
    const response = await fetch(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: GeminiResponse = await response.json();

    // Extract the text response
    const textResponse = data.candidates[0]?.content.parts[0]?.text;

    if (!textResponse) {
      throw new Error("No response from Gemini API");
    }

    // Log the raw response for debugging
    console.log("Raw Gemini API response:", textResponse);

    // Parse the JSON response
    // The response might not be perfect JSON, so we need to extract it
    let jsonStr = textResponse;

    // If the response contains markdown code blocks, extract the JSON
    if (textResponse.includes("```json")) {
      const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonStr = jsonMatch[1];
      }
    } else if (textResponse.includes("```")) {
      // Try to extract from any code block
      const jsonMatch = textResponse.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonStr = jsonMatch[1];
      }
    }

    // Parse the JSON
    let parsedResponse;
    try {
      // Clean up the JSON string to handle bullet points and other special characters
      const cleanedJsonStr = jsonStr
        .replace(/•/g, '') // Remove bullet points
        .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '') // Remove various bullet point characters
        .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
        .trim();

      console.log("Attempting to parse cleaned JSON:", cleanedJsonStr);
      parsedResponse = JSON.parse(cleanedJsonStr);
      console.log("Successfully parsed JSON:", parsedResponse);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);

      // Try a more aggressive approach to extract JSON
      try {
        // Look for patterns that might indicate JSON structure
        const jsonPattern = /\{[\s\S]*"disease"[\s\S]*"description"[\s\S]*"remedy"[\s\S]*"prevention"[\s\S]*\}/i;
        const match = textResponse.match(jsonPattern);

        if (match) {
          const potentialJson = match[0]
            .replace(/•/g, '') // Remove bullet points
            .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '') // Remove various bullet point characters
            .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
            .trim();

          console.log("Attempting to parse extracted JSON pattern:", potentialJson);
          parsedResponse = JSON.parse(potentialJson);
          console.log("Successfully parsed extracted JSON pattern:", parsedResponse);
        } else {
          throw new Error("No JSON pattern found");
        }
      } catch (extractError) {
        console.error("Failed to extract and parse JSON pattern:", extractError);
        console.log("Falling back to text extraction");
        return extractStructuredInfo(textResponse);
      }
    }

    // Extract the data
    const species = parsedResponse.species || parsedResponse["Plant species"] || parsedResponse["Likely plant species affected"] || "";
    const disease = parsedResponse.disease || parsedResponse["Disease name"] || "";
    const description = parsedResponse.description || parsedResponse["Description"] || "";
    let remedy = parsedResponse.treatment || parsedResponse.remedy || parsedResponse["Treatment"] || parsedResponse["Treatment remedies"] || "";
    const prevention = parsedResponse.prevention || parsedResponse["Prevention"] || parsedResponse["Prevention methods"] || "";

    // If no remedy is available, generate some common remedies based on the disease
    if (!remedy || (typeof remedy === 'string' && (remedy.toLowerCase().includes("no remedy") || remedy.toLowerCase().includes("not available")))) {
      console.log("No remedy information available in text analysis, generating common remedies");
      remedy = generateCommonRemedies(disease, description);
    } else if (Array.isArray(remedy) && remedy.length === 0) {
      console.log("Empty remedy array in text analysis, generating common remedies");
      remedy = generateCommonRemedies(disease, description);
    } else if (remedy === undefined) {
      console.log("Undefined remedy in text analysis, generating common remedies");
      remedy = generateCommonRemedies(disease, description);
    }

    // Return the structured data
    return {
      species,
      disease,
      description,
      remedy,
      prevention,
      confidence: 0.8 // Default confidence value
    };
  } catch (error) {
    console.error("Error analyzing text symptoms:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Helper function to convert image URI to base64
async function imageToBase64(uri: string): Promise<string> {
  try {
    if (Platform.OS === "web") {
      // For web, fetch the image and convert to base64
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          resolve(base64data.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // For mobile, use Expo FileSystem
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    }
  } catch (error) {
    console.error("Error converting image to base64:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Helper function to extract structured information from text when JSON parsing fails
function extractStructuredInfo(text: string): {
  species: string;
  disease: string;
  description: string;
  remedy: string;
  prevention: string;
  confidence: number;
} {
  console.log("Extracting structured info from text:", text);

  // Default values
  let species = "";
  let disease = "";
  let description = "";
  let remedy = "";
  let prevention = "";

  // Try to extract information based on common patterns
  const speciesMatch = text.match(/species:?\s*([^\n.]+)/i) ||
                      text.match(/plant:?\s*([^\n.]+)/i);
  if (speciesMatch) {
    species = speciesMatch[1].trim();
    console.log("Extracted species:", species);
  }

  const diseaseMatch = text.match(/disease:?\s*([^\n.]+)/i) ||
                      text.match(/issue:?\s*([^\n.]+)/i);
  if (diseaseMatch) {
    disease = diseaseMatch[1].trim();
    console.log("Extracted disease:", disease);
  }

  const descriptionMatch = text.match(/description:?\s*([^\n]+(?:\n[^\n]+)*?)(?:\n\n|\n[A-Z]|$)/i);
  if (descriptionMatch) {
    description = descriptionMatch[1].trim();
    console.log("Extracted description:", description);
  } else {
    // Try a more aggressive pattern
    const altDescMatch = text.match(/description:?\s*([\s\S]*?)(?:treatment|remedy|prevention|$)/i);
    if (altDescMatch) {
      description = altDescMatch[1].trim();
      console.log("Extracted description (alt method):", description);
    }
  }

  const remedyMatch = text.match(/treatment:?\s*([^\n]+(?:\n[^\n]+)*?)(?:\n\n|\n[A-Z]|$)/i) ||
                     text.match(/remedy:?\s*([^\n]+(?:\n[^\n]+)*?)(?:\n\n|\n[A-Z]|$)/i);
  if (remedyMatch) {
    remedy = remedyMatch[1].trim();
    console.log("Extracted remedy:", remedy);
  } else {
    // Try a more aggressive pattern
    const altRemedyMatch = text.match(/(?:treatment|remedy):?\s*([\s\S]*?)(?:prevention|$)/i);
    if (altRemedyMatch) {
      remedy = altRemedyMatch[1].trim();
      console.log("Extracted remedy (alt method):", remedy);
    }
  }

  const preventionMatch = text.match(/prevention:?\s*([^\n]+(?:\n[^\n]+)*?)(?:\n\n|\n[A-Z]|$)/i);
  if (preventionMatch) {
    prevention = preventionMatch[1].trim();
    console.log("Extracted prevention:", prevention);
  } else {
    // Try a more aggressive pattern
    const altPreventionMatch = text.match(/prevention:?\s*([\s\S]*?)(?:$)/i);
    if (altPreventionMatch) {
      prevention = altPreventionMatch[1].trim();
      console.log("Extracted prevention (alt method):", prevention);
    }
  }

  // If no remedy is available, generate some common remedies based on the disease
  if (!remedy || (typeof remedy === 'string' && (remedy.toLowerCase().includes("no remedy") || remedy.toLowerCase().includes("not available")))) {
    console.log("No remedy information available, generating common remedies");
    remedy = generateCommonRemedies(disease, description);
  } else if (remedy === undefined) {
    console.log("Undefined remedy, generating common remedies");
    remedy = generateCommonRemedies(disease, description);
  }

  const result = {
    species,
    disease,
    description,
    remedy,
    prevention,
    confidence: 0.7 // Lower confidence for text extraction
  };

  console.log("Final extracted result:", result);
  return result;
}

/**
 * Generates common remedies for plant diseases when no specific remedy is available
 * @param disease The identified disease
 * @param description The disease description
 * @returns A string with common remedies in bullet point format
 */
function generateCommonRemedies(disease: string, description: string): string {
  console.log(`Generating common remedies for: ${disease || "unknown disease"}`);

  // Ensure disease and description are strings
  const diseaseSafe = typeof disease === 'string' ? disease : "unknown plant issue";
  const descriptionSafe = typeof description === 'string' ? description : "";

  // Common home remedies for various plant disease categories
  const commonRemedies = [
    "• Remove and destroy infected plant parts to prevent spread of the disease.",
    "• Apply neem oil solution (2 tablespoons neem oil in 1 gallon of water) to affected areas every 7-14 days.",
    "• Create a baking soda spray (1 tablespoon baking soda, 1 teaspoon mild soap, 1 gallon water) and apply to affected areas.",
    "• Use a diluted milk spray (1 part milk to 9 parts water) which can be effective against fungal diseases.",
    "• Apply compost tea as a natural fungicide and to boost plant immunity."
  ];

  // Industrial/commercial remedies
  const commercialRemedies = [
    "• Apply copper-based fungicides according to package instructions for severe infections.",
    "• Use sulfur-based fungicides which are effective against many fungal diseases.",
    "• Consider appropriate commercial fungicides labeled for the specific disease.",
    "• For bacterial infections, use products containing streptomycin or copper compounds.",
    "• Apply horticultural oils to smother insect pests that may be vectors for the disease."
  ];

  // Combine home and commercial remedies
  const allRemedies = [...commonRemedies, ...commercialRemedies];

  // Check for specific disease types to provide more targeted remedies
  let specificRemedies: string[] = [];

  const diseaseLower = diseaseSafe.toLowerCase();
  const descriptionLower = descriptionSafe.toLowerCase();

  if (diseaseLower.includes("blight") || descriptionLower.includes("blight")) {
    specificRemedies = [
      "• Ensure good air circulation by proper spacing between plants.",
      "• Apply copper-based fungicides early in the growing season.",
      "• Water at the base of plants to keep foliage dry.",
      "• Rotate crops and avoid planting susceptible species in affected soil for 3-4 years."
    ];
  } else if (diseaseLower.includes("rust") || descriptionLower.includes("rust")) {
    specificRemedies = [
      "• Remove and destroy all infected plant material.",
      "• Apply sulfur-based fungicides at first sign of infection.",
      "• Avoid overhead watering which can spread rust spores.",
      "• Increase spacing between plants to improve air circulation."
    ];
  } else if (diseaseLower.includes("mildew") || descriptionLower.includes("mildew") || diseaseLower.includes("powdery")) {
    specificRemedies = [
      "• Mix 1 tablespoon of baking soda with 1 gallon of water and spray on affected areas.",
      "• Apply a solution of 40% milk and 60% water to affected areas twice a week.",
      "• Use potassium bicarbonate sprays which are effective against powdery mildew.",
      "• Prune overcrowded areas to increase air circulation."
    ];
  } else if (diseaseLower.includes("spot") || descriptionLower.includes("spot")) {
    specificRemedies = [
      "• Remove infected leaves and destroy them.",
      "• Apply copper-based fungicides according to package directions.",
      "• Avoid overhead watering to prevent spreading spores.",
      "• Mulch around plants to prevent soil-borne spores from splashing onto leaves."
    ];
  } else if (diseaseLower.includes("rot") || descriptionLower.includes("rot")) {
    specificRemedies = [
      "• Improve soil drainage by adding organic matter or raising beds.",
      "• Reduce watering frequency and avoid overwatering.",
      "• Apply fungicides containing fosetyl-aluminum for root rots.",
      "• Remove and destroy affected plants to prevent spread."
    ];
  }

  // Combine general and specific remedies, but limit to 5-7 total points
  let finalRemedies: string[] = [];

  if (specificRemedies.length > 0) {
    // If we have specific remedies, use those plus some general ones
    finalRemedies = [...specificRemedies.slice(0, 4), ...commonRemedies.slice(0, 2), ...commercialRemedies.slice(0, 1)];
  } else {
    // Otherwise use a mix of common and commercial remedies
    finalRemedies = [...commonRemedies.slice(0, 4), ...commercialRemedies.slice(0, 3)];
  }

  // Limit to 7 remedies maximum
  finalRemedies = finalRemedies.slice(0, 7);

  // Ensure we have at least 3 remedies
  if (finalRemedies.length < 3) {
    // Add more common remedies if we don't have enough
    finalRemedies = [...finalRemedies, ...commonRemedies].slice(0, 5);
  }

  // Final safety check - if somehow we still have no remedies, add a default set
  if (finalRemedies.length === 0) {
    finalRemedies = [
      "• Remove and destroy infected plant parts to prevent spread of the disease.",
      "• Apply neem oil solution (2 tablespoons neem oil in 1 gallon of water) to affected areas.",
      "• Improve air circulation around plants by proper spacing.",
      "• Water at the base of plants to keep foliage dry.",
      "• Apply appropriate fungicide for severe infections."
    ];
  }

  // Return as a string
  const result = finalRemedies.join("\n");
  console.log(`Generated ${finalRemedies.length} remedies`);
  return result;
}

/**
 * Translates content to the specified language using Gemini API
 * @param content Text content to translate
 * @param targetLanguage Target language code (e.g., "hi" for Hindi)
 * @returns Translated text
 */
export async function translateWithGemini(content: string, targetLanguage: string): Promise<string> {
  try {
    if (!content || content.trim() === "") {
      console.log("Empty content provided for translation");
      return "";
    }

    // Map language codes to full language names for better results
    const languageNames: Record<string, string> = {
      "en": "English",
      "hi": "Hindi",
      "te": "Telugu",
      "kn": "Kannada",
      "ta": "Tamil",
      "mr": "Marathi"
    };

    const languageName = languageNames[targetLanguage] || targetLanguage;
    console.log(`Translating content to ${languageName} using Gemini API`);

    // Prepare the request
    const prompt = `Translate the following text to ${languageName}. Provide ONLY the translated text without any additional explanations, notes, or original text. Maintain the same formatting, including bullet points, line breaks, and paragraph structure:

${content}`;

    const requestBody: GeminiTextRequest = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    // Make API request
    const response = await fetch(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: GeminiResponse = await response.json();

    // Extract the text response
    const textResponse = data.candidates[0]?.content.parts[0]?.text;

    if (!textResponse) {
      throw new Error("No translation response from Gemini API");
    }

    console.log(`Translation successful. First 50 chars: ${textResponse.substring(0, 50)}...`);
    return textResponse;
  } catch (error) {
    console.error("Error translating with Gemini:", error instanceof Error ? error.message : String(error));
    // Return original content if translation fails
    return content;
  }
}
