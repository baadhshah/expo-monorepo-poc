import Constants from 'expo-constants';
import { createApp } from '@shared/core';

const webViewUrl =
  (Constants.expoConfig?.extra as any)?.webViewUrl || 'https://20lifestyle.mvt.so/';

export default createApp({ webViewUrl });
