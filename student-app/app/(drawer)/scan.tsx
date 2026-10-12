import React, { useState, useRef, useEffect } from 'react';
import { Pressable, 
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Alert,
    Platform,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';
import { scannerService, ScanResult } from '@/lib/scanner';
import { haptics } from '@/lib/haptics';
import { MathText } from '@/components/ui/MathText';

const { width } = Dimensions.get('window');

const MOCK_RECENT_SCANS = [
    { id: '1', title: 'Quadratic #4', subtitle: 'Solved • 98%', color: '#007AFF' },
    { id: '2', title: 'Physics Doc', subtitle: 'Formulas', color: '#007AFF' },
    { id: '3', title: 'Calculus Test', subtitle: 'Answered', color: '#34D399' },
];

export default function ScanScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const navigation = useNavigation();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const user = useAuthStore((s) => s.user);
    const credits = user?.credits ?? 0;
    const toggleCreditsModal = useAuthStore((s) => s.toggleCreditsModal);

    const [enableTorch, setEnableTorch] = useState(false);
    const [scanMode, setScanMode] = useState<'single' | 'worksheet' | 'diagram'>('single');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ScanResult[]>([]);
    const [activeModel, setActiveModel] = useState<'cloud' | 'skeemy'>('skeemy');
    const [followUpText, setFollowUpText] = useState('');
    const [facing, setFacing] = useState<'back' | 'front'>('back');

    // Laser scanning animation
    const laserY = useSharedValue(0.08);
    // Flash animation
    const flashOpacity = useSharedValue(0);

    useEffect(() => {
        laserY.value = withRepeat(
            withTiming(0.92, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
            -1,
            true
        );
    }, []);

    const laserAnimatedStyle = useAnimatedStyle(() => ({
        top: `${laserY.value * 100}%`,
    }));

    const flashAnimatedStyle = useAnimatedStyle(() => ({
        opacity: flashOpacity.value,
    }));

    // Hide tab bar when showing results
    useEffect(() => {
        if (results.length > 0) {
            navigation.setOptions({ tabBarStyle: { display: 'none' } });
        } else {
            navigation.setOptions({ tabBarStyle: { display: 'flex' } });
        }
    }, [results]);

    const handleCapture = async () => {
        if (!cameraRef.current) return;
        try {
            await haptics.impactAsync();
            flashOpacity.value = withSequence(
                withTiming(0.9, { duration: 50 }),
                withTiming(0, { duration: 250 })
            );
            
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.85,
                skipProcessing: Platform.OS === 'android',
            });
            if (photo?.uri) {
                processImage(photo.uri);
            }
        } catch (e: any) {
            Alert.alert('Capture Error', e.message || 'Failed to capture photo');
        }
    };

    const pickImage = async () => {
        try {
            await haptics.selectionAsync();
            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.85,
            });
            if (!res.canceled && res.assets && res.assets[0].uri) {
                processImage(res.assets[0].uri);
            }
        } catch (e: any) {
            Alert.alert('Gallery Error', e.message || 'Could not pick image');
        }
    };

    const processImage = async (uri: string) => {
        setLoading(true);
        try {
            const manip = await manipulateAsync(
                uri,
                [{ resize: { width: 1200 } }],
                { compress: 0.8, format: SaveFormat.JPEG, base64: true }
            );

            if (!manip.base64) throw new Error('Could not encode image');

            const resp = await scannerService.solve(manip.base64);
            if (resp.results && resp.results.length > 0) {
                setResults(resp.results);
                await haptics.notificationAsync();
            } else {
                Alert.alert('No Questions Found', 'Could not detect any clear questions in the photo. Please try again.');
            }
        } catch (e: any) {
            Alert.alert('Scan Failed', e.message || 'Failed to process question.');
        } finally {
            setLoading(false);
        }
    };

    const getInstructionText = () => {
        if (loading) return 'Analyzing problem with Skeeme AI...';
        if (scanMode === 'single') return 'Align math problem inside frame';
        if (scanMode === 'worksheet') return 'Hold steady to capture full page';
        if (scanMode === 'diagram') return 'Center coordinate graph or diagram';
        return '';
    };

    if (results.length > 0) {
        const currentResult = results[0];
        return (
            <View className="flex-1 bg-surface">
                {/* Result Header */}
                <View className="flex-row items-center justify-between px-4 h-16 bg-surface/85 border-b border-surface-container" style={{ paddingTop: insets.top }}>
                    <Pressable
                        
                        onPress={() => setResults([])}
                        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-surface-container active:scale-95 transition-all"
                    >
                        <MaterialIcons name="arrow-back" size={20} color="#1c1c1e" />
                    </Pressable>
                    <View className="flex-1 items-center px-2">
                        <Text className="text-[18px] font-bold text-on-surface tracking-tight" style={{ fontWeight: '700' }}>Question</Text>
                    </View>
                    <Pressable
                        
                        onPress={() => {
                            haptics.selectionAsync();
                            Alert.alert('Share', 'Exporting solution summary...');
                        }}
                        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-surface-container active:scale-95 transition-all"
                    >
                        <MaterialIcons name="ios-share" size={20} color="#1c1c1e" />
                    </Pressable>
                </View>

                <ScrollView
                    className="flex-1 w-full bg-surface"
                    contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 120, paddingTop: 12 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="w-full max-w-md mx-auto px-4 space-y-4">
                        {/* Question Card */}
                        <View className="rounded-3xl relative py-1">
                            <View className="bg-white rounded-2xl p-4 shadow-sm relative items-center border border-surface-container-low">
                                <View className="absolute -left-1 -bottom-1 w-3 h-3 rounded-full bg-accent-electric-blue border-2 border-white shadow-sm z-10" />
                                <MathText content={currentResult.question || 'Scanned Problem'} />
                                <Text className="text-[12px] text-on-surface-variant mt-1" style={{ fontWeight: '400' }}>
                                    {currentResult.topic || 'Analyzed Question'}
                                </Text>
                            </View>
                        </View>

                        {/* Model Switcher & Credits Pill */}
                        <View className="flex-row items-center justify-between gap-2 mt-4">
                            <View className="flex-row p-1 bg-surface-container-low rounded-full">
                                <Pressable
                                    
                                    onPress={() => { haptics.selectionAsync(); setActiveModel('cloud'); }}
                                    className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${activeModel === 'cloud' ? 'bg-accent-electric-blue shadow-sm' : ''}`}
                                >
                                    <MaterialIcons name="cloud" size={16} color={activeModel === 'cloud' ? '#FFFFFF' : '#48484a'} />
                                    <Text className={`text-[14px] ${activeModel === 'cloud' ? 'text-on-primary' : 'text-on-surface-variant'}`} style={{ fontWeight: '600' }}>Cloud AI</Text>
                                </Pressable>
                                <Pressable
                                    
                                    onPress={() => { haptics.selectionAsync(); setActiveModel('skeemy'); }}
                                    className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${activeModel === 'skeemy' ? 'bg-accent-electric-blue shadow-sm' : ''}`}
                                >
                                    <MaterialIcons name="auto-awesome" size={16} color={activeModel === 'skeemy' ? '#FFFFFF' : '#48484a'} />
                                    <Text className={`text-[14px] ${activeModel === 'skeemy' ? 'text-on-primary' : 'text-on-surface-variant'}`} style={{ fontWeight: '600' }}>Skeemy</Text>
                                </Pressable>
                            </View>
                            <Pressable
                                
                                onPress={() => toggleCreditsModal(true, 'scan')}
                                className="flex-row items-center gap-1 px-3 py-1.5 bg-white rounded-full border border-surface-container"
                            >
                                <MaterialIcons name="bolt" size={15} color="#007AFF" />
                                <Text className="text-[12px] font-bold text-on-surface">{credits}</Text>
                                <Text className="text-[11px] text-on-surface-variant">left</Text>
                            </Pressable>
                        </View>

                        {/* Solution Card */}
                        <View className="bg-[#f4f8ff] border border-[#dbe8fd] rounded-2xl p-3.5 flex-row items-center justify-between mt-4">
                            <View className="flex-row items-center gap-3">
                                <View className="w-8 h-8 rounded-full bg-accent-electric-blue items-center justify-center shadow-sm">
                                    <MaterialIcons name="check" size={18} color="#FFFFFF" />
                                </View>
                                <View>
                                    <Text className="text-[10px] text-accent-electric-blue uppercase tracking-wider font-bold">Solution</Text>
                                    <MathText content={currentResult.solution || 'No direct answer'} />
                                </View>
                            </View>
                            <View className="bg-[#e1f8f5] px-2 py-0.5 rounded-full">
                                <Text className="text-[11px] text-[#00837c]" style={{ fontWeight: '600' }}>Verified</Text>
                            </View>
                        </View>

                        {/* Steps */}
                        {currentResult.steps && currentResult.steps.length > 0 && (
                            <View className="pt-2 mt-2">
                                <View className="flex-row items-center gap-1.5 mb-3">
                                    <MaterialIcons name="filter-list" size={18} color="#007AFF" />
                                    <Text className="text-on-surface text-[15px]" style={{ fontWeight: '700' }}>Step-by-step Explanation</Text>
                                </View>
                                <View className="pl-1 flex-col gap-4">
                                    {currentResult.steps.map((step, idx) => (
                                        <View key={idx} className="flex-row items-start gap-3">
                                            <View className="w-6 h-6 rounded-full bg-primary-fixed items-center justify-center shadow-sm mt-0.5">
                                                <Text className="text-[#004493] text-[12px]" style={{ fontWeight: '700' }}>{idx + 1}</Text>
                                            </View>
                                            <View className="flex-1 flex-col pl-0.5 bg-surface-container-low p-2.5 rounded-xl">
                                                <MathText content={step} />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Explanation Summary / Pro Tip */}
                        {currentResult.explanation && (
                            <View className="p-3 bg-[#f0edff] border border-[#e2dfff] rounded-2xl flex-row items-start gap-2.5 mt-4">
                                <MaterialIcons name="tips-and-updates" size={20} color="#4c4aca" style={{ marginTop: 2 }} />
                                <View className="flex-col flex-1">
                                    <Text className="text-[13px] text-[#0c006a]" style={{ fontWeight: '700' }}>Quiz Hack</Text>
                                    <Text className="text-[12px] text-[#0c006a] opacity-80 mt-0.5 leading-5">{currentResult.explanation}</Text>
                                </View>
                            </View>
                        )}

                        {/* Make Practice Questions */}
                        <Pressable
                            
                            onPress={() => { haptics.impactAsync(); router.push('/(drawer)/generate'); }}
                            className="w-full h-12 rounded-2xl bg-accent-electric-blue items-center justify-center flex-row gap-2 shadow-sm active:scale-95 mt-4"
                        >
                            <MaterialIcons name="auto-awesome" size={19} color="#FFFFFF" />
                            <Text className="text-on-primary text-[15px]" style={{ fontWeight: '700' }}>Make 3 Similar Practice Questions</Text>
                        </Pressable>
                    </View>
                </ScrollView>

                {/* Follow-up Chat Dock */}
                <View className="absolute bottom-0 left-0 right-0 z-40 bg-surface/90 pb-4 shadow-lg border-t border-surface-container/50">
                    <View className="max-w-md mx-auto px-4 py-2.5">
                        <View className="flex-row items-center bg-white rounded-full pl-4 pr-1.5 py-1.5 shadow-sm border border-surface-container">
                            <MaterialIcons name="chat" size={20} color="#8e8e93" className="mr-2" />
                            <TextInput
                                className="flex-1 text-[15px] text-on-surface py-2"
                                placeholder="Ask a question"
                                placeholderTextColor="#8e8e93"
                                value={followUpText}
                                onChangeText={setFollowUpText}
                            />
                            <Pressable
                                
                                onPress={() => {
                                    if (!followUpText.trim()) return;
                                    haptics.selectionAsync();
                                    Alert.alert('Skeemy', `Thinking about: "${followUpText}"...`);
                                    setFollowUpText('');
                                }}
                                className="w-10 h-10 rounded-full bg-accent-electric-blue items-center justify-center ml-2"
                            >
                                <MaterialIcons name="arrow-upward" size={20} color="#FFFFFF" />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    if (!permission) {
        return <View className="flex-1 bg-[#090d16]" />;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-[#090d16] items-center justify-center px-8" style={{ paddingTop: insets.top }}>
                <MaterialIcons name="camera-alt" size={56} color="#007AFF" style={{ marginBottom: 16 }} />
                <Text className="text-[22px] text-white mb-2" style={{ fontWeight: '700' }}>Camera Access Needed</Text>
                <Text className="text-[14px] text-[#8E8E93] text-center leading-5 mb-6">
                    Skeeme needs camera access to scan your homework problems, math formulas, and past questions.
                </Text>
                <Pressable
                    
                    onPress={requestPermission}
                    className="bg-[#007AFF] px-7 py-3 rounded-full"
                >
                    <Text className="text-white text-[15px]" style={{ fontWeight: '700' }}>Grant Access</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#090d16]">
            <CameraView
                style={StyleSheet.absoluteFill}
                facing={facing}
                ref={cameraRef}
                enableTorch={enableTorch}
            />

            {/* Flash Overlay */}
            <Animated.View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, { backgroundColor: 'white', zIndex: 50 }, flashAnimatedStyle]}
            />

            {/* Top Bar Controls */}
            <View className="w-full flex-row items-center justify-between px-5 pt-4 z-20" style={{ marginTop: Math.max(insets.top, 14) }}>
                <Pressable
                    
                    onPress={() => router.back()}
                    className="w-11 h-11 rounded-full bg-black/40 border border-white/15 items-center justify-center"
                >
                    <MaterialIcons name="close" size={22} color="#FFFFFF" />
                </Pressable>

                {/* Credits Pill */}
                <Pressable
                    
                    onPress={() => toggleCreditsModal(true, 'scan')}
                    className="flex-row items-center gap-1.5 px-4 py-2 rounded-full bg-black/50 border border-white/15"
                >
                    <MaterialIcons name="bolt" size={19} color="#007AFF" />
                    <Text className="text-[14px] text-white" style={{ fontWeight: '700' }}>{credits}</Text>
                    <Text className="text-[13px] text-white/70" style={{ fontWeight: '500' }}>Credits</Text>
                </Pressable>

                {/* Torch Toggle */}
                <Pressable
                    
                    onPress={() => { haptics.selectionAsync(); setEnableTorch(!enableTorch); }}
                    className={`w-11 h-11 rounded-full border items-center justify-center transition-all ${enableTorch ? 'bg-[#007AFF] border-[#007AFF]' : 'bg-black/40 border-white/15'}`}
                >
                    <MaterialIcons
                        name={enableTorch ? 'flash-on' : 'flash-off'}
                        size={21}
                        color="#FFFFFF"
                    />
                </Pressable>
            </View>

            {/* Viewfinder Center */}
            <View className="flex-1 items-center justify-center px-6 my-1">
                <View className="w-full max-w-[340px] aspect-[4/4.2] rounded-3xl overflow-hidden items-center justify-center border border-white/10" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 50 }}>
                    <View className="absolute inset-0 bg-[#007AFF]/5" />
                    
                    {/* Animated Laser */}
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                left: 12,
                                right: 12,
                                height: 2.5,
                                backgroundColor: '#007AFF',
                                shadowColor: '#007AFF',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.9,
                                shadowRadius: 8,
                                zIndex: 10
                            },
                            laserAnimatedStyle
                        ]}
                    />

                    {/* Corner Brackets */}
                    <View className="absolute top-3.5 left-3.5 w-7 h-7 border-t-[3.5px] border-l-[3.5px] border-[#007AFF] rounded-tl-xl" style={styles.glow} />
                    <View className="absolute top-3.5 right-3.5 w-7 h-7 border-t-[3.5px] border-r-[3.5px] border-[#007AFF] rounded-tr-xl" style={styles.glow} />
                    <View className="absolute bottom-3.5 left-3.5 w-7 h-7 border-b-[3.5px] border-l-[3.5px] border-[#007AFF] rounded-bl-xl" style={styles.glow} />
                    <View className="absolute bottom-3.5 right-3.5 w-7 h-7 border-b-[3.5px] border-r-[3.5px] border-[#007AFF] rounded-br-xl" style={styles.glow} />

                    {/* Center Crosshair Marks */}
                    <View className="w-4 h-4 border border-dashed border-white/30 rounded-full items-center justify-center">
                        <View className="w-1 h-1 rounded-full bg-[#007AFF]" />
                    </View>
                </View>

                {/* Instruction Pill */}
                <View className="mt-4 px-4 py-2 rounded-full bg-black/60 border border-white/10 flex-row items-center gap-2">
                    <MaterialIcons name="crop-free" size={18} color="#007AFF" />
                    <Text className="text-[13px] text-white" style={{ fontWeight: '600' }}>{getInstructionText()}</Text>
                </View>

                {/* Mode Selector */}
                <View className="mt-3 flex-row items-center gap-1.5 p-1 rounded-full bg-black/45 border border-white/10">
                    <Pressable
                        onPress={() => setScanMode('single')}
                        className={`px-3.5 py-1 rounded-full ${scanMode === 'single' ? 'bg-[#007AFF]' : 'bg-transparent'}`}
                    >
                        <Text className={`text-[12px] ${scanMode === 'single' ? 'text-white' : 'text-white/70'}`} style={{ fontWeight: '600' }}>Single Problem</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setScanMode('worksheet')}
                        className={`px-3.5 py-1 rounded-full ${scanMode === 'worksheet' ? 'bg-[#007AFF]' : 'bg-transparent'}`}
                    >
                        <Text className={`text-[12px] ${scanMode === 'worksheet' ? 'text-white' : 'text-white/70'}`} style={{ fontWeight: '600' }}>Full Worksheet</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setScanMode('diagram')}
                        className={`px-3.5 py-1 rounded-full ${scanMode === 'diagram' ? 'bg-[#007AFF]' : 'bg-transparent'}`}
                    >
                        <Text className={`text-[12px] ${scanMode === 'diagram' ? 'text-white' : 'text-white/70'}`} style={{ fontWeight: '600' }}>Diagram</Text>
                    </Pressable>
                </View>
            </View>

            {/* Bottom Controls */}
            <View className="w-full flex-col gap-3 px-5 pb-5 z-20" style={{ paddingBottom: Math.max(insets.bottom, 20) + 40 }}>
                
                {/* Recent Scans Tray */}
                <View className="w-full">
                    <View className="flex-row items-center gap-1.5 px-1 mb-2">
                        <MaterialIcons name="history" size={16} color="#007AFF" />
                        <Text className="text-[12px] text-white/75 uppercase tracking-wider" style={{ fontWeight: '600' }}>Recent Scans</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 2 }}>
                        {MOCK_RECENT_SCANS.map(scan => (
                            <Pressable
                                key={scan.id}
                                className="flex-row items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/10 border border-white/15"
                                
                            >
                                <View className="w-8 h-8 rounded-xl bg-black/40 border border-white/20 items-center justify-center">
                                    <MaterialIcons name="image" size={16} color="#FFFFFF" />
                                </View>
                                <View>
                                    <Text className="text-[13px] text-white leading-tight" style={{ fontWeight: '700' }}>{scan.title}</Text>
                                    <Text className="text-[10px] tracking-wide" style={{ fontWeight: '600', color: scan.color }}>{scan.subtitle}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Action Bar */}
                <View className="w-full flex-row items-center justify-between py-1">
                    {/* Left: Library */}
                    <View className="w-20 items-start">
                        <Pressable
                            
                            onPress={pickImage}
                            className="items-center gap-1"
                        >
                            <View className="w-13 h-13 p-3 rounded-2xl bg-black/45 border border-white/15 items-center justify-center">
                                <MaterialIcons name="photo-library" size={24} color="#FFFFFF" />
                            </View>
                            <Text className="text-[11px] text-white/80 mt-1" style={{ fontWeight: '600' }}>Library</Text>
                        </Pressable>
                    </View>

                    {/* Center: Shutter Button */}
                    <View className="flex-1 items-center">
                        <Pressable
                            
                            onPress={handleCapture}
                            disabled={loading}
                            className="w-[76px] h-[76px] rounded-full bg-white/15 border-2 border-white items-center justify-center p-1"
                            style={{ shadowColor: '#007AFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 14 }}
                        >
                            <View className="w-full h-full rounded-full border-2 border-[#007AFF]/60 items-center justify-center p-1">
                                <View className={`w-full h-full rounded-full bg-white items-center justify-center transition-all ${loading ? 'scale-75 bg-[#007AFF]' : ''}`}>
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <View className="w-5 h-5 rounded-full bg-[#007AFF]/20 border border-[#007AFF]/40" />
                                    )}
                                </View>
                            </View>
                        </Pressable>
                    </View>

                    {/* Right: Flip Camera */}
                    <View className="w-20 items-end">
                        <Pressable
                            
                            onPress={() => {
                                haptics.selectionAsync();
                                setFacing(prev => (prev === 'back' ? 'front' : 'back'));
                            }}
                            className="items-center gap-1"
                        >
                            <View className="w-13 h-13 p-3 rounded-2xl bg-black/45 border border-white/15 items-center justify-center">
                                <MaterialIcons name="flip-camera-ios" size={24} color="#FFFFFF" />
                            </View>
                            <Text className="text-[11px] text-white/80 mt-1" style={{ fontWeight: '600' }}>Flip</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    glow: {
        shadowColor: '#007AFF',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
    },
});
