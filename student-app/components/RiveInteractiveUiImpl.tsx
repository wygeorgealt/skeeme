import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Alignment,
  DataBindMode,
  Fit,
  RiveView,
  useRive,
  useRiveFile,
  useViewModelInstance,
} from '@rive-app/react-native';
import * as Haptics from 'expo-haptics';

// Adjust path based on where you moved the asset
const RIVE_SOURCE = require('../assets/rive/largoapp3.riv');

const ARTBOARD_NAME = 'withLayout';
const STATE_MACHINE_NAME = 'State Machine 1';
const VIEW_MODEL_NAME = 'base';

export default function RiveInteractiveUiImpl(): React.ReactElement {
  const { riveFile, isLoading, error } = useRiveFile(RIVE_SOURCE);
  const { setHybridRef, riveViewRef } = useRive();
  const [reloadKey, setReloadKey] = useState(0);

  const { instance: viewModelInstance, error: vmError } = useViewModelInstance(
    riveFile,
    { viewModelName: VIEW_MODEL_NAME },
  );

  const { instance: boundInstance } = useViewModelInstance(riveViewRef);
  const vmInstance = boundInstance ?? viewModelInstance;

  const reloadRiveFromScratch = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  // Sync haptics with the Rive animation
  useEffect(() => {
    if (!vmInstance) return;

    const unsubs: Array<() => void> = [];

    const btmTrigger = vmInstance.triggerProperty('btmX');
    if (btmTrigger) {
      unsubs.push(
        btmTrigger.addListener(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          reloadRiveFromScratch();
        }),
      );
    }

    const hapticProp = vmInstance.numberProperty('haptic');
    if (hapticProp) {
      let lastHaptic: number | null = null;
      hapticProp.getValueAsync().then(val => { lastHaptic = val; }).catch(() => {});
      
      unsubs.push(
        hapticProp.addListener((value) => {
          if (value === 1 && lastHaptic !== 1) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          lastHaptic = value;
        }),
      );
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [vmInstance, reloadKey, reloadRiveFromScratch]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading Rive Interactive UI...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Error: {error.message}</Text>
      </View>
    );
  }

  if (!riveFile) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>No Rive file found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RiveView
        key={`rive-${reloadKey}`}
        hybridRef={setHybridRef}
        file={riveFile}
        artboardName={ARTBOARD_NAME}
        {...(STATE_MACHINE_NAME ? { stateMachineName: STATE_MACHINE_NAME } : {})}
        dataBind={viewModelInstance ?? DataBindMode.None}
        autoPlay
        fit={Fit.Layout}
        alignment={Alignment.Center}
        style={styles.rive}
        onError={(e) => {
          console.warn('Rive Error:', e);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  rive: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
