import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word } from '../types/word';

const STORAGE_KEY = '@lingoflow_vocabulary';

// ─── SM-2 Algoritması ─────────────────────────────────────────────────────────
// quality: 1 = doğru, 0 = yanlış (bizim kullanım için basitleştirildi)
export function computeSM2(word: Word, isCorrect: boolean): Partial<Word> {
    const q = isCorrect ? 5 : 1;                    // SM-2'ye dönüştür
    const n = word.sm2Repetitions ?? 0;
    const ef = word.sm2EF ?? 2.5;

    // Yeni zorluk faktörü (EF asla 1.3'ün altına düşmez)
    const newEF = Math.max(1.3, ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

    let newRepetitions: number;
    let intervalDays: number;

    if (!isCorrect) {
        newRepetitions = 0;
        intervalDays = 1;
    } else {
        newRepetitions = n + 1;
        if (n === 0) intervalDays = 1;
        else if (n === 1) intervalDays = 6;
        else intervalDays = Math.round((word.sm2NextReview
            ? daysBetweenNowAndLast(word)
            : 6) * newEF);
    }

    const nextReview = Date.now() + intervalDays * 86_400_000;

    return {
        sm2Repetitions: newRepetitions,
        sm2EF: newEF,
        sm2NextReview: nextReview,
    };
}

function daysBetweenNowAndLast(word: Word): number {
    if (!word.lastReviewedAt) return 6;
    return Math.max(1, Math.round((Date.now() - word.lastReviewedAt) / 86_400_000));
}

// ─── Bugün tekrar edilmesi gereken kelimeler ──────────────────────────────────
export function getDueWords(words: Word[]): Word[] {
    const now = Date.now();
    return words.filter(w => {
        if (!w.sm2NextReview) return true;   // hiç çalışılmamış
        return w.sm2NextReview <= now;
    });
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────
export class VocabularyService {
    static async getAllWords(): Promise<Word[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    static async addWord(word: Word): Promise<boolean> {
        try {
            const words = await this.getAllWords();
            words.push(word);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
            return true;
        } catch {
            return false;
        }
    }

    static async updateWord(id: string, updatedWord: Partial<Word>): Promise<boolean> {
        try {
            const words = await this.getAllWords();
            const index = words.findIndex(w => w.id === id);
            if (index === -1) return false;
            words[index] = { ...words[index], ...updatedWord };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
            return true;
        } catch {
            return false;
        }
    }

    static async deleteWord(id: string): Promise<boolean> {
        try {
            const words = await this.getAllWords();
            const filtered = words.filter(w => w.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            return true;
        } catch {
            return false;
        }
    }

    static async getWordById(id: string): Promise<Word | null> {
        try {
            const words = await this.getAllWords();
            return words.find(w => w.id === id) || null;
        } catch {
            return null;
        }
    }

    static async toggleFavorite(id: string): Promise<boolean> {
        try {
            const words = await this.getAllWords();
            const index = words.findIndex(w => w.id === id);
            if (index === -1) return false;
            words[index].isFavorite = !words[index].isFavorite;
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
            return true;
        } catch {
            return false;
        }
    }

    // YENİ: SM-2 dahil istatistik güncelleme
    static async updatePracticeStats(
        id: string,
        isCorrect: boolean,
        newFamiliarity?: number
    ): Promise<boolean> {
        try {
            const words = await this.getAllWords();
            const index = words.findIndex(w => w.id === id);
            if (index === -1) return false;

            const word = words[index];

            if (isCorrect) {
                word.correctCount = (word.correctCount ?? 0) + 1;
            } else {
                word.wrongCount = (word.wrongCount ?? 0) + 1;
            }

            word.lastReviewedAt = Date.now();

            if (newFamiliarity !== undefined) {
                word.familiarity = newFamiliarity;
            }

            // SM-2 güncelle
            const sm2 = computeSM2(word, isCorrect);
            Object.assign(word, sm2);

            words[index] = word;
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
            return true;
        } catch {
            return false;
        }
    }

    static async clearAll(): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            return true;
        } catch {
            return false;
        }
    }

    static async exportData(): Promise<string> {
        try {
            const words = await this.getAllWords();
            return JSON.stringify(words, null, 2);
        } catch {
            return '[]';
        }
    }

    static async importData(jsonData: string): Promise<boolean> {
        try {
            const words: Word[] = JSON.parse(jsonData);
            if (!Array.isArray(words)) return false;
            const existing = await this.getAllWords();
            const merged = [...existing];
            words.forEach(nw => {
                const idx = merged.findIndex(w => w.id === nw.id);
                if (idx !== -1) merged[idx] = nw;
                else merged.push(nw);
            });
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return true;
        } catch {
            return false;
        }
    }

    static async getWordsByPartOfSpeech(partOfSpeech: string): Promise<Word[]> {
        try {
            const words = await this.getAllWords();
            return words.filter(w => w.partOfSpeech === partOfSpeech);
        } catch {
            return [];
        }
    }

    static async searchWords(query: string): Promise<Word[]> {
        try {
            const words = await this.getAllWords();
            const q = query.toLowerCase();
            return words.filter(w =>
                w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q)
            );
        } catch {
            return [];
        }
    }
}
