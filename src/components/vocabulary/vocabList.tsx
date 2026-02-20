import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useVocabulary } from '../../hooks/vocabulary/useVocabulary';
import { PartOfSpeech, Word } from "../../types/word";

export const VocabList = () => {
    const { words, isLoading, error, refresh, deleteWord, toggleFavorite } = useVocabulary();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<PartOfSpeech | 'all'>('all');

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
        return new Date(timestamp).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    };

    const handleDelete = (id: string, word: string) => {
        Alert.alert(
            "Kelimeyi Sil",
            `"${word}" kelimesini silmek istediğinize emin misiniz?`,
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: async () => {
                        await deleteWord(id);
                        Alert.alert("Başarılı", "Kelime silindi.");
                    }
                }
            ]
        );
    };

    const filteredWords = useMemo(() => {
        let filtered = words;

        // Kelime türü filtreleme
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(item => item.partOfSpeech === selectedFilter);
        }

        // Arama filtreleme
        if (searchQuery.trim()) {
            filtered = filtered.filter(item => {
                const itemData = `${item.word.toUpperCase()} ${item.meaning.toUpperCase()} ${item.partOfSpeech.toUpperCase()}`;
                const textData = searchQuery.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
        }

        // Tarihe göre sırala (en yeni en üstte)
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
    }, [words, searchQuery, selectedFilter]);

    const renderItem = ({ item }: { item: Word }) => {
        const themeColor = getPosColor(item.partOfSpeech);

        return (
            <View style={styles.tableRow}>
                {/* Sol Kısım: Kelime ve Tip */}
                <View style={styles.mainInfo}>
                    <View style={styles.wordRow}>
                        <Text style={styles.wordText} numberOfLines={1}>{item.word}</Text>
                        {item.isFavorite && (
                            <Ionicons name="star" size={14} color="#FFD700" />
                        )}
                    </View>
                    <View style={[styles.posBadge, { borderColor: themeColor }]}>
                        <Text style={[styles.posText, { color: themeColor }]}>
                            {item.partOfSpeech.substring(0, 3)}
                        </Text>
                    </View>
                    {item.familiarity !== undefined && item.familiarity > 0 && (
                        <View style={styles.familiarityBar}>
                            <View
                                style={[
                                    styles.familiarityFill,
                                    {
                                        width: `${(item.familiarity / 5) * 100}%`,
                                        backgroundColor: themeColor
                                    }
                                ]}
                            />
                        </View>
                    )}
                </View>

                {/* Orta Kısım: Anlam */}
                <View style={styles.meaningInfo}>
                    <Text style={styles.meaningText} numberOfLines={2}>{item.meaning}</Text>
                    {item.examples && item.examples.length > 0 && (
                        <Text style={styles.exampleHint}>
                            {item.examples.length} örnek cümle
                        </Text>
                    )}
                </View>

                {/* Sağ Kısım: Tarih ve Aksiyonlar */}
                <View style={styles.metaInfo}>
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    <View style={styles.rowActions}>
                        <TouchableOpacity
                            style={styles.smallAction}
                            onPress={() => toggleFavorite(item.id)}
                        >
                            <Ionicons
                                name={item.isFavorite ? "star" : "star-outline"}
                                size={18}
                                color={item.isFavorite ? "#FFD700" : "#007AFF"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.smallAction}
                            onPress={() => handleDelete(item.id, item.word)}
                        >
                            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderFilterButton = (filter: PartOfSpeech | 'all', label: string) => {
        const isActive = selectedFilter === filter;
        const color = filter === 'all' ? '#007AFF' : getPosColor(filter as PartOfSpeech);

        return (
            <TouchableOpacity
                key={filter}
                style={[
                    styles.filterButton,
                    isActive && {
                        backgroundColor: color + '15',
                        borderColor: color
                    }
                ]}
                onPress={() => setSelectedFilter(filter)}
            >
                <Text
                    style={[
                        styles.filterButtonText,
                        isActive && { color, fontWeight: '700' }
                    ]}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle" size={48} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

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

                {/* Filtre Butonları */}
                <View style={styles.filterContainer}>
                    {renderFilterButton('all', 'Tümü')}
                    {renderFilterButton('noun', 'İsim')}
                    {renderFilterButton('verb', 'Fiil')}
                    {renderFilterButton('adjective', 'Sıfat')}
                    {renderFilterButton('adverb', 'Zarf')}
                </View>

                {/* İstatistik Satırı */}
                <View style={styles.statsBar}>
                    <Text style={styles.statsText}>
                        <Text style={styles.boldText}>{filteredWords.length}</Text> Kelime Listeleniyor
                    </Text>
                    {words.length > 0 && (
                        <Text style={styles.totalText}>
                            (Toplam: {words.length})
                        </Text>
                    )}
                </View>
            </View>

            {/* Liste Başlıkları */}
            <View style={styles.tableHeader}>
                <Text style={[styles.headerLabel, { flex: 2.5 }]}>KELİME</Text>
                <Text style={[styles.headerLabel, { flex: 3.5 }]}>ANLAM</Text>
                <Text style={[styles.headerLabel, { flex: 2, textAlign: 'right' }]}>
                    TARİH / İŞLEM
                </Text>
            </View>

            {isLoading && words.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredWords}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading && words.length > 0}
                            onRefresh={refresh}
                            tintColor="#007AFF"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="book-outline" size={64} color="#E5E5EA" />
                            <Text style={styles.emptyText}>
                                {searchQuery.trim() || selectedFilter !== 'all'
                                    ? 'Kelime bulunamadı.'
                                    : 'Henüz kelime eklenmemiş.'}
                            </Text>
                            {!searchQuery.trim() && selectedFilter === 'all' && (
                                <Text style={styles.emptyHint}>
                                    "Ekle" butonuna tıklayarak yeni kelime ekleyebilirsiniz.
                                </Text>
                            )}
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingTop: 10
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 15
    },

    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: '#E5E5EA'
    },
    filterButtonText: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600'
    },

    statsBar: {
        marginTop: 10,
        paddingLeft: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    statsText: {
        fontSize: 13,
        color: '#636366'
    },
    boldText: {
        fontWeight: '700',
        color: '#000'
    },
    totalText: {
        fontSize: 11,
        color: '#8E8E93'
    },

    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        marginTop: 10
    },
    headerLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#8E8E93',
        letterSpacing: 0.5
    },

    listContent: {
        paddingBottom: 20,
        flexGrow: 1
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    mainInfo: {
        flex: 2.5,
        flexDirection: 'column',
        gap: 4
    },
    wordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    wordText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E'
    },
    posBadge: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4
    },
    posText: {
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    familiarityBar: {
        height: 3,
        backgroundColor: '#E5E5EA',
        borderRadius: 1.5,
        width: '80%',
        marginTop: 2,
        overflow: 'hidden'
    },
    familiarityFill: {
        height: '100%',
        borderRadius: 1.5
    },

    meaningInfo: {
        flex: 3.5,
        paddingRight: 10,
        gap: 3
    },
    meaningText: {
        fontSize: 14,
        color: '#3A3A3C'
    },
    exampleHint: {
        fontSize: 10,
        color: '#8E8E93',
        fontStyle: 'italic'
    },

    metaInfo: {
        flex: 2,
        alignItems: 'flex-end',
        gap: 6
    },
    dateText: {
        fontSize: 11,
        color: '#8E8E93'
    },
    rowActions: {
        flexDirection: 'row',
        gap: 12
    },
    smallAction: {
        padding: 2
    },

    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: 40
    },
    emptyText: {
        color: '#8E8E93',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center'
    },
    emptyHint: {
        color: '#C7C7CC',
        fontSize: 13,
        marginTop: 8,
        textAlign: 'center'
    },

    errorText: {
        color: '#FF3B30',
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center'
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600'
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#8E8E93'
    }
});