/**
 * PRACTICE SCREEN - Kelime Pratik Sayfası
 * 
 * Bu sayfa:
 * - AsyncStorage'dan kelimeleri çeker
 * - Her kelime için çoktan seçmeli soru oluşturur
 * - Kullanıcının cevaplarını kontrol eder
 * - Doğru/yanlış istatistiklerini günceller
 * - Örnek cümleleri gösterir (varsa)
 * - Pratik sonunda skor gösterir
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExampleComponent } from '../../components/practice/example';
import { QuestionComponent } from '../../components/practice/question';
import { usePractice } from '../../hooks/practice/Usepractice';

export default function PracticeScreen() {
    const {
        isLoading,
        error,
        hasAnswered,
        isCorrect,
        currentIndex,
        totalQuestions,
        score,
        goToNext,
        handleAnswer,
        resetPractice,
        currentQuestion
    } = usePractice(10); // 10 soruluk pratik

    // Yükleme durumu
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Sorular hazırlanıyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Hata durumu
    if (error || !currentQuestion) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle" size={64} color="#FF3B30" />
                    <Text style={styles.errorText}>
                        {error || 'Bir hata oluştu'}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={resetPractice}>
                        <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${((currentIndex + 1) / totalQuestions) * 100}%` }
                        ]}
                    />
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.progressText}>
                        Soru {currentIndex + 1} / {totalQuestions}
                    </Text>
                    <Text style={styles.scoreText}>
                        Skor: {score} / {totalQuestions}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Soru Component'i */}
                {currentQuestion && (
                    <QuestionComponent
                        question={currentQuestion.question}
                        options={currentQuestion.options}
                        correctAnswer={currentQuestion.correctAnswer}
                        onAnswer={handleAnswer}
                        hasAnswered={hasAnswered}
                    />
                )}

                {/* Cevap verildikten sonra örnek cümle ve sonraki buton */}
                {hasAnswered && currentQuestion && (
                    <View>
                        {/* Örnek Cümle (varsa) */}
                        {currentQuestion.sentence && currentQuestion.translation && (
                            <ExampleComponent
                                sentence={currentQuestion.sentence}
                                translation={currentQuestion.translation}
                            />
                        )}

                        {/* Sonraki Soru Butonu */}
                        <TouchableOpacity
                            style={[
                                styles.nextButton,
                                isCorrect ? styles.nextButtonCorrect : styles.nextButtonWrong
                            ]}
                            onPress={goToNext}
                        >
                            <Text style={styles.nextButtonText}>
                                {currentIndex < totalQuestions - 1
                                    ? 'Sonraki Soru →'
                                    : 'Sonuçları Gör 🎉'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    scrollContent: {
        paddingBottom: 40
    },

    // Progress Bar
    progressContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#F8F9FA',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA'
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E5EA',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 10
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 3
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E'
    },
    scoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#007AFF'
    },

    // Next Button
    nextButton: {
        margin: 20,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    nextButtonCorrect: {
        backgroundColor: '#34C759',
    },
    nextButtonWrong: {
        backgroundColor: '#007AFF',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },

    // Loading & Error
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8E8E93'
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#FF3B30',
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
        color: '#fff',
        fontSize: 15,
        fontWeight: '600'
    }
});