/**
 * src/app/(tabs)/index.tsx
 *
 * LingoFlow Ana Sayfa — Günlük Dashboard
 *
 * Tasarım yönü: Sıcak, motive edici, kart bazlı dashboard.
 * Gerçek veri: AsyncStorage'dan kelime istatistikleri.
 * Animasyon: Staggered fade-slide, sayı animasyonu.
 * Özellikler:
 *  - Günün saatine göre selamlama
 *  - Bugünün tarihi + streak (seri) bilgisi
 *  - Canlı istatistik kartları (gerçek veri)
 *  - Hızlı erişim butonları
 *  - Son eklenen kelimeler
 *  - Günlük motivasyon sözü
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VocabularyService } from '../../services/vocabularyService';
import { Word } from '../../types/word';

const { width } = Dimensions.get('window');

// ── Sabitler ──────────────────────────────────────────────────────────────────

const MOTIVATIONAL_QUOTES = [
    { text: 'Jede Sprache ist eine andere Art, die Welt zu sehen.', author: 'Federico Fellini' },
    { text: 'Die Grenzen meiner Sprache sind die Grenzen meiner Welt.', author: 'Ludwig Wittgenstein' },
    { text: 'Mit jeder Sprache, die du lernst, lebst du ein neues Leben.', author: 'Çek Atasözü' },
    { text: 'Sprachen sind das Fenster zur Welt.', author: 'Unbekannt' },
    { text: 'Wer fremde Sprachen nicht kennt, weiß nichts von seiner eigenen.', author: 'Goethe' },
];

// Günün saatine göre selamlama
function getGreeting(): { text: string; emoji: string } {
    const h = new Date().getHours();
    if (h < 6) return { text: 'Gece geç saatte', emoji: '🌙' };
    if (h < 12) return { text: 'Günaydın', emoji: '☀️' };
    if (h < 17) return { text: 'İyi öğlenler', emoji: '🌤️' };
    if (h < 21) return { text: 'İyi akşamlar', emoji: '🌇' };
    return { text: 'İyi geceler', emoji: '🌙' };
}

function getTurkishDate(): string {
    return new Date().toLocaleDateString('tr-TR', {
        weekday: 'long', day: 'numeric', month: 'long'
    });
}

// ── Animasyonlu kart wrapper ──────────────────────────────────────────────────
function FadeSlide({ children, delay = 0, style, resetKey = 0 }: {
    children: React.ReactNode; delay?: number; style?: object; resetKey?: number;
}) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        opacity.setValue(0);
        translateY.setValue(24);
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 480, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 420, delay, useNativeDriver: true }),
        ]).start();
    }, [resetKey]);

    return (
        <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
            {children}
        </Animated.View>
    );
}

// ── Animasyonlu sayı ──────────────────────────────────────────────────────────
function CountUp({ to, duration = 800, delay = 0, style }: {
    to: number; duration?: number; delay?: number; style?: object;
}) {
    const anim = useRef(new Animated.Value(0)).current;
    const [val, setVal] = useState(0);

    useEffect(() => {
        anim.removeAllListeners();
        anim.setValue(0);
        anim.addListener(({ value }) => setVal(Math.floor(value)));
        Animated.timing(anim, { toValue: to, duration, delay, useNativeDriver: false }).start();
        return () => anim.removeAllListeners();
    }, [to]);

    return <Text style={style}>{val}</Text>;
}


// ── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function HomeScreen() {
    const router = useRouter();
    const greeting = getGreeting();
    const today = getTurkishDate();
    const quote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];

    // Veriler
    const [words, setWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        const data = await VocabularyService.getAllWords();
        setWords(data);
        setIsLoading(false);
    }, []);

    const [animKey, setAnimKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            loadData();
            setAnimKey(k => k + 1);
        }, [loadData])
    );

    // İstatistikler
    const totalWords = words.length;
    const learnedWords = words.filter(w => (w.familiarity ?? 0) >= 4).length;
    const favoriteWords = words.filter(w => w.isFavorite).length;
    const totalCorrect = words.reduce((s, w) => s + (w.correctCount ?? 0), 0);
    const totalWrong = words.reduce((s, w) => s + (w.wrongCount ?? 0), 0);
    const successRate = (totalCorrect + totalWrong) > 0
        ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
        : 0;
    const recentWords = [...words].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {/* ── HERO BÖLÜMÜ ──────────────────────────────────────────── */}
                <FadeSlide delay={0} resetKey={animKey}>
                    <View style={styles.hero}>
                        {/* Arka plan dekorasyon */}
                        <View style={styles.heroBubble1} />
                        <View style={styles.heroBubble2} />

                        <View style={styles.heroTop}>
                            <View>
                                <Text style={styles.greetingEmoji}>{greeting.emoji}</Text>
                                <Text style={styles.greetingText}>{greeting.text}</Text>
                                <Text style={styles.heroDate}>{today}</Text>
                            </View>
                            <View style={styles.logoMark}>
                                <Text style={styles.logoMarkText}>LF</Text>
                            </View>
                        </View>

                        <Text style={styles.heroTitle}>
                            Almanca{'\n'}öğrenmeye{'\n'}devam et.
                        </Text>

                        {/* Ana CTA butonu */}
                        <TouchableOpacity
                            style={styles.ctaBtn}
                            onPress={() => router.push('/(tabs)/practice')}
                            activeOpacity={0.88}
                        >
                            <Ionicons name="flash" size={18} color="#fff" />
                            <Text style={styles.ctaBtnText}>Pratik Yap</Text>
                            <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
                        </TouchableOpacity>
                    </View>
                </FadeSlide>

                {/* ── İSTATİSTİK KARTLARI ──────────────────────────────────── */}
                <FadeSlide delay={100} resetKey={animKey}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Genel Durum</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/progress')}>
                            <Text style={styles.sectionLink}>Tümünü gör →</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statsGrid}>
                        {/* Toplam */}
                        <View style={[styles.statCard, styles.statCardLarge, { backgroundColor: '#5856D6' }]}>
                            <Ionicons name="library-outline" size={22} color="rgba(255,255,255,0.7)" />
                            <CountUp to={totalWords} delay={200} style={styles.statNumLight} />
                            <Text style={styles.statLabelLight}>Kelime</Text>
                        </View>

                        {/* Sağ sütun */}
                        <View style={styles.statColumnRight}>
                            <View style={[styles.statCard, styles.statCardSmall, { backgroundColor: '#34C759' }]}>
                                <Ionicons name="checkmark-done-outline" size={18} color="rgba(255,255,255,0.75)" />
                                <View style={styles.statSmallRow}>
                                    <CountUp to={learnedWords} delay={250} style={styles.statNumLightSm} />
                                    <Text style={styles.statLabelLightSm}>öğrenildi</Text>
                                </View>
                            </View>
                            <View style={[styles.statCard, styles.statCardSmall, { backgroundColor: '#FF9500' }]}>
                                <Ionicons name="trending-up-outline" size={18} color="rgba(255,255,255,0.75)" />
                                <View style={styles.statSmallRow}>
                                    <CountUp to={successRate} delay={300} style={styles.statNumLightSm} />
                                    <Text style={styles.statLabelLightSm}>% başarı</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </FadeSlide>

                {/* ── SON EKLENEN KELİMELER ─────────────────────────────────── */}
                {recentWords.length > 0 && (
                    <FadeSlide delay={260} resetKey={animKey}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Son Eklenenler</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/vocabulary')}>
                                <Text style={styles.sectionLink}>Hepsini gör →</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.recentCard}>
                            {recentWords.map((w, i) => {
                                const posColors: Record<string, string> = {
                                    noun: '#5856D6', verb: '#FF9500', adjective: '#34C759',
                                    adverb: '#AF52DE', preposition: '#5AC8FA',
                                    conjunction: '#FF2D55', pronoun: '#FFCC00', other: '#8E8E93'
                                };
                                const color = posColors[w.partOfSpeech] ?? '#8E8E93';
                                return (
                                    <View key={w.id} style={[
                                        styles.recentRow,
                                        i < recentWords.length - 1 && styles.recentRowDivider
                                    ]}>
                                        <View style={[styles.recentDot, { backgroundColor: color + '20', borderColor: color }]}>
                                            <Text style={[styles.recentDotLetter, { color }]}>
                                                {w.partOfSpeech[0].toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.recentTexts}>
                                            <Text style={styles.recentWord}>{w.word}</Text>
                                            <Text style={styles.recentMeaning} numberOfLines={1}>{w.meaning}</Text>
                                        </View>
                                        {w.isFavorite && (
                                            <Ionicons name="star" size={14} color="#FFD700" />
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </FadeSlide>
                )}

                {/* ── KELİME EKLEMEYİ TAMAMLA (boş durum CTA) ─────────────── */}
                {totalWords === 0 && !isLoading && (
                    <FadeSlide delay={180} resetKey={animKey}>
                        <TouchableOpacity
                            style={styles.emptyCard}
                            onPress={() => router.push('/(tabs)/vocabulary')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.emptyEmoji}>✨</Text>
                            <Text style={styles.emptyTitle}>İlk kelimeni ekle</Text>
                            <Text style={styles.emptySub}>
                                Sözlüğüne kelime ekleyerek öğrenmeye başla.
                            </Text>
                            <View style={styles.emptyBtn}>
                                <Text style={styles.emptyBtnText}>Kelime Ekle</Text>
                                <Ionicons name="arrow-forward" size={14} color="#007AFF" />
                            </View>
                        </TouchableOpacity>
                    </FadeSlide>
                )}

                {/* ── GÜNÜN ALMANCASI ───────────────────────────────────────── */}
                <FadeSlide delay={260} resetKey={animKey}>
                    <View style={styles.quoteCard}>
                        <View style={styles.quoteTopRow}>
                            <View style={styles.quoteBadge}>
                                <Text style={styles.quoteBadgeText}>Günün Sözü</Text>
                            </View>
                            <Text style={styles.quoteFlag}>🇩🇪</Text>
                        </View>
                        <Text style={styles.quoteText}>"{quote.text}"</Text>
                        <Text style={styles.quoteAuthor}>— {quote.author}</Text>
                    </View>
                </FadeSlide>

                {/* ── HIZLI KELİME EKLE BANNER ─────────────────────────────── */}
                <FadeSlide delay={320} resetKey={animKey}>
                    <TouchableOpacity
                        style={styles.addWordBanner}
                        onPress={() => router.push('/(tabs)/vocabulary')}
                        activeOpacity={0.88}
                    >
                        <View style={styles.addWordLeft}>
                            <Ionicons name="add-circle" size={28} color="#fff" />
                            <View>
                                <Text style={styles.addWordTitle}>Yeni Kelime Ekle</Text>
                                <Text style={styles.addWordSub}>Sözlüğünü genişlet</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                </FadeSlide>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Stiller ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    scroll: {
        paddingBottom: 16,
    },

    // ── Hero ──────────────────────────────────────────────────────────────────
    hero: {
        backgroundColor: '#1C1C1E',
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 32,
        marginBottom: 4,
        overflow: 'hidden',
        position: 'relative',
    },
    heroBubble1: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#5856D6',
        opacity: 0.18,
        top: -60,
        right: -60,
    },
    heroBubble2: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#007AFF',
        opacity: 0.12,
        bottom: -40,
        left: 40,
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    greetingEmoji: {
        fontSize: 22,
        marginBottom: 4,
    },
    greetingText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    heroDate: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.35)',
        marginTop: 2,
        textTransform: 'capitalize',
    },
    logoMark: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: '#5856D6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoMarkText: {
        fontSize: 15,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
    },
    heroTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#fff',
        lineHeight: 40,
        marginBottom: 28,
        letterSpacing: -0.5,
    },
    ctaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        backgroundColor: '#5856D6',
        paddingVertical: 13,
        paddingHorizontal: 22,
        borderRadius: 14,
        shadowColor: '#5856D6',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 6,
    },
    ctaBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },

    // ── Bölüm başlığı ─────────────────────────────────────────────────────────
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 12,
    },
    sectionLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },

    // ── İstatistikler ─────────────────────────────────────────────────────────
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
    },
    statCard: {
        borderRadius: 18,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 3,
    },
    statCardLarge: {
        flex: 1.1,
        justifyContent: 'space-between',
        minHeight: 130,
    },
    statColumnRight: {
        flex: 1,
        gap: 10,
    },
    statCardSmall: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
    },
    statNumLight: {
        fontSize: 38,
        fontWeight: '800',
        color: '#fff',
        marginTop: 8,
    },
    statLabelLight: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
        marginTop: 2,
    },
    statSmallRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        flexWrap: 'wrap',
    },
    statNumLightSm: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },
    statLabelLightSm: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },

    // ── Son eklenenler ────────────────────────────────────────────────────────
    recentCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },
    recentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
        gap: 12,
    },
    recentRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    recentDot: {
        width: 36,
        height: 36,
        borderRadius: 10,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recentDotLetter: {
        fontSize: 13,
        fontWeight: '800',
    },
    recentTexts: {
        flex: 1,
    },
    recentWord: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    recentMeaning: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 1,
    },

    // ── Boş durum ─────────────────────────────────────────────────────────────
    emptyCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 18,
        padding: 28,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
    },
    emptyEmoji: { fontSize: 40, marginBottom: 12 },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 6,
    },
    emptySub: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    emptyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EAF4FF',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
    },
    emptyBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#007AFF',
    },

    // ── Günün sözü ────────────────────────────────────────────────────────────
    quoteCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 24,
        borderRadius: 18,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },
    quoteTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    quoteBadge: {
        backgroundColor: '#FFF4E0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    quoteBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FF9500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    quoteFlag: { fontSize: 22 },
    quoteText: {
        fontSize: 15,
        color: '#1C1C1E',
        fontStyle: 'italic',
        lineHeight: 22,
        marginBottom: 10,
    },
    quoteAuthor: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
    },

    // ── Kelime ekle banner ────────────────────────────────────────────────────
    addWordBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#007AFF',
        marginHorizontal: 20,
        marginTop: 14,
        borderRadius: 18,
        padding: 18,
        shadowColor: '#007AFF',
        shadowOpacity: 0.28,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
    },
    addWordLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    addWordTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    addWordSub: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
});