import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, RefreshControl,
    StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

import { ROUTES } from '../../constants/routes';
import { useVocabulary } from '../../hooks/vocabulary/useVocabulary';
import { Artikel, PartOfSpeech, Word } from '../../types/word';

const ARTIKEL_COLORS: Record<Artikel, string> = {
    der: '#007AFF', die: '#FF2D55', das: '#34C759', pl: '#FF9500'
};

const getPosColor = (pos: PartOfSpeech): string => {
    const map: Record<PartOfSpeech, string> = {
        noun: '#5856D6', verb: '#FF9500', adjective: '#34C759', adverb: '#AF52DE',
        preposition: '#5AC8FA', conjunction: '#FF2D55', pronoun: '#FFCC00', other: '#8E8E93'
    };
    return map[pos] ?? '#8E8E93';
};

const formatDate = (ts: number) => new Date(ts).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' });

export const VocabList = () => {
    const router = useRouter();
    const { words, isLoading, error, refresh, deleteWord, toggleFavorite } = useVocabulary();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<PartOfSpeech | 'all'>('all');

    const handleDelete = (id: string, word: string) => {
        Alert.alert('Kelimeyi Sil', `"${word}" kelimesini silmek istiyor musunuz?`, [
            { text: 'İptal', style: 'cancel' },
            { text: 'Sil', style: 'destructive', onPress: async () => { await deleteWord(id); } }
        ]);
    };

    const filteredWords = useMemo(() => {
        let list = words;
        if (selectedFilter !== 'all') list = list.filter(w => w.partOfSpeech === selectedFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toUpperCase();
            list = list.filter(w => `${w.word} ${w.meaning} ${w.partOfSpeech}`.toUpperCase().includes(q));
        }
        return list.sort((a, b) => b.createdAt - a.createdAt);
    }, [words, searchQuery, selectedFilter]);

    const renderItem = ({ item }: { item: Word }) => {
        const color = getPosColor(item.partOfSpeech);
        // "der Hund" formatı: artikel varsa önüne ekle
        const displayWord = item.partOfSpeech === 'noun' && item.artikel
            ? `${item.artikel} ${item.word}`
            : item.word;
        const artikelColor = item.artikel ? ARTIKEL_COLORS[item.artikel] : color;

        return (
            <TouchableOpacity style={styles.tableRow}
                onPress={() => router.push(ROUTES.VOCABULARY_DETAIL(item.id))} activeOpacity={0.7}>

                {/* Sol: Kelime */}
                <View style={styles.mainInfo}>
                    <View style={styles.wordRow}>
                        {/* Artikel renkli prefix */}
                        {item.partOfSpeech === 'noun' && item.artikel ? (
                            <Text style={styles.wordText} numberOfLines={1}>
                                <Text style={{ color: artikelColor, fontWeight: '700' }}>{item.artikel} </Text>
                                {item.word}
                            </Text>
                        ) : (
                            <Text style={styles.wordText} numberOfLines={1}>{item.word}</Text>
                        )}
                        {item.isFavorite && <Ionicons name="star" size={14} color="#FFD700" />}
                    </View>
                    <View style={[styles.posBadge, { borderColor: color }]}>
                        <Text style={[styles.posText, { color }]}>
                            {item.partOfSpeech.substring(0, 3).toUpperCase()}
                        </Text>
                    </View>
                    {item.familiarity !== undefined && item.familiarity > 0 && (
                        <View style={styles.familiarityBar}>
                            <View style={[styles.familiarityFill, { width: `${(item.familiarity / 5) * 100}%`, backgroundColor: color }]} />
                        </View>
                    )}
                </View>

                {/* Orta: Anlam */}
                <View style={styles.meaningInfo}>
                    <Text style={styles.meaningText} numberOfLines={2}>{item.meaning}</Text>
                    {item.examples?.length > 0 && (
                        <Text style={styles.exampleHint}>{item.examples.length} örnek cümle</Text>
                    )}
                </View>

                {/* Sağ: Tarih + aksiyonlar */}
                <View style={styles.metaInfo}>
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    <View style={styles.rowActions}>
                        <TouchableOpacity style={styles.smallAction}
                            onPress={e => { e.stopPropagation?.(); toggleFavorite(item.id); }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name={item.isFavorite ? 'star' : 'star-outline'} size={20} color={item.isFavorite ? '#FFD700' : '#007AFF'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.smallAction}
                            onPress={e => { e.stopPropagation?.(); handleDelete(item.id, displayWord); }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFilter = (filter: PartOfSpeech | 'all', label: string) => {
        const active = selectedFilter === filter;
        const color = filter === 'all' ? '#007AFF' : getPosColor(filter as PartOfSpeech);
        return (
            <TouchableOpacity key={filter}
                style={[styles.filterButton, active && { backgroundColor: color + '15', borderColor: color }]}
                onPress={() => setSelectedFilter(filter)}>
                <Text style={[styles.filterButtonText, active && { color, fontWeight: '700' }]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    if (error) return (
        <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchSection}>
                    <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput style={styles.searchInput} placeholder="Kelime ara..."
                        placeholderTextColor="#AEAEB2" value={searchQuery} onChangeText={setSearchQuery} clearButtonMode="while-editing" />
                </View>
                <View style={styles.filterContainer}>
                    {renderFilter('all', 'Tümü')}
                    {renderFilter('noun', 'İsim')}
                    {renderFilter('verb', 'Fiil')}
                    {renderFilter('adjective', 'Sıfat')}
                    {renderFilter('adverb', 'Zarf')}
                </View>
                <View style={styles.statsBar}>
                    <Text style={styles.statsText}>
                        <Text style={styles.boldText}>{filteredWords.length}</Text> Kelime Listeleniyor
                    </Text>
                    {words.length > 0 && <Text style={styles.totalText}>(Toplam: {words.length})</Text>}
                </View>
            </View>

            <View style={styles.tableHeader}>
                <Text style={[styles.headerLabel, { flex: 2.5 }]}>KELİME</Text>
                <Text style={[styles.headerLabel, { flex: 3.5 }]}>ANLAM</Text>
                <Text style={[styles.headerLabel, { flex: 2, textAlign: 'right' }]}>TARİH / İŞLEM</Text>
            </View>

            {isLoading && words.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            ) : (
                <FlatList data={filteredWords} keyExtractor={i => i.id} renderItem={renderItem}
                    contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isLoading && words.length > 0} onRefresh={refresh} tintColor="#007AFF" />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="book-outline" size={64} color="#E5E5EA" />
                            <Text style={styles.emptyText}>
                                {searchQuery.trim() || selectedFilter !== 'all' ? 'Kelime bulunamadı.' : 'Henüz kelime eklenmemiş.'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    searchContainer: { paddingHorizontal: 20, paddingTop: 10 },
    searchSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, paddingHorizontal: 12 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#1C1C1E' },
    filterContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    filterButton: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: '#E5E5EA' },
    filterButtonText: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },
    statsBar: { marginTop: 10, paddingLeft: 5, flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 4 },
    statsText: { fontSize: 13, color: '#636366' },
    boldText: { fontWeight: '700', color: '#000' },
    totalText: { fontSize: 11, color: '#8E8E93' },
    tableHeader: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#F8F9FA', borderBottomWidth: 1, borderBottomColor: '#E5E5EA', marginTop: 10 },
    headerLabel: { fontSize: 11, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.5 },
    listContent: { paddingBottom: 20, flexGrow: 1 },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', backgroundColor: '#FFFFFF' },
    mainInfo: { flex: 2.5, flexDirection: 'column', gap: 4 },
    wordRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    wordText: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
    posBadge: { alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
    posText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
    familiarityBar: { height: 3, backgroundColor: '#E5E5EA', borderRadius: 1.5, width: '80%', marginTop: 2, overflow: 'hidden' },
    familiarityFill: { height: '100%', borderRadius: 1.5 },
    meaningInfo: { flex: 3.5, paddingRight: 10, gap: 3 },
    meaningText: { fontSize: 14, color: '#3A3A3C' },
    exampleHint: { fontSize: 10, color: '#8E8E93', fontStyle: 'italic' },
    metaInfo: { flex: 2, alignItems: 'flex-end', gap: 8 },
    dateText: { fontSize: 11, color: '#8E8E93' },
    rowActions: { flexDirection: 'row', gap: 14 },
    smallAction: { padding: 2 },
    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyText: { color: '#8E8E93', fontSize: 16, fontWeight: '600', marginTop: 16, textAlign: 'center' },
    errorText: { color: '#FF3B30', fontSize: 16, marginTop: 16, textAlign: 'center' },
    retryButton: { marginTop: 20, backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    retryButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#8E8E93' },
});
