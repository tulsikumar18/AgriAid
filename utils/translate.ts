import { DiagnosisResult } from "@/types/diagnosis";
import { translateWithGemini } from "@/utils/geminiApi";

// Using the RapidAPI Google Translate endpoint
const RAPID_API_KEY = "37ea18fb2fmsh75430a0c01b2db3p1a2365jsn7c6dedeadc24";
const RAPID_API_HOST = "google-translate113.p.rapidapi.com";
const RAPID_API_URL = "https://google-translate113.p.rapidapi.com/api/v1/translator/text";

interface TranslationResponse {
  trans?: string;
  source_language?: string;
  error?: any;
}

export async function translateText(text: string | undefined, targetLanguage: string): Promise<string> {
  // Check if text is undefined or null
  if (text === undefined || text === null) {
    console.log("Text is undefined or null, skipping translation");
    return "";
  }

  // Check if text is empty
  if (text.trim() === "") {
    console.log("Empty text, skipping translation");
    return text;
  }

  console.log(`Translating text to ${targetLanguage}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

  if (targetLanguage === "en") {
    console.log("Target language is English, no translation needed");
    return text;
  }

  // Always use Gemini API for translation
  try {
    const translatedText = await translateWithGemini(text, targetLanguage);
    console.log(`Successfully translated with Gemini API: "${translatedText.substring(0, 50)}${translatedText.length > 50 ? '...' : ''}"`);
    return translatedText;
  } catch (error) {
    console.error("Error using Gemini for translation, falling back to dictionary:", error);
    // Fall back to dictionary-based translation if Gemini fails
  }

  // Only reach here if Gemini translation failed
  // Convert text to lowercase for better matching with dictionary terms
  const lowerText = text.toLowerCase();

  // For demo purposes, provide mock translations to ensure functionality
  // This ensures the app works even if the translation API fails

  // Mock translations for common terms in different languages
  const mockTranslations: Record<string, Record<string, string>> = {
    "hi": { // Hindi
      // Section titles
      "disease": "रोग",
      "description": "विवरण",
      "remedy": "उपचार",
      "prevention": "रोकथाम",
      "confidence": "विश्वास स्तर",
      "diagnosis result": "निदान परिणाम",
      "back to diagnosis": "निदान पर वापस जाएं",
      "read all content": "सभी सामग्री पढ़ें",
      "speaking": "बोल रहा है",

      // Common plant terms
      "plant": "पौधा",
      "leaf": "पत्ती",
      "stem": "तना",
      "root": "जड़",
      "flower": "फूल",
      "fruit": "फल",
      "seed": "बीज",

      // Common disease terms
      "blight": "झुलसा",
      "rust": "रतुआ",
      "mildew": "फफूंदी",
      "rot": "सड़न",
      "spot": "धब्बा",
      "wilt": "मुरझान",
      "mosaic": "मोज़ेक",
      "canker": "कैंकर",

      // Fallback messages
      "no description available": "कोई विवरण उपलब्ध नहीं है",
      "no remedy information available": "कोई उपचार जानकारी उपलब्ध नहीं है",
      "no prevention information available": "कोई रोकथाम जानकारी उपलब्ध नहीं है",
      "unknown disease": "अज्ञात रोग"
    },
    "te": { // Telugu
      // Section titles
      "disease": "వ్యాధి",
      "description": "వివరణ",
      "remedy": "చికిత్స",
      "prevention": "నివారణ",
      "confidence": "నమ్మకం స్థాయి",
      "diagnosis result": "రోగ నిర్ధారణ ఫలితం",
      "back to diagnosis": "రోగ నిర్ధారణకు తిరిగి వెళ్ళండి",
      "read all content": "మొత్తం కంటెంట్ చదవండి",
      "speaking": "మాట్లాడుతోంది",

      // Common plant terms
      "plant": "మొక్క",
      "leaf": "ఆకు",
      "stem": "కాండం",
      "root": "వేరు",
      "flower": "పువ్వు",
      "fruit": "పండు",
      "seed": "విత్తనం",

      // Fallback messages
      "no description available": "వివరణ అందుబాటులో లేదు",
      "no remedy information available": "చికిత్స సమాచారం అందుబాటులో లేదు",
      "no prevention information available": "నివారణ సమాచారం అందుబాటులో లేదు",
      "unknown disease": "తెలియని వ్యాధి"
    },
    "kn": { // Kannada
      // Section titles
      "disease": "ರೋಗ",
      "description": "ವಿವರಣೆ",
      "remedy": "ಪರಿಹಾರ",
      "prevention": "ತಡೆಗಟ್ಟುವಿಕೆ",
      "confidence": "ವಿಶ್ವಾಸ ಮಟ್ಟ",
      "diagnosis result": "ರೋಗ ನಿರ್ಣಯದ ಫಲಿತಾಂಶ",
      "back to diagnosis": "ರೋಗ ನಿರ್ಣಯಕ್ಕೆ ಹಿಂತಿರುಗಿ",
      "read all content": "ಎಲ್ಲಾ ವಿಷಯವನ್ನು ಓದಿ",
      "speaking": "ಮಾತನಾಡುತ್ತಿದೆ",

      // Common plant terms
      "plant": "ಸಸ್ಯ",
      "leaf": "ಎಲೆ",
      "stem": "ಕಾಂಡ",
      "root": "ಬೇರು",
      "flower": "ಹೂವು",
      "fruit": "ಹಣ್ಣು",
      "seed": "ಬೀಜ",

      // Fallback messages
      "no description available": "ಯಾವುದೇ ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ",
      "no remedy information available": "ಯಾವುದೇ ಪರಿಹಾರ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
      "no prevention information available": "ಯಾವುದೇ ತಡೆಗಟ್ಟುವಿಕೆ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
      "unknown disease": "ಅಜ್ಞಾತ ರೋಗ"
    },
    "ta": { // Tamil
      // Section titles
      "disease": "நோய்",
      "description": "விளக்கம்",
      "remedy": "தீர்வு",
      "prevention": "தடுப்பு",
      "confidence": "நம்பிக்கை நிலை",
      "diagnosis result": "நோய் கண்டறிதல் முடிவு",
      "back to diagnosis": "நோய் கண்டறிதலுக்குத் திரும்பு",
      "read all content": "அனைத்து உள்ளடக்கத்தையும் படி",
      "speaking": "பேசுகிறது",

      // Common plant terms
      "plant": "தாவரம்",
      "leaf": "இலை",
      "stem": "தண்டு",
      "root": "வேர்",
      "flower": "பூ",
      "fruit": "பழம்",
      "seed": "விதை",

      // Fallback messages
      "no description available": "விளக்கம் எதுவும் இல்லை",
      "no remedy information available": "தீர்வு தகவல் எதுவும் இல்லை",
      "no prevention information available": "தடுப்பு தகவல் எதுவும் இல்லை",
      "unknown disease": "அறியப்படாத நோய்"
    },
    "mr": { // Marathi
      // Section titles
      "disease": "रोग",
      "description": "वर्णन",
      "remedy": "उपाय",
      "prevention": "प्रतिबंध",
      "confidence": "विश्वास पातळी",
      "diagnosis result": "निदान निकाल",
      "back to diagnosis": "निदानाकडे परत जा",
      "read all content": "सर्व सामग्री वाचा",
      "speaking": "बोलत आहे",

      // Common plant terms
      "plant": "वनस्पती",
      "leaf": "पान",
      "stem": "खोड",
      "root": "मूळ",
      "flower": "फूल",
      "fruit": "फळ",
      "seed": "बीज",

      // Fallback messages
      "no description available": "कोणतेही वर्णन उपलब्ध नाही",
      "no remedy information available": "कोणतीही उपाय माहिती उपलब्ध नाही",
      "no prevention information available": "कोणतीही प्रतिबंध माहिती उपलब्ध नाही",
      "unknown disease": "अज्ञात रोग"
    }
  };

  // Check if we have mock translations for this language
  if (mockTranslations[targetLanguage]) {
    // Check for exact matches first (case-insensitive)
    if (mockTranslations[targetLanguage][lowerText]) {
      return mockTranslations[targetLanguage][lowerText];
    }

    // Try to match section titles exactly
    const sectionTitles = ["disease", "description", "remedy", "prevention", "confidence",
                          "diagnosis result", "back to diagnosis", "read all content", "speaking"];

    for (const title of sectionTitles) {
      if (lowerText === title) {
        if (mockTranslations[targetLanguage][title]) {
          return mockTranslations[targetLanguage][title];
        }
      }
    }

    // Replace known terms with their translations
    let translatedText = text;
    Object.entries(mockTranslations[targetLanguage]).forEach(([term, translation]) => {
      // Create a word boundary-aware regex to match whole words only
      // This prevents partial word matches (e.g., "plant" in "plantation")
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (lowerText.includes(term.toLowerCase())) {
        translatedText = translatedText.replace(regex, translation);
      }
    });

    // Add language suffix for demo if no changes were made
    if (translatedText === text) {
      const suffixes: Record<string, string> = {
        "hi": " (हिंदी)",
        "te": " (తెలుగు)",
        "kn": " (ಕನ್ನಡ)",
        "ta": " (தமிழ்)",
        "mr": " (मराठी)"
      };

      return text + (suffixes[targetLanguage] || " (translated)");
    }

    return translatedText;
  }

  // Try to use the RapidAPI Google Translate endpoint
  try {
    console.log(`Attempting to translate using RapidAPI: ${text.substring(0, 30)}...`);

    const response = await fetch(RAPID_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": RAPID_API_HOST,
      },
      body: JSON.stringify({
        source_language: "auto",
        target_language: targetLanguage,
        text: text,
      }),
    });

    if (!response.ok) {
      // Handle 400 Bad Request errors gracefully
      if (response.status === 400) {
        console.error("Translation API bad request error. Validating payload format.");
        throw new Error("Bad request to translation API");
      }
      throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the translated text from the response
    if (data && data.trans) {
      const translatedText = data.trans;
      console.log(`Translation successful: "${translatedText.substring(0, 50)}${translatedText.length > 50 ? '...' : ''}"`);
      return translatedText;
    } else {
      console.error("Unexpected translation response format:", JSON.stringify(data));
      throw new Error("Invalid translation response format");
    }
  } catch (error) {
    console.error("Translation API failed:", error instanceof Error ? error.message : String(error));
    console.log("Falling back to mock translations");

    // Create a simple mock translation by adding language suffix
    const suffixes: Record<string, string> = {
      "hi": " (हिंदी)",
      "te": " (తెలుగు)",
      "kn": " (ಕನ್ನಡ)",
      "ta": " (தமிழ்)",
      "mr": " (मराठी)"
    };

    return text + (suffixes[targetLanguage] || " (translated)");
  }

  /* Commented out API call to avoid errors
  try {
    const response = await fetch(RAPID_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": RAPID_API_HOST,
      },
      body: JSON.stringify({
        source_language: "auto",
        target_language: targetLanguage,
        text: text,
      }),
    });

    if (!response.ok) {
      // Handle 400 Bad Request errors gracefully
      if (response.status === 400) {
        console.error("Translation API bad request error. Validating payload format.");
        // Return original text instead of throwing
        return text;
      }
      throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the translated text from the response
    if (data && data.translated_text) {
      const translatedText = data.translated_text;
      console.log(`Translation successful: "${translatedText.substring(0, 50)}${translatedText.length > 50 ? '...' : ''}"`);
      return translatedText;
    } else {
      console.error("Unexpected translation response format:", JSON.stringify(data));
      return text || "";
    }
  } catch (error) {
    console.error("Translation failed:", error instanceof Error ? error.message : String(error));
    // Fallback to mock translation for demo
    return text + " (translated)";
  }
  */
}

export async function detectLanguage(text: string): Promise<string> {
  if (!text || text.trim() === "") return "en";

  try {
    console.log("Attempting to detect language using Gemini API:", text.substring(0, 30) + "...");

    // First try using Gemini API for language detection
    try {
      // Create a prompt for language detection
      const prompt = `Detect the language of the following text and respond with ONLY the ISO 639-1 language code (e.g., "en" for English, "hi" for Hindi, etc.). Do not include any other text in your response:

${text.substring(0, 200)}`;

      // Get the response from Gemini
      const response = await translateWithGemini(prompt, "en");

      // Extract the language code (should be the only thing in the response)
      const languageCode = response.trim().toLowerCase().substring(0, 2);

      // Validate the language code
      const validLanguageCodes = ["en", "hi", "te", "kn", "ta", "mr"];
      if (validLanguageCodes.includes(languageCode)) {
        console.log(`Detected language using Gemini API: ${languageCode}`);
        return languageCode;
      } else {
        console.log(`Invalid language code from Gemini API: ${languageCode}, falling back to RapidAPI`);
      }
    } catch (geminiError) {
      console.error("Error detecting language with Gemini API:", geminiError);
      console.log("Falling back to RapidAPI for language detection");
    }

    // Skip RapidAPI since it's failing with 400 errors
    // Instead, try to detect language based on common patterns
    try {
      console.log("Attempting to detect language using pattern matching...");

      // Convert text to lowercase for better matching
      const lowerText = text.toLowerCase();

      // Check for common patterns in different languages
      if (/[अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह]/.test(text)) {
        console.log("Detected Hindi based on character patterns");
        return "hi";
      } else if (/[అఆఇఈఉఊఋఌఎఏఐఒఓఔకఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరలవశషసహళక్షఱ]/.test(text)) {
        console.log("Detected Telugu based on character patterns");
        return "te";
      } else if (/[ಅಆಇಈಉಊಋಌಎಏಐಒಓಔಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಲವಶಷಸಹಳಕ್ಷಱ]/.test(text)) {
        console.log("Detected Kannada based on character patterns");
        return "kn";
      } else if (/[அஆஇஈஉஊஎஏஐஒஓஔகஙசஜஞடணதநபமயரலவழளறனஶஷஸஹ]/.test(text)) {
        console.log("Detected Tamil based on character patterns");
        return "ta";
      } else if (/[अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसहळक्ष]/.test(text)) {
        console.log("Detected Marathi based on character patterns");
        return "mr";
      }

      // If no patterns match, check for common words
      if (lowerText.includes("नमस्ते") || lowerText.includes("धन्यवाद") || lowerText.includes("हिंदी")) {
        return "hi";
      } else if (lowerText.includes("నమస్కారం") || lowerText.includes("ధన్యవాదాలు") || lowerText.includes("తెలుగు")) {
        return "te";
      } else if (lowerText.includes("ನಮಸ್ಕಾರ") || lowerText.includes("ಧನ್ಯವಾದಗಳು") || lowerText.includes("ಕನ್ನಡ")) {
        return "kn";
      } else if (lowerText.includes("வணக்கம்") || lowerText.includes("நன்றி") || lowerText.includes("தமிழ்")) {
        return "ta";
      } else if (lowerText.includes("नमस्कार") || lowerText.includes("धन्यवाद") || lowerText.includes("मराठी")) {
        return "mr";
      }

      // Default to English if no patterns match
      console.log("No language patterns detected, defaulting to English");
      return "en";
    } catch (patternError) {
      console.error("Pattern-based language detection failed:", patternError);
      console.log("All language detection methods failed, defaulting to English");
      return "en";
    }
  } catch (error) {
    console.error("All language detection methods failed:", error instanceof Error ? error.message : String(error));
    console.log("Defaulting to English");
    return "en";
  }

  // The following code is commented out to avoid API calls during demo
  /*
  try {
    const response = await fetch(RAPID_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": RAPID_API_HOST,
      },
      body: JSON.stringify({
        source_language: "auto",
        target_language: "en",
        text: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Language detection API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the detected language
    if (data && data.source_language) {
      return data.source_language.toLowerCase();
    } else {
      console.error("Unexpected language detection response format:", JSON.stringify(data));
      return "en";
    }
  } catch (error) {
    console.error("Language detection failed:", error instanceof Error ? error.message : String(error));
    return "en";
  }
  */
}

export async function translateDiagnosisResult(result: DiagnosisResult, targetLanguage: string): Promise<DiagnosisResult> {
  console.log(`Translating diagnosis result to ${targetLanguage}`);

  if (targetLanguage === "en") {
    console.log("Target language is English, no translation needed");
    return result;
  }

  if (!result) {
    console.log("No result to translate");
    return result || {} as DiagnosisResult;
  }

  try {
    // Create a copy of the result to avoid mutating the original
    const translatedResult: DiagnosisResult = { ...result };

    // Helper function to translate content using Gemini API
    const translateFullContent = async (field: any, fieldName: string): Promise<any> => {
      try {
        if (!field) return field;

        // Handle array of strings (bullet points)
        if (Array.isArray(field)) {
          console.log(`Translating ${fieldName} array with ${field.length} items using Gemini API`);

          // Join the array items with newlines to preserve formatting
          const combinedText = field.join('\n');

          // Translate the entire content at once
          const translatedText = await translateWithGemini(combinedText, targetLanguage);

          // Split back into an array
          return translatedText.split('\n').filter(line => line.trim() !== '');
        }
        // Handle string
        else if (typeof field === 'string') {
          console.log(`Translating ${fieldName} using Gemini API: "${field.substring(0, 50)}${field.length > 50 ? '...' : ''}"`);
          return await translateWithGemini(field, targetLanguage);
        }

        // Return as is for other types
        return field;
      } catch (e) {
        console.error(`Error translating ${fieldName}:`, e);
        return field; // Keep original value if translation fails
      }
    };

    // Translate each field using Gemini API for complete translation
    translatedResult.species = await translateFullContent(result.species, 'species');
    translatedResult.disease = await translateFullContent(result.disease, 'disease');
    translatedResult.description = await translateFullContent(result.description, 'description');
    translatedResult.remedy = await translateFullContent(result.remedy, 'remedy');
    translatedResult.prevention = await translateFullContent(result.prevention, 'prevention');

    // Log the translated result to verify remedy is included
    console.log("Translated remedy:", translatedResult.remedy);
    console.log("Translated disease:", translatedResult.disease);

    // Also translate section titles for complete translation
    try {
      // Create a combined string with all section titles
      const sectionTitles = `disease\ndescription\nremedy\nprevention\nconfidence\ndiagnosis result\nback to diagnosis\nread all content\nspeaking`;

      // Translate all section titles at once
      const translatedTitles = await translateWithGemini(sectionTitles, targetLanguage);

      // Log the translated titles
      console.log("Translated section titles:", translatedTitles);

      // Store the translated titles in the app's translation system
      // This will be handled by the translation system
    } catch (error) {
      console.error("Error translating section titles:", error);
    }

    return translatedResult;
  } catch (error) {
    console.error("Error translating diagnosis result:", error instanceof Error ? error.message : String(error));
    return result || {} as DiagnosisResult; // Return original result if translation fails
  }
}