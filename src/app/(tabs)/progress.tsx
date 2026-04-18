/**
 * src/app/(tabs)/progress.tsx
 *
 * Animasyonlu Profil / İlerleme Sayfası
 * - Sayfa açılınca staggered fade+slide animasyonu
 * - Gerçek veriler AsyncStorage'dan (useProgress hook)
 * - Stat kartları, başarı oranı çubuğu, POS dağılımı, aşinalık haritası,
 *   son kelimeler ve rozetler
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgress } from '../../hooks/useProgress';
import { PartOfSpeech } from '../../types/word';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

// ─── Animasyonlu wrapper ───────────────────────────────────────────────────────
function FadeSlide({
    children,
    delay = 0,
    style,
}: {
    children: React.ReactNode;
    delay?: number;
    style?: object;
}) {
    const anim = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(28)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slide, {
                toValue: 0,
                duration: 440,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[style, { opacity: anim, transform: [{ translateY: slide }] }]}>
            {children}
        </Animated.View>
    );
}

// ─── Animasyonlu sayı ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
    const anim = useRef(new Animated.Value(0)).current;
    const [display, setDisplay] = React.useState(0);

    useEffect(() => {
        anim.addListener(({ value: v }) => setDisplay(Math.floor(v)));
        Animated.timing(anim, {
            toValue: value,
            duration: 900,
            delay: 300,
            useNativeDriver: false,
        }).start();
        return () => anim.removeAllListeners();
    }, [value]);

    return (
        <Text style={styles.statValue}>
            {display}{suffix}
        </Text>
    );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function AnimatedBar({
    ratio,
    color,
    delay = 0,
}: {
    ratio: number;
    color: string;
    delay?: number;
}) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: ratio,
            duration: 700,
            delay,
            useNativeDriver: false,
        }).start();
    }, [ratio]);

    const widthInterp = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.barBg}>
            <Animated.View
                style={[styles.barFill, { width: widthInterp, backgroundColor: color }]}
            />
        </View>
    );
}

// ─── Ana Ekran ────────────────────────────────────────────────────────────────
export default function ProgressScreen() {
    const stats = useProgress();

    if (stats.isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingBox}>
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const totalPractice = stats.totalCorrect + stats.totalWrong;
    const maxPosCount = Math.max(...stats.posDist.map(p => p.count), 1);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Başlık ───────────────────────────────────────────────── */}
                <FadeSlide delay={0}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerSub}>LingoFlow</Text>
                            <Text style={styles.headerTitle}>Gelişimim</Text>
                        </View>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarEmoji}>🎓</Text>
                        </View>
                    </View>
                </FadeSlide>

                {/* ── 4 Ana Stat Kartı ─────────────────────────────────────── */}
                <FadeSlide delay={80}>
                    <View style={styles.statsGrid}>
                        {[
                            {
                                label: 'Toplam Kelime',
                                value: stats.totalWords,
                                icon: 'library-outline' as const,
                                color: '#5856D6',
                                suffix: ''
                            },
                            {
                                label: 'Öğrenilen',
                                value: stats.learnedWords,
                                icon: 'checkmark-circle-outline' as const,
                                color: '#34C759',
                                suffix: ''
                            },
                            {
                                label: 'Başarı Oranı',
                                value: stats.successRate,
                                icon: 'trending-up-outline' as const,
                                color: '#007AFF',
                                suffix: '%'
                            },
                            {
                                label: 'Favoriler',
                                value: stats.favoriteWords,
                                icon: 'star-outline' as const,
                                color: '#FF9500',
                                suffix: ''
                            },
                        ].map((item, i) => (
                            <View key={i} style={[styles.statCard, { borderTopColor: item.color }]}>
                                <View style={[styles.statIconBg, { backgroundColor: item.color + '18' }]}>
                                    <Ionicons name={item.icon} size={20} color={item.color} />
                                </View>
                                <AnimatedNumber value={item.value} suffix={item.suffix} />
                                <Text style={styles.statLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </FadeSlide>

                {/* ── Pratik Özeti ─────────────────────────────────────────── */}
                <FadeSlide delay={160}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="flash-outline" size={18} color="#FF9500" />
                            <Text style={styles.cardTitle}>Pratik Özeti</Text>
                        </View>

                        {totalPractice === 0 ? (
                            <Text style={styles.emptyNote}>Henüz pratik yapılmamış.</Text>
                        ) : (
                            <>
                                {/* Doğru / Yanlış bar */}
                                <View style={styles.practiceRow}>
                                    <View style={styles.practiceItem}>
                                        <Text style={styles.practiceNum}>{stats.totalCorrect}</Text>
                                        <Text style={[styles.practiceLabel, { color: '#34C759' }]}>✓ Doğru</Text>
                                    </View>
                                    <View style={styles.splitBar}>
                                        <Animated.View
                                            style={[
                                                styles.splitFillLeft,
                                                {
                                                    flex: stats.totalCorrect / totalPractice,
                                                    backgroundColor: '#34C759'
                                                }
                                            ]}
                                        />
                                        <Animated.View
                                            style={[
                                                styles.splitFillRight,
                                                {
                                                    flex: stats.totalWrong / totalPractice,
                                                    backgroundColor: '#FF3B30'
                                                }
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.practiceItem}>
                                        <Text style={styles.practiceNum}>{stats.totalWrong}</Text>
                                        <Text style={[styles.practiceLabel, { color: '#FF3B30' }]}>✗ Yanlış</Text>
                                    </View>
                                </View>

                                <View style={styles.practiceFooter}>
                                    <Text style={styles.practiceFooterText}>
                                        {stats.totalPracticed} kelime pratik edildi · {totalPractice} toplam deneme
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </FadeSlide>

                {/* ── Aşinalık Haritası ────────────────────────────────────── */}
                <FadeSlide delay={240}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="pulse-outline" size={18} color="#5856D6" />
                            <Text style={styles.cardTitle}>Aşinalık Dağılımı</Text>
                        </View>

                        {stats.totalWords === 0 ? (
                            <Text style={styles.emptyNote}>Henüz kelime eklenmemiş.</Text>
                        ) : (
                            <View style={styles.famGrid}>
                                {stats.familiarityDist.slice(1).map((item) => {
                                    const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF'];
                                    const color = colors[item.level - 1] ?? '#8E8E93';
                                    return (
                                        <View key={item.level} style={styles.famItem}>
                                            <View style={[styles.famDot, { backgroundColor: color }]} />
                                            <View style={styles.famTexts}>
                                                <Text style={styles.famLabel}>{item.label}</Text>
                                                <Text style={styles.famCount}>{item.count} kelime</Text>
                                            </View>
                                            <AnimatedBar
                                                ratio={stats.totalWords > 0 ? item.count / stats.totalWords : 0}
                                                color={color}
                                                delay={280 + item.level * 60}
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </FadeSlide>

                {/* ── Kelime Türü Dağılımı ─────────────────────────────────── */}
                {stats.posDist.length > 0 && (
                    <FadeSlide delay={320}>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="pie-chart-outline" size={18} color="#AF52DE" />
                                <Text style={styles.cardTitle}>Kelime Türleri</Text>
                            </View>

                            {stats.posDist.map((item, i) => (
                                <View key={item.pos} style={styles.posRow}>
                                    <View style={[styles.posDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.posLabel}>{item.label}</Text>
                                    <AnimatedBar
                                        ratio={item.count / maxPosCount}
                                        color={item.color}
                                        delay={360 + i * 50}
                                    />
                                    <Text style={styles.posCount}>{item.count}</Text>
                                </View>
                            ))}
                        </View>
                    </FadeSlide>
                )}

                {/* ── Son Eklenen Kelimeler ────────────────────────────────── */}
                {stats.recentWords.length > 0 && (
                    <FadeSlide delay={400}>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="time-outline" size={18} color="#5AC8FA" />
                                <Text style={styles.cardTitle}>Son Eklenenler</Text>
                            </View>

                            {stats.recentWords.map((w, i) => {
                                const posColors: Record<PartOfSpeech, string> = {
                                    noun: '#5856D6', verb: '#FF9500', adjective: '#34C759',
                                    adverb: '#AF52DE', preposition: '#5AC8FA', conjunction: '#FF2D55',
                                    pronoun: '#FFCC00', other: '#8E8E93'
                                };
                                const color = posColors[w.partOfSpeech];
                                return (
                                    <View
                                        key={w.id}
                                        style={[
                                            styles.recentRow,
                                            i < stats.recentWords.length - 1 && styles.recentRowBorder
                                        ]}
                                    >
                                        <View style={[styles.recentDot, { backgroundColor: color + '22', borderColor: color }]}>
                                            <Text style={[styles.recentDotText, { color }]}>
                                                {w.partOfSpeech.substring(0, 1).toUpperCase()}
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

                {/* ── Rozetler ─────────────────────────────────────────────── */}
                <FadeSlide delay={480}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="ribbon-outline" size={18} color="#FF9500" />
                            <Text style={styles.cardTitle}>Rozetler</Text>
                            <Text style={styles.badgeCount}>
                                {stats.badges.filter(b => b.unlocked).length}/{stats.badges.length}
                            </Text>
                        </View>

                        <View style={styles.badgeGrid}>
                            {stats.badges.map((badge, i) => (
                                <FadeSlide key={badge.id} delay={500 + i * 40}>
                                    <View style={[
                                        styles.badgeItem,
                                        !badge.unlocked && styles.badgeLocked
                                    ]}>
                                        <Text style={[
                                            styles.badgeEmoji,
                                            !badge.unlocked && styles.badgeEmojiLocked
                                        ]}>
                                            {badge.emoji}
                                        </Text>
                                        <Text style={[
                                            styles.badgeTitle,
                                            !badge.unlocked && styles.badgeTextLocked
                                        ]}>
                                            {badge.title}
                                        </Text>
                                        <Text style={[
                                            styles.badgeDesc,
                                            !badge.unlocked && styles.badgeTextLocked
                                        ]}>
                                            {badge.description}
                                        </Text>
                                        {badge.unlocked && (
                                            <View style={styles.badgeCheck}>
                                                <Ionicons name="checkmark" size={10} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                </FadeSlide>
                            ))}
                        </View>
                    </View>
                </FadeSlide>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    scroll: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#8E8E93',
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 8,
    },
    headerSub: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1C1C1E',
        marginTop: 2,
    },
    avatarCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#5856D6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#5856D6',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    avatarEmoji: {
        fontSize: 26,
    },

    // 2x2 stat grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },
    statIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1C1C1E',
    },
    statLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 4,
        textAlign: 'center',
    },

    // Kart
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1C1C1E',
        flex: 1,
    },
    emptyNote: {
        fontSize: 14,
        color: '#C7C7CC',
        textAlign: 'center',
        paddingVertical: 12,
    },

    // Pratik özeti
    practiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    practiceItem: {
        alignItems: 'center',
        minWidth: 48,
    },
    practiceNum: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1C1C1E',
    },
    practiceLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    splitBar: {
        flex: 1,
        flexDirection: 'row',
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: '#F2F2F7',
    },
    splitFillLeft: {
        height: '100%',
    },
    splitFillRight: {
        height: '100%',
    },
    practiceFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 10,
    },
    practiceFooterText: {
        fontSize: 12,
        color: '#8E8E93',
        textAlign: 'center',
    },

    // Aşinalık
    famGrid: {
        gap: 12,
    },
    famItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    famDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    famTexts: {
        width: 110,
    },
    famLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    famCount: {
        fontSize: 11,
        color: '#8E8E93',
    },
    barBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#F2F2F7',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },

    // POS dağılımı
    posRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    posDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    posLabel: {
        width: 60,
        fontSize: 13,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    posCount: {
        fontSize: 13,
        fontWeight: '700',
        color: '#8E8E93',
        width: 24,
        textAlign: 'right',
    },

    // Son eklenenler
    recentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
    },
    recentRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    recentDot: {
        width: 34,
        height: 34,
        borderRadius: 10,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recentDotText: {
        fontSize: 13,
        fontWeight: '800',
    },
    recentTexts: {
        flex: 1,
    },
    recentWord: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    recentMeaning: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 1,
    },

    // Rozetler
    badgeCount: {
        fontSize: 13,
        fontWeight: '700',
        color: '#8E8E93',
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    badgeItem: {
        width: (width - 76) / 2,
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        position: 'relative',
    },
    badgeLocked: {
        opacity: 0.45,
    },
    badgeEmoji: {
        fontSize: 28,
        marginBottom: 6,
    },
    badgeEmojiLocked: {
        opacity: 0.5,
    },
    badgeTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1C1C1E',
        textAlign: 'center',
        marginBottom: 3,
    },
    badgeDesc: {
        fontSize: 11,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 15,
    },
    badgeTextLocked: {
        color: '#C7C7CC',
    },
    badgeCheck: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
    },
});