import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated, Dimensions, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgress } from '../../hooks/useProgress';
import { DAILY_GOAL } from '../../services/streakService';
import { PartOfSpeech } from '../../types/word';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;

// ─── Animasyon yardımcıları ───────────────────────────────────────────────────
function FadeSlide({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: object }) {
    const op = useRef(new Animated.Value(0)).current;
    const sl = useRef(new Animated.Value(24)).current;
    useEffect(() => {
        Animated.parallel([
            Animated.timing(op, { toValue: 1, duration: 480, delay, useNativeDriver: true }),
            Animated.timing(sl, { toValue: 0, duration: 420, delay, useNativeDriver: true }),
        ]).start();
    }, []);
    return <Animated.View style={[style, { opacity: op, transform: [{ translateY: sl }] }]}>{children}</Animated.View>;
}

function AnimNum({ value, suffix = '' }: { value: number; suffix?: string }) {
    const anim = useRef(new Animated.Value(0)).current;
    const [disp, setDisp] = React.useState(0);
    useEffect(() => {
        anim.addListener(({ value: v }) => setDisp(Math.floor(v)));
        Animated.timing(anim, { toValue: value, duration: 900, delay: 300, useNativeDriver: false }).start();
        return () => anim.removeAllListeners();
    }, [value]);
    return <Text style={styles.statValue}>{disp}{suffix}</Text>;
}

function Bar({ ratio, color, delay = 0 }: { ratio: number; color: string; delay?: number }) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => { Animated.timing(anim, { toValue: ratio, duration: 700, delay, useNativeDriver: false }).start(); }, [ratio]);
    const w = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
    return <View style={styles.barBg}><Animated.View style={[styles.barFill, { width: w, backgroundColor: color }]} /></View>;
}

// ─── Ana ekran ────────────────────────────────────────────────────────────────
export default function ProgressScreen() {
    const stats = useProgress();

    if (stats.isLoading) {
        return <SafeAreaView style={styles.container}><View style={styles.loadingBox}><Text style={styles.loadingText}>Yükleniyor...</Text></View></SafeAreaView>;
    }

    const total = stats.totalCorrect + stats.totalWrong;
    const maxPosCount = Math.max(...stats.posDist.map(p => p.count), 1);
    const weekMax = Math.max(...stats.weekDays.map(d => d.practiced), 1);
    const goalPct = Math.min(stats.streak.todayCount / DAILY_GOAL, 1);
    const goalDone = stats.streak.todayCount >= DAILY_GOAL;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ── Başlık ─────────────────────────────────────────────── */}
                <FadeSlide delay={0}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerSub}>LingoFlow</Text>
                            <Text style={styles.headerTitle}>Gelişimim</Text>
                        </View>
                        <View style={styles.avatarCircle}><Text style={styles.avatarEmoji}>🎓</Text></View>
                    </View>
                </FadeSlide>

                {/* ── Streak + Günlük Hedef ───────────────────────────────── */}
                <FadeSlide delay={60}>
                    <View style={styles.streakRow}>
                        {/* Streak */}
                        <View style={[styles.streakCard, { flex: 1 }]}>
                            <View style={styles.streakIconRow}>
                                <Text style={styles.streakFire}>🔥</Text>
                                <Text style={styles.streakNum}>{stats.streak.currentStreak}</Text>
                            </View>
                            <Text style={styles.streakLabel}>Günlük Seri</Text>
                            <Text style={styles.streakSub}>En iyi: {stats.streak.longestStreak} gün</Text>
                            {stats.streak.shieldActive && (
                                <View style={styles.shieldBadge}>
                                    <Ionicons name="shield-checkmark" size={12} color="#FF9500" />
                                    <Text style={styles.shieldText}>Shield aktif</Text>
                                </View>
                            )}
                        </View>

                        {/* Günlük hedef */}
                        <View style={[styles.streakCard, { flex: 1 }]}>
                            <View style={styles.goalRingOuter}>
                                <View style={[styles.goalRingFill, {
                                    height: `${goalPct * 100}%`,
                                    backgroundColor: goalDone ? '#34C759' : '#007AFF',
                                }]} />
                                <View style={styles.goalRingInner}>
                                    <Text style={[styles.goalNum, { color: goalDone ? '#34C759' : '#007AFF' }]}>
                                        {stats.streak.todayCount}
                                    </Text>
                                    <Text style={styles.goalDen}>/ {DAILY_GOAL}</Text>
                                </View>
                            </View>
                            <Text style={styles.streakLabel}>Bugünkü Hedef</Text>
                            <Text style={styles.streakSub}>{goalDone ? 'Tamamlandı! 🎉' : `${DAILY_GOAL - stats.streak.todayCount} kaldı`}</Text>
                        </View>
                    </View>
                </FadeSlide>

                {/* ── Haftalık Grafik ─────────────────────────────────────── */}
                <FadeSlide delay={120}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="bar-chart-outline" size={18} color="#5856D6" />
                            <Text style={styles.cardTitle}>Son 7 Gün</Text>
                        </View>
                        <View style={styles.weekChart}>
                            {stats.weekDays.map((day, i) => {
                                const h = weekMax > 0 ? (day.practiced / weekMax) : 0;
                                const isToday = i === 6;
                                const metGoal = day.practiced >= DAILY_GOAL;
                                return (
                                    <View key={day.date} style={styles.weekCol}>
                                        <Text style={styles.weekCount}>{day.practiced > 0 ? day.practiced : ''}</Text>
                                        <View style={styles.weekBarBg}>
                                            <View style={[styles.weekBarFill, {
                                                height: `${Math.max(h * 100, day.practiced > 0 ? 8 : 0)}%`,
                                                backgroundColor: metGoal ? '#34C759' : isToday ? '#007AFF' : '#5856D6',
                                                opacity: isToday ? 1 : 0.6,
                                            }]} />
                                        </View>
                                        <Text style={[styles.weekLabel, isToday && { fontWeight: '800', color: '#007AFF' }]}>
                                            {day.label}
                                        </Text>
                                        {metGoal && <Text style={styles.weekGoalDot}>●</Text>}
                                    </View>
                                );
                            })}
                        </View>
                        <View style={styles.weekLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
                                <Text style={styles.legendText}>Hedef tutturuldu</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
                                <Text style={styles.legendText}>Bugün</Text>
                            </View>
                        </View>
                    </View>
                </FadeSlide>

                {/* ── 4 Ana Stat ──────────────────────────────────────────── */}
                <FadeSlide delay={180}>
                    <View style={styles.statsGrid}>
                        {[
                            { label: 'Toplam Kelime', value: stats.totalWords, icon: 'library-outline' as const, color: '#5856D6', suffix: '' },
                            { label: 'Öğrenilen', value: stats.learnedWords, icon: 'checkmark-circle-outline' as const, color: '#34C759', suffix: '' },
                            { label: 'Başarı Oranı', value: stats.successRate, icon: 'trending-up-outline' as const, color: '#007AFF', suffix: '%' },
                            { label: 'Tekrar Bekleyen', value: stats.dueCount, icon: 'refresh-outline' as const, color: '#5856D6', suffix: '' },
                        ].map((item, i) => (
                            <View key={i} style={[styles.statCard, { borderTopColor: item.color }]}>
                                <View style={[styles.statIconBg, { backgroundColor: item.color + '18' }]}>
                                    <Ionicons name={item.icon} size={20} color={item.color} />
                                </View>
                                <AnimNum value={item.value} suffix={item.suffix} />
                                <Text style={styles.statLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </FadeSlide>

                {/* ── En Çok Yanlış ──────────────────────────────────────── */}
                {stats.hardestWords.length > 0 && (
                    <FadeSlide delay={240}>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="alert-circle-outline" size={18} color="#FF3B30" />
                                <Text style={styles.cardTitle}>En Çok Yanlış Yapılanlar</Text>
                            </View>
                            {stats.hardestWords.map((w, i) => {
                                const attempts = (w.correctCount ?? 0) + (w.wrongCount ?? 0);
                                const wrongPct = attempts > 0 ? Math.round(((w.wrongCount ?? 0) / attempts) * 100) : 0;
                                return (
                                    <View key={w.id} style={[styles.hardRow, i < stats.hardestWords.length - 1 && styles.hardRowBorder]}>
                                        <View style={styles.hardLeft}>
                                            <Text style={styles.hardWord}>{w.word}</Text>
                                            <Text style={styles.hardMeaning} numberOfLines={1}>{w.meaning}</Text>
                                        </View>
                                        <View style={styles.hardRight}>
                                            <Text style={styles.hardPct}>{wrongPct}%</Text>
                                            <Text style={styles.hardPctLabel}>yanlış</Text>
                                        </View>
                                        <View style={styles.hardBarWrap}>
                                            <View style={[styles.hardBarFill, { width: `${wrongPct}%` }]} />
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </FadeSlide>
                )}

                {/* ── Pratik Özeti ────────────────────────────────────────── */}
                <FadeSlide delay={300}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="flash-outline" size={18} color="#FF9500" />
                            <Text style={styles.cardTitle}>Pratik Özeti</Text>
                        </View>
                        {total === 0 ? (
                            <Text style={styles.emptyNote}>Henüz pratik yapılmamış.</Text>
                        ) : (
                            <>
                                <View style={styles.practiceRow}>
                                    <View style={styles.practiceItem}>
                                        <Text style={styles.practiceNum}>{stats.totalCorrect}</Text>
                                        <Text style={[styles.practiceLabel, { color: '#34C759' }]}>✓ Doğru</Text>
                                    </View>
                                    <View style={styles.splitBar}>
                                        <View style={[styles.splitFill, { flex: stats.totalCorrect / total, backgroundColor: '#34C759' }]} />
                                        <View style={[styles.splitFill, { flex: stats.totalWrong / total, backgroundColor: '#FF3B30' }]} />
                                    </View>
                                    <View style={styles.practiceItem}>
                                        <Text style={styles.practiceNum}>{stats.totalWrong}</Text>
                                        <Text style={[styles.practiceLabel, { color: '#FF3B30' }]}>✗ Yanlış</Text>
                                    </View>
                                </View>
                                <View style={styles.practiceFooter}>
                                    <Text style={styles.practiceFooterText}>
                                        {stats.totalPracticed} kelime pratik edildi · {total} toplam deneme
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </FadeSlide>

                {/* ── Aşinalık Dağılımı ───────────────────────────────────── */}
                <FadeSlide delay={360}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="pulse-outline" size={18} color="#5856D6" />
                            <Text style={styles.cardTitle}>Aşinalık Dağılımı</Text>
                        </View>
                        {stats.totalWords === 0 ? (
                            <Text style={styles.emptyNote}>Henüz kelime eklenmemiş.</Text>
                        ) : (
                            <View style={styles.famGrid}>
                                {stats.familiarityDist.slice(1).map(item => {
                                    const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF'];
                                    const color = colors[item.level - 1] ?? '#8E8E93';
                                    return (
                                        <View key={item.level} style={styles.famItem}>
                                            <View style={[styles.famDot, { backgroundColor: color }]} />
                                            <View style={styles.famTexts}>
                                                <Text style={styles.famLabel}>{item.label}</Text>
                                                <Text style={styles.famCount}>{item.count} kelime</Text>
                                            </View>
                                            <Bar ratio={stats.totalWords > 0 ? item.count / stats.totalWords : 0} color={color} delay={400 + item.level * 60} />
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </FadeSlide>

                {/* ── Kelime Türleri ──────────────────────────────────────── */}
                {stats.posDist.length > 0 && (
                    <FadeSlide delay={420}>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="pie-chart-outline" size={18} color="#AF52DE" />
                                <Text style={styles.cardTitle}>Kelime Türleri</Text>
                            </View>
                            {stats.posDist.map((item, i) => (
                                <View key={item.pos} style={styles.posRow}>
                                    <View style={[styles.posDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.posLabel}>{item.label}</Text>
                                    <Bar ratio={item.count / maxPosCount} color={item.color} delay={460 + i * 50} />
                                    <Text style={styles.posCount}>{item.count}</Text>
                                </View>
                            ))}
                        </View>
                    </FadeSlide>
                )}

                {/* ── Rozetler ────────────────────────────────────────────── */}
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
                                <FadeSlide key={badge.id} delay={500 + i * 35}>
                                    <View style={[styles.badgeItem, !badge.unlocked && styles.badgeLocked]}>
                                        <Text style={[styles.badgeEmoji, !badge.unlocked && styles.lockedOpacity]}>{badge.emoji}</Text>
                                        <Text style={[styles.badgeTitle, !badge.unlocked && styles.lockedText]}>{badge.title}</Text>
                                        <Text style={[styles.badgeDesc, !badge.unlocked && styles.lockedText]}>{badge.description}</Text>
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    scroll: { paddingHorizontal: 16, paddingTop: 8 },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 16, color: '#8E8E93' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
    headerSub: { fontSize: 12, fontWeight: '700', color: '#8E8E93', letterSpacing: 1, textTransform: 'uppercase' },
    headerTitle: { fontSize: 30, fontWeight: '800', color: '#1C1C1E', marginTop: 2 },
    avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#5856D6', justifyContent: 'center', alignItems: 'center', shadowColor: '#5856D6', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4 },
    avatarEmoji: { fontSize: 26 },

    // Streak + hedef
    streakRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    streakCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
    streakIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    streakFire: { fontSize: 28 },
    streakNum: { fontSize: 32, fontWeight: '800', color: '#1C1C1E' },
    streakLabel: { fontSize: 13, fontWeight: '700', color: '#1C1C1E', marginTop: 6 },
    streakSub: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
    shieldBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: '#FFF4E5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    shieldText: { fontSize: 10, fontWeight: '700', color: '#FF9500' },

    // Halka hedef
    goalRingOuter: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F2F2F7', overflow: 'hidden', justifyContent: 'flex-end', marginBottom: 4 },
    goalRingFill: { width: '100%', position: 'absolute', bottom: 0, borderRadius: 30 },
    goalRingInner: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
    goalNum: { fontSize: 16, fontWeight: '800' },
    goalDen: { fontSize: 9, color: '#8E8E93', fontWeight: '600' },

    // Haftalık grafik
    weekChart: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 6, marginBottom: 10 },
    weekCol: { flex: 1, alignItems: 'center', gap: 3 },
    weekCount: { fontSize: 9, fontWeight: '700', color: '#8E8E93', height: 12 },
    weekBarBg: { flex: 1, width: '100%', backgroundColor: '#F2F2F7', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
    weekBarFill: { width: '100%', borderRadius: 4 },
    weekLabel: { fontSize: 10, color: '#8E8E93', fontWeight: '600' },
    weekGoalDot: { fontSize: 8, color: '#34C759' },
    weekLegend: { flexDirection: 'row', gap: 16, marginTop: 4 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, color: '#8E8E93' },

    // Stat grid
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
    statCard: { width: CARD_W, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderTopWidth: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
    statIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { fontSize: 26, fontWeight: '800', color: '#1C1C1E' },
    statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4, textAlign: 'center' },

    // En çok yanlış
    hardRow: { paddingVertical: 10, gap: 6 },
    hardRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    hardLeft: { flex: 1 },
    hardWord: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
    hardMeaning: { fontSize: 12, color: '#8E8E93' },
    hardRight: { alignItems: 'flex-end' },
    hardPct: { fontSize: 16, fontWeight: '800', color: '#FF3B30' },
    hardPctLabel: { fontSize: 10, color: '#8E8E93' },
    hardBarWrap: { height: 4, backgroundColor: '#F2F2F7', borderRadius: 2, overflow: 'hidden', marginTop: 2 },
    hardBarFill: { height: '100%', backgroundColor: '#FF3B30', borderRadius: 2 },

    // Kart
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', flex: 1 },
    emptyNote: { fontSize: 14, color: '#C7C7CC', textAlign: 'center', paddingVertical: 12 },

    practiceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    practiceItem: { alignItems: 'center', minWidth: 48 },
    practiceNum: { fontSize: 20, fontWeight: '800', color: '#1C1C1E' },
    practiceLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    splitBar: { flex: 1, flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: '#F2F2F7' },
    splitFill: { height: '100%' },
    practiceFooter: { borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 10 },
    practiceFooterText: { fontSize: 12, color: '#8E8E93', textAlign: 'center' },

    famGrid: { gap: 12 },
    famItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    famDot: { width: 10, height: 10, borderRadius: 5 },
    famTexts: { width: 110 },
    famLabel: { fontSize: 13, fontWeight: '600', color: '#1C1C1E' },
    famCount: { fontSize: 11, color: '#8E8E93' },
    barBg: { flex: 1, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 3 },

    posRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    posDot: { width: 10, height: 10, borderRadius: 5 },
    posLabel: { width: 60, fontSize: 13, fontWeight: '600', color: '#1C1C1E' },
    posCount: { fontSize: 13, fontWeight: '700', color: '#8E8E93', width: 24, textAlign: 'right' },

    badgeCount: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    badgeItem: { width: (width - 76) / 2, backgroundColor: '#F8F9FA', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5EA', position: 'relative' },
    badgeLocked: { opacity: 0.4 },
    badgeEmoji: { fontSize: 28, marginBottom: 6 },
    lockedOpacity: { opacity: 0.5 },
    badgeTitle: { fontSize: 13, fontWeight: '700', color: '#1C1C1E', textAlign: 'center', marginBottom: 3 },
    badgeDesc: { fontSize: 11, color: '#8E8E93', textAlign: 'center', lineHeight: 15 },
    lockedText: { color: '#C7C7CC' },
    badgeCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: '#34C759', justifyContent: 'center', alignItems: 'center' },
});
