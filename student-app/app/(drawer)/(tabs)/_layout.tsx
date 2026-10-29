import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { usePathname } from 'expo-router';

export default function MainTabsLayout() {
    const pathname = usePathname();

    return (
        <NativeTabs
            backBehavior="history"
            tintColor="#007AFF"
            hidden={pathname?.includes('/chat') ?? false}
        >
            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    sf={{ default: 'house', selected: 'house.fill' }}
                    md={{ default: 'home', selected: 'home' }}
                />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="history">
                <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    sf={{ default: 'clock', selected: 'clock.fill' }}
                    md={{ default: 'history', selected: 'history' }}
                />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="chat">
                <NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }}
                    md={{ default: 'chat_bubble_outline', selected: 'chat_bubble' }}
                />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
