AgriAid 🌱

Multilingual Smart Plant Disease Detection Application

AgriAid is an AI-powered cross-platform application built with React Native (Expo). It enables farmers and agricultural communities to identify plant diseases and receive multilingual support through integrated AI models. The app leverages speech-to-text, translation, and Gemini API for real-time, interactive disease detection assistance.

🚀 Features

Plant Disease Detection with AI models.

Multilingual Support for accessibility.

Voice Input via speech-to-text API.

Cross-Platform – runs on Android, iOS, and Web (via Expo).

Lightweight & Scalable frontend built on Expo + React Native.

🛠️ Prerequisites

Node.js (LTS version recommended)

Expo Go app installed on your mobile (Android/iOS)

Gemini API Key (for AI responses)

RapidAPI Key (for speech-to-text and translation services)

⚙️ Setup Instructions 

1. Clone the Repository

git clone https://github.com/tulsikumar18/AgriAid.git

cd AgriAid

2. (Optional) Activate Virtual Environment

If using a Python environment for backend scripts, activate it:

Mac/Linux

source myenv/bin/activate


Windows (PowerShell)

myenv\Scripts\Activate.ps1

3. Install Dependencies (Already done her in  Myenv)

npm install

4. Configure API Keys

Update the following files with your keys:

utils/geminiApi.ts → Add your Gemini 1.5 Flash API key

utils/speechToText.ts → Set RAPID_API_KEY

utils/translate.ts → Set RAPID_API_KEY

5. Run the Application

npm run start


This will start the Expo development server.

6. Preview the App

Scan the QR code from the terminal/browser using the Expo Go app on your mobile device.

The application will open in Expo Go.

📂 Project Structure
AgriAid/
│── utils/
│    ├── geminiApi.ts          # Gemini API integration
│    ├── speechToText.ts       # Speech-to-text API config
│    └── translate.ts          # Translation API config
│── package.json
│── App.tsx (or main entry file)

📸 Demo

(Add screenshots or GIF previews of your application here.)