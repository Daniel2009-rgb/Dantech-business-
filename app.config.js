export default {
  name: "Dantech Daraja",
  slug: "dantech-business",
  owner: "dantech2s-team",
  version: "1.0.0",
  scheme: "dantech",
  android: {
    package: "com.dantech.daraja",
    versionCode: 1,
    permissions: ["RECORD_AUDIO"],
  },
  ios: {
    bundleIdentifier: "com.dantech.daraja",
    infoPlist: {
      NSSpeechRecognitionUsageDescription: "App inahitaji microphone",
      NSMicrophoneUsageDescription: "App inahitaji microphone"
    },
plugins: [
    [
      "expo-build-properties",
      {
        android: { enableJetifier: true }
      }
    ],
    "./withManifestFix",
    "@react-native-voice/voice"
  ],
  extra: {
    eas: {
      projectId: "5afae031-0fc4-4964-b11b-81b93ce30d85"
    }
  }
};
