export type PartOfSpeech =
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "preposition"
    | "conjunction"
    | "pronoun"
    | "other";

export interface Example {
    example: string;
    exampleMeaning: string;
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
}

export interface Word {
    id: string;

    word: string;
    meaning: string;

    partOfSpeech: PartOfSpeech;

    examples: Example[];

    verbDetails?: VerbDetails;

    // kullanıcı & pratik verisi
    familiarity?: number;     // 0–5
    correctCount?: number;
    wrongCount?: number;
    isFavorite?: boolean;

    createdAt: number;
    lastReviewedAt?: number;
}
