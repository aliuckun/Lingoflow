import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { PartOfSpeech, Word } from "../../types/word";

// --- MOCK DATA ---
const MOCK_WORDS: Word[] = [
    {
        id: '1', word: 'Persistence', meaning: 'Süreklilik, Kararlılık', partOfSpeech: 'noun', createdAt: 1737805200000,
        examples: [], familiarity: 4
    },
    {
        id: '2', word: 'Achieve', meaning: 'Başarmak, elde etmek', partOfSpeech: 'verb', createdAt: 1737632400000,
        examples: []
    },
    {
        id: '3', word: 'Eloquent', meaning: 'Hitabeti güçlü', partOfSpeech: 'adjective', createdAt: 1737718800000,
        examples: []
    },
    {
        id: '4', word: 'Quickly', meaning: 'Hızlıca', partOfSpeech: 'adverb', createdAt: 1737546000000,
        examples: []
    }
];

export const VocabList = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const getPosColor = (pos: PartOfSpeech): string => {
        switch (pos) {
            case 'noun': return '#5856D6';
            case 'verb': return '#FF9500';
            case 'adjective': return '#34C759';
            case 'adverb': return '#AF52DE';
            case 'preposition': return '#5AC8FA';
            case 'conjunction': return '#FF2D55';
            case 'pronoun': return '#FFCC00';
            default: return '#8E8E93';
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    const filteredWords = useMemo(() => {
        return MOCK_WORDS.filter(item => {
            const itemData = `${item.word.toUpperCase()} ${item.meaning.toUpperCase()} ${item.partOfSpeech.toUpperCase()}`;
            const textData = searchQuery.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });
    }, [searchQuery]);

    const renderItem = ({ item }: { item: Word }) => {
        const themeColor = getPosColor(item.partOfSpeech);

        return (
            <View style={styles.tableRow}>
                {/* Sol Kısım: Kelime ve Tip */}
                <View style={styles.mainInfo}>
                    <Text style={styles.wordText} numberOfLines={1}>{item.word}</Text>
                    <View style={[styles.posBadge, { borderColor: themeColor }]}>
                        <Text style={[styles.posText, { color: themeColor }]}>{item.partOfSpeech.substring(0, 3)}</Text>
                    </View>
                </View>

                {/* Orta Kısım: Anlam */}
                <View style={styles.meaningInfo}>
                    <Text style={styles.meaningText} numberOfLines={2}>{item.meaning}</Text>
                </View>

                {/* Sağ Kısım: Tarih ve Aksiyonlar */}
                <View style={styles.metaInfo}>
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    <View style={styles.rowActions}>
                        <TouchableOpacity style={styles.smallAction}>
                            <Ionicons name="volume-medium" size={18} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.smallAction}>
                            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Arama Bölümü */}
            <View style={styles.searchContainer}>
                <View style={styles.searchSection}>
                    <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Kelime ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                </View>

                {/* İstatistik Satırı */}
                <View style={styles.statsBar}>
                    <Text style={styles.statsText}>
                        <Text style={styles.boldText}>{filteredWords.length}</Text> Kelime Listeleniyor
                    </Text>
                </View>
            </View>

            {/* Liste Başlıkları (Tablo görünümü için) */}
            <View style={styles.tableHeader}>
                <Text style={[styles.headerLabel, { flex: 2.5 }]}>KELİME</Text>
                <Text style={[styles.headerLabel, { flex: 3.5 }]}>ANLAM</Text>
                <Text style={[styles.headerLabel, { flex: 2, textAlign: 'right' }]}>TARİH / İŞLEM</Text>
            </View>

            <FlatList
                data={filteredWords}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Kelime bulunamadı.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    searchContainer: { paddingHorizontal: 20, paddingTop: 10 },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 15 },

    statsBar: { marginTop: 10, paddingLeft: 5 },
    statsText: { fontSize: 13, color: '#636366' },
    boldText: { fontWeight: '700', color: '#000' },

    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        marginTop: 10
    },
    headerLabel: { fontSize: 11, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.5 },

    listContent: { paddingBottom: 20 },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    mainInfo: { flex: 2.5, flexDirection: 'column', gap: 4 },
    wordText: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
    posBadge: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4
    },
    posText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },

    meaningInfo: { flex: 3.5, paddingRight: 10 },
    meaningText: { fontSize: 14, color: '#3A3A3C' },

    metaInfo: { flex: 2, alignItems: 'flex-end', gap: 6 },
    dateText: { fontSize: 11, color: '#8E8E93' },
    rowActions: { flexDirection: 'row', gap: 12 },
    smallAction: { padding: 2 },

    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#8E8E93', fontSize: 14 }
});