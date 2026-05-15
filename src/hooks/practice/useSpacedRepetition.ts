import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { recordPractice } from '../../services/streakService';
import { VocabularyService, getDueWords } from '../../services/vocabularyService';
import { Word } from '../../types/word';

export interface ReviewQuestion {
    wordId: string;
    word: Word;
    question: string;
    options: string[];
    correctAnswer: string;
}

interface UseSpacedRepetitionReturn {
    dueWords: Word[];
    questions: ReviewQuestion[];
    currentIndex: number;
    hasAnswered: boolean;
    isCorrect: boolean | null;
    score: number;
    isLoading: boolean;
    isDone: boolean;
    handleAnswer: (selected: string) => void;
    goToNext: () => void;
    restart: () => void;
}

const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

function buildQuestions(due: Word[], all: Word[]): ReviewQuestion[] {
    return due.map(word => {
        const others = all.filter(w => w.id !== word.id);
        const wrongs = shuffle(others).slice(0, 3).map(w => w.meaning);
        const options = shuffle([word.meaning, ...wrongs]);
        return {
            wordId: word.id,
            word,
            question: `"${word.word}" kelimesinin anlamı nedir?`,
            options,
            correctAnswer: word.meaning,
        };
    });
}

export function useSpacedRepetition(): UseSpacedRepetitionReturn {
    const [dueWords, setDueWords] = useState<Word[]>([]);
    const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDone, setIsDone] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        setIsDone(false);
        setCurrentIndex(0);
        setHasAnswered(false);
        setIsCorrect(null);
        setScore(0);
        try {
            const all = await VocabularyService.getAllWords();
            const due = getDueWords(all);
            setDueWords(due);
            setQuestions(buildQuestions(due, all));
        } catch { /* sessiz */ }
        finally { setIsLoading(false); }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const handleAnswer = async (selected: string) => {
        const current = questions[currentIndex];
        if (hasAnswered || !current) return;
        const correct = selected === current.correctAnswer;
        setIsCorrect(correct);
        setHasAnswered(true);
        if (correct) setScore(p => p + 1);
        try {
            await VocabularyService.updatePracticeStats(current.wordId, correct);
            await recordPractice(correct);
        } catch { /* sessiz */ }
    };

    const goToNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(p => p + 1);
            setHasAnswered(false);
            setIsCorrect(null);
        } else {
            setIsDone(true);
            Alert.alert(
                'Tekrar Tamamlandı 🎉',
                `Bugünkü tekrarlarını bitirdin!\n\nDoğru: ${score} / ${questions.length}`,
                [{ text: 'Harika!' }]
            );
        }
    };

    return {
        dueWords, questions, currentIndex,
        hasAnswered, isCorrect, score,
        isLoading, isDone,
        handleAnswer, goToNext, restart: load,
    };
}
