import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { recordPractice } from '../../services/streakService';
import { VocabularyService } from '../../services/vocabularyService';
import { Word } from '../../types/word';

// ─── Tipler ───────────────────────────────────────────────────────────────────
export type PracticeMode = 'meaning' | 'perfekt' | 'writing' | 'artikel';

export interface PracticeQuestion {
    id: string;
    wordId: string;
    mode: PracticeMode;
    question: string;
    options: string[];           // boş ise yazma modu
    correctAnswer: string;
    sentence?: string;
    translation?: string;
    word: Word;
    // Yazma modu: hangi yönde?
    writingDirection?: 'tr2de' | 'de2tr';
}

// Yazma modu cevap durumu
export type WriteResult = 'correct' | 'almost' | 'wrong' | null;

interface UsePracticeReturn {
    questions: PracticeQuestion[];
    currentIndex: number;
    isLoading: boolean;
    error: string | null;
    currentQuestion: PracticeQuestion | null;
    hasAnswered: boolean;
    isCorrect: boolean | null;
    writeResult: WriteResult;
    totalQuestions: number;
    score: number;
    selectedMode: PracticeMode;
    setSelectedMode: (m: PracticeMode) => void;
    isReady: boolean;
    startPractice: () => void;
    goToNext: () => void;
    handleAnswer: (selected: string) => void;
    handleWriteAnswer: (typed: string) => void;
    resetPractice: () => void;
}

// ─── Fisher-Yates ─────────────────────────────────────────────────────────────
const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// ─── Levenshtein mesafesi ─────────────────────────────────────────────────────
function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

// Tolerans: ≤4 harf → 0, 5-8 → 1, 9+ → 2
function tolerance(len: number): number {
    if (len <= 4) return 0;
    if (len <= 8) return 1;
    return 2;
}

export function checkWriteAnswer(typed: string, correct: string): WriteResult {
    const t = typed.trim().toLowerCase();
    const c = correct.trim().toLowerCase();
    if (t === c) return 'correct';
    const dist = levenshtein(t, c);
    if (dist <= tolerance(c.length)) return 'almost';
    return 'wrong';
}

// ─── Soru üreticiler ──────────────────────────────────────────────────────────

function genMeaning(words: Word[], count: number): PracticeQuestion[] {
    const selected = shuffle(words).slice(0, Math.min(count, words.length));
    return selected.map(word => {
        const others = words.filter(w => w.id !== word.id);
        const wrongs = shuffle(others).slice(0, 3).map(w => w.meaning);
        const options = shuffle([word.meaning, ...wrongs]);
        const ex = word.examples?.[0];
        return {
            id: `meaning_${word.id}`,
            wordId: word.id,
            mode: 'meaning' as PracticeMode,
            question: `"${word.word}" kelimesinin anlamı nedir?`,
            options,
            correctAnswer: word.meaning,
            sentence: ex?.example,
            translation: ex?.exampleMeaning,
            word,
        };
    });
}

function genPerfekt(words: Word[], count: number): PracticeQuestion[] {
    const verbs = words.filter(w => w.partOfSpeech === 'verb' && w.verbDetails?.perfekt?.partizip2);
    if (verbs.length === 0) return [];
    const selected = shuffle(verbs).slice(0, Math.min(count, verbs.length));
    return selected.map(word => {
        const correct = word.verbDetails!.perfekt!.partizip2;
        const hilfsverb = word.verbDetails!.perfekt!.hilfsverb;
        const otherP = verbs
            .filter(w => w.id !== word.id && w.verbDetails?.perfekt?.partizip2)
            .map(w => w.verbDetails!.perfekt!.partizip2);
        const wrongs = shuffle(otherP).slice(0, 3);
        while (wrongs.length < 3) wrongs.push(`ge${word.word.slice(0, 4)}t`);
        return {
            id: `perfekt_${word.id}`,
            wordId: word.id,
            mode: 'perfekt' as PracticeMode,
            question: `"${word.word}" fiilinin Perfekt Partizip II'si nedir?\n(Yardımcı fiil: ${hilfsverb})`,
            options: shuffle([correct, ...wrongs]),
            correctAnswer: correct,
            sentence: word.verbDetails?.perfekt?.perfektSatz,
            translation: undefined,
            word,
        };
    });
}

function genWriting(words: Word[], count: number): PracticeQuestion[] {
    const selected = shuffle(words).slice(0, Math.min(count, words.length));
    return selected.map(word => {
        const dir: 'tr2de' | 'de2tr' = Math.random() < 0.5 ? 'tr2de' : 'de2tr';
        const question = dir === 'tr2de'
            ? `"${word.meaning}" kelimesinin Almancasını yaz:`
            : `"${word.word}" kelimesinin Türkçesini yaz:`;
        const correct = dir === 'tr2de' ? word.word : word.meaning;
        const ex = word.examples?.[0];
        return {
            id: `writing_${word.id}_${dir}`,
            wordId: word.id,
            mode: 'writing' as PracticeMode,
            question,
            options: [],            // yazma modunda seçenek yok
            correctAnswer: correct,
            sentence: ex?.example,
            translation: ex?.exampleMeaning,
            word,
            writingDirection: dir,
        };
    });
}

function genArtikel(words: Word[], count: number): PracticeQuestion[] {
    const nouns = words.filter(w => w.partOfSpeech === 'noun' && w.artikel);
    if (nouns.length === 0) return [];
    const selected = shuffle(nouns).slice(0, Math.min(count, nouns.length));
    return selected.map(word => ({
        id: `artikel_${word.id}`,
        wordId: word.id,
        mode: 'artikel' as PracticeMode,
        question: `"${word.word}" kelimesinin artikeli nedir?`,
        options: ['der', 'die', 'das', 'pl'],
        correctAnswer: word.artikel!,
        word,
    }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const usePractice = (questionCount = 10): UsePracticeReturn => {
    const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [writeResult, setWriteResult] = useState<WriteResult>(null);
    const [score, setScore] = useState(0);
    const [selectedMode, setSelectedMode] = useState<PracticeMode>('meaning');
    const [isReady, setIsReady] = useState(false);

    const loadQuestions = async (mode: PracticeMode) => {
        setIsLoading(true);
        setError(null);
        try {
            const all = await VocabularyService.getAllWords();
            if (all.length === 0) { setError('Henüz kelime eklenmemiş.'); setIsLoading(false); return; }

            let qs: PracticeQuestion[] = [];

            if (mode === 'meaning') {
                if (all.length < 4) { setError('Anlam testi için en az 4 kelime gerekli.'); setIsLoading(false); return; }
                qs = genMeaning(all, questionCount);
            } else if (mode === 'perfekt') {
                const verbs = all.filter(w => w.partOfSpeech === 'verb' && w.verbDetails?.perfekt?.partizip2);
                if (verbs.length === 0) { setError('Perfekt testi için Partizip II girilmiş en az 1 fiil gerekli.'); setIsLoading(false); return; }
                qs = genPerfekt(all, questionCount);
            } else if (mode === 'writing') {
                if (all.length < 1) { setError('Yazma testi için en az 1 kelime gerekli.'); setIsLoading(false); return; }
                qs = genWriting(all, questionCount);
            } else if (mode === 'artikel') {
                const nouns = all.filter(w => w.partOfSpeech === 'noun' && w.artikel);
                if (nouns.length === 0) { setError('Artikel testi için artikel girilmiş en az 1 isim gerekli.'); setIsLoading(false); return; }
                qs = genArtikel(all, questionCount);
            }

            setQuestions(qs);
        } catch (e) {
            setError('Sorular yüklenirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const startPractice = () => {
        setIsReady(true);
        setCurrentIndex(0);
        setHasAnswered(false);
        setIsCorrect(null);
        setWriteResult(null);
        setScore(0);
        loadQuestions(selectedMode);
    };

    // Çoktan seçmeli cevap
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

    // Yazma modu cevap
    const handleWriteAnswer = async (typed: string) => {
        const current = questions[currentIndex];
        if (hasAnswered || !current) return;
        const result = checkWriteAnswer(typed, current.correctAnswer);
        const correct = result === 'correct' || result === 'almost';
        setWriteResult(result);
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
            setWriteResult(null);
        } else {
            Alert.alert(
                'Tebrikler! 🎉',
                `Pratik tamamlandı!\n\nDoğru: ${score}\nYanlış: ${questions.length - score}\nBaşarı: %${Math.round((score / questions.length) * 100)}`,
                [{ text: 'Tamam', onPress: resetPractice }]
            );
        }
    };

    const resetPractice = () => {
        setIsReady(false);
        setCurrentIndex(0);
        setHasAnswered(false);
        setIsCorrect(null);
        setWriteResult(null);
        setScore(0);
        setQuestions([]);
        setError(null);
    };

    return {
        questions, currentIndex, isLoading, error,
        currentQuestion: questions[currentIndex] || null,
        hasAnswered, isCorrect, writeResult,
        totalQuestions: questions.length, score,
        selectedMode, setSelectedMode,
        isReady, startPractice, goToNext,
        handleAnswer, handleWriteAnswer, resetPractice,
    };
};
