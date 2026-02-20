import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MonthPicker from '../components/MonthPicker';
import HabitGrid from '../components/HabitGrid';
import Graph from '../components/Graph';
import {
  loadState, saveState, AppState, getMonthData,
  getGraphData, generateId, getRandomColor, MonthData,
} from '../utils/storage';
import { syncToMongo, loadFromMongo } from '../utils/mongo';

export default function Dashboard() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadState().then(async (local) => {
      setState(local);
      setIsLoading(false);
      // Try to merge remote on startup
      try {
        const remote = await loadFromMongo();
        if (remote) {
          const merged: AppState = {
            selectedMonth: local.selectedMonth,
            monthData: { ...remote.monthData, ...local.monthData },
          };
          setState(merged);
          await saveState(merged);
        }
      } catch (_) {}
    });
  }, []);

  const persist = useCallback(async (newState: AppState) => {
    setState(newState);
    await saveState(newState);
    // Fire-and-forget sync
    syncToMongo(newState).catch(() => {});
  }, []);

  const handleMonthChange = (month: string) => {
    if (!state) return;
    persist({ ...state, selectedMonth: month });
  };

  const handleToggle = (day: number, habitId: string) => {
    if (!state) return;
    const month = state.selectedMonth;
    const monthData = getMonthData(state, month);
    const dateKey = `${month}-${String(day).padStart(2, '0')}`;
    const existing = monthData.completions[dateKey] || [];
    const updated = existing.includes(habitId)
      ? existing.filter(id => id !== habitId)
      : [...existing, habitId];
    persist({
      ...state,
      monthData: {
        ...state.monthData,
        [month]: { ...monthData, completions: { ...monthData.completions, [dateKey]: updated } },
      },
    });
  };

  const handleAddHabit = () => {
    const name = newHabitName.trim();
    if (!name || !state) return;
    const month = state.selectedMonth;
    const monthData = getMonthData(state, month);
    const newHabit = { id: generateId(), name, color: getRandomColor(), createdAt: new Date().toISOString() };
    persist({
      ...state,
      monthData: {
        ...state.monthData,
        [month]: { ...monthData, habits: [...monthData.habits, newHabit] },
      },
    });
    setNewHabitName('');
    Keyboard.dismiss();
  };

  const handleDeleteHabit = (habitId: string) => {
    if (!state) return;
    Alert.alert('Remove habit?', 'Removes this habit and all completions for this month.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: () => {
          const month = state.selectedMonth;
          const monthData = getMonthData(state, month);
          persist({
            ...state,
            monthData: {
              ...state.monthData,
              [month]: {
                habits: monthData.habits.filter(h => h.id !== habitId),
                completions: Object.fromEntries(
                  Object.entries(monthData.completions).map(([k, ids]) => [k, ids.filter(id => id !== habitId)])
                ),
              },
            },
          });
        },
      },
    ]);
  };

  if (isLoading || !state) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.loading}>
          <ActivityIndicator color="#4DFFDB" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const month = state.selectedMonth;
  const monthData = getMonthData(state, month);
  const graphData = getGraphData(monthData, month);
  const totalCompleted = graphData.reduce((a, b) => a + b, 0);
  const activeDays = new Date().getDate();
  const maxPossible = monthData.habits.length * activeDays;
  const pct = maxPossible > 0 ? Math.min(100, Math.round((totalCompleted / maxPossible) * 100)) : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.appName}>habits</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pct}%</Text>
          </View>
        </View>

        {/* Month picker */}
        <MonthPicker month={month} onMonthChange={handleMonthChange} />

        {/* Stats strip */}
        <View style={styles.strip}>
          {[
            { n: monthData.habits.length, l: 'habits' },
            { n: totalCompleted, l: 'done' },
            { n: graphData.filter(d => d > 0).length, l: 'active days' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.l}>
              <View style={styles.stripStat}>
                <Text style={styles.stripN}>{s.n}</Text>
                <Text style={styles.stripL}>{s.l}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.stripDiv} />}
            </React.Fragment>
          ))}
        </View>

        {/* Main scroll — grid + graph + add, all in one flow */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {/* GRID */}
          <Text style={styles.sectionLabel}>DAILY GRID</Text>
          <View style={styles.card}>
            <HabitGrid
              month={month}
              monthData={monthData}
              onToggle={handleToggle}
              onDeleteHabit={handleDeleteHabit}
            />
            {monthData.habits.length > 0 && (
              <Text style={styles.hint}>Long press habit to remove</Text>
            )}
          </View>

          {/* ADD HABIT */}
          <Text style={[styles.sectionLabel, { marginTop: 22 }]}>ADD HABIT</Text>
          <View style={styles.addCard}>
            <TextInput
              style={styles.input}
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholder="e.g. meditate, read, exercise…"
              placeholderTextColor="rgba(255,255,255,0.15)"
              onSubmitEditing={handleAddHabit}
              returnKeyType="done"
              maxLength={30}
            />
            <TouchableOpacity
              style={[styles.addBtn, !newHabitName.trim() && styles.addBtnOff]}
              onPress={handleAddHabit}
              disabled={!newHabitName.trim()}
            >
              <Text style={styles.addBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>

          {/* GRAPH — completely separate section, full width, no scroll fighting */}
          {monthData.habits.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 22 }]}>CONSISTENCY CURVE</Text>
              <Graph
                data={graphData}
                totalHabits={monthData.habits.length}
                month={month}
              />
            </>
          )}

          <View style={{ height: 48 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0E0E1A' },
  flex: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 2,
  },
  backBtn: { padding: 8 },
  backText: { color: 'rgba(255,255,255,0.35)', fontSize: 24 },
  appName: {
    color: '#FFFFFF', fontSize: 24,
    fontFamily: 'serif', fontStyle: 'italic', letterSpacing: 2,
  },
  badge: {
    backgroundColor: 'rgba(77,255,219,0.1)',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(77,255,219,0.25)',
  },
  badgeText: { color: '#4DFFDB', fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },
  strip: {
    flexDirection: 'row', marginHorizontal: 20, marginVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  stripStat: { flex: 1, alignItems: 'center' },
  stripN: { color: '#FFFFFF', fontSize: 22, fontFamily: 'serif', fontWeight: '700' },
  stripL: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2, letterSpacing: 0.5 },
  stripDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.2)', fontSize: 10,
    letterSpacing: 2.5, fontFamily: 'monospace', marginBottom: 8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  hint: {
    color: 'rgba(255,255,255,0.15)', fontSize: 10,
    textAlign: 'right', marginTop: 8, fontStyle: 'italic',
  },
  addCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 16, paddingVertical: 4, gap: 10,
  },
  input: {
    flex: 1, color: '#FFFFFF', fontSize: 16,
    fontFamily: 'serif', fontStyle: 'italic', paddingVertical: 14,
  },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#4DFFDB',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4DFFDB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  addBtnOff: { backgroundColor: 'rgba(77,255,219,0.2)', shadowOpacity: 0, elevation: 0 },
  addBtnTxt: { color: '#0E0E1A', fontSize: 22, fontWeight: '700', lineHeight: 26 },
});