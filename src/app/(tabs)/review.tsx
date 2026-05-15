import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator, ScrollView, StyleSheet,
    Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExampleComponent } from '../../components/practice/example';
import { QuestionComponent } from '../../components/practice/question';
import { useSpacedRepetition } from '../../hooks/practice/useSpacedRepetition';
import { DAILY_GOAL } from '../../services/streakService';

const ACCENT = '#5856D6';

export default function ReviewScreen() {
    const {
        dueWords, questions, currentIndex,
        hasAnswered, isCorrect, score,
        isLoading, isDone,
        handleAnswer, goToNext, restart,
    } = useSpacedRepetition();

    // ── Yükleme ───────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={ACCENT} />
                    <Text style={styles.loadingText}>Tekrarlar yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Bugün tekrar yok / bitti ──────────────────────────────────────────────
    if (dueWords.length === 0 || isDone) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.emptyContent}>
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyEmoji}>{isDone ? '🎉' : '✅'}</Text>
                        <Text style={styles.emptyTitle}>
                            {isDone ? 'Harika iş!' : 'Bugün tekrar yok'}
                        </Text>
                        <Text style={styles.emptyDesc}>
                            {isDone
                                ? `Bugünkü ${questions.length} tekrarı tamamladın.\nDoğru: ${score} / ${questions.length}`
                                : 'Tüm kelimeler güncel. Yeni kelimeler eklendikçe\nburada tekrar soruları belirecek.'}
                        </Text>
                        <TouchableOpacity style={styles.refreshBtn} onPress={restart}>
                            <Ionicons name="refresh" size={18} color={ACCENT} />
                            <Text style={styles.refreshBtnText}>Yenile</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bilgi kartı */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="information-circle-outline" size={18} color={ACCENT} />
                            <Text style={styles.infoTitle}>Aralıklı Tekrar Nasıl Çalışır?</Text>
                        </View>
                        <Text style={styles.infoText}>
                            Her doğru cevap, kelimenin bir sonraki tekrar tarihini uzatır.
                            Yanlış cevap verirsen kelime ertesi gün tekrar karşına çıkar.
                            Bu yöntem "SM-2" algoritmasına dayanır ve uzun süreli hafıza
                            için bilimsel olarak kanıtlanmıştır.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    const current = questions[currentIndex];
    if (!current) return null;

    // ── Aktif Tekrar ─────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            {/* Progress */}
            <View style={styles.progressContainer}>
                <View style={styles.dueChip}>
                    <Ionicons name="refresh-outline" size={12} color={ACCENT} />
                    <Text style={styles.dueChipText}>{dueWords.length} tekrar bekliyor</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {
                        width: `${((currentIndex + 1) / questions.length) * 100}%`,
                    }]} />
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.progressText}>{currentIndex + 1} / {questions.length}</Text>
                    <Text style={styles.scoreText}>✓ {score}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <QuestionComponent
                    question={current.question}
                    options={current.options}
                    correctAnswer={current.correctAnswer}
                    onAnswer={handleAnswer}
                    hasAnswered={hasAnswered}
                    accentColor={ACCENT}
                />

                {hasAnswered && (
                    <View>
                        {current.word.examples?.[0] && (
                            <ExampleComponent
                                sentence={current.word.examples[0].example}
                                translation={current.word.examples[0].exampleMeaning}
                            />
                        )}
                        {/* SM-2 bilgi notu */}
                        <View style={styles.sm2Note}>
                            <Ionicons name="time-outline" size={14} color={ACCENT} />
                            <Text style={styles.sm2NoteText}>
                                {isCorrect
                                    ? 'Doğru! Bu kelime daha sonra tekrar gelecek.'
                                    : 'Yanlış. Bu kelime yarın tekrar gelecek.'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.nextButton, isCorrect ? styles.nextCorrect : styles.nextWrong]}
                            onPress={goToNext}>
                            <Text style={styles.nextButtonText}>
                                {currentIndex < questions.length - 1 ? 'Sonraki →' : 'Tamamla 🎉'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16, color: '#8E8E93' },
    scrollContent: { paddingBottom: 40 },

    emptyContent: { padding: 24, alignItems: 'center' },
    emptyCard: {
        width: '100%', backgroundColor: '#F0EEFF', borderRadius: 20,
        padding: 28, alignItems: 'center', marginTop: 20, marginBottom: 16,
    },
    emptyEmoji: { fontSize: 56, marginBottom: 12 },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', marginBottom: 8 },
    emptyDesc: { fontSize: 15, color: '#636366', textAlign: 'center', lineHeight: 22 },
    refreshBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginTop: 20, paddingHorizontal: 20, paddingVertical: 10,
        borderRadius: 10, borderWidth: 1.5, borderColor: ACCENT,
    },
    refreshBtnText: { color: ACCENT, fontSize: 15, fontWeight: '600' },

    infoCard: { width: '100%', backgroundColor: '#F8F9FA', borderRadius: 16, padding: 16, borderLeftWidth: 4, borderLeftColor: ACCENT },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    infoTitle: { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
    infoText: { fontSize: 13, color: '#636366', lineHeight: 20 },

    progressContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, backgroundColor: '#F8F9FA', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    dueChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#EEEEFF', marginBottom: 10 },
    dueChipText: { fontSize: 11, fontWeight: '700', color: ACCENT },
    progressBar: { height: 6, backgroundColor: '#E5E5EA', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
    progressFill: { height: '100%', borderRadius: 3, backgroundColor: ACCENT },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    progressText: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
    scoreText: { fontSize: 14, fontWeight: '700', color: ACCENT },

    sm2Note: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 20, marginTop: 12, padding: 10, backgroundColor: '#EEEEFF', borderRadius: 10 },
    sm2NoteText: { fontSize: 13, color: '#3A3A3C', flex: 1 },

    nextButton: { margin: 20, padding: 18, borderRadius: 14, alignItems: 'center', elevation: 3 },
    nextCorrect: { backgroundColor: '#34C759' },
    nextWrong: { backgroundColor: ACCENT },
    nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
