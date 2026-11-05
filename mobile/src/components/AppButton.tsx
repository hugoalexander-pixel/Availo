import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
  AccessibilityRole,
} from 'react-native';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityHint?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityHint,
}) => {
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isDestructive = variant === 'destructive';
  const isDisabled = disabled || loading;

  const getSpinnerColor = () => {
    if (isOutline) return '#28583f';
    return '#ffffff';
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.secondaryButton,
        isOutline && styles.outlineButton,
        isDestructive && styles.destructiveButton,
        isDisabled && styles.disabledButton,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {loading ? (
        <ActivityIndicator color={getSpinnerColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              isOutline && styles.outlineText,
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#28583f',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#476850',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#28583f',
  },
  destructiveButton: {
    backgroundColor: '#c0392b',
  },
  disabledButton: {
    backgroundColor: '#d8ded5',
    borderColor: '#d8ded5',
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  outlineText: {
    color: '#28583f',
  },
  disabledText: {
    color: '#758074',
  },
});
