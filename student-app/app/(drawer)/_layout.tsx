import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity, useColorScheme, Alert, Platform, Animated, StyleSheet } from 'react-native';
import { 
    Rocket, NavArrowRight, Menu, Sparks, Flash,
    Home, Scanning, MultiplePages, Page, MagicWand, User, LogOut
} from 'iconoir-react-native';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '@/store/authStore';

import { api } from '@/lib/api';
import { router, usePathname } from 'expo-router';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useEffect, useRef } from 'react';
import { registerForPushNotificationsAsync } from '@/lib/notifications';

const NAV_ITEMS = [
    { icon: Home, label: 'Dashboard', route: '/' },
    { icon: Scanning, label: 'Scan & Solve', route: '/scan' },
    { icon: Sparks, label: 'AI Quiz', route: '/generate' },
    { icon: MultiplePages, label: 'Flashcards', route: '/flashcards' },
    { icon: Page, label: 'History', route: '/history' },
    { icon: MagicWand, label: 'Personalize', route: '/preferences' },
    { icon: User, label: 'Account', route: '/account' },
];

function CustomDrawerContent(props: any) {
    const { user, logout } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const pathname = usePathname();

    // Stagger animations for each row
    const anims = useRef(NAV_ITEMS.map(() => new Animated.Value(0))).current;
    const logoutAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Reset
        anims.forEach(a => a.setValue(0));
        logoutAnim.setValue(0);

        // Stagger entrance
        const animations = [
            ...anims.map((a, i) =>
                Animated.spring(a, { toValue: 1, useNativeDriver: true, delay: i * 50, tension: 80, friction: 12 })
            ),
            Animated.spring(logoutAnim, { toValue: 1, useNativeDriver: true, delay: NAV_ITEMS.length * 50, tension: 80, friction: 12 })
        ];

        Animated.parallel(animations).start();
    }, []);

    const handleLogout = async () => {
        const performLogout = async () => {
            try {
                await api.post('logout');
            } catch {
                console.warn('Logout API failed, forcing local logout');
            } finally {
                logout();
                router.replace('/login');
            }
        };

        if (Platform.OS === 'web') {
            await performLogout();
            return;
        }

        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out of Skeeme?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Sign Out", style: "destructive", onPress: performLogout }
            ]
        );
    };

    const iconColors: Record<number, string> = {
        0: '#6B7280', // Home
        1: '#92400E', // Scan
        2: '#3B82F6', // Quiz
        3: '#10B981', // Flashcards
        4: '#8B5CF6', // History
        5: '#EC4899', // Personalize
        6: '#64748B', // Account
    };

    return (
        <View style={[s.drawerRoot, { backgroundColor: 'transparent' }]}>
            <BlurView
                intensity={isDark ? 80 : 40}
                tint={isDark ? 'dark' : 'light'}
                style={{ flex: 1, justifyContent: 'center' }}
            >
                {/* Vertically centered nav items - Jobber FAB style */}
                <View style={s.navContainer}>
                    {NAV_ITEMS.map((item, index) => {
                        const isActive = pathname === item.route || (pathname.startsWith(item.route + '/') && item.route !== '/');
                        const isRootActive = pathname === '/' && item.route === '/';
                        const active = isActive || isRootActive;

                        return (
                            <Animated.View
                                key={item.route}
                                style={{
                                    opacity: anims[index],
                                    transform: [{ translateX: anims[index].interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
                                    marginBottom: 8,
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => router.push(item.route as any)}
                                    activeOpacity={0.7}
                                    style={s.navItem}
                                >
                                    <Text style={[s.navLabel, active ? (isDark ? s.textWhite : s.textSlate900) : (isDark ? s.textWhite60 : s.textSlate700)]}>
                                        {item.label}
                                    </Text>

                                    <View
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 24,
                                            backgroundColor: active ? (iconColors[index] || '#6B7280') : (isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9'),
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <item.icon
                                            width={22}
                                            height={22}
                                            color={active ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#334155')}
                                            strokeWidth={active ? 2 : 1.5}
                                        />
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}

                    <Animated.View
                        style={{
                            opacity: logoutAnim,
                            transform: [{ translateX: logoutAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
                            marginTop: 16,
                        }}
                    >
                        <TouchableOpacity
                            onPress={handleLogout}
                            activeOpacity={0.7}
                            style={s.navItem}
                        >
                            <Text style={[s.navLabel, isDark ? s.textRed400 : s.textRed600]}>Sign out</Text>
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <LogOut width={22} height={22} color="#F87171" strokeWidth={2} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </BlurView>
        </View>
    );
}


export default function DrawerLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const bgColor = isDark ? '#100921' : '#fafafa';
    const drawerBg = isDark ? '#100921' : '#fafafa';
    const tintColor = isDark ? '#fff' : '#121212';

    const { user, token } = useAuthStore();
    const pathname = usePathname();

    useEffect(() => {
        // AI Personalization Guard
        // If logged in but academic level is missing, force them to preferences
        if (token && user && !user.ai_preferences?.education_level) {
            if (pathname !== '/preferences') {
                router.replace('/preferences');
            }
        }

        // Defer push token registration to avoid triggering during navigation mount
        const timer = setTimeout(() => {
            if (token) {
                registerForPushNotificationsAsync(token).catch(() => {});
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [token, user, pathname]);

    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerPosition: 'right',
                drawerType: 'front',
                overlayColor: 'rgba(0,0,0,0.7)',
                sceneStyle: {
                    backgroundColor: 'transparent'
                },
                drawerStyle: {
                    backgroundColor: 'transparent',
                    width: '55%',
                    elevation: 0,
                    shadowOpacity: 0,
                }
            }}>

            <Drawer.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                }}
            />

            <Drawer.Screen
                name="flashcards"
                options={{
                    title: 'Flashcards',
                    drawerItemStyle: { display: 'none' }, // Using custom link in Study Tools
                }}
            />

            <Drawer.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    drawerItemStyle: { display: 'none' },
                }}
            />

            <Drawer.Screen
                name="generate"
                options={{
                    title: 'Generate',
                    drawerItemStyle: { display: 'none' },
                }}
            />

            <Drawer.Screen
                name="history"
                options={{
                    title: 'Study History',
                }}
            />

            <Drawer.Screen
                name="account"
                options={{
                    title: 'Account & Settings',
                }}
            />

            <Drawer.Screen
                name="preferences"
                options={{
                    title: 'Personalize AI',
                }}
            />
        </Drawer >
    );
}

const s = StyleSheet.create({
    drawerRoot: { flex: 1, overflow: 'hidden' },
    navContainer: { flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 24, paddingBottom: 80 },
    navItem: { flexDirection: 'row', alignItems: 'center' },
    navLabel: { fontWeight: '700', fontSize: 14, marginRight: 16 },
    textWhite: { color: 'white' },
    textSlate900: { color: '#0f172a' },
    textWhite60: { color: 'rgba(255,255,255,0.6)' },
    textSlate700: { color: '#334155' },
    textRed400: { color: '#F87171' },
    textRed600: { color: '#DC2626' },
});
