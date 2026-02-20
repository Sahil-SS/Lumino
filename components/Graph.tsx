import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import Svg, {
  Path, Defs, LinearGradient, Stop, Circle, Line,
  Text as SvgText,
} from 'react-native-svg';
import { getDaysInMonth } from '../utils/storage';

interface Props {
  data: number[];
  totalHabits: number;
  month: string;
}

const { width } = Dimensions.get('window');
// Fixed compact dimensions — fits all days, no scroll needed
const Y_AXIS_W = 24;
const GRAPH_CONTENT_W = width - 48 - Y_AXIS_W - 8; // fills screen width
const GRAPH_H = 140;
const PAD_TOP = 14;
const PAD_BOTTOM = 28;

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX} ${prev.y} ${cpX} ${curr.y} ${curr.x} ${curr.y}`;
  }
  return d;
}

export default function Graph({ data, totalHabits, month }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, [month]);

  const days = getDaysInMonth(month);
  const maxVal = Math.max(totalHabits, 1);
  const drawH = GRAPH_H - PAD_TOP - PAD_BOTTOM;

  // Distribute all days evenly across full width
  const stepX = GRAPH_CONTENT_W / Math.max(days - 1, 1);

  const points = data.map((val, i) => ({
    x: i * stepX,
    y: PAD_TOP + drawH - (val / maxVal) * drawH,
  }));

  const linePath = smoothPath(points);
  const fillPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${PAD_TOP + drawH} L ${points[0].x} ${PAD_TOP + drawH} Z`
    : '';

  const todayIdx = new Date().getDate() - 1;
  const nonZero = data.filter(d => d > 0).length;
  const avg = nonZero > 0 ? (data.reduce((a, b) => a + b, 0) / nonZero).toFixed(1) : '0';

  // Y ticks: 0..totalHabits
  const yTicks = Array.from({ length: maxVal + 1 }, (_, i) => i);

  // X labels: day 1, every 5th, last day
  const xLabelIdxs = new Set<number>();
  xLabelIdxs.add(0);
  for (let i = 4; i < days; i += 5) xLabelIdxs.add(i);
  xLabelIdxs.add(days - 1);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statN}>{nonZero}</Text>
          <Text style={styles.statL}>active</Text>
        </View>
        <View style={styles.div} />
        <View style={styles.stat}>
          <Text style={styles.statN}>{avg}</Text>
          <Text style={styles.statL}>avg/day</Text>
        </View>
        <View style={styles.div} />
        <View style={styles.stat}>
          <Text style={styles.statN}>{totalHabits}</Text>
          <Text style={styles.statL}>habits</Text>
        </View>
      </View>

      {/* Chart: Y-axis left + SVG right (no horizontal scroll — all days fit) */}
      <View style={styles.chartRow}>

        {/* Y-axis labels */}
        <View style={[styles.yAxisCol, { height: GRAPH_H }]}>
          {yTicks.map(tick => {
            const y = PAD_TOP + drawH - (tick / maxVal) * drawH;
            return (
              <Text
                key={tick}
                style={[styles.yTick, { position: 'absolute', top: y - 7 }]}
              >
                {tick}
              </Text>
            );
          })}
        </View>

        {/* SVG — all 28-31 days spread across full width, no scroll */}
        <Svg width={GRAPH_CONTENT_W} height={GRAPH_H}>
          <Defs>
            <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#4DFFDB" stopOpacity="0.28" />
              <Stop offset="1" stopColor="#4DFFDB" stopOpacity="0.0" />
            </LinearGradient>
            <LinearGradient id="line" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#C44DFF" />
              <Stop offset="1" stopColor="#4DFFDB" />
            </LinearGradient>
          </Defs>

          {/* Horizontal grid per y tick */}
          {yTicks.map(tick => {
            const y = PAD_TOP + drawH - (tick / maxVal) * drawH;
            return (
              <Line
                key={tick}
                x1={0} y1={y} x2={GRAPH_CONTENT_W} y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
                strokeDasharray={tick > 0 ? '3 4' : undefined}
              />
            );
          })}

          {/* Fill */}
          {fillPath ? <Path d={fillPath} fill="url(#fill)" /> : null}

          {/* Line */}
          {linePath ? (
            <Path
              d={linePath}
              fill="none"
              stroke="url(#line)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {/* Dots */}
          {points.map((pt, i) =>
            data[i] > 0 ? (
              <Circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={i === todayIdx ? 5 : 2.5}
                fill={i === todayIdx ? '#FFD93D' : '#4DFFDB'}
                stroke="#0E0E1A"
                strokeWidth={1.5}
              />
            ) : null
          )}

          {/* X-axis date labels */}
          {[...xLabelIdxs].map(i => (
            <SvgText
              key={i}
              x={i * stepX}
              y={GRAPH_H - 6}
              fontSize={9}
              fill="rgba(255,255,255,0.3)"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {i + 1}
            </SvgText>
          ))}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#FFD93D' }]} />
          <Text style={styles.legendTxt}>today</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#4DFFDB' }]} />
          <Text style={styles.legendTxt}>completed</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(77,255,219,0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 14,
  },
  stat: { alignItems: 'center' },
  statN: {
    color: '#4DFFDB',
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: '700',
  },
  statL: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  div: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.07)' },
  chartRow: { flexDirection: 'row', alignItems: 'flex-start' },
  yAxisCol: { width: Y_AXIS_W, position: 'relative' },
  yTick: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontFamily: 'monospace',
    textAlign: 'right',
    width: Y_AXIS_W - 4,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  legendTxt: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});