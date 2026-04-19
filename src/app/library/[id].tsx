/**
 * src/app/library/[id].tsx
 *
 * Gelişmiş Hikaye Okuma Ekranı:
 * - Kelimeye dokununca MyMemory API ile Almanca→Türkçe çeviri
 * - Çevrilen kelimeyi tek tıkla sözlüğe kaydet
 * - Paragraf bazlı TTS + tüm hikayeyi otomatik oku
 * - Yazı boyutu ayarı (A- / A+)
 * - Okuma ilerlemesi (paragraf bazlı)
 * - Seviye rozeti + kelime sayısı
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import allStories from '../../../assets/books/german_stories.json';
import { useStoryReader } from '../../hooks/library/useStoryReader';

// ── Seviye renkleri ───────────────────────────────────────────────────────────
const LEVEL_COLOR: Record<string, string> = {
    A1: '#34C759', A2: '#30D158',
    B1: '#007AFF', B2: '#0A84FF',
    C1: '#AF52DE', C2: '#BF5AF2',
};

// ── Kelime bileşeni: dokunulabilir ───────────────────────────────────────────
interface TappableWordProps {
    word: string;
    onPress: (word: string) => void;
    fontSize: number;
    color: string;
}

const TappableWord = React.memo(({ word, onPress, fontSize, color }: TappableWordProps) => {
    // Sadece harf içeren token'ları tıklanabilir yap
    const isWord = /[a-zA-ZäöüÄÖÜß]{3,}/.test(word);

    if (!isWord) {
        return <Text style={{ fontSize, color, lineHeight: fontSize * 1.7 }}>{word}</Text>;
    }

    return (
        <Text
            style={{ fontSize, color, lineHeight: fontSize * 1.7, textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: '#AEAEB2' }}
            onPress={() => onPress(word)}
            suppressHighlighting
        >
            {word}
        </Text>
    );
});

// ── Paragraf tokenizer ────────────────────────────────────────────────────────
function tokenize(text: string): string[] {
    // Kelimeleri ve aralarındaki boşluk/noktalama'yı ayır
    return text.split(/(\s+|(?=[.,!?;:"""„])|(?<=[.,!?;:"""„]))/);
}

// ── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function StoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const story = allStories.find(s => s.id === id);
    const paragraphs = story ? story.text.split('\n\n') : [];

    const {
        fontSize, increaseFontSize, decreaseFontSize,
        speakingIndex, isPlayingAll, speakParagraph, stopSpeaking, playAll,
        translation, translateWord, clearTranslation, saveWordToVocab,
        readParagraphs, markAsRead, readingProgress,
    } = useStoryReader(paragraphs.length);

    const scrollRef = useRef<ScrollView>(null);

    // Çeviri popup fade animasyonu
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [popupVisible, setPopupVisible] = useState(false);

    const handleWordPress = useCallback(async (word: string) => {
        setPopupVisible(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        await translateWord(word);
    }, [translateWord, fadeAnim]);

    const handleClosePopup = useCallback(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            setPopupVisible(false);
            clearTranslation();
        });
    }, [fadeAnim, clearTranslation]);

    if (!story) {
        return (
            <SafeAreaView style={styles.centered}>
                <Ionicons name="book-outline" size={52} color="#C7C7CC" />
                <Text style={styles.notFoundText}>Hikaye bulunamadı.</Text>
            </SafeAreaView>
        );
    }

    const levelColor = LEVEL_COLOR[story.level] ?? '#8E8E93';

    return (
        <>
            <Stack.Screen options={{ title: story.title, headerBackTitle: 'Kitaplık' }} />

            <SafeAreaView style={styles.container} edges={['bottom']}>

                {/* ── Üst Araç Çubuğu ─────────────────────────────────────── */}
                <View style={styles.toolbar}>
                    {/* Yazı boyutu */}
                    <View style={styles.toolGroup}>
                        <TouchableOpacity style={styles.toolBtn} onPress={decreaseFontSize}>
                            <Text style={styles.toolBtnText}>A−</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolBtn} onPress={increaseFontSize}>
                            <Text style={[styles.toolBtnText, { fontSize: 16 }]}>A+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Oynatma kontrolü */}
                    <TouchableOpacity
                        style={[styles.playAllBtn, isPlayingAll && styles.playAllBtnActive]}
                        onPress={() => isPlayingAll ? stopSpeaking() : playAll(paragraphs)}
                    >
                        <Ionicons
                            name={isPlayingAll ? 'stop-circle' : 'play-circle'}
                            size={20}
                            color={isPlayingAll ? '#FF3B30' : '#007AFF'}
                        />
                        <Text style={[styles.playAllText, isPlayingAll && { color: '#FF3B30' }]}>
                            {isPlayingAll ? 'Durdur' : 'Tümünü Oku'}
                        </Text>
                    </TouchableOpacity>

                    {/* İlerleme */}
                    <View style={styles.progressPill}>
                        <Text style={styles.progressText}>%{readingProgress}</Text>
                    </View>
                </View>

                {/* ── İlerleme Çubuğu ─────────────────────────────────────── */}
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${readingProgress}%` }]} />
                </View>

                {/* ── Başlık Kartı ─────────────────────────────────────────── */}
                <View style={styles.heroCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.heroTitle}>{story.title}</Text>
                        <Text style={styles.heroMeta}>{story.wordCount} kelime</Text>
                    </View>
                    <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
                        <Text style={styles.levelText}>{story.level}</Text>
                    </View>
                </View>

                {/* ── İpucu ────────────────────────────────────────────────── */}
                <View style={styles.hintBar}>
                    <Ionicons name="hand-left-outline" size={13} color="#8E8E93" />
                    <Text style={styles.hintText}>
                        Altı çizili kelimelere dokun → Türkçe çeviri
                    </Text>
                </View>

                {/* ── Hikaye İçeriği ───────────────────────────────────────── */}
                <ScrollView
                    ref={scrollRef}
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    onScrollEndDrag={() => { }} // momentum için
                >
                    {paragraphs.map((para, index) => {
                        const isSpeaking = speakingIndex === index;
                        const isRead = readParagraphs.has(index);
                        const tokens = tokenize(para);

                        return (
                            <Pressable
                                key={index}
                                style={[
                                    styles.paraCard,
                                    isSpeaking && styles.paraCardSpeaking,
                                    isRead && !isSpeaking && styles.paraCardRead,
                                ]}
                                onPress={() => markAsRead(index)}
                            >
                                {/* Paragraf numarası */}
                                <Text style={styles.paraNum}>#{index + 1}</Text>

                                {/* Metin — kelime kelime tıklanabilir */}
                                <Text style={styles.paraTextWrapper}>
                                    {tokens.map((token, ti) => (
                                        <TappableWord
                                            key={ti}
                                            word={token}
                                            onPress={handleWordPress}
                                            fontSize={fontSize}
                                            color={isSpeaking ? '#1C1C1E' : '#2C2C2E'}
                                        />
                                    ))}
                                </Text>

                                {/* Paragraf aksiyonları */}
                                <View style={styles.paraActions}>
                                    {/* Seslendir */}
                                    <TouchableOpacity
                                        style={[styles.paraBtn, isSpeaking && styles.paraBtnActive]}
                                        onPress={() => speakParagraph(para, index)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons
                                            name={isSpeaking ? 'stop-circle' : 'volume-medium-outline'}
                                            size={20}
                                            color={isSpeaking ? '#FF3B30' : '#007AFF'}
                                        />
                                    </TouchableOpacity>

                                    {/* Okundu işareti */}
                                    <TouchableOpacity
                                        style={styles.paraBtn}
                                        onPress={() => markAsRead(index)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons
                                            name={isRead ? 'checkmark-circle' : 'checkmark-circle-outline'}
                                            size={20}
                                            color={isRead ? '#34C759' : '#C7C7CC'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </Pressable>
                        );
                    })}

                    {/* Bitiş kartı */}
                    {readingProgress === 100 && (
                        <View style={styles.finishCard}>
                            <Text style={styles.finishEmoji}>🎉</Text>
                            <Text style={styles.finishTitle}>Hikayeyi bitirdin!</Text>
                            <Text style={styles.finishSub}>
                                {story.wordCount} kelimelik bir metni okudun.
                            </Text>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* ── Çeviri Popup ─────────────────────────────────────────── */}
                {popupVisible && (
                    <Animated.View style={[styles.translationPopup, { opacity: fadeAnim }]}>
                        {translation?.isLoading ? (
                            <View style={styles.popupLoading}>
                                <ActivityIndicator size="small" color="#007AFF" />
                                <Text style={styles.popupLoadingText}>Çevriliyor...</Text>
                            </View>
                        ) : translation?.error ? (
                            <View style={styles.popupError}>
                                <Ionicons name="alert-circle-outline" size={18} color="#FF3B30" />
                                <Text style={styles.popupErrorText}>{translation.error}</Text>
                                <TouchableOpacity onPress={handleClosePopup}>
                                    <Ionicons name="close" size={20} color="#8E8E93" />
                                </TouchableOpacity>
                            </View>
                        ) : translation ? (
                            <View style={styles.popupContent}>
                                {/* Orijinal kelime */}
                                <View style={styles.popupWordRow}>
                                    <View>
                                        <Text style={styles.popupOriginal}>{translation.originalWord}</Text>
                                        <Text style={styles.popupTranslation}>{translation.translation}</Text>
                                    </View>
                                    <TouchableOpacity onPress={handleClosePopup} style={styles.popupClose}>
                                        <Ionicons name="close" size={20} color="#8E8E93" />
                                    </TouchableOpacity>
                                </View>

                                {/* Sözlüğe kaydet */}
                                <TouchableOpacity
                                    style={styles.saveToVocabBtn}
                                    onPress={() => saveWordToVocab(translation.originalWord, translation.translation)}
                                >
                                    <Ionicons name="add-circle-outline" size={16} color="#007AFF" />
                                    <Text style={styles.saveToVocabText}>Sözlüğüme Ekle</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </Animated.View>
                )}

            </SafeAreaView>
        </>
    );
}

// ── Stiller ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    notFoundText: {
        marginTop: 12,
        fontSize: 16,
        color: '#8E8E93',
    },

    // Araç çubuğu
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    toolGroup: {
        flexDirection: 'row',
        gap: 6,
    },
    toolBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
    },
    toolBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    playAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: '#EAF4FF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#C6E0FF',
    },
    playAllBtnActive: {
        backgroundColor: '#FFF0EE',
        borderColor: '#FFD0CC',
    },
    playAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#007AFF',
    },
    progressPill: {
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
    },

    // İlerleme çubuğu
    progressBarBg: {
        height: 3,
        backgroundColor: '#E5E5EA',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#34C759',
    },

    // Başlık kartı
    heroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    heroTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    heroMeta: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    levelBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
        marginLeft: 12,
    },
    levelText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#fff',
    },

    // İpucu
    hintBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F8F9FA',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    hintText: {
        fontSize: 12,
        color: '#8E8E93',
    },

    // Scroll
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },

    // Paragraf kartı
    paraCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    paraCardSpeaking: {
        borderColor: '#007AFF',
        backgroundColor: '#F0F8FF',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    paraCardRead: {
        borderColor: '#D1FAE5',
        backgroundColor: '#F0FDF4',
    },
    paraNum: {
        fontSize: 10,
        fontWeight: '700',
        color: '#C7C7CC',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    paraTextWrapper: {
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    paraActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    paraBtn: {
        padding: 4,
    },
    paraBtnActive: {
        backgroundColor: '#FFF0EE',
        borderRadius: 8,
        padding: 4,
    },

    // Bitiş kartı
    finishCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 28,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#D1FAE5',
    },
    finishEmoji: {
        fontSize: 40,
        marginBottom: 10,
    },
    finishTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1C1C1E',
        marginBottom: 6,
    },
    finishSub: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
    },

    // Çeviri popup
    translationPopup: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 18,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        overflow: 'hidden',
    },
    popupLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 18,
    },
    popupLoadingText: {
        fontSize: 15,
        color: '#8E8E93',
    },
    popupError: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 16,
    },
    popupErrorText: {
        flex: 1,
        fontSize: 14,
        color: '#FF3B30',
    },
    popupContent: {
        padding: 18,
    },
    popupWordRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    popupOriginal: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    popupTranslation: {
        fontSize: 17,
        color: '#007AFF',
        fontWeight: '500',
    },
    popupClose: {
        padding: 4,
    },
    saveToVocabBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 11,
        backgroundColor: '#EAF4FF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#C6E0FF',
    },
    saveToVocabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
});