import { Text } from '@/components/ui/Text';
import { Drawer } from 'expo-router/drawer';
import { View, TouchableOpacity, useColorScheme, Alert, Platform, Animated, StyleSheet } from 'react-native';
import { 
    Rocket, NavArrowRight, Menu, Sparks, Flash,
    Home, MultiplePages, Page, User, LogOut
} from 'iconoir-react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '@/store/authStore';

const CameraIcon = (props: any) => <Ionicons name="camera-outline" size={props.width || 22} color={props.color} />;
const HappyIcon = (props: any) => <Ionicons name="happy" size={props.width || 22} color={props.color} />;

import { api } from '@/lib/api';
import { router, usePathname } from 'expo-router';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useEffect, useRef } from 'react';
import { registerForPushNotificationsAsync } from '@/lib/notifications';

const NAV_ITEMS = [
    { icon: Home, label: 'Dashboard', route: '/' },
    { icon: CameraIcon, label: 'Scan & Solve', route: '/scan' },
    { icon: Sparks, label: 'AI Quiz', route: '/generate' },
    { icon: MultiplePages, label: 'Flashcards', route: '/flashcards' },
    { icon: Page, label: 'History', route: '/history' },
    { icon: HappyIcon, label: 'Personalize', route: '/preferences' },
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
        <View style={[s.drawerRoot, { backgroundColor: isDark ? 'transparent' : '#ffffff' }]}>
            {isDark ? (
                <BlurView intensity={80} tint="dark" style={{ flex: 1, justifyContent: 'center' }}>
                    <NavContent 
                        pathname={pathname} anims={anims} logoutAnim={logoutAnim} 
                        handleLogout={handleLogout} iconColors={iconColors} isDark={isDark} 
                    />
                </BlurView>
            ) : (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <NavContent 
                        pathname={pathname} anims={anims} logoutAnim={logoutAnim} 
                        handleLogout={handleLogout} iconColors={iconColors} isDark={isDark} 
                    />
                </View>
            )}
        </View>
    );
}

// Extracted NavContent to avoid duplicating JSX inside the BlurView/View toggle
function NavContent({ pathname, anims, logoutAnim, handleLogout, iconColors, isDark }: any) {
    return (
        <View style={s.navContainer}>
            {NAV_ITEMS.map((item, index) => {
                const isActive = pathname === item.route || (pathname.startsWith(item.route + '/') && item.route !== '/');
                const isRootActive = pathname === '/' && item.route === '/';
                const active = isActive || isRootActive;
                
                const baseColor = iconColors[index] || '#6B7280';

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
                            <Text style={[s.navLabel, active ? (isDark ? s.textWhite : s.textSlate900) : (isDark ? s.textWhite60 : s.textSlate400)]}>
                                {item.label}
                            </Text>

                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    // Dark mode: strong colors. Light mode: transparent or very subtle background.
                                    backgroundColor: active 
                                        ? (isDark ? baseColor : `${baseColor}1A`) 
                                        : (isDark ? 'rgba(255,255,255,0.08)' : 'transparent'),
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <item.icon
                                    width={22}
                                    height={22}
                                    color={active 
                                        ? (isDark ? '#FFFFFF' : baseColor) 
                                        : (isDark ? '#9CA3AF' : '#94A3B8')}
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
                            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <LogOut width={22} height={22} color={isDark ? "#F87171" : "#EF4444"} strokeWidth={2} />
                    </View>
                </TouchableOpacity>
            </Animated.View>
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
    textSlate400: { color: '#94a3b8' },
    textRed400: { color: '#F87171' },
    textRed600: { color: '#DC2626' },
});
