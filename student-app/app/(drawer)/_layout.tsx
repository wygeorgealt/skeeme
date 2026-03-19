import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity, useColorScheme, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

import { api } from '@/lib/api';
import { router, usePathname } from 'expo-router';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '@/lib/notifications';

function CustomDrawerContent(props: any) {
    const { user, logout } = useAuthStore();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const iconColor = isDark ? '#ffffff' : '#121212';
    const pathname = usePathname();

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

    const NavItem = ({ icon, label, route }: { icon: any, label: string, route: string }) => {
        const isActive = pathname === route || (pathname.startsWith(route + '/') && route !== '/');
        const isRootActive = pathname === '/' && route === '/';
        const active = isActive || isRootActive;

        return (
            <TouchableOpacity
                onPress={() => router.push(route as any)}
                className="px-6 py-4 flex-row items-center"
            >
                <Ionicons name={icon} size={22} color={iconColor} style={{ opacity: active ? 1 : 0.7 }} />
                <Text className={`ml-5 font-semibold text-[15px] ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ opacity: active ? 1 : 0.8 }}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 40, paddingBottom: 20 }}>
                {/* Profile Header section */}
                <View className="px-6 mb-6">
                    <View className="size-20 rounded-full bg-brand-primary items-center justify-center mb-4 border-4 border-slate-50 dark:border-[#111111] overflow-hidden shadow-sm shadow-slate-200 dark:shadow-none">
                        <Text className="text-white font-black text-3xl">
                            {user?.name?.charAt(0).toUpperCase() || 'S'}
                        </Text>
                    </View>
                    <Text className="text-slate-900 dark:text-white font-bold text-2xl mb-1" numberOfLines={1}>{user?.name}</Text>
                    <Text className="text-slate-500 dark:text-slate-400 font-medium text-sm" numberOfLines={1}>{user?.email}</Text>
                </View>

                {/* Divider exactly like image */}
                <View className="h-[1px] bg-slate-100 dark:bg-white/10 mx-6 mb-4" />

                {/* Nav Items */}
                <NavItem icon="home-outline" label="Dashboard" route="/" />
                <NavItem icon="scan-outline" label="Scan & Solve" route="/scan" />
                <NavItem icon="sparkles-outline" label="AI Practice Quiz" route="/generate" />
                <NavItem icon="albums-outline" label="Flashcards" route="/flashcards" />
                <NavItem icon="book-outline" label="Study History" route="/history" />
                <NavItem icon="color-wand-outline" label="Personalize AI" route="/preferences" />
            </DrawerContentScrollView>

            {/* Footer with Sign Out like image */}
            <View className="px-6 pb-12 pt-4">
                <TouchableOpacity
                    onPress={() => router.push('/account')}
                    className="bg-[#f1f5f9] dark:bg-[#111111] rounded-full py-[14px] items-center justify-center mb-3 border-2 border-slate-200 dark:border-slate-800"
                    activeOpacity={0.7}
                >
                    <Text className="text-slate-900 dark:text-slate-300 font-bold text-[14px]">Account & Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-[#f1f5f9] dark:bg-[#111111] rounded-full py-[14px] items-center justify-center border-2 border-red-100 dark:border-red-900/30"
                    activeOpacity={0.7}
                >
                    <Text className="text-red-500 font-bold text-[14px]">Sign out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function DrawerLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const bgColor = isDark ? '#121212' : '#ffffff';
    const drawerBg = isDark ? '#121212' : '#ffffff';
    const tintColor = isDark ? '#fff' : '#121212';

    useEffect(() => {
        // Defer push token registration to avoid triggering during navigation mount
        const timer = setTimeout(() => {
            const token = useAuthStore.getState().token;
            if (token) {
                registerForPushNotificationsAsync(token).catch(() => {});
            }
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerTitle: '', // Keep the hamburger icon, but remove text titles
                headerShown: true,
                headerStyle: {
                    backgroundColor: bgColor,
                    borderBottomWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: tintColor,
                drawerStyle: {
                    backgroundColor: drawerBg,
                    width: '85%',
                },
            }}>

            <Drawer.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
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
                name="history"
                options={{
                    title: 'Study History',
                    drawerIcon: ({ color }) => <Ionicons name="book-outline" size={22} color={color} />,
                }}
            />

            <Drawer.Screen
                name="account"
                options={{
                    title: 'Account & Settings',
                    drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} />,
                }}
            />

            <Drawer.Screen
                name="preferences"
                options={{
                    title: 'Personalize AI',
                    drawerIcon: ({ color }) => <Ionicons name="color-wand-outline" size={22} color={color} />,
                }}
            />
        </Drawer >
    );
}
