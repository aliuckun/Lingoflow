import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddVocab } from '../../components/vocabulary/addVocab';
import { VocabList } from '../../components/vocabulary/vocabList';

export default function VocabScreen() {
    const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

    return (
        <SafeAreaView style={styles.container}>
            {/* Özel Tab Bar */}
            <View style={styles.header}>
                <Text style={styles.title}>Sözlüğüm</Text>
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'list' && styles.activeTab]}
                        onPress={() => setActiveTab('list')}
                    >
                        <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>Kelimelerim</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'add' && styles.activeTab]}
                        onPress={() => setActiveTab('add')}
                    >
                        <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>Kelime Ekle</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Dinamik İçerik */}
            <View style={styles.content}>
                {activeTab === 'list' ? (
                    <VocabList />
                ) : (
                    <AddVocab onSuccess={() => setActiveTab('list')} />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { paddingHorizontal: 20, paddingTop: 10, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 15 },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        padding: 2,
        marginBottom: 10
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8
    },
    activeTab: { backgroundColor: '#fff', elevation: 2, shadowOpacity: 0.1 },
    tabText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
    activeTabText: { color: '#007AFF' },
    content: { flex: 1 }
});