import React, { useState } from 'react';
import { Pressable,  View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { haptics } from '@/lib/haptics';

interface AiSummaryViewProps {
  title: string;
  subtitle: string;
  conceptText: string;
  keyPoints: string[];
  mainFormula?: {
    expression: string;
    variables: { label: string; name: string; direction?: 'up' | 'down' }[];
  };
  relatedFormulas: { title: string; expression: string; icon: any }[];
  onBack: () => void;
}

export function AiSummaryView(props: AiSummaryViewProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'mindmap'>('notes');

  const handleTabPress = (tab: 'notes' | 'mindmap') => {
    haptics.selectionAsync(true);
    setActiveTab(tab);
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-1 pb-3 flex-row items-center justify-between shrink-0">
        <Pressable
          onPress={() => {
            haptics.selectionAsync(true);
            props.onBack();
          }}
          className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm border border-outline-variant active:scale-95 transition-transform shrink-0"
        >
          <MaterialIcons name="arrow-back-ios-new" size={20} className="text-on-surface" />
        </Pressable>
        <View className="flex-col items-center justify-center text-center px-2 flex-1">
          <Text className="text-[17px] font-bold text-on-surface tracking-tight leading-snug">{props.title || 'Summary'}</Text>
          <Text className="text-[12px] font-medium text-on-surface-variant tracking-tight">{props.subtitle}</Text>
        </View>
        <Pressable
          className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm border border-outline-variant active:scale-95 transition-transform shrink-0"
        >
          <MaterialIcons name="more-horiz" size={20} className="text-on-surface" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}>
        {/* Format Tabs */}
        <View className="flex-row items-center space-x-2.5 pt-1 pb-1 mb-4">
          <Pressable
            onPress={() => handleTabPress('notes')}
            className={`px-5 py-2.5 rounded-full border border-outline-variant transition-all ${
              activeTab === 'notes' ? 'bg-surface-container-lowest shadow-sm' : 'bg-surface'
            }`}
          >
            <Text className={`font-medium text-[13px] ${activeTab === 'notes' ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              Notes
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabPress('mindmap')}
            className={`px-5 py-2.5 rounded-full border border-outline-variant transition-all ${
              activeTab === 'mindmap' ? 'bg-surface-container-lowest shadow-sm' : 'bg-surface'
            }`}
          >
            <Text className={`font-medium text-[13px] ${activeTab === 'mindmap' ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              Mind Map
            </Text>
          </Pressable>
        </View>

        {/* Main Summary Card */}
        <View className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-outline-variant relative mb-4">
          <Text 
            className="text-on-surface-variant mb-4" 
            style={{ fontSize: 15, fontWeight: '400', lineHeight: 23 }}
          >
            {props.conceptText}
          </Text>

          <Text 
            className="text-on-surface mb-2" 
            style={{ fontSize: 14, fontWeight: '600' }}
          >
            Key Points
          </Text>
          <View className="mb-4">
            {props.keyPoints.map((point, idx) => (
              <View key={idx} className="flex-row items-start mb-2">
                <View className="w-1.5 h-1.5 rounded-full bg-on-surface-variant mt-2 mr-2 shrink-0" />
                <Text 
                  className="text-on-surface-variant flex-1" 
                  style={{ fontSize: 13, fontWeight: '400', lineHeight: 20 }}
                >
                  {point}
                </Text>
              </View>
            ))}
          </View>

          {/* Visual Formula Box */}
          {props.mainFormula && (
            <View className="w-full bg-surface-container-low rounded-2xl p-4 border border-outline-variant flex-row items-center justify-between">
              <View className="flex-1 flex-col justify-center">
                <View className="flex-row justify-between mb-2 px-1">
                  {props.mainFormula.variables.map((v, i) => (
                    <View key={i} className="items-center flex-1">
                      <Text className="text-[11px] text-on-surface-variant font-medium">{v.label}</Text>
                      {v.direction && (
                        <MaterialIcons 
                          name={v.direction === 'up' ? 'arrow-upward' : 'arrow-downward'} 
                          size={10} 
                          className="text-on-surface-variant mt-0.5" 
                        />
                      )}
                    </View>
                  ))}
                </View>
                <View className="items-center justify-center pt-2 border-t border-outline-variant">
                  <Text className="text-[22px] font-bold text-on-surface tracking-wider">
                    {props.mainFormula.expression}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Important Formulas Carousel */}
        {props.relatedFormulas && props.relatedFormulas.length > 0 && (
          <View className="pt-1">
            <Text 
              className="text-on-surface tracking-tight mb-2.5" 
              style={{ fontSize: 14, fontWeight: '700' }}
            >
              Important Formulas
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="-mx-5 px-5 pb-2"
              contentContainerStyle={{ paddingRight: 40 }}
            >
              {props.relatedFormulas.map((f, idx) => (
                <View 
                  key={idx} 
                  className="bg-surface-container-lowest rounded-2xl p-4 w-40 shadow-sm mr-3 border border-outline-variant flex-col justify-between"
                  style={{ minHeight: 100 }}
                >
                  <View className="flex-row items-center mb-3">
                    <View className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center mr-2">
                      <MaterialIcons name={f.icon as any} size={18} className="text-on-primary-container" />
                    </View>
                    <Text className="text-[13px] font-bold text-on-surface flex-1">{f.title}</Text>
                  </View>
                  <Text className="text-[12px] text-on-surface-variant font-medium">
                    {f.expression}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
