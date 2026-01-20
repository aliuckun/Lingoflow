// src/constants/routes.ts
export const ROUTES = {
    HOME: 'index',
    LIBRARY: 'library/index',
    VOCABULARY: 'vocabulary/index', // Yeni eklenen
    WORDS: 'words/index',
    WORD_DETAIL: (id: string | number) => `words/${id}`,
    PRACTICE: 'practice/index',
    PROGRESS: 'progress/index',
} as const;