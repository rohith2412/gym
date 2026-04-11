const { CapacitorConfig } = require('@capacitor/cli');

const config = {
  appId: 'com.yourpocketgym.app',
  appName: 'YourPocketGym',
  webDir: 'out',
  server: {
    url: 'https://www.yourpocketgym.com/',
    cleartext: false,
  },
};

module.exports = config;