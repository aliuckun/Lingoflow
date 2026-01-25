export const ROUTES = {
    HOME: 'index',
    LIBRARY: 'library',    // 'library/index' değil, çünkü dosya direkt library.tsx
    PRACTICE: 'practice',
    PROGRESS: 'progress',
    VOCABULARY: 'vocabulary',

    LIBRARY_DETAIL: (id: string) => ({
        pathname: '/library/[id]',
        params: { id }
    } as const),

    WORD_DETAIL: (id: string | number) => ({
        pathname: '/words/[id]',
        params: { id: String(id) }
    } as const),
} as const;