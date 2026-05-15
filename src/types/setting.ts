export interface AppSettings {
    currentLanguage: string;
    dailyGoal: number;          // sabit: 20
}

// ─── Streak ───────────────────────────────────────────────────────────────────
export interface StreakData {
    currentStreak: number;      // mevcut seri (gün)
    longestStreak: number;      // en uzun seri
    lastPracticeDate: string;   // 'YYYY-MM-DD' formatı
    shieldActive: boolean;      // shield hakkı kullanıldı mı bugün
    todayCount: number;         // bugün yapılan pratik sayısı
}

// ─── Günlük Log ───────────────────────────────────────────────────────────────
// AsyncStorage key: @lingoflow_daily_log
// Değer: Record<'YYYY-MM-DD', DailyLogEntry>
export interface DailyLogEntry {
    practiced: number;          // o gün yapılan toplam pratik
    correct: number;            // o gün doğru cevap sayısı
}

export type DailyLog = Record<string, DailyLogEntry>;
