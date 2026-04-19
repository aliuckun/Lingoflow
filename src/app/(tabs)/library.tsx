// src/app/(tabs)/library.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import allStories from '../../../assets/books/german_stories.json';
import { BookCard } from '../../components/Library/BookCard';
import { ROUTES } from '../../constants/routes';

const ALL_LEVELS = ['Tümü', ...Array.from(new Set(allStories.map(s => s.level))).sort()];

const LEVEL_COLOR: Record<string, string> = {
    A1: '#34C759', A2: '#30D158',
    B1: '#007AFF', B2: '#0A84FF',
    C1: '#AF52DE', C2: '#BF5AF2',
    'Tümü': '#1C1C1E',
};

// ── Fade + Slide wrapper ──────────────────────────────────────────────────────
function FadeSlide({ children, delay = 0, style, resetKey = 0 }: {
    children: React.ReactNode; delay?: number; style?: object; resetKey?: number;
}) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        opacity.setValue(0);
        translateY.setValue(20);
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
        ]).start();
    }, [resetKey]);

    return (
        <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
            {children}
        </Animated.View>
    );
}

// ── Animasyonlu sayı ──────────────────────────────────────────────────────────
function CountUp({ to, delay = 0, style }: { to: number; delay?: number; style?: object }) {
    const anim = useRef(new Animated.Value(0)).current;
    const [val, setVal] = useState(0);

    useEffect(() => {
        anim.addListener(({ value }) => setVal(Math.floor(value)));
        Animated.timing(anim, { toValue: to, duration: 700, delay, useNativeDriver: false }).start();
        return () => anim.removeAllListeners();
    }, [to]);

    return <Text style={style}>{val}</Text>;
}

// ── Animasyonlu kitap kartı ───────────────────────────────────────────────────
function AnimatedBookCard({ item, index, onPress, resetKey = 0 }: {
    item: typeof allStories[0]; index: number; onPress: () => void; resetKey?: number;
}) {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.92)).current;

    useEffect(() => {
        opacity.setValue(0);
        scale.setValue(0.92);
        const delay = 280 + (index % 6) * 65;
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 360, delay, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true, tension: 80, friction: 8 }),
        ]).start();
    }, [index, resetKey]);

    return (
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
            <BookCard
                title={item.title}
                level={item.level}
                wordCount={item.wordCount}
                onPress={onPress}
            />
        </Animated.View>
    );
}

// ── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function LibraryScreen() {
    const router = useRouter();
    const [selectedLevel, setSelectedLevel] = useState('Tümü');

    const filtered = useMemo(() =>
        selectedLevel === 'Tümü'
            ? allStories
            : allStories.filter(s => s.level === selectedLevel),
        [selectedLevel]
    );

    const totalWords = allStories.reduce((s, b) => s + (b.wordCount ?? 0), 0);

    // Animasyon key — sayfa focus olduğunda sıfırlanır
    const [animKey, setAnimKey] = useState(0);
    useFocusEffect(
        useCallback(() => {
            setAnimKey(k => k + 1);
        }, [])
    );

    // Filtre değişince kartlar yeniden animasyonla gelsin
    const [listKey, setListKey] = useState('all');
    const handleLevelChange = (level: string) => {
        setSelectedLevel(level);
        setListKey(level + Date.now());
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* ── Başlık ───────────────────────────────────────────────────── */}
            <FadeSlide delay={0} resetKey={animKey}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerSub}>LingoFlow</Text>
                        <Text style={styles.headerTitle}>Kitaplığım</Text>
                    </View>
                    <View style={styles.headerIcon}>
                        <Ionicons name="library" size={26} color="#007AFF" />
                    </View>
                </View>
            </FadeSlide>

            {/* ── İstatistik şeridi ─────────────────────────────────────────── */}
            <FadeSlide delay={80} resetKey={animKey}>
                <View style={styles.statsRow}>
                    {[
                        { label: 'Hikaye', value: allStories.length },
                        { label: 'Seviye', value: ALL_LEVELS.length - 1 },
                        { label: 'Kelime', value: totalWords },
                    ].map((item, i) => (
                        <React.Fragment key={item.label}>
                            {i > 0 && <View style={styles.statDivider} />}
                            <View style={styles.statItem}>
                                <CountUp to={item.value} delay={150 + i * 80} style={styles.statNum} />
                                <Text style={styles.statLabel}>{item.label}</Text>
                            </View>
                        </React.Fragment>
                    ))}
                </View>
            </FadeSlide>

            {/* ── Seviye filtreleri ─────────────────────────────────────────── */}
            <FadeSlide delay={160} resetKey={animKey}>
                <View style={styles.filterWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContent}
                    >
                        {ALL_LEVELS.map(level => {
                            const active = selectedLevel === level;
                            const color = LEVEL_COLOR[level] ?? '#8E8E93';
                            return (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.filterPill,
                                        active && { backgroundColor: color, borderColor: color }
                                    ]}
                                    onPress={() => handleLevelChange(level)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[styles.filterText, active && { color: '#fff' }]}>
                                        {level}
                                    </Text>
                                    {active && level !== 'Tümü' && (
                                        <Text style={styles.filterCount}>
                                            {' '}{allStories.filter(s => s.level === level).length}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </FadeSlide>

            {/* ── Sonuç sayısı ──────────────────────────────────────────────── */}
            <FadeSlide delay={220} resetKey={animKey}>
                <View style={styles.resultBar}>
                    <Text style={styles.resultText}>
                        <Text style={styles.resultBold}>{filtered.length}</Text>
                        {' '}hikaye listeleniyor
                    </Text>
                </View>
            </FadeSlide>

            {/* ── Kitap Listesi ─────────────────────────────────────────────── */}
            <FlatList
                key={listKey}
                data={filtered}
                keyExtractor={item => item.id}
                numColumns={2}
                renderItem={({ item, index }) => (
                    <AnimatedBookCard
                        item={item}
                        index={index}
                        onPress={() => router.push(ROUTES.LIBRARY_DETAIL(item.id))}
                        resetKey={animKey}
                    />
                )}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyEmoji}>📚</Text>
                        <Text style={styles.emptyText}>Bu seviyede hikaye yok.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 14,
        backgroundColor: '#fff',
    },
    headerSub: {
        fontSize: 11,
        fontWeight: '700',
        color: '#8E8E93',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1C1C1E',
        marginTop: 2,
    },
    headerIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#EAF4FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNum: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1C1C1E',
    },
    statLabel: {
        fontSize: 11,
        color: '#8E8E93',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E5E5EA',
    },
    filterWrapper: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    filterContent: {
        paddingHorizontal: 16,
        gap: 8,
        flexDirection: 'row',
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#3A3A3C',
    },
    filterCount: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.85)',
    },
    resultBar: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    resultText: {
        fontSize: 13,
        color: '#8E8E93',
    },
    resultBold: {
        fontWeight: '700',
        color: '#1C1C1E',
    },
    listContent: {
        paddingHorizontal: 8,
        paddingBottom: 24,
    },
    columnWrapper: {
        justifyContent: 'flex-start',
    },
    emptyBox: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
        fontWeight: '600',
    },
});