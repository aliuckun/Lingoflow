/**
 * useWordEdit
 *
 * useWordDetail hook'unun üzerine inşa edilmiş düzenleme katmanı.
 * - Görüntüleme / düzenleme modu geçişi
 * - Form field state'leri (word, meaning, pos, examples, verbDetails, perfekt)
 * - Kaydet: updateWord çağırır
 * - Sil: deleteWord çağırır, başarılıysa geri döner
 * - toggleFavorite, updateFamiliarity: useWordDetail'den direkt geçer
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Example, PartOfSpeech, PerfektDetails, VerbDetails, Word } from '../../types/word';
import { useWordDetail } from './useWorddetail';

// ─── Tip tanımları ────────────────────────────────────────────────────────────

interface ConjugationFields {
    ich: string;
    du: string;
    erSieEs: string;
    wir: string;
    ihr: string;
    sieSie: string;
}

export interface UseWordEditReturn {
    // Veri
    word: Word | null;
    isLoading: boolean;
    error: string | null;

    // Mod
    isEditMode: boolean;
    setIsEditMode: (v: boolean) => void;

    // Form alanları
    editWord: string;
    setEditWord: (v: string) => void;
    editMeaning: string;
    setEditMeaning: (v: string) => void;
    editPos: PartOfSpeech;
    setEditPos: (v: PartOfSpeech) => void;
    editExamples: Example[];
    setEditExamples: (v: Example[]) => void;
    editConjugations: ConjugationFields;
    setEditConjugations: (v: ConjugationFields) => void;

    // YENİ: Perfekt alanları
    editPerfekt: PerfektDetails;
    setEditPerfekt: (v: PerfektDetails) => void;

    // İşlemler
    isSaving: boolean;
    saveEdits: () => Promise<void>;
    cancelEdit: () => void;
    confirmDelete: (onSuccess: () => void) => void;
    toggleFavorite: () => Promise<void>;
    updateFamiliarity: (level: number) => Promise<void>;
    refresh: () => Promise<void>;

    // Örnek cümle yardımcıları
    addExample: () => void;
    removeExample: (index: number) => void;
    updateExample: (index: number, field: keyof Example, value: string) => void;
}

const DEFAULT_CONJUGATIONS: ConjugationFields = {
    ich: '', du: '', erSieEs: '', wir: '', ihr: '', sieSie: ''
};

const DEFAULT_PERFEKT: PerfektDetails = {
    partizip2: '',
    hilfsverb: 'haben',
    perfektSatz: '',
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useWordEdit = (wordId: string): UseWordEditReturn => {
    const detail = useWordDetail({ wordId });

    // Mod
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form field'ları
    const [editWord, setEditWord] = useState('');
    const [editMeaning, setEditMeaning] = useState('');
    const [editPos, setEditPos] = useState<PartOfSpeech>('noun');
    const [editExamples, setEditExamples] = useState<Example[]>([]);
    const [editConjugations, setEditConjugations] = useState<ConjugationFields>(DEFAULT_CONJUGATIONS);
    const [editPerfekt, setEditPerfekt] = useState<PerfektDetails>(DEFAULT_PERFEKT);

    // Word yüklenince form'u doldur
    const populateForm = useCallback((w: Word) => {
        setEditWord(w.word);
        setEditMeaning(w.meaning);
        setEditPos(w.partOfSpeech);
        setEditExamples(w.examples ? [...w.examples] : []);
        setEditConjugations(
            w.verbDetails?.conjugations
                ? { ...w.verbDetails.conjugations }
                : DEFAULT_CONJUGATIONS
        );
        // YENİ: mevcut perfekt verisini form'a yükle
        setEditPerfekt(
            w.verbDetails?.perfekt
                ? { ...w.verbDetails.perfekt }
                : DEFAULT_PERFEKT
        );
    }, []);

    useEffect(() => {
        if (detail.word) {
            populateForm(detail.word);
        }
    }, [detail.word, populateForm]);

    // ── Kaydet ────────────────────────────────────────────────────────────────
    const saveEdits = async () => {
        if (!editWord.trim() || !editMeaning.trim()) {
            Alert.alert('Hata', 'Kelime ve anlam alanları boş bırakılamaz.');
            return;
        }

        setIsSaving(true);
        try {
            let verbDetails: VerbDetails | undefined = undefined;

            if (editPos === 'verb') {
                // Perfekt doluysa ekle, boşsa undefined bırak
                const perfektToSave: PerfektDetails | undefined =
                    editPerfekt.partizip2.trim()
                        ? {
                            partizip2: editPerfekt.partizip2.trim(),
                            hilfsverb: editPerfekt.hilfsverb,
                            perfektSatz: editPerfekt.perfektSatz?.trim() || undefined,
                        }
                        : undefined;

                verbDetails = {
                    infinitive: editWord.trim(),
                    conjugations: editConjugations,
                    perfekt: perfektToSave,
                };
            }

            const updates: Partial<Word> = {
                word: editWord.trim(),
                meaning: editMeaning.trim(),
                partOfSpeech: editPos,
                examples: editExamples.filter(
                    (e) => e.example.trim() || e.exampleMeaning.trim()
                ),
                verbDetails,
            };

            await detail.updateWord(updates);
            setIsEditMode(false);
            Alert.alert('Kaydedildi ✓', `"${editWord.trim()}" güncellendi.`);
        } finally {
            setIsSaving(false);
        }
    };

    // ── İptal ─────────────────────────────────────────────────────────────────
    const cancelEdit = () => {
        if (detail.word) populateForm(detail.word);
        setIsEditMode(false);
    };

    // ── Sil ───────────────────────────────────────────────────────────────────
    const confirmDelete = (onSuccess: () => void) => {
        Alert.alert(
            'Kelimeyi Sil',
            `"${detail.word?.word}" kelimesini kalıcı olarak silmek istediğinize emin misiniz?`,
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await detail.deleteWord();
                        if (success) onSuccess();
                    }
                }
            ]
        );
    };

    // ── Örnek cümle yardımcıları ──────────────────────────────────────────────
    const addExample = () => {
        setEditExamples((prev) => [...prev, { example: '', exampleMeaning: '' }]);
    };

    const removeExample = (index: number) => {
        setEditExamples((prev) => prev.filter((_, i) => i !== index));
    };

    const updateExample = (index: number, field: keyof Example, value: string) => {
        setEditExamples((prev) =>
            prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
        );
    };

    return {
        word: detail.word,
        isLoading: detail.isLoading,
        error: detail.error,

        isEditMode,
        setIsEditMode,

        editWord,
        setEditWord,
        editMeaning,
        setEditMeaning,
        editPos,
        setEditPos,
        editExamples,
        setEditExamples,
        editConjugations,
        setEditConjugations,

        // YENİ
        editPerfekt,
        setEditPerfekt,

        isSaving,
        saveEdits,
        cancelEdit,
        confirmDelete,
        toggleFavorite: detail.toggleFavorite,
        updateFamiliarity: detail.updateFamiliarity,
        refresh: detail.refresh,

        addExample,
        removeExample,
        updateExample,
    };
};
