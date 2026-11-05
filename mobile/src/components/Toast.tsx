import React, { useEffect, useState, useCallback } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  visible,
  onHide,
  duration = 3000,
}) => {
  const [translateY] = useState(() => new Animated.Value(-80));
  const [opacity] = useState(() => new Animated.Value(0));

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  }, [translateY, opacity, onHide]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-80);
      opacity.setValue(0);
    }
  }, [visible, duration, hideToast, opacity, translateY]);

  if (!visible && message === '') return null;

  const isError = type === 'error';
  const isInfo = type === 'info';

  const iconText = isError ? '✕' : isInfo ? 'ℹ' : '✓';
  const typeLabel = isError ? 'Galat: ' : isInfo ? 'Informasi: ' : 'Sukses: ';

  return (
    <Animated.View
      style={[
        styles.container,
        isError ? styles.errorContainer : isInfo ? styles.infoContainer : styles.successContainer,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel={`${typeLabel}${message}`}
    >
      <Pressable
        onPress={hideToast}
        style={styles.inner}
        accessibilityRole="button"
        accessibilityLabel="Tutup pemberitahuan"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{iconText}</Text>
        </View>
        <Text style={styles.text}>{message}</Text>
        <Text style={styles.dismissText}>✕</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    minHeight: 48,
  },
  successContainer: {
    backgroundColor: '#204d35',
  },
  errorContainer: {
    backgroundColor: '#9e2a1d',
  },
  infoContainer: {
    backgroundColor: '#244569',
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  dismissText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    paddingHorizontal: 4,
  },
});
