
export default {
  name: "Dantech Daraja",
  slug: "dantech business",
  version: "1.0.0",
  android: {
    permissions: ["RECORD_AUDIO"] // HII NI MUHIMU KWA VOICE
  },
  ios: {
    infoPlist: {
      NSSpeechRecognitionUsageDescription: "App inahitaji kurekodi sauti yako",
      NSMicrophoneUsageDescription: "App inahitaji kutumia microphone"
    }
  },
  plugins: [
    "@react-native-voice/voice" // Acha hivi tu, bila vitu ndani
  ]
};
