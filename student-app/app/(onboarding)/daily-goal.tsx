import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    useColorScheme,
} from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    type SharedValue,
} from 'react-native-reanimated';
import { OnboardingFooter } from '@/components/onboarding/OnboardingFooter';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingQuestion } from '@/components/onboarding/OnboardingQuestion';
import { OnboardingReveal } from '@/components/onboarding/OnboardingReveal';
import { useOnboardingEntrance } from '@/components/onboarding/useOnboardingEntrance';
import { dailyGoals } from '@/components/onboarding/onboardingContent';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import { useAuthStore } from '@/store/authStore';
import type { DailyGoal } from '@/types';

const ITEM_HEIGHT = 56;
const VISIBLE_ITEM_COUNT = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEM_COUNT;
const WHEEL_PADDING = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

export default function DailyGoalScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const pageBg = isDark ? C.background : '#F8F9FA';
    const { onboardingData, setOnboardingData, setOnboardingStep } = useAuthStore();
    const initialGoal =
        dailyGoals.find(({ id }) => id === onboardingData.daily_goal)?.id ?? '10';
    const [selectedGoal, setSelectedGoal] = useState<DailyGoal>(initialGoal);
    const selectedGoalRef = useRef(selectedGoal);
    const entrance = useOnboardingEntrance('daily-goal');
    const [isTransitioning, setIsTransitioning] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setIsTransitioning(false);
        }, []),
    );

    useEffect(() => {
        void setOnboardingStep(4);
    }, [setOnboardingStep]);

    const handleSelect = useCallback((id: DailyGoal) => {
        if (selectedGoalRef.current === id) return;

        selectedGoalRef.current = id;
        setSelectedGoal(id);
        void haptics.selectionAsync();
    }, []);

    const handleContinue = () => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        void setOnboardingData({ daily_goal: selectedGoal });
        router.push('/(onboarding)/personalized-plan');
    };

    return (
        <View style={[styles.root, { backgroundColor: pageBg }]}>
            <OnboardingProgress step={4} />

            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <OnboardingQuestion
                    prompt="How long can we study for?"
                    mascotSize={88}
                    shouldType={!entrance.isComplete}
                    onTypingComplete={entrance.complete}
                />

                <OnboardingReveal
                    visible={entrance.isComplete}
                    animateOnMount={entrance.shouldAnimate}
                    style={styles.wheelReveal}
                >
                    <View style={styles.wheelSection}>
                        <DailyGoalCarousel
                            selectedGoal={selectedGoal}
                            isDark={isDark}
                            onSelect={handleSelect}
                        />
                    </View>
                </OnboardingReveal>
            </ScrollView>

            <OnboardingReveal
                visible={entrance.isComplete}
                animateOnMount={entrance.shouldAnimate}
            >
                <OnboardingFooter
                    onContinue={handleContinue}
                    disabled={isTransitioning}
                    showArrow
                />
            </OnboardingReveal>
        </View>
    );
}

interface DailyGoalCarouselProps {
    selectedGoal: DailyGoal;
    isDark: boolean;
    onSelect: (id: DailyGoal) => void;
}

function DailyGoalCarousel({
    selectedGoal,
    isDark,
    onSelect,
}: DailyGoalCarouselProps) {
    const reduceMotion = useReducedMotion();
    const selectedIndex = dailyGoals.findIndex(({ id }) => id === selectedGoal);
    const scrollY = useSharedValue(selectedIndex * ITEM_HEIGHT);
    const scrollRef = useRef<ScrollView>(null);
    const didSetInitialOffset = useRef(false);
    const color = isDark ? Colors.dark.text : Colors.light.text;

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.set(event.contentOffset.y);
        },
    });

    const handleScrollEnd = ({
        nativeEvent,
    }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.max(
            0,
            Math.min(
                dailyGoals.length - 1,
                Math.round(nativeEvent.contentOffset.y / ITEM_HEIGHT),
            ),
        );
        onSelect(dailyGoals[index].id);
    };

    const handleLayout = () => {
        if (didSetInitialOffset.current) return;

        didSetInitialOffset.current = true;
        scrollRef.current?.scrollTo({
            x: 0,
            y: selectedIndex * ITEM_HEIGHT,
            animated: false,
        });
    };

    return (
        <Animated.ScrollView
            ref={scrollRef}
            style={styles.carousel}
            contentContainerStyle={styles.carouselContent}
            contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
            onLayout={handleLayout}
            onScroll={onScroll}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
            snapToInterval={ITEM_HEIGHT}
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
        >
            {dailyGoals.map((option, index) => (
                <DailyGoalCarouselItem
                    key={option.id}
                    id={option.id}
                    index={index}
                    selected={selectedGoal === option.id}
                    scrollY={scrollY}
                    textColor={color}
                    reduceMotion={reduceMotion}
                    onPress={() => {
                        onSelect(option.id);
                        scrollRef.current?.scrollTo({
                            x: 0,
                            y: index * ITEM_HEIGHT,
                            animated: !reduceMotion,
                        });
                    }}
                />
            ))}
        </Animated.ScrollView>
    );
}

interface DailyGoalCarouselItemProps {
    id: DailyGoal;
    index: number;
    selected: boolean;
    scrollY: SharedValue<number>;
    textColor: string;
    reduceMotion: boolean;
    onPress: () => void;
}

function DailyGoalCarouselItem({
    id,
    index,
    selected,
    scrollY,
    textColor,
    reduceMotion,
    onPress,
}: DailyGoalCarouselItemProps) {
    const rowStyle = useAnimatedStyle(() => {
        const distance = (index * ITEM_HEIGHT - scrollY.get()) / ITEM_HEIGHT;

        return {
            opacity: interpolate(
                distance,
                [-2, -1, 0, 1, 2],
                [0.12, 0.38, 1, 0.38, 0.12],
                Extrapolation.CLAMP,
            ),
            transform: [
                {
                    scale: reduceMotion
                        ? 1
                        : interpolate(
                              distance,
                              [-2, -1, 0, 1, 2],
                              [0.84, 0.92, 1, 0.92, 0.84],
                              Extrapolation.CLAMP,
                          ),
                },
            ],
        };
    });

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${id} ${id === '1' ? 'minute' : 'minutes'}`}
            accessibilityState={{ selected }}
            onPress={onPress}
            style={styles.carouselItem}
        >
            <Animated.View style={[styles.carouselRow, rowStyle]}>
                <Text style={[styles.carouselNumber, { color: textColor }]}>
                    {id}
                    {selected ? (
                        <Text style={styles.carouselUnit}>
                            {` ${id === '1' ? 'minute' : 'minutes'}`}
                        </Text>
                    ) : null}
                </Text>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    body: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    wheelReveal: {
        flex: 1,
    },
    wheelSection: {
        flex: 1,
        minHeight: WHEEL_HEIGHT + 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carousel: {
        height: WHEEL_HEIGHT,
        width: '100%',
        flexGrow: 0,
        flexShrink: 0,
    },
    carouselContent: {
        alignItems: 'stretch',
        paddingVertical: WHEEL_PADDING,
    },
    carouselItem: {
        height: ITEM_HEIGHT,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    carouselRow: {
        height: ITEM_HEIGHT,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    carouselNumber: {
        minWidth: 68,
        textAlign: 'center',
        fontFamily: 'Allo-Black',
        fontSize: 44,
        lineHeight: 52,
        fontVariant: ['tabular-nums'],
    },
    carouselUnit: {
        fontFamily: 'Allo-Bold',
        fontSize: 19,
        lineHeight: 24,
    },
    note: {
        marginTop: 8,
        fontFamily: 'Allo-Medium',
        fontSize: 12.5,
        textAlign: 'center',
    },
});
