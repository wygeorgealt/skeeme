import React, { useEffect } from 'react';
import { Pressable,  View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { haptics } from '@/lib/haptics';
import { router } from 'expo-router';

export interface FlashcardDeckSummaryProps {
  deckTitle: string;
  subject?: string;
  totalCards: number;
  sessionDurationMs: number;
  ratings: {
    easy: number;
    good: number;
    hard: number;
    again: number;
  };
  streakCount: number;
  onPracticeQuiz: () => void;
  onRetake: () => void;
  onFinish: () => void;
}

export function FlashcardDeckSummary({
  deckTitle,
  subject = '',
  totalCards,
  sessionDurationMs,
  ratings,
  streakCount,
  onPracticeQuiz,
  onRetake,
  onFinish,
}: FlashcardDeckSummaryProps) {
  // Glow Pulse Animation
  const glowOpacity = useSharedValue(0.2);

  useEffect(() => {
    glowOpacity.value = withRepeat(withTiming(0.5, { duration: 1500 }), -1, true);
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const minutes = Math.floor(sessionDurationMs / 60000);
  const seconds = Math.floor((sessionDurationMs % 60000) / 1000);
  
  // Calculate Mastery
  const maxScore = totalCards * 3;
  const currentScore = ratings.easy * 3 + ratings.good * 2 + ratings.hard * 1;
  const masteryPercentage = totalCards > 0 ? Math.round((currentScore / maxScore) * 100) : 0;

  // SVG Progress Ring calculations
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * masteryPercentage) / 100;

  const handlePracticeQuiz = () => {
    haptics.selectionAsync(true);
    onPracticeQuiz();
  };

  const getPercentage = (count: number) => {
    return totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
  };

  const easyPercent = getPercentage(ratings.easy);
  const goodPercent = getPercentage(ratings.good);
  const hardPercent = getPercentage(ratings.hard);
  const againPercent = getPercentage(ratings.again);

  return (
    <ScrollView 
      className="flex-1 bg-surface"
      contentContainerClassName="pb-10 pt-4 px-4 space-y-6"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Celebration Section */}
      <View className="flex-col items-center text-center mt-2">
        <View className="relative items-center justify-center mb-4 w-32 h-32">
          <Animated.View 
            className="absolute w-[112px] h-[112px] bg-primary rounded-full blur-2xl"
            style={animatedGlowStyle}
          />
          <View className="relative w-20 h-20 rounded-full bg-primary flex-col items-center justify-center shadow-xl">
            <MaterialIcons name="workspace-premium" size={42} color="#ffffff" />
            <MaterialIcons 
              name="auto-awesome" 
              size={22} 
              color="#61f9ef" 
              style={{ position: 'absolute', top: -4, right: -4 }}
            />
          </View>
        </View>

        <View className="flex-row items-center gap-1 px-4 py-1.5 rounded-full bg-primary-container shadow-sm mb-2">
          <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-on-primary-container">
            {streakCount}-Day Streak 🔥
          </Text>
        </View>

        <Text style={{ fontSize: 26, fontWeight: '700', letterSpacing: -0.5 }} className="text-on-surface text-center">
          Outstanding Session!
        </Text>
        <Text style={{ fontSize: 15, fontWeight: '400' }} className="text-on-surface-variant mt-1 text-center">
          {subject ? `${subject} — ` : ''}{deckTitle} · {totalCards} cards reviewed in <Text style={{ fontWeight: '600' }} className="text-on-surface">{minutes}m {seconds}s</Text>
        </Text>
      </View>

      {/* Mastery Level Card */}
      <View className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-sm">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text style={{ fontSize: 20, fontWeight: '600', letterSpacing: -0.2 }} className="text-on-surface">
              Mastery Level: <Text style={{ fontWeight: '800' }} className="text-accent-electric-blue">{masteryPercentage}%</Text>
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '400' }} className="text-on-surface-variant mt-1">
              Retention predicted at <Text style={{ fontWeight: '600' }} className="text-on-surface">92%</Text> over the next 7 days.
            </Text>
          </View>

          <View className="relative w-20 h-20 items-center justify-center">
            <Svg width="80" height="80" viewBox="0 0 72 72" className="-rotate-90">
              <Circle
                cx="36"
                cy="36"
                r={radius}
                stroke="#eeedf3"
                strokeWidth="6"
                fill="transparent"
              />
              <Circle
                cx="36"
                cy="36"
                r={radius}
                stroke="#007AFF"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>
            <View className="absolute inset-0 flex-col items-center justify-center">
              <Text style={{ fontSize: 16, fontWeight: '600' }} className="text-on-surface">
                {masteryPercentage}%
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-4 pt-4 border-t border-surface-container flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="trending-up" size={18} color="#006762" />
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }} className="text-on-surface">
              +14% vs. last week
            </Text>
          </View>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }} className="text-on-surface-variant">
            Exam Ready: <Text style={{ fontWeight: '700' }} className="text-tertiary">A Grade</Text>
          </Text>
        </View>
      </View>

      {/* Response Breakdown Bento Grid */}
      <View className="flex-col space-y-2">
        <View className="flex-row items-center justify-between px-1 mb-2">
          <Text style={{ fontSize: 16, fontWeight: '600' }} className="text-on-surface">Session Response Breakdown</Text>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }} className="text-on-surface-variant">{totalCards} cards graded</Text>
        </View>
        
        <View className="flex-row gap-2">
          {/* Easy */}
          <View className="flex-1 flex-col items-center justify-center bg-surface-container-lowest p-2 rounded-lg shadow-sm">
            <Text style={{ fontSize: 20, fontWeight: '800' }} className="text-tertiary">{ratings.easy}</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }} className="text-on-surface mt-0.5">Easy</Text>
            <Text style={{ fontSize: 10 }} className="text-on-surface-variant">{easyPercent}%</Text>
            <View className="w-full h-1 bg-tertiary/15 rounded-full mt-2 overflow-hidden">
              <View className="h-full bg-tertiary rounded-full" style={{ width: `${easyPercent}%` }} />
            </View>
          </View>

          {/* Good */}
          <View className="flex-1 flex-col items-center justify-center bg-surface-container-lowest p-2 rounded-lg shadow-sm">
            <Text style={{ fontSize: 20, fontWeight: '800' }} className="text-accent-electric-blue">{ratings.good}</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }} className="text-on-surface mt-0.5">Good</Text>
            <Text style={{ fontSize: 10 }} className="text-on-surface-variant">{goodPercent}%</Text>
            <View className="w-full h-1 bg-accent-electric-blue/15 rounded-full mt-2 overflow-hidden">
              <View className="h-full bg-accent-electric-blue rounded-full" style={{ width: `${goodPercent}%` }} />
            </View>
          </View>

          {/* Hard */}
          <View className="flex-1 flex-col items-center justify-center bg-surface-container-lowest p-2 rounded-lg shadow-sm">
            <Text style={{ fontSize: 20, fontWeight: '800' }} className="text-accent-indigo">{ratings.hard}</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }} className="text-on-surface mt-0.5">Hard</Text>
            <Text style={{ fontSize: 10 }} className="text-on-surface-variant">{hardPercent}%</Text>
            <View className="w-full h-1 bg-accent-indigo/15 rounded-full mt-2 overflow-hidden">
              <View className="h-full bg-accent-indigo rounded-full" style={{ width: `${hardPercent}%` }} />
            </View>
          </View>

          {/* Again */}
          <View className="flex-1 flex-col items-center justify-center bg-surface-container-lowest p-2 rounded-lg shadow-sm">
            <Text style={{ fontSize: 20, fontWeight: '800' }} className="text-error">{ratings.again}</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }} className="text-on-surface mt-0.5">Again</Text>
            <Text style={{ fontSize: 10 }} className="text-on-surface-variant">{againPercent}%</Text>
            <View className="w-full h-1 bg-error/15 rounded-full mt-2 overflow-hidden">
              <View className="h-full bg-error rounded-full" style={{ width: `${againPercent}%` }} />
            </View>
          </View>
        </View>
      </View>

      {/* Upcoming Review Timeline */}
      <View className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm mt-2">
        <View className="flex-row items-center justify-between pb-2 mb-2 border-b border-surface-container">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="event-repeat" size={20} color="#007AFF" />
            <Text style={{ fontSize: 16, fontWeight: '600' }} className="text-on-surface">Upcoming Review</Text>
          </View>
          <View className="px-2 py-0.5 rounded-full bg-primary-container">
            <Text style={{ fontSize: 11, fontWeight: '700' }} className="text-on-primary-container">Smart Sync</Text>
          </View>
        </View>

        <View className="space-y-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-error-container items-center justify-center">
                <MaterialIcons name="replay" size={18} color="#93000A" />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-on-surface">Tomorrow</Text>
                <Text style={{ fontSize: 13, fontWeight: '400' }} className="text-on-surface-variant">{ratings.again} cards scheduled</Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700' }} className="text-error">{ratings.again} Cards</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-primary-container items-center justify-center">
                <MaterialIcons name="calendar-today" size={18} color="#007AFF" />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-on-surface">In 3 Days</Text>
                <Text style={{ fontSize: 13, fontWeight: '400' }} className="text-on-surface-variant">{ratings.good} cards scheduled</Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700' }} className="text-accent-electric-blue">{ratings.good} Cards</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-tertiary-container/30 items-center justify-center">
                <MaterialIcons name="date-range" size={18} color="#006762" />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600' }} className="text-on-surface">Next Week</Text>
                <Text style={{ fontSize: 13, fontWeight: '400' }} className="text-on-surface-variant">{ratings.easy} cards scheduled</Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700' }} className="text-tertiary">{ratings.easy} Cards</Text>
          </View>
        </View>

        <View className="mt-4 bg-surface-container-low rounded-lg p-2.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="notifications-active" size={18} color="#007AFF" />
            <Text style={{ fontSize: 13, fontWeight: '500' }} className="text-on-surface">
              Smart Reminder set for <Text style={{ fontWeight: '700' }}>7:30 PM</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Action CTA */}
      <View className="pt-2">
        <Pressable 
          onPress={handlePracticeQuiz}
          
          className="w-full h-[52px] rounded-xl bg-accent-electric-blue flex-row items-center justify-center gap-2"
          style={{ shadowColor: '#007AFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 12 }}
        >
          <MaterialIcons name="quiz" size={20} color="#ffffff" />
          <Text style={{ fontSize: 16, fontWeight: '600' }} className="text-on-primary">
            Practice Related Quiz (10 Qs)
          </Text>
          <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </ScrollView>
  );
}
