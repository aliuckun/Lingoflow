import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLog, DailyLogEntry, StreakData } from '../types/setting';

const STREAK_KEY = '@lingoflow_streak';
const LOG_KEY = '@lingoflow_daily_log';
export const DAILY_GOAL = 20;

// ─── Tarih yardımcıları ───────────────────────────────────────────────────────
export const today = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const daysBetween = (a: string, b: string): number => {
    const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime());
    return Math.floor(ms / 86_400_000);
};

// ─── Default streak ───────────────────────────────────────────────────────────
const defaultStreak = (): StreakData => ({
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: '',
    shieldActive: false,
    todayCount: 0,
});

// ─── Streak oku ───────────────────────────────────────────────────────────────
export async function getStreak(): Promise<StreakData> {
    try {
        const raw = await AsyncStorage.getItem(STREAK_KEY);
        if (!raw) return defaultStreak();
        const data: StreakData = JSON.parse(raw);

        const todayStr = today();
        if (!data.lastPracticeDate) return data;

        const diff = daysBetween(data.lastPracticeDate, todayStr);

        if (diff === 0) {
            // Bugün zaten girildi — todayCount'u sıfırlama
            return data;
        } else if (diff === 1) {
            // Dün girildi, bugün henüz giriş yok — streak korunuyor
            return { ...data, todayCount: 0, shieldActive: false };
        } else if (diff === 2 && !data.shieldActive) {
            // 1 gün shield'ı: 2 gün geçmişse ve shield kullanılmamışsa koru
            return { ...data, todayCount: 0, shieldActive: true };
        } else {
            // 2+ gün geçti veya shield kullanıldı → streak sıfırla
            return { ...data, currentStreak: 0, todayCount: 0, shieldActive: false };
        }
    } catch {
        return defaultStreak();
    }
}

// ─── Streak yaz ───────────────────────────────────────────────────────────────
async function saveStreak(data: StreakData): Promise<void> {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

// ─── Pratik sonrası streak güncelle ──────────────────────────────────────────
// Her doğru/yanlış cevaptan sonra çağrılır
export async function recordPractice(isCorrect: boolean): Promise<StreakData> {
    const data = await getStreak();
    const todayStr = today();

    const newTodayCount = data.todayCount + 1;

    // Streak hesabı
    let newStreak = data.currentStreak;
    let newLongest = data.longestStreak;

    if (data.lastPracticeDate !== todayStr) {
        // İlk pratik bugün — streak'i artır
        newStreak = data.currentStreak + 1;
        newLongest = Math.max(newStreak, data.longestStreak);
    }

    const updated: StreakData = {
        ...data,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastPracticeDate: todayStr,
        todayCount: newTodayCount,
    };

    await saveStreak(updated);
    await recordDailyLog(isCorrect);
    return updated;
}

// ─── Günlük log ───────────────────────────────────────────────────────────────
export async function getDailyLog(): Promise<DailyLog> {
    try {
        const raw = await AsyncStorage.getItem(LOG_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

async function recordDailyLog(isCorrect: boolean): Promise<void> {
    try {
        const log = await getDailyLog();
        const todayStr = today();
        const entry: DailyLogEntry = log[todayStr] ?? { practiced: 0, correct: 0 };
        log[todayStr] = {
            practiced: entry.practiced + 1,
            correct: entry.correct + (isCorrect ? 1 : 0),
        };
        // Eski logları temizle (30 günden fazlasını sil)
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        Object.keys(log).forEach(k => {
            if (new Date(k) < cutoff) delete log[k];
        });
        await AsyncStorage.setItem(LOG_KEY, JSON.stringify(log));
    } catch {
        // sessizce geç
    }
}

// ─── Son 7 günün log verisi ───────────────────────────────────────────────────
export function getLast7Days(log: DailyLog): { date: string; label: string; practiced: number; correct: number }[] {
    const days: { date: string; label: string; practiced: number; correct: number }[] = [];
    const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const entry = log[key] ?? { practiced: 0, correct: 0 };
        days.push({ date: key, label: DAY_LABELS[d.getDay()], ...entry });
    }
    return days;
}
