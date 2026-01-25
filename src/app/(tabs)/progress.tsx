import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
    // Şimdilik mock (geçici) veriler
    const stats = [
        { id: 1, label: 'Toplam Kelime', value: '124', icon: 'book', color: '#5856D6' },
        { id: 2, label: 'Öğrenilen', value: '42', icon: 'checkmark-circle', color: '#34C759' },
        { id: 3, label: 'Günlük Seri', value: '7 Gün', icon: 'flame', color: '#FF9500' },
        { id: 4, label: 'Başarı Oranı', value: '%85', icon: 'trending-up', color: '#AF52DE' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Gelişimim</Text>

                {/* Özet Kartları Grid Yapısı */}
                <View style={styles.statsGrid}>
                    {stats.map((stat) => (
                        <View key={stat.id} style={styles.statCard}>
                            <View style={[styles.iconBadge, { backgroundColor: `${stat.color}15` }]}>
                                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Gelecekte Grafik Gelecek Olan Alan */}
                <View style={styles.chartPlaceholder}>
                    <View style={styles.headerRow}>
                        <Ionicons name="bar-chart" size={20} color="#1C1C1E" />
                        <Text style={styles.sectionTitle}>Haftalık Aktivite</Text>
                    </View>
                    <View style={styles.dummyChart}>
                        <Text style={styles.dummyText}>Grafikler yakında burada olacak 🚀</Text>
                    </View>
                </View>

                {/* Son Başarılar veya Rozetler */}
                <View style={styles.badgeSection}>
                    <Text style={styles.sectionTitle}>Rozetlerin</Text>
                    <View style={styles.badgeRow}>
                        {['🏆', '🔥', '📚', '⭐'].map((emoji, index) => (
                            <View key={index} style={styles.badgeCircle}>
                                <Text style={{ fontSize: 24 }}>{emoji}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { padding: 20 },
    title: { fontSize: 28, fontWeight: '800', color: '#1C1C1E', marginBottom: 20 },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15
    },
    statCard: {
        backgroundColor: '#FFF',
        width: (width - 55) / 2, // Ekranı ikiye böler
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    iconBadge: { padding: 10, borderRadius: 12, marginBottom: 12 },
    statValue: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
    statLabel: { fontSize: 13, color: '#8E8E93', marginTop: 4 },

    chartPlaceholder: { marginTop: 30 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
    dummyChart: {
        height: 150,
        backgroundColor: '#FFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dummyText: { color: '#C7C7CC', fontSize: 14 },

    badgeSection: { marginTop: 30 },
    badgeRow: { flexDirection: 'row', gap: 15, marginTop: 15 },
    badgeCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2F2F7'
    }
});