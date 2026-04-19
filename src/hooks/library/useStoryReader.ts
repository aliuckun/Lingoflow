/**
 * src/hooks/library/useStoryReader.ts
 *
 * Hikaye okuma sayfası için tüm iş mantığı:
 * - Kelime üstüne tıklayınca MyMemory API ile çeviri
 * - Kelimeyi sözlüğe kaydet
 * - Bölüm bazlı TTS (expo-speech)
 * - Tüm hikaye TTS (otomatik bölüm geçişi)
 * - Okuma ilerlemesi takibi
 * - Yazı boyutu ayarı
 */

import * as Speech from 'expo-speech';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { VocabularyService } from '../../services/vocabularyService';
import { Word } from '../../types/word';

// ── Tipler ────────────────────────────────────────────────────────────────────

export interface TranslationResult {
    originalWord: string;
    translation: string;
    isLoading: boolean;
    error: string | null;
}

export interface UseStoryReaderReturn {
    // Yazı boyutu
    fontSize: number;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;

    // Konuşma (TTS)
    speakingIndex: number | null;       // hangi paragraf konuşuluyor
    isPlayingAll: boolean;              // tüm hikaye oynatılıyor mu
    speakParagraph: (text: string, index: number) => void;
    stopSpeaking: () => void;
    playAll: (paragraphs: string[]) => void;

    // Kelime çevirisi
    translation: TranslationResult | null;
    translateWord: (word: string) => Promise<void>;
    clearTranslation: () => void;
    saveWordToVocab: (word: string, translation: string) => Promise<void>;

    // Okuma ilerlemesi
    readParagraphs: Set<number>;
    markAsRead: (index: number) => void;
    readingProgress: number;            // 0–100
}

// ── Yardımcı: Almanca stopwords ───────────────────────────────────────────────
const DE_STOPWORDS = new Set([
    'der', 'die', 'das', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
    'und', 'oder', 'aber', 'ist', 'sind', 'war', 'waren', 'hat', 'haben',
    'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'Sie',
    'in', 'an', 'auf', 'mit', 'von', 'zu', 'bei', 'nach', 'aus',
    'nicht', 'auch', 'noch', 'schon', 'nur', 'sehr', 'so', 'dann',
    'als', 'wie', 'wenn', 'dass', 'ob', 'weil', 'da',
]);

function cleanWord(raw: string): string {
    return raw.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').toLowerCase();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useStoryReader(totalParagraphs: number): UseStoryReaderReturn {

    // Yazı boyutu
    const [fontSize, setFontSize] = useState(17);
    const increaseFontSize = () => setFontSize(s => Math.min(s + 2, 26));
    const decreaseFontSize = () => setFontSize(s => Math.max(s - 2, 13));

    // TTS
    const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
    const [isPlayingAll, setIsPlayingAll] = useState(false);
    const playAllRef = useRef(false);

    const stopSpeaking = useCallback(() => {
        Speech.stop();
        setSpeakingIndex(null);
        setIsPlayingAll(false);
        playAllRef.current = false;
    }, []);

    const speakParagraph = useCallback((text: string, index: number) => {
        // Aynı paragraf tekrar tıklandıysa durdur
        if (speakingIndex === index) {
            stopSpeaking();
            return;
        }
        Speech.stop();
        setSpeakingIndex(index);
        setIsPlayingAll(false);
        playAllRef.current = false;

        Speech.speak(text, {
            language: 'de',
            rate: 0.82,
            onDone: () => setSpeakingIndex(null),
            onError: () => setSpeakingIndex(null),
        });
    }, [speakingIndex, stopSpeaking]);

    // Tüm hikayeleri sırayla oku
    const playAll = useCallback((paragraphs: string[]) => {
        if (isPlayingAll) {
            stopSpeaking();
            return;
        }

        playAllRef.current = true;
        setIsPlayingAll(true);
        setSpeakingIndex(0);

        const speakNext = (index: number) => {
            if (!playAllRef.current || index >= paragraphs.length) {
                setSpeakingIndex(null);
                setIsPlayingAll(false);
                playAllRef.current = false;
                return;
            }

            setSpeakingIndex(index);
            Speech.speak(paragraphs[index], {
                language: 'de',
                rate: 0.82,
                onDone: () => speakNext(index + 1),
                onError: () => {
                    setSpeakingIndex(null);
                    setIsPlayingAll(false);
                    playAllRef.current = false;
                },
            });
        };

        speakNext(0);
    }, [isPlayingAll, stopSpeaking]);

    // Çeviri
    const [translation, setTranslation] = useState<TranslationResult | null>(null);

    const translateWord = useCallback(async (rawWord: string) => {
        const word = cleanWord(rawWord);

        // Stopword veya çok kısa kelimeleri atla
        if (!word || word.length < 3 || DE_STOPWORDS.has(word)) return;

        setTranslation({ originalWord: rawWord, translation: '', isLoading: true, error: null });

        try {
            // MyMemory - ücretsiz, key gerektirmeyen çeviri API
            const res = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=de|tr`
            );
            const data = await res.json();

            if (data.responseStatus === 200) {
                const t = data.responseData.translatedText as string;
                // API bazen orjinal kelimeyi döndürüyor — kontrol et
                if (t.toLowerCase() === word.toLowerCase()) {
                    setTranslation({
                        originalWord: rawWord,
                        translation: 'Çeviri bulunamadı',
                        isLoading: false,
                        error: null
                    });
                } else {
                    setTranslation({
                        originalWord: rawWord,
                        translation: t,
                        isLoading: false,
                        error: null
                    });
                }
            } else {
                throw new Error('API hatası');
            }
        } catch {
            setTranslation({
                originalWord: rawWord,
                translation: '',
                isLoading: false,
                error: 'Çeviri yapılamadı'
            });
        }
    }, []);

    const clearTranslation = useCallback(() => setTranslation(null), []);

    // Kelimeyi sözlüğe kaydet
    const saveWordToVocab = useCallback(async (word: string, meaning: string) => {
        const cleaned = cleanWord(word);
        if (!cleaned || !meaning) return;

        const newWord: Word = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            word: cleaned,
            meaning: meaning,
            partOfSpeech: 'other',
            examples: [],
            createdAt: Date.now(),
            familiarity: 0,
            correctCount: 0,
            wrongCount: 0,
            isFavorite: false,
        };

        const success = await VocabularyService.addWord(newWord);
        if (success) {
            Alert.alert('Kaydedildi ✓', `"${cleaned}" sözlüğüne eklendi.`);
            clearTranslation();
        } else {
            Alert.alert('Hata', 'Kelime kaydedilemedi.');
        }
    }, [clearTranslation]);

    // Okuma ilerlemesi
    const [readParagraphs, setReadParagraphs] = useState<Set<number>>(new Set());

    const markAsRead = useCallback((index: number) => {
        setReadParagraphs(prev => new Set(prev).add(index));
    }, []);

    const readingProgress = totalParagraphs > 0
        ? Math.round((readParagraphs.size / totalParagraphs) * 100)
        : 0;

    return {
        fontSize, increaseFontSize, decreaseFontSize,
        speakingIndex, isPlayingAll, speakParagraph, stopSpeaking, playAll,
        translation, translateWord, clearTranslation, saveWordToVocab,
        readParagraphs, markAsRead, readingProgress,
    };
}