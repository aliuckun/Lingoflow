import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word } from '../types/word';

const STORAGE_KEY = '@lingoflow_vocabulary';

export class VocabularyService {
    /**
     * Tüm kelimeleri getir
     */
    static async getAllWords(): Promise<Word[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Kelimeler getirilirken hata:', error);
            return [];
        }
    }

    /**
     * Yeni kelime ekle
     */
    static async addWord(word: Word): Promise<boolean> {
        try {
            const words = await this.getAllWords();
            words.push(word);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
            return true;
        } catch (error) {
            console.error('Kelime eklenirken hata:', error);
            return false;
        }
    }

    /**
     * Kelime güncelle
     */
    static async updateWord(id: string, updatedWord: Partial<Word>): Promise<boolean> {
        try {
            const words = await this.getAllWords();
            const index = words.findIndex(w => w.id === id);

            if (index === -1) return false;

            words[index] = { ...words[index], ...updatedWord };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
            return true;
        } catch (error) {
            console.error('Kelime güncellenirken hata:', error);
            return false;
        }
    }

    /**
     * Kelime sil
     */
    static async deleteWord(id: string): Promise<boolean> {
        try {
            const words = await this.getAllWords();
            const filtered = words.filter(w => w.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Kelime silinirken hata:', error);
            return false;
        }
    }

    /**
     * ID'ye göre kelime getir
     */
    static async getWordById(id: string): Promise<Word | null> {
        try {
            const words = await this.getAllWords();
            return words.find(w => w.id === id) || null;
        } catch (error) {
            console.error('Kelime getirilirken hata:', error);
            return null;
        }
    }

    /**
     * Favori durumunu değiştir
     */
    static async toggleFavorite(id: string): Promise<boolean> {
        try {
            const words = await this.getAllWords();
            const index = words.findIndex(w => w.id === id);

            if (index === -1) return false;

            words[index].isFavorite = !words[index].isFavorite;
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
            return true;
        } catch (error) {
            console.error('Favori değiştirilirken hata:', error);
            return false;
        }
    }

    /**
     * Pratik sonrası güncelle (doğru/yanlış sayısı)
     */
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
                word.correctCount = (word.correctCount || 0) + 1;
            } else {
                word.wrongCount = (word.wrongCount || 0) + 1;
            }

            word.lastReviewedAt = Date.now();

            if (newFamiliarity !== undefined) {
                word.familiarity = newFamiliarity;
            }

            words[index] = word;
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
            return true;
        } catch (error) {
            console.error('Pratik istatistikleri güncellenirken hata:', error);
            return false;
        }
    }

    /**
     * Tüm veriyi temizle (dikkatli kullanın!)
     */
    static async clearAll(): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Veriler temizlenirken hata:', error);
            return false;
        }
    }

    /**
     * JSON export için veri al
     */
    static async exportData(): Promise<string> {
        try {
            const words = await this.getAllWords();
            return JSON.stringify(words, null, 2);
        } catch (error) {
            console.error('Veri export edilirken hata:', error);
            return '[]';
        }
    }

    /**
     * JSON import et
     */
    static async importData(jsonData: string): Promise<boolean> {
        try {
            const words: Word[] = JSON.parse(jsonData);

            // Validasyon
            if (!Array.isArray(words)) return false;

            const existingWords = await this.getAllWords();
            const mergedWords = [...existingWords];

            // Aynı ID'ye sahip kelimeleri güncelle, yenileri ekle
            words.forEach(newWord => {
                const existingIndex = mergedWords.findIndex(w => w.id === newWord.id);
                if (existingIndex !== -1) {
                    mergedWords[existingIndex] = newWord;
                } else {
                    mergedWords.push(newWord);
                }
            });

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedWords));
            return true;
        } catch (error) {
            console.error('Veri import edilirken hata:', error);
            return false;
        }
    }

    /**
     * Kelime türüne göre filtrele
     */
    static async getWordsByPartOfSpeech(partOfSpeech: string): Promise<Word[]> {
        try {
            const words = await this.getAllWords();
            return words.filter(w => w.partOfSpeech === partOfSpeech);
        } catch (error) {
            console.error('Kelimeler filtrelenirken hata:', error);
            return [];
        }
    }

    /**
     * Arama yap
     */
    static async searchWords(query: string): Promise<Word[]> {
        try {
            const words = await this.getAllWords();
            const lowerQuery = query.toLowerCase();

            return words.filter(w =>
                w.word.toLowerCase().includes(lowerQuery) ||
                w.meaning.toLowerCase().includes(lowerQuery)
            );
        } catch (error) {
            console.error('Arama yapılırken hata:', error);
            return [];
        }
    }
}