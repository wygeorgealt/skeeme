import { useCallback, useState } from 'react';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Plus } from 'lucide-react-native';
import { DASHBOARD_THEME } from '@/components/dashboard/dashboardTokens';
import { CreateBottomSheet } from '@/components/dashboard/CreateBottomSheet';
import {
    KubaiNativeIcon,
    type KubaiNativeIconName,
} from '@/components/ui/KubaiNativeIcon';
import {
    TabBarScrollProvider,
    type PrimaryTabRoute,
} from '@/components/ui/TabBarScrollContext';

const primaryTabs = [
    { name: 'index', title: 'Home', icon: 'home' },
    { name: 'library', title: 'Library', icon: 'library' },
    { name: 'profile', title: 'Profile', icon: 'profile' },
] as const;

export default function MainTabsLayout() {
    const [createVisible, setCreateVisible] = useState(false);
    const [scrolledTabs, setScrolledTabs] = useState<Partial<Record<PrimaryTabRoute, boolean>>>({});

    const handleScrollChange = useCallback(
        (route: PrimaryTabRoute, isScrolled: boolean) => {
            setScrolledTabs((current) =>
                current[route] === isScrolled ? current : { ...current, [route]: isScrolled },
            );
        },
        [],
    );

    return (
        <TabBarScrollProvider onScrollChange={handleScrollChange}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0 },
                }}
                tabBar={({ state, descriptors, navigation, insets }) => {
                    const activeRoute = state.routes[state.index]?.name;
                    const showBlur = primaryTabs.some(
                        ({ name }) => name === activeRoute && scrolledTabs[name],
                    );

                    return (
                        <View pointerEvents="box-none" style={styles.tabBar}>
                            <View
                                style={[
                                    styles.tabBarContent,
                                    {
                                        paddingBottom: Math.max(insets.bottom, 12),
                                        paddingLeft: Math.max(insets.left, 20),
                                        paddingRight: Math.max(insets.right, 20),
                                    },
                                ]}
                            >
                                <View style={styles.pillShadow}>
                                    <View style={styles.pill}>
                                        <BlurView
                                            intensity={showBlur ? 58 : 34}
                                            tint="systemUltraThinMaterialLight"
                                            pointerEvents="none"
                                            style={StyleSheet.absoluteFill}
                                        />
                                        <View style={styles.tabGroup}>
                                            {primaryTabs.map(({ name, title, icon }) => {
                                                const route = state.routes.find((item) => item.name === name);
                                                if (!route) return null;

                                                const focused = state.routes[state.index]?.key === route.key;
                                                const color = focused ? DASHBOARD_THEME.primary : '#64748B';
                                                const label = descriptors[route.key]?.options.title ?? title;

                                                return (
                                                    <Pressable
                                                        key={route.key}
                                                        accessibilityRole="tab"
                                                        accessibilityLabel={label}
                                                        accessibilityState={{ selected: focused }}
                                                        onPress={() => {
                                                            const event = navigation.emit({
                                                                type: 'tabPress',
                                                                target: route.key,
                                                                canPreventDefault: true,
                                                            });

                                                            if (!focused && !event.defaultPrevented) {
                                                                navigation.navigate(route.name, route.params);
                                                            }
                                                        }}
                                                        style={styles.tabButton}
                                                    >
                                                        <KubaiNativeIcon
                                                            name={icon satisfies KubaiNativeIconName}
                                                            size={22}
                                                            color={color}
                                                        />
                                                        <Text style={[styles.tabLabel, { color }]}>{label}</Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </View>

                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Create"
                                    accessibilityHint="Opens create options"
                                    onPress={() => setCreateVisible(true)}
                                    style={styles.createButton}
                                >
                                    <Plus size={25} color="#FFFFFF" strokeWidth={2.7} />
                                </Pressable>
                            </View>
                        </View>
                    );
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{ title: 'Home' }}
                />
                <Tabs.Screen
                    name="library"
                    options={{ title: 'Library' }}
                />
                <Tabs.Screen
                    name="create"
                    options={{ title: 'Create' }}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault();
                            setCreateVisible(true);
                        },
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{ title: 'Profile' }}
                />

                {/* Legacy hidden tabs kept accessible via deep links */}
                <Tabs.Screen name="history" options={{ href: null }} />
                <Tabs.Screen name="chat" options={{ href: null }} />
            </Tabs>

            <CreateBottomSheet
                visible={createVisible}
                onClose={() => setCreateVisible(false)}
            />
        </TabBarScrollProvider>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    tabBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 8,
    },
    pillShadow: {
        flex: 1,
        height: 64,
        borderRadius: 32,
        shadowColor: '#1D2939',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 5,
    },
    pill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.38)',
    },
    tabGroup: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 64,
    },
    tabButton: {
        flex: 1,
        minWidth: 0,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    tabLabel: {
        fontFamily: 'Allo-Medium',
        fontSize: 12,
        lineHeight: 16,
    },
    createButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: DASHBOARD_THEME.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: DASHBOARD_THEME.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.24,
        shadowRadius: 10,
        elevation: 6,
        marginBottom: 4,
    },
});
