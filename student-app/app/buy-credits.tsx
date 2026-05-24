import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Stack, router } from 'expo-router';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useAuthStore } from '@/store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { DangerTriangle, Bolt, RoundArrowRight } from '@solar-icons/react-native/Bold';
import * as ExpoHaptics from 'expo-haptics';
import { haptics } from '@/lib/haptics';

export default function BuyCreditsScreen() {
    const { user, updateUser } = useAuthStore();
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = {
        bg: isDark ? '#121212' : '#f8fafc',
        card: isDark ? '#1e293b' : 'white',
        text: isDark ? 'white' : '#0f172a',
        subText: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? '#334155' : '#e2e8f0',
    };

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            const offerings = await Purchases.getOfferings();
            
            // Look for an offering specifically named 'credits', or check the current offering
            let creditPackages: PurchasesPackage[] = [];
            
            if (offerings.all && offerings.all['credits']) {
                creditPackages = offerings.all['credits'].availablePackages;
            } else if (offerings.current) {
                // Filter current offering for any products containing "credits"
                creditPackages = offerings.current.availablePackages.filter(p => 
                    p.product.identifier.includes('credits')
                );
            }
            
            // Sort by price
            creditPackages.sort((a, b) => a.product.price - b.product.price);
            setPackages(creditPackages);
        } catch (e: any) {
            console.error('Error fetching offerings:', e);
            Alert.alert('Error', 'Could not load credit packages at this time.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurchase = async (pkg: PurchasesPackage) => {
        setIsPurchasing(pkg.identifier);
        haptics.selectionAsync();
        
        try {
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            
            // Determine how many credits were just bought based on product ID
            let addedCredits = 0;
            if (pkg.product.identifier.includes('1000')) addedCredits = 1000;
            if (pkg.product.identifier.includes('5000')) addedCredits = 5000;
            if (pkg.product.identifier.includes('20000')) addedCredits = 20000;
            
            if (addedCredits > 0) {
                // Optimistically update local user state
                updateUser({ credits: (user?.credits || 0) + addedCredits });
            }
            
            haptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success, true);
            Alert.alert(
                'Payment Successful!', 
                `You have successfully purchased ${addedCredits || 'your'} credits. They have been added to your balance.`,
                [{ text: 'Awesome', onPress: () => router.back() }]
            );
            
        } catch (e: any) {
            if (!e.userCancelled) {
                Alert.alert('Purchase Failed', e.message || 'There was an error completing your purchase.');
            }
        } finally {
            setIsPurchasing(null);
        }
    };

    const renderPackage = (pkg: PurchasesPackage, index: number) => {
        // Aesthetic coloring based on the size of the package
        const colors = [
            ['#3b82f6', '#2563eb'], // Blue for cheapest
            ['#a855f7', '#7e22ce'], // Purple for middle
            ['#f59e0b', '#d97706'], // Amber for most expensive
        ];
        
        const grad = colors[Math.min(index, colors.length - 1)] as [string, string];
        const isProcessing = isPurchasing === pkg.identifier;
        
        // Extract a clean number (e.g., "1000" from "skeeme_credits_1000")
        const amountMatch = pkg.product.identifier.match(/\d+/);
        const amount = amountMatch ? parseInt(amountMatch[0]).toLocaleString() : 'Credits';

        return (
            <TouchableOpacity 
                key={pkg.identifier} 
                activeOpacity={0.8}
                onPress={() => handlePurchase(pkg)}
                disabled={isPurchasing !== null}
                style={[styles.packageCard, { backgroundColor: C.card, borderColor: C.border }]}
            >
                <View style={styles.packageLeft}>
                    <LinearGradient
                        colors={grad}
                        style={styles.iconBox}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    >
                        <Bolt size={24} color="white" />
                    </LinearGradient>
                    <View style={styles.packageTextWrap}>
                        <Text style={[styles.packageTitle, { color: C.text }]}>{amount} Credits</Text>
                        <Text style={[styles.packageDesc, { color: C.subText }]}>{pkg.product.description || 'Instantly refill your balance'}</Text>
                    </View>
                </View>
                
                <View style={styles.packageRight}>
                    {isProcessing ? (
                        <ActivityIndicator color={grad[0]} />
                    ) : (
                        <>
                            <Text style={[styles.priceText, { color: C.text }]}>{pkg.product.priceString}</Text>
                            <RoundArrowRight size={20} color={C.subText} style={{ marginLeft: 6 }} />
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen 
                options={{ 
                    title: 'Top Up Credits',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: C.bg },
                    headerTintColor: C.text,
                }} 
            />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: C.text }]}>Need a boost?</Text>
                    <Text style={[styles.subtitle, { color: C.subText }]}>
                        Running low on credits? Purchase a one-time pack to keep scanning, solving, and studying without limits.
                    </Text>
                </View>
                
                <View style={[styles.balanceBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]}>
                    <Text style={styles.balanceLabel}>Current Balance</Text>
                    <Text style={styles.balanceAmount}>{user?.credits?.toLocaleString() || 0} <Text style={{fontSize: 16, fontWeight: '500'}}>credits</Text></Text>
                </View>

                <View style={styles.packagesContainer}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text style={[styles.loadingText, { color: C.subText }]}>Loading credit packs...</Text>
                        </View>
                    ) : packages.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <DangerTriangle size={48} color={C.subText} />
                            <Text style={[styles.emptyText, { color: C.text }]}>No credit packs found</Text>
                            <Text style={[styles.emptySubText, { color: C.subText }]}>
                                Ensure you have products configured in RevenueCat.
                            </Text>
                        </View>
                    ) : (
                        packages.map(renderPackage)
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 24, paddingBottom: 60 },
    header: { marginBottom: 32 },
    title: { fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
    subtitle: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
    
    balanceBox: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    balanceLabel: { color: '#3b82f6', fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    balanceAmount: { color: '#2563eb', fontWeight: '800', fontSize: 32 },
    
    packagesContainer: { gap: 16 },
    
    packageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    packageLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconBox: {
        width: 48, height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    packageTextWrap: { flex: 1, paddingRight: 8 },
    packageTitle: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
    packageDesc: { fontSize: 13, fontWeight: '500' },
    
    packageRight: { flexDirection: 'row', alignItems: 'center' },
    priceText: { fontSize: 16, fontWeight: '800' },
    
    loadingContainer: { alignItems: 'center', paddingVertical: 40 },
    loadingText: { marginTop: 16, fontWeight: '600' },
    
    emptyContainer: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    emptySubText: { textAlign: 'center', paddingHorizontal: 20 },
});
