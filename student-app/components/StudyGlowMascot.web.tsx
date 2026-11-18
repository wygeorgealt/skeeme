import { Image, StyleSheet, View } from 'react-native';

export default function StudyGlowMascot() {
    return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/images/study-glow-idle.png')}
                style={styles.mascot}
                resizeMode="contain"
                accessibilityLabel="Skeemy ready to help with your study plan"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 250,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mascot: {
        width: 250,
        height: 250,
    },
});
