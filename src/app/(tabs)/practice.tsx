import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExampleComponent } from '../../components/practice/example';
import { QuestionComponent } from '../../components/practice/question';

// Örnek Veri Seti
const MOCK_QUESTIONS = [
    {
        id: 1,
        question: "Hangisi 'Gelecek' anlamına gelir?",
        options: ["Past", "Present", "Future", "Now"],
        correctAnswer: "Future",
        sentence: "The future belongs to those who believe in the beauty of their dreams.",
        translation: "Gelecek, hayallerinin güzelliğine inananlarındır."
    },
    {
        id: 2,
        question: "Hangisi 'Geleneksel' anlamına gelir?",
        options: ["Modern", "Traditional", "Digital", "Quick"],
        correctAnswer: "Traditional",
        sentence: "We should preserve our traditional values.",
        translation: "Geleneksel değerlerimizi korumalıyız."
    }
];

export default function PracticeScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasAnswered, setHasAnswered] = useState(false);

    const currentData = MOCK_QUESTIONS[currentIndex];

    const handleAnswer = (selected: string) => {
        setHasAnswered(true);
    };

    const handleNext = () => {
        if (currentIndex < MOCK_QUESTIONS.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setHasAnswered(false); // Yeni soru için ekranı sıfırla
        } else {
            alert("Tebrikler! Tüm soruları tamamladınız.");
            setCurrentIndex(0); // Başa dön veya başka sayfaya yönlendir
            setHasAnswered(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <QuestionComponent
                    question={currentData.question}
                    options={currentData.options}
                    onAnswer={handleAnswer}
                />

                {hasAnswered && (
                    <View>
                        <ExampleComponent
                            sentence={currentData.sentence}
                            translation={currentData.translation}
                        />

                        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                            <Text style={styles.nextButtonText}>Sonraki Soru →</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingBottom: 40 },
    nextButton: {
        backgroundColor: '#34C759',
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
    nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});