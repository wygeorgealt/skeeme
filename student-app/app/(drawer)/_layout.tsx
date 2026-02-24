import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { GradientButton } from '@/components/ui/GradientButton';

function CustomDrawerContent(props: any) {
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.warn('Logout API failed, forcing local logout');
        } finally {
            logout();
            router.replace('/login');
        }
    };

    return (
        <View className="flex-1 bg-brand-dark pt-10">
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>

                {/* Profile Header section */}
                <View className="px-5 py-6 border-b border-white/5">
                    <View className="flex-row items-center mb-3">
                        <View className="size-12 rounded-full bg-indigo-600 items-center justify-center mr-3 border-2 border-slate-800">
                            <Text className="text-white font-black text-lg">
                                {user?.name?.charAt(0).toUpperCase() || 'S'}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-bold text-base" numberOfLines={1}>{user?.name}</Text>
                            <Text className="text-slate-400 font-medium text-xs" numberOfLines={1}>{user?.email}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center bg-slate-800 self-start px-3 py-1 rounded-full">
                        <Ionicons name="flash" size={12} color="#fbbf24" />
                        <Text className="text-slate-300 font-bold text-xs ml-1">
                            {user?.is_unlimited ? 'Pro Server' : 'Free Tier'}
                        </Text>
                    </View>

                    {!user?.is_unlimited && (
                        <View className="flex-row items-center bg-slate-800/50 self-start px-3 py-1 rounded-full mt-2">
                            <Ionicons name="wallet-outline" size={11} color="#a5b4fc" />
                            <Text className="text-indigo-300 font-bold text-xs ml-1">
                                {user?.credits ?? 0} credits
                            </Text>
                        </View>
                    )}
                </View>

                {/* Study Tools */}
                <View className="px-5 mt-2 mb-2">
                    <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-3">Study Tools</Text>

                    <GradientButton
                        onPress={() => router.push('/generate')}
                        className="py-3 px-4"
                        containerStyle="mb-3"
                        icon={<Ionicons name="sparkles" size={18} color="white" />}
                    >
                        AI Practice Quiz
                    </GradientButton>

                    <TouchableOpacity
                        onPress={() => router.push('/flashcards')}
                        className="bg-emerald-600 flex-row items-center py-3 px-4 rounded-xl mb-4 shadow-sm shadow-emerald-500/20"
                    >
                        <Ionicons name="albums" size={18} color="white" />
                        <Text className="text-white font-black ml-3">Flashcards</Text>
                    </TouchableOpacity>
                </View>

                {/* Existing Routes */}
                <View className="px-2">
                    <DrawerItemList {...props} />
                </View>

            </DrawerContentScrollView>

            {/* Footer */}
            <View className="border-t border-white/5 p-4">
                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center p-3 rounded-xl"
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                    <Text className="text-red-500 font-bold ml-3">Sign Out</Text>
                </TouchableOpacity>
                <Text className="text-slate-600 text-[10px] font-medium text-center mt-2">Skeeme v1.0.0</Text>
            </View>
        </View>
    );
}

export default function DrawerLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#010100',
                    borderBottomWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: '#fff',
                drawerStyle: {
                    backgroundColor: '#010100',
                    width: 300,
                },
                drawerActiveBackgroundColor: '#111111',
                drawerActiveTintColor: '#fff',
                drawerInactiveTintColor: '#94a3b8', // slate-400
                drawerLabelStyle: {
                    fontFamily: 'Inter_500Medium',
                    fontSize: 15,
                    marginLeft: -10,
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
                    title: 'Quiz History',
                    drawerIcon: ({ color }) => <Ionicons name="time-outline" size={22} color={color} />,
                }}
            />

            <Drawer.Screen
                name="upgrade"
                options={{
                    title: 'Get Unlimited Pro',
                    drawerIcon: ({ color }) => <Ionicons name="star-outline" size={22} color={color} />,
                    headerTitle: 'Upgrade Plan',
                }}
            />

            <Drawer.Screen
                name="account"
                options={{
                    title: 'Account & Settings',
                    drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} />,
                }}
            />
        </Drawer>
    );
}
