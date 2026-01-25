import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuestionProps {
    question: string;
    options: string[];
    onAnswer: (selected: string) => void;
}

export const QuestionComponent = ({ question, options, onAnswer }: QuestionProps) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Soru değiştiğinde seçimi sıfırla
    useEffect(() => {
        setSelectedOption(null);
    }, [question]);

    const handlePress = (option: string) => {
        if (selectedOption) return; // Zaten seçilmişse bir şey yapma
        setSelectedOption(option);
        onAnswer(option);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{question}</Text>
            <View style={styles.optionsContainer}>
                {options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        disabled={!!selectedOption}
                        style={[
                            styles.button,
                            selectedOption === option && styles.selectedButton
                        ]}
                        onPress={() => handlePress(option)}
                    >
                        <Text style={[
                            styles.buttonText,
                            selectedOption === option && styles.selectedText
                        ]}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '800', marginBottom: 30, textAlign: 'center', color: '#1A1A1A' },
    optionsContainer: { width: '100%' },
    button: {
        backgroundColor: '#F2F2F7',
        padding: 18,
        borderRadius: 15,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    selectedButton: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    buttonText: { color: '#1C1C1E', fontSize: 17, fontWeight: '500' },
    selectedText: { color: '#fff' }
});