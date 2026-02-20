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

/**
 * Soru component'i - Çoktan seçmeli soru gösterir
 * - Kullanıcı cevap seçer
 * - Doğru/yanlış durumunu görsel olarak gösterir
 * - Cevap verildikten sonra tüm seçenekleri disable eder
 */
export const QuestionComponent = ({
    question,
    options,
    correctAnswer,
    onAnswer,
    hasAnswered
}: QuestionProps) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Soru değiştiğinde seçimi sıfırla
    useEffect(() => {
        setSelectedOption(null);
    }, [question]);

    /**
     * Seçenek tıklama handler'ı
     * - İlk tıklamayı kabul eder
     * - Parent'a cevabı bildirir
     */
    const handlePress = (option: string) => {
        if (selectedOption) return; // Zaten seçilmişse bir şey yapma
        setSelectedOption(option);
        onAnswer(option);
    };

    /**
     * Seçeneğin durumunu belirler (doğru/yanlış/normal)
     */
    const getOptionStyle = (option: string) => {
        if (!hasAnswered) {
            return selectedOption === option ? styles.selectedButton : styles.button;
        }

        // Cevap verildikten sonra
        if (option === correctAnswer) {
            return styles.correctButton; // Doğru cevabı yeşil göster
        }
        if (option === selectedOption && option !== correctAnswer) {
            return styles.wrongButton; // Yanlış seçimi kırmızı göster
        }
        return styles.button;
    };

    /**
     * Seçenek text stilini belirler
     */
    const getOptionTextStyle = (option: string) => {
        if (!hasAnswered) {
            return selectedOption === option ? styles.selectedText : styles.buttonText;
        }

        if (option === correctAnswer || option === selectedOption) {
            return styles.selectedText;
        }
        return styles.buttonText;
    };

    /**
     * İkon gösterir (doğru/yanlış)
     */
    const renderIcon = (option: string) => {
        if (!hasAnswered) return null;

        if (option === correctAnswer) {
            return <Ionicons name="checkmark-circle" size={24} color="#fff" />;
        }
        if (option === selectedOption && option !== correctAnswer) {
            return <Ionicons name="close-circle" size={24} color="#fff" />;
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{question}</Text>
            <View style={styles.optionsContainer}>
                {options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        disabled={!!selectedOption}
                        style={getOptionStyle(option)}
                        onPress={() => handlePress(option)}
                    >
                        <Text style={getOptionTextStyle(option)}>
                            {option}
                        </Text>
                        {renderIcon(option)}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Feedback Mesajı */}
            {hasAnswered && (
                <View style={styles.feedbackContainer}>
                    {selectedOption === correctAnswer ? (
                        <View style={styles.correctFeedback}>
                            <Ionicons name="checkmark-circle" size={28} color="#34C759" />
                            <Text style={styles.correctText}>Doğru! 🎉</Text>
                        </View>
                    ) : (
                        <View style={styles.wrongFeedback}>
                            <Ionicons name="close-circle" size={28} color="#FF3B30" />
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
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 30,
        textAlign: 'center',
        color: '#1A1A1A'
    },
    optionsContainer: {
        width: '100%'
    },
    button: {
        backgroundColor: '#F2F2F7',
        padding: 18,
        borderRadius: 15,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10
    },
    selectedButton: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF'
    },
    correctButton: {
        backgroundColor: '#34C759',
        borderColor: '#34C759',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 18
    },
    wrongButton: {
        backgroundColor: '#FF3B30',
        borderColor: '#FF3B30',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 18
    },
    buttonText: {
        color: '#1C1C1E',
        fontSize: 17,
        fontWeight: '500'
    },
    selectedText: {
        color: '#fff'
    },
    feedbackContainer: {
        marginTop: 20,
        width: '100%'
    },
    correctFeedback: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#E8F5E9',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#34C759'
    },
    wrongFeedback: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF3B30'
    },
    correctText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#34C759'
    },
    wrongText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
        flex: 1
    }
});