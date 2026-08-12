import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.moodley.auth',
  appName: 'Moodley Auth',
  webDir: 'www',
  plugins: {
    App: {
      // No additional config needed
    },
  },
};

export default config;
