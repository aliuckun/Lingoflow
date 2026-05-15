export type PartOfSpeech =
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "preposition"
    | "conjunction"
    | "pronoun"
    | "other";

export type Artikel = 'der' | 'die' | 'das' | 'pl';

export interface Example {
    example: string;
    exampleMeaning: string;
}

export interface PerfektDetails {
    partizip2: string;
    hilfsverb: 'haben' | 'sein';
    perfektSatz?: string;
}

export interface VerbDetails {
    infinitive: string;
    conjugations: {
        ich: string;
        du: string;
        erSieEs: string;
        wir: string;
        ihr: string;
        sieSie: string;
    };
    isSeparable?: boolean;
    perfekt?: PerfektDetails;
}

export interface Word {
    id: string;

    word: string;
    meaning: string;

    partOfSpeech: PartOfSpeech;

    // YENİ: Almanca artikel (yalnızca isimler için)
    artikel?: Artikel;

    examples: Example[];
    verbDetails?: VerbDetails;

    // Kullanıcı & pratik verisi
    familiarity?: number;       // 0–5
    correctCount?: number;
    wrongCount?: number;
    isFavorite?: boolean;

    // YENİ: SM-2 Spaced Repetition alanları
    sm2Repetitions?: number;    // üst üste doğru bilindi sayısı
    sm2EF?: number;             // zorluk faktörü (başlangıç: 2.5)
    sm2NextReview?: number;     // timestamp — ne zaman tekrar gösterilecek

    createdAt: number;
    lastReviewedAt?: number;
}
