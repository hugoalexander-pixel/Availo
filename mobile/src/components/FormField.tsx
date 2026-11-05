import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  required?: boolean;
  locked?: boolean;
}

export const FormField = React.forwardRef<TextInputInstance, FormFieldProps>(
  (
    {
      label,
      error,
      hint,
      containerStyle,
      inputStyle,
      required,
      locked,
      accessibilityLabel,
      ...props
    },
    ref
  ) => {
    const isLocked = Boolean(locked || props.editable === false);
    const inputA11yLabel =
      accessibilityLabel || `${label}${required ? ', wajib diisi' : ''}${isLocked ? ', terkunci' : ''}`;

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.requiredMark}> *</Text>}
          </Text>
          {isLocked && (
            <View style={styles.lockedBadge} accessible={false}>
              <Text style={styles.lockedText}>🔒 Terkunci</Text>
            </View>
          )}
        </View>

        <TextInput
          ref={ref}
          style={[
            styles.input,
            error ? styles.inputError : null,
            isLocked ? styles.inputLocked : null,
            inputStyle,
          ]}
          placeholderTextColor="#6c776a"
          accessibilityLabel={inputA11yLabel}
          accessibilityHint={error || hint}
          aria-invalid={Boolean(error)}
          {...props}
        />

        {error ? (
          <View style={styles.errorContainer} accessibilityRole="alert">
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : hint ? (
          <Text style={styles.hintText}>{hint}</Text>
        ) : null}
      </View>
    );
  }
);

FormField.displayName = 'FormField';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2e22',
    letterSpacing: 0.3,
  },
  requiredMark: {
    color: '#c0392b',
    fontWeight: '700',
  },
  lockedBadge: {
    marginLeft: 8,
    backgroundColor: '#e6ede4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  lockedText: {
    fontSize: 11,
    color: '#3d5241',
    fontWeight: '700',
  },
  input: {
    minHeight: 44,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#d2dad0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    fontSize: 15,
    color: '#192820',
  },
  inputLocked: {
    backgroundColor: '#f1f5ee',
    borderColor: '#d8e1d5',
    color: '#526354',
  },
  inputError: {
    borderColor: '#c0392b',
    backgroundColor: '#fffcfb',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorIcon: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#b02a1c',
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    color: '#556353',
    marginTop: 4,
  },
});
