import { useCallback, useEffect, useState } from 'react';
import { VocabularyService } from '../../services/vocabularyService';
import { Word } from '../../types/word';

interface UseWordDetailProps {
    wordId: string;
}

interface UseWordDetailReturn {
    word: Word | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    updateWord: (updates: Partial<Word>) => Promise<void>;
    deleteWord: () => Promise<boolean>;
    toggleFavorite: () => Promise<void>;
    updateFamiliarity: (newLevel: number) => Promise<void>;
}

export const useWordDetail = ({ wordId }: UseWordDetailProps): UseWordDetailReturn => {
    const [word, setWord] = useState<Word | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadWord = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await VocabularyService.getWordById(wordId);
            setWord(data);

            if (!data) {
                setError('Kelime bulunamadı');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Kelime yüklenirken hata oluştu';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [wordId]);

    useEffect(() => {
        loadWord();
    }, [loadWord]);

    const refresh = async () => {
        await loadWord();
    };

    const updateWord = async (updates: Partial<Word>) => {
        try {
            const success = await VocabularyService.updateWord(wordId, updates);
            if (success) {
                setWord(prev => prev ? { ...prev, ...updates } : null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Kelime güncellenirken hata oluştu';
            setError(errorMessage);
        }
    };

    const deleteWord = async (): Promise<boolean> => {
        try {
            const success = await VocabularyService.deleteWord(wordId);
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Kelime silinirken hata oluştu';
            setError(errorMessage);
            return false;
        }
    };

    const toggleFavorite = async () => {
        try {
            const success = await VocabularyService.toggleFavorite(wordId);
            if (success && word) {
                setWord({ ...word, isFavorite: !word.isFavorite });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Favori değiştirilirken hata oluştu';
            setError(errorMessage);
        }
    };

    const updateFamiliarity = async (newLevel: number) => {
        if (newLevel < 0 || newLevel > 5) {
            setError('Aşinalık seviyesi 0-5 arasında olmalıdır');
            return;
        }

        try {
            const success = await VocabularyService.updateWord(wordId, { familiarity: newLevel });
            if (success && word) {
                setWord({ ...word, familiarity: newLevel });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Aşinalık güncellenirken hata oluştu';
            setError(errorMessage);
        }
    };

    return {
        word,
        isLoading,
        error,
        refresh,
        updateWord,
        deleteWord,
        toggleFavorite,
        updateFamiliarity
    };
};