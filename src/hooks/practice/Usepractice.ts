import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { VocabularyService } from '../../services/vocabularyService';
import { Word } from '../../types/word';

interface PracticeQuestion {
    id: string;
    wordId: string;
    question: string;
    options: string[];
    correctAnswer: string;
    sentence?: string;
    translation?: string;
    word: Word;
}

interface UsePracticeReturn {
    questions: PracticeQuestion[];
    currentIndex: number;
    isLoading: boolean;
    error: string | null;
    currentQuestion: PracticeQuestion | null;
    hasAnswered: boolean;
    isCorrect: boolean | null;
    totalQuestions: number;
    score: number;
    goToNext: () => void;
    handleAnswer: (selected: string) => void;
    resetPractice: () => void;
}

const fisherYatesShuffle = <T>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};


/**
 * Practice hook - Kelime pratik sorularını yönetir
 * - AsyncStorage'dan kelimeleri çeker
 * - Her kelime için çoktan seçmeli soru oluşturur
 * - Doğru/yanlış kontrolü yapar
 * - İstatistikleri günceller
 */
export const usePractice = (questionCount: number = 10): UsePracticeReturn => {
    const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);

    // Pratik sorularını oluştur
    useEffect(() => {
        loadPracticeQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Storage'dan kelimeleri çekip pratik soruları oluşturur
     */
    const loadPracticeQuestions = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const allWords = await VocabularyService.getAllWords();

            if (allWords.length === 0) {
                setError('Henüz kelime eklenmemiş. Lütfen önce kelime ekleyin.');
                setIsLoading(false);
                return;
            }

            if (allWords.length < 4) {
                setError('En az 4 kelime olmalı. Daha fazla kelime ekleyin.');
                setIsLoading(false);
                return;
            }

            // Rastgele sorular oluştur
            const practiceQuestions = generateQuestions(allWords, questionCount);
            setQuestions(practiceQuestions);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Sorular yüklenirken hata oluştu';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Kelimelerden rastgele pratik soruları oluşturur
     */
    const generateQuestions = (words: Word[], count: number): PracticeQuestion[] => {
        const shuffled = fisherYatesShuffle(words);
        const selectedWords = shuffled.slice(0, Math.min(count, words.length));

        return selectedWords.map(word => {
            const otherWords = words.filter(w => w.id !== word.id);
            const wrongAnswers = fisherYatesShuffle(otherWords)
                .slice(0, 3)
                .map(w => w.meaning);

            const allOptions = fisherYatesShuffle([word.meaning, ...wrongAnswers]);

            const example = word.examples && word.examples.length > 0
                ? word.examples[0]
                : undefined;

            return {
                id: `q_${word.id}`,
                wordId: word.id,
                question: `"${word.word}" kelimesinin anlamı nedir?`,
                options: allOptions,
                correctAnswer: word.meaning,
                sentence: example?.example,
                translation: example?.exampleMeaning,
                word: word
            };
        });
    };

    /**
     * Kullanıcının cevabını kontrol eder ve istatistikleri günceller
     */
    const handleAnswer = async (selected: string) => {
        const current = questions[currentIndex];
        if (hasAnswered || !current) return;

        const correct = selected === current.correctAnswer;
        setIsCorrect(correct);
        setHasAnswered(true);

        // Skor güncelle
        if (correct) {
            setScore(prev => prev + 1);
        }

        // AsyncStorage'da istatistikleri güncelle
        try {
            await VocabularyService.updatePracticeStats(
                current.wordId,
                correct
            );
        } catch (err) {
            console.error('İstatistikler güncellenirken hata:', err);
        }
    };

    /**
     * Sonraki soruya geçer
     */
    const goToNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setHasAnswered(false);
            setIsCorrect(null);
        } else {
            // Tüm sorular bitti
            Alert.alert(
                'Tebrikler! 🎉',
                `Pratik tamamlandı!\n\nDoğru: ${score}\nYanlış: ${questions.length - score}\nBaşarı Oranı: %${Math.round((score / questions.length) * 100)}`,
                [
                    { text: 'Tamam', onPress: resetPractice }
                ]
            );
        }
    };

    /**
     * Pratiği sıfırlar ve yeni sorular yükler
     */
    const resetPractice = () => {
        setCurrentIndex(0);
        setHasAnswered(false);
        setIsCorrect(null);
        setScore(0);
        loadPracticeQuestions();
    };

    return {
        questions,
        currentIndex,
        isLoading,
        error,
        currentQuestion: questions[currentIndex] || null,
        hasAnswered,
        isCorrect,
        totalQuestions: questions.length,
        score,
        goToNext,
        handleAnswer,
        resetPractice
    };
};