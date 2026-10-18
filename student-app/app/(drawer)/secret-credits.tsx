import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { appStorage } from '@/lib/storage';
import { AnimatedButton } from 'react-native-3d-animated-buttons';

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export default function SecretCreditsScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const user = useAuthStore((s) => s.user);
    const checkAuth = useAuthStore((s) => s.checkAuth);

    const [identifier, setIdentifier] = useState(user?.email || '');
    const [amount, setAmount] = useState('500');
    const [passkey, setPasskey] = useState('skeeme-admin-2026');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastReceipt, setLastReceipt] = useState<{
        email: string;
        previous_credits: number;
        added_credits: number;
        credits: number;
    } | null>(null);

    useEffect(() => {
        if (user?.email && !identifier) {
            setIdentifier(user.email);
        }
    }, [user?.email]);

    useEffect(() => {
        appStorage.getItem('skeeme_secret_admin_key').then((saved) => {
            if (saved) setPasskey(saved);
        }).catch(() => {});
    }, []);

    const handleSendCredits = async () => {
        const parsedAmount = parseInt(amount.trim(), 10);
        if (!identifier.trim()) {
            Alert.alert('Missing User', 'Please enter a user email or ID.');
            return;
        }
        if (!parsedAmount || parsedAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a credit amount greater than 0.');
            return;
        }
        if (!passkey.trim()) {
            Alert.alert('Missing Passkey', 'Please enter the admin passkey.');
            return;
        }

        haptics.impactAsync();
        setLoading(true);
        try {
            await appStorage.setItem('skeeme_secret_admin_key', passkey.trim());

            const res = await api.post('admin/credits/grant', {
                password: passkey.trim(),
                identifier: identifier.trim(),
                amount: parsedAmount,
                description: description.trim() || `Purchase of ${parsedAmount} Skeeme Credits`,
            });

            const data = res.data;
            if (data?.success && data?.user) {
                setLastReceipt(data.user);
                haptics.notificationAsync();
                // Immediately sync current user's live credit balance in the store
                await checkAuth().catch(() => {});
                Alert.alert(
                    'Credits Sent & Recorded as Bought',
                    `${data.user.email}\n${data.user.previous_credits} → ${data.user.credits} credits (+${data.user.added_credits} purchased)`
                );
            } else {
                Alert.alert('Failed', data?.error || 'Could not grant credits.');
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                'Failed to grant credits.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[s.root, { backgroundColor: C.background }]}>
            <ScreenHeader
                title="Secret Credit Dispenser"
                onBack={() => (router.canGoBack() ? router.back() : router.replace('/(drawer)' as any))}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={s.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Current Test Account Banner */}
                    <View
                        style={[
                            s.card,
                            {
                                backgroundColor: C.card,
                                borderColor: C.border,
                            },
                        ]}
                    >
                        <View style={s.rowBetween}>
                            <View style={s.badgePill}>
                                <Icon name="ShieldCheck" size={14} color="primary" />
                                <Text style={s.badgeText}>SAVED AS CREDITS BOUGHT</Text>
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#007AFF' }}>
                                {user?.credits ?? 0} Credits
                            </Text>
                        </View>
                        <Text style={[s.cardTitle, { color: C.text }]}>
                            Grant Purchased Credits
                        </Text>
                        <Text style={[s.cardSub, { color: C.textSecondary }]}>
                            Credits sent here are recorded in the ledger as a completed credit pack purchase (`type = purchase`) and paid invoice.
                        </Text>
                    </View>

                    {/* Target User Input */}
                    <View
                        style={[
                            s.card,
                            {
                                backgroundColor: C.card,
                                borderColor: C.border,
                            },
                        ]}
                    >
                        <View style={s.rowBetween}>
                            <Text style={[s.fieldLabel, { color: C.textSecondary }]}>
                                TARGET USER (EMAIL OR ID)
                            </Text>
                            {user?.email && identifier !== user.email ? (
                                <Pressable
                                    onPress={() => {
                                        haptics.selectionAsync();
                                        setIdentifier(user.email);
                                    }}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#007AFF' }}>
                                        Use My Account
                                    </Text>
                                </Pressable>
                            ) : null}
                        </View>
                        <TextInput
                            value={identifier}
                            onChangeText={setIdentifier}
                            placeholder="student@example.com or user ID"
                            placeholderTextColor={C.textTertiary}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            style={[
                                s.input,
                                {
                                    backgroundColor: C.surfaceLow,
                                    color: C.text,
                                    borderColor: C.border,
                                },
                            ]}
                        />

                        {/* Preset Credit Packs */}
                        <Text style={[s.fieldLabel, { color: C.textSecondary, marginTop: 16 }]}>
                            CREDIT PACK AMOUNT
                        </Text>
                        <View style={s.presetGrid}>
                            {PRESET_AMOUNTS.map((preset) => {
                                const isSelected = amount === String(preset);
                                return (
                                    <Pressable
                                        key={preset}
                                        onPress={() => {
                                            haptics.selectionAsync();
                                            setAmount(String(preset));
                                        }}
                                        style={[
                                            s.presetChip,
                                            {
                                                backgroundColor: isSelected ? '#007AFF' : C.surfaceLow,
                                                borderColor: isSelected ? '#007AFF' : C.border,
                                            },
                                        ]}
                                    >
                                        <Icon
                                            name="Zap"
                                            size={13}
                                            color={isSelected ? 'white' : 'primary'}
                                        />
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                fontWeight: '800',
                                                color: isSelected ? '#FFFFFF' : C.text,
                                            }}
                                        >
                                            +{preset.toLocaleString()}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="Custom credit amount (e.g. 500)"
                            placeholderTextColor={C.textTertiary}
                            keyboardType="number-pad"
                            style={[
                                s.input,
                                {
                                    backgroundColor: C.surfaceLow,
                                    color: C.text,
                                    borderColor: C.border,
                                    marginTop: 10,
                                },
                            ]}
                        />

                        {/* Admin Passkey */}
                        <Text style={[s.fieldLabel, { color: C.textSecondary, marginTop: 16 }]}>
                            ADMIN PASSKEY
                        </Text>
                        <TextInput
                            value={passkey}
                            onChangeText={setPasskey}
                            placeholder="Admin passkey"
                            placeholderTextColor={C.textTertiary}
                            autoCapitalize="none"
                            secureTextEntry
                            style={[
                                s.input,
                                {
                                    backgroundColor: C.surfaceLow,
                                    color: C.text,
                                    borderColor: C.border,
                                },
                            ]}
                        />

                        {/* Optional Note */}
                        <Text style={[s.fieldLabel, { color: C.textSecondary, marginTop: 16 }]}>
                            RECEIPT DESCRIPTION (OPTIONAL)
                        </Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder={`Purchase of ${amount || 500} Skeeme Credits`}
                            placeholderTextColor={C.textTertiary}
                            style={[
                                s.input,
                                {
                                    backgroundColor: C.surfaceLow,
                                    color: C.text,
                                    borderColor: C.border,
                                },
                            ]}
                        />
                    </View>

                    {/* Receipt Confirmation Card */}
                    {lastReceipt ? (
                        <View
                            style={[
                                s.card,
                                {
                                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
                                    borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : '#A7F3D0',
                                },
                            ]}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Icon name="CheckCircle2" size={18} color="#10B981" />
                                <Text style={{ fontSize: 14, fontWeight: '800', color: '#10B981' }}>
                                    Purchase Recorded Successfully
                                </Text>
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: C.text, marginTop: 6 }}>
                                Account: {lastReceipt.email}
                            </Text>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: C.textSecondary, marginTop: 2 }}>
                                Balance: {lastReceipt.previous_credits} → {lastReceipt.credits} Credits (+{lastReceipt.added_credits} bought)
                            </Text>
                        </View>
                    ) : null}

                    <View style={{ marginTop: 8 }}>
                        <AnimatedButton
                            title={loading ? 'Sending Purchased Credits...' : `Send +${Number(amount || 0).toLocaleString()} Purchased Credits`}
                            onPress={handleSendCredits}
                            loading={loading}
                            disabled={loading}
                            type="capsule"
                            backgroundColor="#007AFF"
                            shadowColor="#005ECE"
                            fullWidth
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
    },
    scrollContent: {
        padding: 18,
        paddingBottom: 60,
        gap: 14,
    },
    card: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 18,
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(0, 122, 255, 0.12)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#007AFF',
        letterSpacing: 0.4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    cardSub: {
        fontSize: 13,
        lineHeight: 19,
        marginTop: 4,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 14,
        fontSize: 14,
        fontWeight: '600',
    },
    presetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    presetChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        minWidth: '30%',
        flex: 1,
    },
});
