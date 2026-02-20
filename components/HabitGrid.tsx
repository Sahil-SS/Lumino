import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { MonthData, getDaysInMonth, formatDateKey } from '../utils/storage';

interface Props {
  month: string;
  monthData: MonthData;
  onToggle: (day: number, habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

const { width } = Dimensions.get('window');
const CELL = 30;
const DAY_W = 34;

export default function HabitGrid({ month, monthData, onToggle, onDeleteHabit }: Props) {
  const { habits, completions } = monthData;
  const days = getDaysInMonth(month);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  if (habits.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✦</Text>
        <Text style={styles.emptyText}>Add your first habit below</Text>
        <Text style={styles.emptySubText}>Small steps, consistent motion.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Habit name headers — vertical, fixed left column */}
      <View style={styles.layout}>

        {/* LEFT: day numbers column */}
        <View style={styles.dayCol}>
          <View style={{ height: 60 }} />{/* spacer for header */}
          <ScrollView scrollEnabled={false} nestedScrollEnabled>
            {Array.from({ length: days }, (_, i) => {
              const day = i + 1;
              const dateKey = formatDateKey(month, day);
              const isToday = dateKey === todayKey;
              return (
                <View key={day} style={styles.dayCell}>
                  <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>{day}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* RIGHT: scrollable habit columns */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.habitScroll}>
          <View>
            {/* Habit headers */}
            <View style={styles.headerRow}>
              {habits.map(habit => (
                <TouchableOpacity
                  key={habit.id}
                  style={[styles.habitHeader, { width: CELL + 8 }]}
                  onLongPress={() => onDeleteHabit(habit.id)}
                >
                  <View style={[styles.habitDot, { backgroundColor: habit.color, shadowColor: habit.color }]} />
                  <Text style={styles.habitName} numberOfLines={3}>{habit.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Grid rows — all days visible, no maxHeight cap */}
            {Array.from({ length: days }, (_, i) => {
              const day = i + 1;
              const dateKey = formatDateKey(month, day);
              const completed = completions[dateKey] || [];
              const isToday = dateKey === todayKey;
              const ratio = habits.length > 0 ? completed.length / habits.length : 0;

              return (
                <View key={day} style={[styles.row, isToday && styles.todayRow]}>
                  {habits.map(habit => {
                    const done = completed.includes(habit.id);
                    return (
                      <TouchableOpacity
                        key={habit.id}
                        style={[styles.cellWrap, { width: CELL + 8 }]}
                        onPress={() => onToggle(day, habit.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.cell,
                          done
                            ? { backgroundColor: habit.color, borderColor: habit.color, shadowColor: habit.color, shadowOpacity: 0.6, shadowRadius: 5, elevation: 3 }
                            : styles.cellEmpty,
                        ]}>
                          {done && <Text style={styles.check}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {/* Row progress pip */}
                  <View style={styles.rowPip}>
                    <View style={[styles.rowPipFill, { height: `${ratio * 100}%` as any }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  layout: { flexDirection: 'row' },
  dayCol: { width: DAY_W },
  dayCell: {
    height: CELL + 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLabel: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  todayLabel: {
    color: '#4DFFDB',
    fontWeight: '700',
    fontSize: 13,
  },
  habitScroll: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'flex-end',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: 0,
  },
  habitHeader: {
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  habitDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 2,
  },
  habitName: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CELL + 6,
    borderRadius: 6,
  },
  todayRow: {
    backgroundColor: 'rgba(77,255,219,0.05)',
  },
  cellWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cellEmpty: {
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  check: {
    color: '#0E0E1A',
    fontSize: 13,
    fontWeight: '800',
  },
  rowPip: {
    width: 4,
    height: CELL,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  rowPipFill: {
    width: '100%',
    backgroundColor: '#4DFFDB',
    borderRadius: 2,
    opacity: 0.6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyIcon: { fontSize: 32, color: 'rgba(77,255,219,0.35)', marginBottom: 6 },
  emptyText: { color: 'rgba(255,255,255,0.45)', fontSize: 16, fontFamily: 'serif', fontStyle: 'italic' },
  emptySubText: { color: 'rgba(255,255,255,0.2)', fontSize: 13, fontStyle: 'italic' },
});