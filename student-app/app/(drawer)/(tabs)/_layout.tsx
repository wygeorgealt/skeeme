import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function MainTabsLayout() {
    return (
        <NativeTabs
            backBehavior="history"
            tintColor="#007AFF"
        >
            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    sf={{ default: 'house', selected: 'house.fill' }}
                    md={{ default: 'home', selected: 'home' }}
                />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="history" hidden />
            <NativeTabs.Trigger name="chat" hidden />
        </NativeTabs>
    );
}
