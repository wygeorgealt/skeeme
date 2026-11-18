import { useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { CreateBottomSheet } from '@/components/dashboard/CreateBottomSheet';
import { DASHBOARD_THEME } from '@/components/dashboard/dashboardTokens';

export default function CreateTabFallback() {
    const router = useRouter();
    const [visible, setVisible] = useState(true);

    useFocusEffect(() => {
        setVisible(true);
    });

    const handleClose = () => {
        setVisible(false);
        router.replace('/(drawer)/(tabs)');
    };

    return (
        <View style={{ flex: 1, backgroundColor: DASHBOARD_THEME.surface }}>
            <CreateBottomSheet visible={visible} onClose={handleClose} />
        </View>
    );
}
