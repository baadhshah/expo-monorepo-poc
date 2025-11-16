import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export type AppConfig = { webViewUrl: string };

const styles = StyleSheet.create({
  webview: { flex: 1 }
});

function MainApp({ config }: { config: AppConfig }) {
  return (
    <View style={{ flex: 1 }}>
      <WebView style={styles.webview} source={{ uri: config.webViewUrl }} />
    </View>
  );
}

export function createApp(config: AppConfig) {
  return function App() {
    return <MainApp config={config} />;
  };
}


