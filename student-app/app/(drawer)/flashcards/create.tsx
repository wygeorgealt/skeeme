import React, { useCallback, useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {FlashcardEditor} from '@/components/flashcards/FlashcardEditor';
import { createDeckFromTopic, createDeckFromExtraction } from '@/lib/flashcardsService';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '@/lib/api';
import { router } from 'expo-router';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function GenerateFlashcardScreen() {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const onGenerate = useCallback(async ({ topic, count, contentFocus }: { topic?: string; count: number; contentFocus: string[] }) => {
        try {
            setLoading(true);
            if (!topic || !topic.trim()) return Alert.alert('Required', 'Please enter a topic.');
            const deck = await createDeckFromTopic(topic.trim(), count);
            if (deck?.id) router.replace(`/(drawer)/flashcards/${deck.id}` as any);
            else Alert.alert('Error', 'Could not create deck');
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to create deck');
        } finally {
            setLoading(false);
        }
    }, []);

    const onPickFile = useCallback(async () => {
        try {
            const r = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'] });
            if (!r.canceled && r.assets && r.assets[0]) {
                const asset = r.assets[0];
                // upload for extraction
                const fd = new FormData();
                // @ts-ignore
                fd.append('file', { uri: asset.uri, name: asset.name || 'upload', type: asset.mimeType || 'application/octet-stream' } as any);
                fd.append('type', 'flashcard');
                const res = await api.post('files/extract', fd, { headers: { 'Content-Type': 'multipart/form-data' } } as any);
                const extractionId = res.data?.extraction_id;
                if (extractionId) {
                    const deck = await createDeckFromExtraction(extractionId);
                    if (deck?.id) router.replace(`/(drawer)/flashcards/${deck.id}` as any);
                } else {
                    Alert.alert('Extraction Failed', 'Could not extract text from document.');
                }
            }
        } catch (e: any) {
            Alert.alert('Upload Error', e?.response?.data?.message || 'Failed to upload document');
        }
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}> 
            <ScreenHeader 
                title="Generate Flashcards" 
                subtitle="Transform notes or topics into active recall decks" 
            />
            <FlashcardEditor onGenerate={onGenerate} onPickFile={onPickFile} />
        </View>
    );
}
