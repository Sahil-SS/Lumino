import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, FlatList, Animated, Dimensions, Pressable,
} from 'react-native';
import { getCurrentMonth, MONTH_NAMES } from '../utils/storage';

interface Props {
  month: string;
  onMonthChange: (month: string) => void;
}

const { width, height } = Dimensions.get('window');
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 5 + i);

export default function MonthPicker({ month, onMonthChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => parseInt(month.split('-')[0]));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;

  const currentMonthIndex = parseInt(month.split('-')[1]) - 1;
  const currentYear = parseInt(month.split('-')[0]);
  const isCurrentMonth = month === getCurrentMonth();

  const openPicker = () => {
    setSelectedYear(currentYear);
    setVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
    ]).start();
  };

  const closePicker = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 60, duration: 200, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  };

  const selectMonth = (monthIndex: number) => {
    const m = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    onMonthChange(m);
    closePicker();
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.monthButton} onPress={openPicker} activeOpacity={0.8}>
          <View style={styles.monthLeft}>
            {isCurrentMonth && <View style={styles.liveDot} />}
            <Text style={styles.monthText}>
              {MONTH_NAMES[currentMonthIndex]}
            </Text>
            <Text style={styles.yearText}>{currentYear}</Text>
          </View>
          <View style={styles.chevronContainer}>
            <Text style={styles.chevron}>⌄</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={visible} animationType="none" onRequestClose={closePicker}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Pressable style={styles.overlayPress} onPress={closePicker} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Sheet handle */}
          <View style={styles.handle} />

          <Text style={styles.sheetTitle}>Select Month</Text>

          {/* Year selector */}
          <FlatList
            data={YEARS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.toString()}
            contentContainerStyle={styles.yearList}
            renderItem={({ item: year }) => (
              <TouchableOpacity
                style={[styles.yearChip, selectedYear === year && styles.yearChipActive]}
                onPress={() => setSelectedYear(year)}
              >
                <Text style={[styles.yearChipText, selectedYear === year && styles.yearChipTextActive]}>
                  {year}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Month grid */}
          <View style={styles.monthGrid}>
            {MONTH_NAMES.map((name, index) => {
              const thisMonth = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
              const isSelected = thisMonth === month;
              const isCurrent = thisMonth === getCurrentMonth();

              return (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.monthCell,
                    isSelected && styles.monthCellSelected,
                    isCurrent && !isSelected && styles.monthCellCurrent,
                  ]}
                  onPress={() => selectMonth(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.monthCellText,
                    isSelected && styles.monthCellTextSelected,
                    isCurrent && !isSelected && styles.monthCellTextCurrent,
                  ]}>
                    {name.slice(0, 3)}
                  </Text>
                  {isCurrent && <View style={styles.currentDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={closePicker}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  monthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4DFFDB',
    shadowColor: '#4DFFDB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  monthText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'serif',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  yearText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 16,
    fontFamily: 'serif',
    marginTop: 2,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(77,255,219,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    color: '#4DFFDB',
    fontSize: 18,
    lineHeight: 22,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  overlayPress: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#141428',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(77,255,219,0.15)',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  yearList: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 8,
  },
  yearChipActive: {
    backgroundColor: 'rgba(77,255,219,0.15)',
    borderColor: '#4DFFDB',
  },
  yearChipText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
    fontFamily: 'monospace',
  },
  yearChipTextActive: {
    color: '#4DFFDB',
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    justifyContent: 'center',
  },
  monthCell: {
    width: (width - 72) / 4,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    position: 'relative',
  },
  monthCellSelected: {
    backgroundColor: 'rgba(77,255,219,0.18)',
    borderColor: '#4DFFDB',
  },
  monthCellCurrent: {
    borderColor: 'rgba(196,77,255,0.5)',
    backgroundColor: 'rgba(196,77,255,0.08)',
  },
  monthCellText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontFamily: 'serif',
  },
  monthCellTextSelected: {
    color: '#4DFFDB',
    fontWeight: '700',
  },
  monthCellTextCurrent: {
    color: '#C44DFF',
  },
  currentDot: {
    position: 'absolute',
    bottom: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C44DFF',
  },
  closeBtn: {
    margin: 20,
    marginBottom: 4,
    backgroundColor: 'rgba(77,255,219,0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(77,255,219,0.3)',
  },
  closeBtnText: {
    color: '#4DFFDB',
    fontSize: 16,
    letterSpacing: 1,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
});