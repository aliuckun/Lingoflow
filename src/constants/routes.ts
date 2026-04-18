export const ROUTES = {
    HOME: 'index',
    LIBRARY: 'library',
    PRACTICE: 'practice',
    PROGRESS: 'progress',
    VOCABULARY: 'vocabulary',

    LIBRARY_DETAIL: (id: string) => ({
        pathname: '/library/[id]',
        params: { id }
    } as const),

    VOCABULARY_DETAIL: (id: string) => ({
        pathname: '/vocabulary/[id]',
        params: { id }
    } as const),

    WORD_DETAIL: (id: string | number) => ({
        pathname: '/words/[id]',
        params: { id: String(id) }
    } as const),
} as const;