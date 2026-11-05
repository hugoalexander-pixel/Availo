import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export interface DropdownOption<T = string | number> {
  value: T;
  label: string;
  description?: string;
  badge?: string;
}

export interface DropdownModalProps<T = string | number> {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: DropdownOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  accessibilityLabel?: string;
}

export function DropdownModal<T extends string | number>({
  visible,
  title,
  subtitle,
  options,
  selectedValue,
  onSelect,
  onClose,
  accessibilityLabel,
}: DropdownModalProps<T>) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Backdrop press to close */}
        <Pressable
          style={styles.backdropTouch}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Tutup menu pilihan"
        />

        {/* Modal Card */}
        <View
          style={styles.containerCard}
          accessibilityViewIsModal={true}
          accessibilityLabel={accessibilityLabel || title}
        >
          {/* Top handle pill for bottom sheet style */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitles}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup pilihan"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          {/* Options list */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {options.map((opt) => {
              const isSelected = opt.value === selectedValue;
              return (
                <Pressable
                  key={String(opt.value)}
                  style={({ pressed }) => [
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                    pressed && !isSelected && styles.optionItemPressed,
                  ]}
                  onPress={() => onSelect(opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${opt.label}${opt.description ? `, ${opt.description}` : ''}${isSelected ? ', terpilih' : ''}`}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.labelRow}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {opt.badge ? (
                        <View
                          style={[
                            styles.badgePill,
                            isSelected && styles.badgePillSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              isSelected && styles.badgeTextSelected,
                            ]}
                          >
                            {opt.badge}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {opt.description ? (
                      <Text
                        style={[
                          styles.optionDescription,
                          isSelected && styles.optionDescriptionSelected,
                        ]}
                      >
                        {opt.description}
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      isSelected && styles.checkCircleSelected,
                    ]}
                  >
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 30, 23, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFill,
  },
  containerCard: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d6dfd3',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2eb',
  },
  headerTitles: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#192820',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#4a5e4d',
    marginTop: 3,
    lineHeight: 18,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#344537',
  },
  scrollList: {
    marginTop: 12,
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5ece2',
    backgroundColor: '#fafcf9',
    minHeight: 56,
  },
  optionItemSelected: {
    borderColor: '#204d35',
    backgroundColor: '#eef6f0',
  },
  optionItemPressed: {
    backgroundColor: '#f1f6ef',
    borderColor: '#d2ded0',
  },
  optionContent: {
    flex: 1,
    paddingRight: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1d2c22',
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: '#143823',
  },
  optionDescription: {
    fontSize: 12,
    color: '#4a5e4d',
    marginTop: 3,
    lineHeight: 16,
  },
  optionDescriptionSelected: {
    color: '#264b33',
  },
  badgePill: {
    backgroundColor: '#e3ece1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePillSelected: {
    backgroundColor: '#204d35',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2d4b35',
  },
  badgeTextSelected: {
    color: '#ffffff',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#c6d4c3',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkCircleSelected: {
    borderColor: '#204d35',
    backgroundColor: '#204d35',
  },
  checkIcon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
});
