import { Platform } from "react-native";
import * as Speech from 'expo-speech';

// Initialize speech functionality
async function initializeSpeech() {
  try {
    console.log("Initializing speech functionality...");

    // First, stop any ongoing speech
    try {
      await Speech.stop();
      console.log("Stopped any ongoing speech during initialization");
    } catch (stopError) {
      console.log("No ongoing speech to stop or error stopping speech:", stopError);
    }

    // Test speech with a simple message (this will be silent but helps initialize the system)
    try {
      // Speak a very short text to initialize the speech system
      Speech.speak("Test", {
        language: "en-US",
        pitch: 1.0,
        rate: 0.8,
        volume: 0.0, // Silent test
        onDone: () => console.log("Speech initialization test completed"),
        onError: (error) => console.log("Speech initialization test error:", error)
      });

      console.log("Speech initialization test started");
    } catch (testError) {
      console.error("Failed to run speech initialization test:", testError);
    }
  } catch (error) {
    console.error("Failed to initialize speech:", error);
  }
}

// Call this when the app starts
initializeSpeech();

export function speak(text: string, language: string = "en-US"): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!text || text.trim() === "") {
      console.warn("Empty text provided to speak function");
      resolve();
      return;
    }

    try {
      console.log(`Speaking text in ${language}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    } catch (error) {
      console.error("Error logging speech text:", error);
      // Continue with speech even if logging fails
    }

    // Stop any ongoing speech first
    Speech.stop();

    // Ensure we have a valid language code
    if (!language || language === "undefined") {
      console.warn("Invalid language code provided, defaulting to en-US");
      language = "en-US";
    }

    if (Platform.OS === "web") {
      // For web, use a simpler approach to avoid browser compatibility issues
      console.log("Web speech synthesis requested - using mock implementation for demo");

      // Mock implementation for demo purposes
      setTimeout(() => {
        console.log("Mock speech completed");
        resolve();
      }, 2000);

      return;

      /* Original implementation commented out for demo
      // Web Speech API
      if (!("speechSynthesis" in window)) {
        console.error("Text-to-speech not supported in this browser");
        reject(new Error("Text-to-speech not supported"));
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 1.0; // Normal speed as per requirements
      utterance.volume = 1.0; // Maximum volume

      // Try to find a voice that matches the language
      const voices = window.speechSynthesis.getVoices();

      // First try to find a voice that exactly matches the language
      let matchingVoice = voices.find(voice =>
        voice.lang === language &&
        !voice.name.includes("Google") // Prefer non-Google voices as they often sound more natural
      );

      // If no exact match, try to find a voice that starts with the language code
      if (!matchingVoice) {
        matchingVoice = voices.find(voice =>
          voice.lang.startsWith(language.split('-')[0]) &&
          !voice.name.includes("Google")
        );
      }

      // If still no match, try any voice for that language
      if (!matchingVoice) {
        matchingVoice = voices.find(voice =>
          voice.lang.startsWith(language.split('-')[0])
        );
      }

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
      */
    } else {
      // For demo purposes, use a simplified approach for mobile platforms
      // Ensure language is defined before trying to split it
      const languageCode = language && typeof language === 'string' ? language : 'en-US';
      console.log(`Speaking in language: ${languageCode.split('-')[0]} (code: ${languageCode})`);
      console.log(`About to speak text: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);

      try {
        // Simplify the text for better speech performance
        const simplifiedText = text.substring(0, Math.min(text.length, 300));

        console.log("Attempting to speak with Expo Speech API");
        console.log(`Text length: ${text.length}, using first ${simplifiedText.length} characters`);

        // Use a simpler configuration for better compatibility with Expo Go
        const options = {
          language: language,
          pitch: 1.0,
          rate: 0.8, // Slightly slower for better reliability
          volume: 1.0, // Maximum volume
        };

        console.log(`Using speech options: ${JSON.stringify(options)}`);

        // Use a try-catch block inside the promise to handle any errors
        Speech.speak(simplifiedText, {
          ...options,
          onDone: () => {
            console.log("Speech completed successfully");
            resolve();
          },
          onStopped: () => {
            console.log("Speech stopped");
            resolve();
          },
          onError: (error) => {
            console.log("Speech error in callback, trying fallback:", error);

            // Try with English as fallback
            try {
              console.log("Retrying speech with default language (en-US)");

              // Use a simpler text for the fallback attempt
              const fallbackText = simplifiedText.substring(0, Math.min(simplifiedText.length, 100));

              Speech.speak(fallbackText, {
                language: "en-US",
                pitch: 1.0,
                rate: 0.7, // Even slower for better reliability
                volume: 1.0,
                onDone: () => {
                  console.log("Fallback speech completed successfully");
                  resolve();
                },
                onStopped: () => {
                  console.log("Fallback speech stopped");
                  resolve();
                },
                onError: (fallbackError) => {
                  console.error("Fallback speech also failed:", fallbackError);
                  resolve(); // Resolve anyway to prevent hanging
                }
              });
            } catch (fallbackError) {
              console.error("Error in fallback speech:", fallbackError);
              resolve(); // Resolve anyway to prevent hanging
            }
          }
        });
      } catch (speechError) {
        console.error("Error initiating speech:", speechError);
        // Don't reject, just resolve to keep the app working
        resolve();
      }
    }
  });
}

export function getLanguageCodeForSpeech(languageCode: string | undefined): string {
  // Handle undefined or empty language code
  if (!languageCode) {
    console.warn("Undefined or empty language code provided to getLanguageCodeForSpeech, defaulting to en-US");
    return "en-US";
  }

  // Map language codes to BCP 47 language tags for speech synthesis
  const languageMap: Record<string, string> = {
    "en": "en-US",
    "hi": "hi-IN",
    "te": "te-IN",
    "kn": "kn-IN",
    "ta": "ta-IN",
    "mr": "mr-IN"
  };

  // Return the mapped language code or default to en-US if not found
  return languageMap[languageCode] || "en-US";
}

export function isSpeechSupported(): boolean {
  if (Platform.OS === "web") {
    return "speechSynthesis" in window;
  }

  // For mobile, we're using expo-speech which is supported on both iOS and Android
  return true;
}

// Check if speech is available and log the result
export async function checkSpeechAvailability(): Promise<boolean> {
  try {
    console.log("Checking speech availability...");

    // First check if currently speaking
    try {
      const isCurrentlySpeaking = await Speech.isSpeakingAsync();
      console.log("Speech availability checked, currently speaking:", isCurrentlySpeaking);
    } catch (speakingError) {
      console.log("Error checking if currently speaking:", speakingError);
    }

    // For Expo Go, we'll assume speech is available even if the check fails
    // This is because some devices may not properly report speech availability
    console.log("Speech is assumed to be available for Expo Go");
    return true;
  } catch (error) {
    console.error("Error checking speech availability:", error);
    // Still return true to allow speech attempts
    return true;
  }
}

// Load voices when the page loads (for web)
if (Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window) {
  // Some browsers need this to initialize voices
  window.speechSynthesis.getVoices();

  // Chrome needs this event to get all voices
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}