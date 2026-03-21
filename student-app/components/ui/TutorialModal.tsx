import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Camera, Book, Flash, NavArrowRight, Check } from 'iconoir-react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface TutorialModalProps {
    visible: boolean;
    onDismiss: () => void;
}

const slides = [
    {
        id: 1,
        title: "Welcome to Skeeme",
        description: "The AI tutor that helps you study 5x faster. Let's show you the ropes.",
        icon: <Flash width={48} height={48} color="#8B5CF6" />,
        color: "#8B5CF6"
    },
    {
        id: 2,
        title: "Scan & Solve",
        description: "Snap a photo of any problem or note. Our AI will solve it and explain the 'why' instantly.",
        icon: <Camera width={48} height={48} color="#8B5CF6" />,
        color: "#8B5CF6"
    },
    {
        id: 3,
        title: "Master Your Notes",
        description: "Convert your files into interactive Quizzes and Flashcards. Study smarter, not harder.",
        icon: <Book width={48} height={48} color="#8B5CF6" />,
        color: "#8B5CF6"
    }
];

export function TutorialModal({ visible, onDismiss }: TutorialModalProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onDismiss();
        }
    };

    if (!visible) return null;

    const slide = slides[currentSlide];

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={s.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                
                <Animated.View 
                    entering={FadeIn.duration(400)} 
                    exiting={FadeOut.duration(400)}
                    style={s.container}
                >
                    {/* Progress Dots */}
                    <View style={s.progressRow}>
                        {slides.map((_, i) => (
                            <View 
                                key={i} 
                                style={[
                                    s.dot, 
                                    i === currentSlide ? s.dotActive : s.dotInactive
                                ]} 
                            />
                        ))}
                    </View>

                    <Animated.View 
                        key={currentSlide}
                        entering={SlideInRight.duration(400)}
                        exiting={SlideOutLeft.duration(400)}
                        style={s.content}
                    >
                        <View style={s.iconWrapper}>
                            {slide.icon}
                        </View>
                        
                        <Text style={s.title}>{slide.title}</Text>
                        <Text style={s.description}>{slide.description}</Text>
                    </Animated.View>

                    <TouchableOpacity 
                        onPress={handleNext}
                        activeOpacity={0.8}
                        style={s.nextBtn}
                    >
                        <Text style={s.nextBtnText}>
                            {currentSlide === slides.length - 1 ? 'Start Studying' : 'Next'}
                        </Text>
                        {currentSlide === slides.length - 1 ? (
                            <Check width={20} height={20} color="white" />
                        ) : (
                            <NavArrowRight width={20} height={20} color="white" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onDismiss} style={s.skipBtn}>
                        <Text style={s.skipText}>Skip tutorial</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32
    },
    container: {
        width: '100%',
        backgroundColor: '#1E293B',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 10
    },
    progressRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 32
    },
    dot: {
        height: 6,
        borderRadius: 3
    },
    dotActive: {
        width: 24,
        backgroundColor: '#8B5CF6'
    },
    dotInactive: {
        width: 6,
        backgroundColor: '#475569'
    },
    content: {
        alignItems: 'center',
        width: '100%',
        marginBottom: 40
    },
    iconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
        textAlign: 'center',
        marginBottom: 12
    },
    description: {
        fontSize: 16,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 12
    },
    nextBtn: {
        width: '100%',
        height: 56,
        backgroundColor: '#8B5CF6',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5
    },
    nextBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700'
    },
    skipBtn: {
        marginTop: 20,
        padding: 10
    },
    skipText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600'
    }
});
