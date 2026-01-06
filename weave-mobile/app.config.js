require('dotenv').config();

module.exports = {
  expo: {
    name: 'Weaive',
    slug: 'weave-mobile',
    version: '0.0.1',
    scheme: 'weavelight',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.weavelight.app',
      associatedDomains: ['applinks:weavelight.app'],
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ['weavelight']
          }
        ],
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: 'com.weavelight.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'weavelight'
            }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        }
      ],
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    plugins: ['expo-router', 'expo-web-browser', 'expo-font'],
    updates: {
      url: 'https://u.expo.dev/9acc0e9e-3bb5-4d2d-b719-e885e869de09'
    },
    runtimeVersion: {
      policy: 'appVersion'
    },
    extra: {
      router: {},
      eas: {
        projectId: '9acc0e9e-3bb5-4d2d-b719-e885e869de09'
      },
      // API Configuration - defaults to production Railway backend
      apiBaseUrl: process.env.API_BASE_URL || 'https://weavelight-production-e380.up.railway.app',
    }
  }
};
