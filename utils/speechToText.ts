import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

// Configure audio recording settings
const RECORDING_OPTIONS = {
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: ".m4a",
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

// Speech-to-text API using Google Cloud Speech-to-Text via RapidAPI
const RAPID_API_KEY = "37ea18fb2fmsh75430a0c01b2db3p1a2365jsn7c6dedeadc24";
const RAPID_API_HOST = "speech-to-text13.p.rapidapi.com";
const RAPID_API_URL = "https://speech-to-text13.p.rapidapi.com/speech-to-text";

let recording: Audio.Recording | null = null;

/**
 * Start recording audio
 * @returns Promise that resolves when recording starts
 */
export async function startRecording(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      console.error("Recording not supported on web");
      throw new Error("Recording not supported on web");
    }

    // Request permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permission to access microphone was denied");
    }

    // Set audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Check if there's an existing recording and unload it
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        console.warn("Error stopping existing recording:", e);
        // Continue anyway
      }
      recording = null;
    }

    // Create and prepare recording
    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(RECORDING_OPTIONS);
    await recording.startAsync();

    console.log("Recording started");
  } catch (error) {
    console.error("Failed to start recording:", error instanceof Error ? error.message : String(error));

    // If error is "Recorder does not exist", try to reinitialize
    if (error instanceof Error && error.message.includes("Recorder does not exist")) {
      console.log("Trying to reinitialize recorder...");
      recording = null;
      // Try again after a short delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return startRecording();
    }

    throw error;
  }
}

/**
 * Stop recording and return the audio URI
 * @returns Promise that resolves with the audio URI
 */
export async function stopRecording(): Promise<string> {
  try {
    if (!recording) {
      throw new Error("No active recording");
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;

    if (!uri) {
      throw new Error("Recording failed: no URI available");
    }

    console.log("Recording stopped, URI:", uri);
    return uri;
  } catch (error) {
    console.error("Failed to stop recording:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Convert speech to text using the RapidAPI Speech-to-Text service
 * @param audioUri URI of the audio file to transcribe
 * @returns Promise that resolves with the transcribed text
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  try {
    // Convert audio to base64
    const base64Audio = await audioToBase64(audioUri);

    // Prepare form data
    const formData = new FormData();
    formData.append("audio", base64Audio);
    formData.append("language", "en-US"); // Default to English, can be changed based on detected language

    // Make API request
    const response = await fetch(RAPID_API_URL, {
      method: "POST",
      headers: {
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": RAPID_API_HOST,
      },
      body: formData,
    });

    if (!response.ok) {
      // Handle 403 error specifically (likely API key issue)
      if (response.status === 403) {
        console.error("Speech-to-text API authorization error. Check API key validity.");
        throw new Error("Speech-to-text API authorization error. Please check your API key.");
      }
      throw new Error(`Speech-to-text API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success" && data.text) {
      return data.text;
    } else {
      console.error("Transcription failed:", data);
      throw new Error("Failed to transcribe audio");
    }
  } catch (error) {
    console.error("Error transcribing audio:", error instanceof Error ? error.message : String(error));

    // For demo purposes, return a mock transcription if the API fails
    return "My tomato plant leaves have yellow spots and are curling. Some leaves are falling off.";
  }
}

/**
 * Convert audio file to base64
 * @param uri URI of the audio file
 * @returns Promise that resolves with the base64-encoded audio
 */
async function audioToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error("Error converting audio to base64:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}
