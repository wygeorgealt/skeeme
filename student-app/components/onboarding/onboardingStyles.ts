import { StyleSheet } from 'react-native';

export const ONBOARDING_BLUE = '#007AFF';
export const ONBOARDING_YELLOW = '#FFDF00';

export const onboardingStyles = StyleSheet.create({
    root: {
        flex: 1,
    },
    body: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 70,
    },
    topSpacer: {
        flex: 1,
        minHeight: 16,
    },
    questionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    mascotWrapper: {
        width: 130,
        height: 130,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubble: {
        maxWidth: 220,
        borderRadius: 22,
        borderWidth: 0,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    bubbleTail: {
        position: 'absolute',
        left: -9,
        top: 24,
        width: 0,
        height: 0,
        borderTopWidth: 8,
        borderBottomWidth: 8,
        borderRightWidth: 10,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    prompt: {
        fontFamily: 'Satoshi-Black',
        fontSize: 20,
        lineHeight: 25,
        letterSpacing: -0.4,
    },
    options: {
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 64,
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    cardSelected: {
        shadowColor: ONBOARDING_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 4,
    },
    cardTextWrap: {
        flex: 1,
        marginRight: 14,
    },
    cardText: {
        fontFamily: 'Satoshi-Bold',
        fontSize: 16,
        lineHeight: 21,
        letterSpacing: -0.1,
    },
    cardSub: {
        marginTop: 3,
        fontFamily: 'Satoshi-Medium',
        fontSize: 13,
        lineHeight: 17,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
});
