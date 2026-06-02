/** @type {import('expo/config').ExpoConfig} */
export default {
  expo: {
    name: 'Visitor Management',
    slug: 'visitor-management',
    version: '1.0.0',
    orientation: 'default',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#f8fafc',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.shuklamanya.visitormanagement',
      infoPlist: {
        NSCameraUsageDescription:
          'Camera access is used to scan visitor QR codes at the gate.',
      },
    },
    android: {
      package: 'com.shuklamanya.visitormanagement',
      adaptiveIcon: {
        backgroundColor: '#0f172a',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      permissions: ['android.permission.CAMERA'],
    },
    plugins: [
      [
        'expo-camera',
        {
          cameraPermission:
            'Allow Visitor Management to use the camera for QR scanning.',
        },
      ],
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
    },
  },
};
