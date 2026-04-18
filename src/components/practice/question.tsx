import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuestionProps {
    question: string;
    options: string[];
    correctAnswer: string;
    onAnswer: (selected: string) => void;
    hasAnswered: boolean;
}

export const QuestionComponent = ({
    question,
    options,
    correctAnswer,
    onAnswer,
    hasAnswered
}: QuestionProps) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    useEffect(() => {
        setSelectedOption(null);
    }, [question]);

    const handlePress = (option: string) => {
        if (selectedOption) return;
        setSelectedOption(option);
        onAnswer(option);
    };

    // Tek bir fonksiyon — hem buton hem yazı rengini döndürür
    const getState = (option: string): 'default' | 'selected' | 'correct' | 'wrong' | 'dimmed' => {
        if (!hasAnswered) {
            return selectedOption === option ? 'selected' : 'default';
        }
        if (option === correctAnswer) return 'correct';
        if (option === selectedOption) return 'wrong';
        return 'dimmed'; // cevap verildikten sonra diğer seçenekler soluklaşır
    };

    const buttonStyle = (state: ReturnType<typeof getState>) => {
        switch (state) {
            case 'selected': return [styles.btnBase, styles.btnSelected];
            case 'correct': return [styles.btnBase, styles.btnCorrect];
            case 'wrong': return [styles.btnBase, styles.btnWrong];
            case 'dimmed': return [styles.btnBase, styles.btnDimmed];
            default: return [styles.btnBase];
        }
    };

    const textStyle = (state: ReturnType<typeof getState>) => {
        switch (state) {
            case 'correct':
            case 'wrong':
            case 'selected': return styles.textLight;
            case 'dimmed': return styles.textDimmed;
            default: return styles.textDark;
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{question}</Text>

            <View style={styles.optionsContainer}>
                {options.map((option, index) => {
                    const state = getState(option);
                    return (
                        <TouchableOpacity
                            key={index}
                            disabled={!!selectedOption}
                            style={buttonStyle(state)}
                            onPress={() => handlePress(option)}
                            activeOpacity={0.75}
                        >
                            <Text style={textStyle(state)} numberOfLines={2}>
                                {option}
                            </Text>

                            {/* İkon — sadece doğru ya da yanlış seçimde */}
                            {hasAnswered && state === 'correct' && (
                                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                            )}
                            {hasAnswered && state === 'wrong' && (
                                <Ionicons name="close-circle" size={22} color="#fff" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Feedback */}
            {hasAnswered && (
                <View style={styles.feedbackContainer}>
                    {selectedOption === correctAnswer ? (
                        <View style={styles.correctFeedback}>
                            <Ionicons name="checkmark-circle" size={26} color="#34C759" />
                            <Text style={styles.correctText}>Doğru! 🎉</Text>
                        </View>
                    ) : (
                        <View style={styles.wrongFeedback}>
                            <Ionicons name="close-circle" size={26} color="#FF3B30" />
                            <Text style={styles.wrongText}>
                                Yanlış. Doğru cevap: {correctAnswer}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 24,
        textAlign: 'center',
        color: '#1A1A1A',
        lineHeight: 30,
    },
    optionsContainer: {
        width: '100%',
        gap: 10,
    },

    // ── Buton base: tüm ortak stiller burada ──────────────────────────────────
    btnBase: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
        backgroundColor: '#F2F2F7',
        minHeight: 56,
    },
    btnSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    btnCorrect: {
        backgroundColor: '#34C759',
        borderColor: '#34C759',
    },
    btnWrong: {
        backgroundColor: '#FF3B30',
        borderColor: '#FF3B30',
    },
    btnDimmed: {
        backgroundColor: '#F9F9F9',
        borderColor: '#F2F2F7',
        opacity: 0.6,
    },

    // ── Yazı stilleri ─────────────────────────────────────────────────────────
    textDark: {
        color: '#1C1C1E',
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    textLight: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    textDimmed: {
        color: '#AEAEB2',
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },

    // ── Feedback ──────────────────────────────────────────────────────────────
    feedbackContainer: {
        marginTop: 16,
    },
    correctFeedback: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#E8F5E9',
        padding: 14,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#34C759',
    },
    wrongFeedback: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FFEBEE',
        padding: 14,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF3B30',
    },
    correctText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#34C759',
    },
    wrongText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FF3B30',
        flex: 1,
    },
});