// src/constants/routes.ts
export const ROUTES = {
    HOME: 'index',
    LIBRARY: 'library/index',

    // ✅ Dinamik kitap detay rotası eklendi
    LIBRARY_DETAIL: (id: string) => ({
        pathname: '/library/[id]',
        params: { id }
    } as const),

    VOCABULARY: 'vocabulary/index',
    WORDS: 'words/index',

    // WORD_DETAIL'i de aynı şekilde düzelt
    WORD_DETAIL: (id: string | number) => ({
        pathname: '/words/[id]',
        params: { id: String(id) }
    } as const),

    PRACTICE: 'practice/index',
    PROGRESS: 'progress/index',
} as const;