import React, { useCallback, useState } from 'react';
import { View, Alert } from 'react-native';
import { FlashcardEditor } from '@/components/flashcards/FlashcardEditor';
import { createDeckFromTopic, createDeckFromExtraction } from '@/lib/flashcardsService';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '@/lib/api';
import { router, useLocalSearchParams } from 'expo-router';
import { flashcardCost, verifySufficientCredits } from '@/lib/creditCosts';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function GenerateFlashcardScreen() {
    const params = useLocalSearchParams<{ topic?: string }>();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [extractionId, setExtractionId] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);

    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const onPickFile = useCallback(async () => {
        try {
            const r = await DocumentPicker.getDocumentAsync({ 
                type: [
                    'application/pdf', 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                    'text/plain', 
                    'text/markdown'
                ] 
            });

            if (!r.canceled && r.assets && r.assets[0]) {
                const asset = r.assets[0];
                if (asset.size && asset.size > 25 * 1024 * 1024) {
                    Alert.alert('File too large', 'Please upload a file smaller than 25MB.');
                    return;
                }

                setSelectedFile(asset);
                setExtractionId(null);
                setIsExtracting(true);

                try {
                    const fd = new FormData();
                    fd.append('file', {
                        uri: asset.uri,
                        name: asset.name || 'document',
                        type: asset.mimeType || 'application/octet-stream',
                    } as any);
                    fd.append('type', 'flashcard');

                    const res = await api.post('files/extract', fd, { 
                        headers: { 'Content-Type': 'multipart/form-data' },
                        skipGlobalError: true,
                    } as any);

                    const extId = res.data?.extraction_id;
                    if (extId) {
                        setExtractionId(extId);
                    } else {
                        Alert.alert('Extraction Failed', 'Could not extract text from document.');
                        setSelectedFile(null);
                    }
                } catch (e: any) {
                    Alert.alert('Extraction Failed', e?.response?.data?.message || 'Could not extract text from document.');
                    setSelectedFile(null);
                } finally {
                    setIsExtracting(false);
                }
            }
        } catch (e: any) {
            setIsExtracting(false);
            Alert.alert('Upload Error', e?.response?.data?.message || 'Failed to select document');
        }
    }, []);

    const onClearFile = useCallback(() => {
        setSelectedFile(null);
        setExtractionId(null);
        setIsExtracting(false);
    }, []);

    const onGenerate = useCallback(async ({ 
        topic, 
        count, 
        mode 
    }: { 
        topic?: string; 
        count: number; 
        contentFocus: string[]; 
        mode: 'topic' | 'file';
    }) => {
        try {
            setLoading(true);

            if (mode === 'topic') {
                if (!topic || !topic.trim()) {
                    Alert.alert('Required', 'Please enter a topic.');
                    return;
                }
            } else {
                if (!selectedFile) {
                    Alert.alert('Required', 'Please select a document.');
                    return;
                }
                if (isExtracting) {
                    Alert.alert('Processing', 'Please wait for document extraction to finish.');
                    return;
                }
                if (!extractionId) {
                    Alert.alert('Required', 'Could not read document text. Please upload again.');
                    return;
                }
            }

            // Universal fresh credit check before deck creation or routing
            const requiredCredits = flashcardCost(count || 15);
            const canAfford = await verifySufficientCredits(requiredCredits, 'flashcard', true);
            if (!canAfford) {
                return;
            }

            if (mode === 'file') {
                const deckTitle = selectedFile?.name?.replace(/\.[^/.]+$/, '') || 'Document Flashcards';
                const deck = await createDeckFromExtraction(extractionId!, deckTitle);
                if (deck?.id) {
                    router.replace({
                        pathname: '/(drawer)/flashcards/[id]',
                        params: {
                            id: String(deck.id),
                            autoStart: 'true',
                            topic: deckTitle,
                            card_count: String(count || 15),
                            extraction_id: extractionId!,
                        },
                    } as any);
                } else {
                    Alert.alert('Error', 'Could not create deck from document');
                }
            } else {
                const deck = await createDeckFromTopic(topic!.trim(), count);
                if (deck?.id) {
                    router.replace({
                        pathname: '/(drawer)/flashcards/[id]',
                        params: {
                            id: String(deck.id),
                            autoStart: 'true',
                            topic: topic!.trim(),
                            card_count: String(count || 15),
                        },
                    } as any);
                } else {
                    Alert.alert('Error', 'Could not create deck');
                }
            }
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to create deck');
        } finally {
            setLoading(false);
        }
    }, [selectedFile, extractionId, isExtracting]);

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}> 
            <ScreenHeader title="Create Flashcards" />
            <FlashcardEditor 
                onGenerate={onGenerate} 
                onPickFile={onPickFile} 
                selectedFile={selectedFile}
                isExtracting={isExtracting}
                onClearFile={onClearFile}
                initialTopic={params.topic} 
            />
        </View>
    );
}
