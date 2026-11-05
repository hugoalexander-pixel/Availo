import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../hooks/useResponsive';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardOffset?: number;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  keyboardOffset = Platform.OS === 'ios' ? 0 : 20,
  refreshControl,
}) => {
  const { isMediumLarge, contentMaxWidth } = useResponsive();

  const responsiveInnerStyle: ViewStyle = isMediumLarge
    ? {
        maxWidth: contentMaxWidth,
        width: '100%',
        alignSelf: 'center',
      }
    : {
        width: '100%',
      };

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={keyboardOffset}
      >
        {scrollable ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.scrollContent,
              responsiveInnerStyle,
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, responsiveInnerStyle, style]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
