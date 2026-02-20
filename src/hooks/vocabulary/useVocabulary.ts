import { useCallback, useEffect, useState } from 'react';
import { VocabularyService } from '../../services/vocabularyService';
import { PartOfSpeech, Word } from '../../types/word';

interface UseVocabularyReturn {
    words: Word[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    deleteWord: (id: string) => Promise<void>;
    toggleFavorite: (id: string) => Promise<void>;
    searchWords: (query: string) => Promise<void>;
    filterByPartOfSpeech: (pos: PartOfSpeech | null) => Promise<void>;
}

export const useVocabulary = (): UseVocabularyReturn => {
    const [words, setWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadWords = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await VocabularyService.getAllWords();
            setWords(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Kelimeler yüklenirken hata oluştu';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadWords();
    }, [loadWords]);

    const refresh = async () => {
        await loadWords();
    };

    const deleteWord = async (id: string) => {
        try {
            const success = await VocabularyService.deleteWord(id);
            if (success) {
                setWords(prev => prev.filter(w => w.id !== id));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Kelime silinirken hata oluştu';
            setError(errorMessage);
        }
    };

    const toggleFavorite = async (id: string) => {
        try {
            const success = await VocabularyService.toggleFavorite(id);
            if (success) {
                setWords(prev => prev.map(w =>
                    w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
                ));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Favori değiştirilirken hata oluştu';
            setError(errorMessage);
        }
    };

    const searchWords = async (query: string) => {
        if (!query.trim()) {
            await loadWords();
            return;
        }

        setIsLoading(true);
        try {
            const results = await VocabularyService.searchWords(query);
            setWords(results);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Arama yapılırken hata oluştu';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const filterByPartOfSpeech = async (pos: PartOfSpeech | null) => {
        if (!pos) {
            await loadWords();
            return;
        }

        setIsLoading(true);
        try {
            const results = await VocabularyService.getWordsByPartOfSpeech(pos);
            setWords(results);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Filtreleme yapılırken hata oluştu';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        words,
        isLoading,
        error,
        refresh,
        deleteWord,
        toggleFavorite,
        searchWords,
        filterByPartOfSpeech
    };
};