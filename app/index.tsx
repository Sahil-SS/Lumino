import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, RadialGradient, Stop, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const QUOTES = [
  "Not streaks. Just motion.",
  "The curve remembers everything.",
  "One mark changes nothing.\nEvery mark changes everything.",
  "Progress lives in the shape of your effort.",
];

export default function LandingScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Background orbs */}
        <View style={styles.orbContainer} pointerEvents="none">
          <Svg width={width * 1.2} height={width * 1.2}>
            <Defs>
              <RadialGradient id="orb1" cx="40%" cy="40%" r="50%">
                <Stop offset="0" stopColor="#4DFFDB" stopOpacity="0.10" />
                <Stop offset="1" stopColor="#0E0E1A" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="orb2" cx="70%" cy="70%" r="50%">
                <Stop offset="0" stopColor="#C44DFF" stopOpacity="0.10" />
                <Stop offset="1" stopColor="#0E0E1A" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={width * 0.4} cy={width * 0.4} r={width * 0.5} fill="url(#orb1)" />
            <Circle cx={width * 0.75} cy={width * 0.75} r={width * 0.4} fill="url(#orb2)" />
          </Svg>
        </View>

        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {/* Badge */}
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>HABIT TRACKER</Text>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleSmall}>your</Text>
            <Text style={styles.titleLarge}>consistency</Text>
            <Text style={styles.titleLarge}>
              curve
              <Text style={styles.titleAccent}>.</Text>
            </Text>
          </View>

          {/* Mini graph decoration */}
          <View style={styles.graphDeco}>
            {[2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 6].map((h, i) => (
              <View
                key={i}
                style={[
                  styles.graphBar,
                  {
                    height: h * 5,
                    backgroundColor: i >= 9 ? '#4DFFDB' : 'rgba(77,255,219,0.2)',
                    opacity: 0.4 + i * 0.05,
                  },
                ]}
              />
            ))}
          </View>

          {/* Quote */}
          <Text style={styles.quote}>&quot;{quote}&quot;</Text>

          {/* Features */}
          <View style={styles.features}>
            {['Daily habit grid', 'Consistency graph', 'Monthly history'].map((f) => (
              <View key={f} style={styles.featureItem}>
                <Text style={styles.featureDot}>✦</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <Animated.View style={[styles.ctaWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/dashboard')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>Begin your streak</Text>
              <Text style={styles.ctaArrow}>→</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.bottomNote}>Local · Private · Offline-first</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E0E1A',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E0E1A',
  },
  orbContainer: {
    position: 'absolute',
    top: -height * 0.05,
    left: -width * 0.1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 22,
    width: '100%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(77,255,219,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(77,255,219,0.2)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4DFFDB',
    shadowColor: '#4DFFDB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeText: {
    color: '#4DFFDB',
    fontSize: 11,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleSmall: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 20,
    fontFamily: 'serif',
    fontStyle: 'italic',
    letterSpacing: 3,
  },
  titleLarge: {
    color: '#FFFFFF',
    fontSize: 54,
    fontFamily: 'serif',
    fontStyle: 'italic',
    letterSpacing: -1,
    lineHeight: 60,
  },
  titleAccent: {
    color: '#4DFFDB',
  },
  graphDeco: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 50,
  },
  graphBar: {
    width: 10,
    borderRadius: 3,
  },
  quote: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: 'serif',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  features: {
    gap: 8,
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureDot: {
    color: '#C44DFF',
    fontSize: 12,
  },
  featureText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  ctaWrapper: {
    width: '100%',
  },
  ctaButton: {
    backgroundColor: '#4DFFDB',
    paddingVertical: 18,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#4DFFDB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaText: {
    color: '#0E0E1A',
    fontSize: 17,
    fontFamily: 'serif',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  ctaArrow: {
    color: '#0E0E1A',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomNote: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: 11,
    letterSpacing: 2,
  },
});