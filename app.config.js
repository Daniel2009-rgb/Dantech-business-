export default {
  name: "Dantech Daraja",
  slug: "dantech business",
  owner: "dantech2s-team",
  version: "1.0.0",
  scheme: "dantech", // ya kusaidia deeplinks
  
  android: {
    package: "com.dantech.daraja", // HII NDIO INAYOKOSEA
    versionCode: 1,
    permissions: ["RECORD_AUDIO"] // Kwa Voice
  },

  ios: {
    bundleIdentifier: "com.dantech.daraja", // Kwa iPhone
    infoPlist: {
      NSSpeechRecognitionUsageDescription: "App inahitaji kurekodi sauti yako",
      NSMicrophoneUsageDescription: "App inahitaji kutumia microphone"
    }
  },

  plugins: [
    "@react-native-voice/voice"
  ]
};
