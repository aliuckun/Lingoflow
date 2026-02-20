import { useState } from 'react';
import { Alert } from 'react-native';
import { VocabularyService } from '../../services/vocabularyService';
import { Word } from '../../types/word';

interface UseAddVocabularyProps {
    onSuccess: () => void;
}

interface UseAddVocabularyReturn {
    state: {
        isLoading: boolean;
        error: string | null;
    };
    actions: {
        addWord: (word: Word) => Promise<void>;
        clearError: () => void;
    };
}

export const useAddVocabulary = ({ onSuccess }: UseAddVocabularyProps): UseAddVocabularyReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addWord = async (word: Word) => {
        setIsLoading(true);
        setError(null);

        try {
            const success = await VocabularyService.addWord(word);

            if (success) {
                Alert.alert(
                    "Başarılı ✓",
                    `"${word.word}" listenize eklendi.`,
                    [{ text: "Tamam", onPress: onSuccess }]
                );
            } else {
                throw new Error('Kelime eklenirken bir hata oluştu');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu';
            setError(errorMessage);
            Alert.alert("Hata", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        state: {
            isLoading,
            error
        },
        actions: {
            addWord,
            clearError
        }
    };
};