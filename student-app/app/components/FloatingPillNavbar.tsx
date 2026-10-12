import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

type NavItem = {
  key: string;
  label: string;
  route: string;
};

const ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', route: '/' },
  { key: 'scan', label: 'Scan', route: '/scan' },
  { key: 'chat', label: 'Chat', route: '/chat' },
];

export default function FloatingPillNavbar() {
  const router = useRouter();

  return (
    <View style={{
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 28,
      alignItems: 'center',
      zIndex: 50,
    }}>
      <View style={{
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 40,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 8,
      }}>
        {ITEMS.map((it) => (
          <TouchableOpacity
            key={it.key}
            onPress={() => router.push(it.route as any)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              marginHorizontal: 4,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel={it.label}
          >
            <Text style={{ color: '#007aff', fontWeight: '600' }}>{it.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
