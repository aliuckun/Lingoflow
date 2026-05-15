import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator, KeyboardAvoidingView, Platform,
    ScrollView, StyleSheet, Text, TextInput,
    TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExampleComponent } from '../../components/practice/example';
import { QuestionComponent } from '../../components/practice/question';
import { PracticeMode, checkWriteAnswer, usePractice } from '../../hooks/practice/Usepractice';

const MODE_CONFIG: Record<PracticeMode, {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string; subtitle: string; description: string;
    color: string; bgColor: string;
}> = {
    meaning: {
        icon: 'text-outline', title: 'Anlam Testi', subtitle: 'Türkçe karşılığını bul',
        description: 'Almanca kelimeye bakarak doğru Türkçe anlamı seç.',
        color: '#007AFF', bgColor: '#EAF4FF',
    },
    perfekt: {
        icon: 'time-outline', title: 'Perfekt Testi', subtitle: 'Partizip II\'yi bul',
        description: 'Fiilin Perfekt halini (Partizip II) ve yardımcı fiilini bul.',
        color: '#AF52DE', bgColor: '#F5EEFF',
    },
    writing: {
        icon: 'pencil-outline', title: 'Yazarak Pratik', subtitle: 'Kelimeyi kendini yaz',
        description: 'Türkçesini gör Almancasını yaz — ya da tersi. Karma sorular gelir.',
        color: '#FF9500', bgColor: '#FFF4E5',
    },
    artikel: {
        icon: 'pricetag-outline', title: 'Artikel Testi', subtitle: 'der / die / das / pl',
        description: 'İsimlerin Almanca artikelini bul.',
        color: '#FF2D55', bgColor: '#FFF0F3',
    },
};

// ─── Yazma Modu UI ────────────────────────────────────────────────────────────
function WritingInput({
    onSubmit, disabled, correctAnswer, hasAnswered, accentColor,
}: {
    onSubmit: (v: string) => void;
    disabled: boolean;
    correctAnswer: string;
    hasAnswered: boolean;
    accentColor: string;
}) {
    const [value, setValue] = useState('');
    const result = hasAnswered ? checkWriteAnswer(value, correctAnswer) : null;

    const borderColor = result === 'correct' ? '#34C759'
        : result === 'almost' ? '#FF9500'
        : result === 'wrong' ? '#FF3B30'
        : accentColor;

    return (
        <View style={wr.container}>
            <TextInput
                style={[wr.input, { borderColor }]}
                value={value}
                onChangeText={setValue}
                placeholder="Cevabını yaz..."
                placeholderTextColor="#AEAEB2"
                editable={!hasAnswered}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => !hasAnswered && value.trim() && onSubmit(value)}
            />

            {!hasAnswered && (
                <TouchableOpacity
                    style={[wr.btn, { backgroundColor: value.trim() ? accentColor : '#E5E5EA' }]}
                    onPress={() => value.trim() && onSubmit(value)}
                    disabled={!value.trim()}>
                    <Text style={[wr.btnText, { color: value.trim() ? '#fff' : '#AEAEB2' }]}>Kontrol Et</Text>
                </TouchableOpacity>
            )}

            {hasAnswered && result && (
                <View style={[wr.feedback, result === 'correct' ? wr.fbCorrect : result === 'almost' ? wr.fbAlmost : wr.fbWrong]}>
                    <Ionicons
                        name={result === 'wrong' ? 'close-circle' : 'checkmark-circle'}
                        size={22}
                        color={result === 'correct' ? '#34C759' : result === 'almost' ? '#FF9500' : '#FF3B30'}
                    />
                    <View style={{ flex: 1 }}>
                        {result === 'correct' && <Text style={[wr.fbTitle, { color: '#34C759' }]}>Doğru! 🎉</Text>}
                        {result === 'almost' && (
                            <>
                                <Text style={[wr.fbTitle, { color: '#FF9500' }]}>Neredeyse! Yazımına dikkat et.</Text>
                                <Text style={wr.fbCorrect2}>Doğru yazım: <Text style={{ fontWeight: '700' }}>{correctAnswer}</Text></Text>
                            </>
                        )}
                        {result === 'wrong' && (
                            <>
                                <Text style={[wr.fbTitle, { color: '#FF3B30' }]}>Yanlış.</Text>
                                <Text style={wr.fbCorrect2}>Doğru cevap: <Text style={{ fontWeight: '700' }}>{correctAnswer}</Text></Text>
                            </>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

// ─── Ana Ekran ────────────────────────────────────────────────────────────────
export default function PracticeScreen() {
    const {
        isLoading, error, hasAnswered, isCorrect,
        currentIndex, totalQuestions, score,
        goToNext, handleAnswer, handleWriteAnswer, resetPractice,
        currentQuestion, selectedMode, setSelectedMode, isReady, startPractice,
    } = usePractice(10);

    // ── 1. Mod Seçimi ─────────────────────────────────────────────────────────
    if (!isReady) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.modePickerContent}>
                    <View style={styles.modePickerHeader}>
                        <Ionicons name="school-outline" size={48} color="#007AFF" />
                        <Text style={styles.modePickerTitle}>Pratik Modu Seç</Text>
                        <Text style={styles.modePickerSub}>Hangi konuda pratik yapmak istiyorsun?</Text>
                    </View>

                    {(Object.entries(MODE_CONFIG) as [PracticeMode, typeof MODE_CONFIG['meaning']][]).map(([mode, cfg]) => {
                        const active = selectedMode === mode;
                        return (
                            <TouchableOpacity key={mode}
                                style={[styles.modeCard, active && { borderColor: cfg.color, backgroundColor: cfg.bgColor }]}
                                onPress={() => setSelectedMode(mode)} activeOpacity={0.75}>
                                <View style={[styles.modeIconBg, { backgroundColor: active ? cfg.color : '#F2F2F7' }]}>
                                    <Ionicons name={cfg.icon} size={28} color={active ? '#fff' : cfg.color} />
                                </View>
                                <View style={styles.modeCardText}>
                                    <Text style={[styles.modeCardTitle, active && { color: cfg.color }]}>{cfg.title}</Text>
                                    <Text style={styles.modeCardSub}>{cfg.subtitle}</Text>
                                    <Text style={styles.modeCardDesc}>{cfg.description}</Text>
                                </View>
                                <View style={[styles.modeRadio, active && { backgroundColor: cfg.color, borderColor: cfg.color }]}>
                                    {active && <Ionicons name="checkmark" size={14} color="#fff" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: MODE_CONFIG[selectedMode].color }]}
                        onPress={startPractice} activeOpacity={0.85}>
                        <Ionicons name="play" size={20} color="#fff" />
                        <Text style={styles.startButtonText}>{MODE_CONFIG[selectedMode].title} Başlat</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ── 2. Yükleme ────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={MODE_CONFIG[selectedMode].color} />
                    <Text style={styles.loadingText}>Sorular hazırlanıyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── 3. Hata ───────────────────────────────────────────────────────────────
    if (error || !currentQuestion) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle" size={64} color="#FF3B30" />
                    <Text style={styles.errorText}>{error || 'Bir hata oluştu'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={resetPractice}>
                        <Ionicons name="arrow-back" size={16} color="#007AFF" />
                        <Text style={styles.retryButtonText}>Mod Seçimine Dön</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── 4. Aktif Pratik ───────────────────────────────────────────────────────
    const cfg = MODE_CONFIG[selectedMode];
    const isWriting = currentQuestion.mode === 'writing';

    return (
        <SafeAreaView style={styles.container}>
            {/* Progress */}
            <View style={styles.progressContainer}>
                <View style={[styles.modePill, { backgroundColor: cfg.bgColor }]}>
                    <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                    <Text style={[styles.modePillText, { color: cfg.color }]}>{cfg.title}</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {
                        width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                        backgroundColor: cfg.color,
                    }]} />
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.progressText}>Soru {currentIndex + 1} / {totalQuestions}</Text>
                    <Text style={[styles.scoreText, { color: cfg.color }]}>Skor: {score} / {totalQuestions}</Text>
                </View>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={120}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    {/* Soru metni */}
                    <Text style={styles.questionTitle}>{currentQuestion.question}</Text>

                    {/* Yazma modu */}
                    {isWriting ? (
                        <WritingInput
                            onSubmit={handleWriteAnswer}
                            disabled={hasAnswered}
                            correctAnswer={currentQuestion.correctAnswer}
                            hasAnswered={hasAnswered}
                            accentColor={cfg.color}
                        />
                    ) : (
                        <QuestionComponent
                            question=""
                            options={currentQuestion.options}
                            correctAnswer={currentQuestion.correctAnswer}
                            onAnswer={handleAnswer}
                            hasAnswered={hasAnswered}
                            accentColor={cfg.color}
                        />
                    )}

                    {/* Cevap sonrası */}
                    {hasAnswered && (
                        <View>
                            {/* Perfekt reveal */}
                            {currentQuestion.mode === 'perfekt' && currentQuestion.word.verbDetails?.perfekt && (
                                <View style={styles.perfektReveal}>
                                    <Text style={styles.perfektRevealTitle}>Perfekt Formu</Text>
                                    <View style={styles.perfektRevealRow}>
                                        <View style={[styles.hilfsChip,
                                            currentQuestion.word.verbDetails.perfekt.hilfsverb === 'haben'
                                                ? styles.habenChip : styles.seinChip]}>
                                            <Text style={styles.hilfsChipText}>
                                                {currentQuestion.word.verbDetails.perfekt.hilfsverb}
                                            </Text>
                                        </View>
                                        <Text style={styles.perfektPartizip}>
                                            {currentQuestion.word.verbDetails.perfekt.partizip2}
                                        </Text>
                                    </View>
                                    <Text style={styles.perfektFull}>
                                        ich {currentQuestion.word.verbDetails.perfekt.hilfsverb === 'haben' ? 'habe' : 'bin'}{' '}
                                        <Text style={{ fontWeight: '700' }}>
                                            {currentQuestion.word.verbDetails.perfekt.partizip2}
                                        </Text>
                                    </Text>
                                </View>
                            )}

                            {/* Örnek cümle */}
                            {currentQuestion.sentence && (
                                <ExampleComponent sentence={currentQuestion.sentence} translation={currentQuestion.translation ?? ''} />
                            )}

                            {/* Sonraki buton */}
                            <TouchableOpacity
                                style={[styles.nextButton, isCorrect ? styles.nextCorrect : { backgroundColor: cfg.color }]}
                                onPress={goToNext}>
                                <Text style={styles.nextButtonText}>
                                    {currentIndex < totalQuestions - 1 ? 'Sonraki Soru →' : 'Sonuçları Gör 🎉'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Stiller ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    scrollContent: { paddingBottom: 40 },

    modePickerContent: { padding: 24, paddingBottom: 48 },
    modePickerHeader: { alignItems: 'center', marginBottom: 28 },
    modePickerTitle: { fontSize: 26, fontWeight: '800', color: '#1C1C1E', marginTop: 14, marginBottom: 8 },
    modePickerSub: { fontSize: 15, color: '#8E8E93', textAlign: 'center' },
    modeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 2, borderColor: '#E5E5EA', gap: 14 },
    modeIconBg: { width: 54, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    modeCardText: { flex: 1 },
    modeCardTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
    modeCardSub: { fontSize: 13, fontWeight: '600', color: '#636366', marginBottom: 4 },
    modeCardDesc: { fontSize: 12, color: '#AEAEB2', lineHeight: 17 },
    modeRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D1D6', justifyContent: 'center', alignItems: 'center' },
    startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8, padding: 18, borderRadius: 16, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
    startButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

    progressContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, backgroundColor: '#F8F9FA', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    modePill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 10 },
    modePillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
    progressBar: { height: 6, backgroundColor: '#E5E5EA', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
    progressFill: { height: '100%', borderRadius: 3 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressText: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
    scoreText: { fontSize: 14, fontWeight: '700' },

    questionTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', color: '#1A1A1A', lineHeight: 30, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },

    perfektReveal: { marginHorizontal: 20, marginTop: 16, backgroundColor: '#F5EEFF', borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: '#AF52DE' },
    perfektRevealTitle: { fontSize: 11, fontWeight: '700', color: '#AF52DE', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
    perfektRevealRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
    hilfsChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
    habenChip: { backgroundColor: '#007AFF' },
    seinChip: { backgroundColor: '#34C759' },
    hilfsChipText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    perfektPartizip: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
    perfektFull: { fontSize: 14, color: '#636366', fontStyle: 'italic' },

    nextButton: { margin: 20, padding: 18, borderRadius: 14, alignItems: 'center', elevation: 3 },
    nextCorrect: { backgroundColor: '#34C759' },
    nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    loadingText: { marginTop: 16, fontSize: 16, color: '#8E8E93' },
    errorText: { marginTop: 16, fontSize: 16, color: '#FF3B30', textAlign: 'center', lineHeight: 22 },
    retryButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#007AFF' },
    retryButtonText: { color: '#007AFF', fontSize: 15, fontWeight: '600' },
});

// ─── Yazma modu stilleri ──────────────────────────────────────────────────────
const wr = StyleSheet.create({
    container: { paddingHorizontal: 20, paddingTop: 8 },
    input: { backgroundColor: '#F8F9FA', borderRadius: 14, borderWidth: 2, padding: 16, fontSize: 18, color: '#1C1C1E', marginBottom: 12 },
    btn: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
    btnText: { fontSize: 16, fontWeight: '700' },
    feedback: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, borderLeftWidth: 4, marginTop: 4 },
    fbCorrect: { backgroundColor: '#E8F5E9', borderLeftColor: '#34C759' },
    fbAlmost: { backgroundColor: '#FFF8E1', borderLeftColor: '#FF9500' },
    fbWrong: { backgroundColor: '#FFEBEE', borderLeftColor: '#FF3B30' },
    fbTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
    fbCorrect2: { fontSize: 14, color: '#3A3A3C' },
});
