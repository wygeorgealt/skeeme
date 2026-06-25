import Constants, { ExecutionEnvironment } from 'expo-constants';
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

/**
 * @rive-app/react-native uses Nitro native modules — not available in Expo Go.
 * In a development build (expo-dev-client), the Rive module is loaded via require() 
 * so it isn't executed in Expo Go and doesn't crash the app.
 */
export default function RiveInteractiveUi(): React.ReactElement {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  if (isExpoGo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
        <View style={styles.screen}>
          <Text style={styles.title}>Rive Animation Unavailable in Expo Go</Text>
          <Text style={styles.body}>
            This screen uses Rive with Nitro native modules. Please build the app natively to view this component.
          </Text>
          <Text style={styles.mono}>
            {`npm run ios\n# or\nnpm run android`}
          </Text>
          <Text style={styles.hint}>
            (If this is your first time: run `npx expo prebuild` to generate the ios/android folders.)
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: RiveInteractiveUiImpl } = require('./RiveInteractiveUiImpl') as {
    default: React.ComponentType;
  };
  return <RiveInteractiveUiImpl />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700',
  },
  body: {
    color: '#94a3b8',
    fontSize: 16,
    lineHeight: 24,
  },
  mono: {
    color: '#e2e8f0',
    fontFamily: 'Menlo',
    fontSize: 14,
    lineHeight: 22,
  },
  hint: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
