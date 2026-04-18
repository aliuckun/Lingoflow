/**
 * src/hooks/useProgress.ts
 *
 * AsyncStorage'daki kelime verisinden profil istatistiklerini hesaplar.
 * Ekran her focus olduğunda yeniden yükler.
 */

import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { VocabularyService } from '../services/vocabularyService';
import { PartOfSpeech, Word } from '../types/word';

export interface ProgressStats {
    // Genel
    totalWords: number;
    learnedWords: number;       // familiarity >= 4
    favoriteWords: number;
    wordsWithExamples: number;

    // Pratik
    totalCorrect: number;
    totalWrong: number;
    successRate: number;        // 0–100
    totalPracticed: number;     // en az 1 kez pratik yapılan kelime sayısı

    // Kelime türü dağılımı
    posDist: { pos: PartOfSpeech; count: number; label: string; color: string }[];

    // Aşinalık dağılımı (0–5)
    familiarityDist: { level: number; count: number; label: string }[];

    // Son eklenen 5 kelime
    recentWords: Word[];

    // Rozet hesabı
    badges: Badge[];

    isLoading: boolean;
}

export interface Badge {
    id: string;
    emoji: string;
    title: string;
    description: string;
    unlocked: boolean;
}

const POS_LABELS: Record<PartOfSpeech, string> = {
    noun: 'İsim', verb: 'Fiil', adjective: 'Sıfat', adverb: 'Zarf',
    preposition: 'Edat', conjunction: 'Bağlaç', pronoun: 'Zamir', other: 'Diğer'
};

const POS_COLORS: Record<PartOfSpeech, string> = {
    noun: '#5856D6', verb: '#FF9500', adjective: '#34C759', adverb: '#AF52DE',
    preposition: '#5AC8FA', conjunction: '#FF2D55', pronoun: '#FFCC00', other: '#8E8E93'
};

const FAM_LABELS = ['Bilinmiyor', 'Yeni', 'Tanıdık', 'Biliyorum', 'İyi Biliyorum', 'Tam Öğrendim'];

function computeBadges(words: Word[]): Badge[] {
    const total = words.length;
    const learned = words.filter(w => (w.familiarity ?? 0) >= 4).length;
    const favorites = words.filter(w => w.isFavorite).length;
    const totalCorrect = words.reduce((s, w) => s + (w.correctCount ?? 0), 0);
    const withExamples = words.filter(w => w.examples?.length > 0).length;
    const verbCount = words.filter(w => w.partOfSpeech === 'verb').length;

    return [
        {
            id: 'first_word',
            emoji: '🌱',
            title: 'İlk Adım',
            description: 'İlk kelimeni ekle',
            unlocked: total >= 1
        },
        {
            id: 'ten_words',
            emoji: '📚',
            title: 'Kelime Avcısı',
            description: '10 kelime ekle',
            unlocked: total >= 10
        },
        {
            id: 'fifty_words',
            emoji: '🏆',
            title: 'Kelime Ustası',
            description: '50 kelime ekle',
            unlocked: total >= 50
        },
        {
            id: 'learned_ten',
            emoji: '🧠',
            title: 'Öğrenci',
            description: '10 kelimeyi tam öğren',
            unlocked: learned >= 10
        },
        {
            id: 'hundred_correct',
            emoji: '🎯',
            title: 'Keskin Nişancı',
            description: '100 doğru cevap ver',
            unlocked: totalCorrect >= 100
        },
        {
            id: 'favorites',
            emoji: '⭐',
            title: 'Koleksiyoner',
            description: '5 kelimeyi favorile',
            unlocked: favorites >= 5
        },
        {
            id: 'examples',
            emoji: '✍️',
            title: 'Cümle Kurdu',
            description: '10 kelimeye örnek cümle ekle',
            unlocked: withExamples >= 10
        },
        {
            id: 'verbs',
            emoji: '⚡',
            title: 'Fiil Kaşifi',
            description: '10 fiil öğren',
            unlocked: verbCount >= 10
        },
    ];
}

export function useProgress(): ProgressStats {
    const [stats, setStats] = useState<ProgressStats>({
        totalWords: 0,
        learnedWords: 0,
        favoriteWords: 0,
        wordsWithExamples: 0,
        totalCorrect: 0,
        totalWrong: 0,
        successRate: 0,
        totalPracticed: 0,
        posDist: [],
        familiarityDist: [],
        recentWords: [],
        badges: [],
        isLoading: true,
    });

    const load = useCallback(async () => {
        setStats(s => ({ ...s, isLoading: true }));
        const words = await VocabularyService.getAllWords();

        // Genel
        const totalWords = words.length;
        const learnedWords = words.filter(w => (w.familiarity ?? 0) >= 4).length;
        const favoriteWords = words.filter(w => w.isFavorite).length;
        const wordsWithExamples = words.filter(w => w.examples?.length > 0).length;

        // Pratik
        const totalCorrect = words.reduce((s, w) => s + (w.correctCount ?? 0), 0);
        const totalWrong = words.reduce((s, w) => s + (w.wrongCount ?? 0), 0);
        const totalAttempts = totalCorrect + totalWrong;
        const successRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
        const totalPracticed = words.filter(w => (w.correctCount ?? 0) + (w.wrongCount ?? 0) > 0).length;

        // POS dağılımı
        const posMap: Partial<Record<PartOfSpeech, number>> = {};
        words.forEach(w => { posMap[w.partOfSpeech] = (posMap[w.partOfSpeech] ?? 0) + 1; });
        const posDist = (Object.entries(posMap) as [PartOfSpeech, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([pos, count]) => ({ pos, count, label: POS_LABELS[pos], color: POS_COLORS[pos] }));

        // Aşinalık dağılımı
        const famMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        words.forEach(w => { famMap[w.familiarity ?? 0]++; });
        const familiarityDist = Object.entries(famMap).map(([level, count]) => ({
            level: Number(level),
            count,
            label: FAM_LABELS[Number(level)]
        }));

        // Son eklenenler
        const recentWords = [...words]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);

        // Rozetler
        const badges = computeBadges(words);

        setStats({
            totalWords, learnedWords, favoriteWords, wordsWithExamples,
            totalCorrect, totalWrong, successRate, totalPracticed,
            posDist, familiarityDist, recentWords, badges,
            isLoading: false,
        });
    }, []);

    useFocusEffect(
        useCallback(() => { load(); }, [load])
    );

    return stats;
}