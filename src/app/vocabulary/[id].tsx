/**
 * src/app/vocabulary/[id].tsx
 *
 * Tek ekran, inline düzenleme.
 * Her kart doğrudan düzenlenebilir — tıklayınca input açılır.
 * YENİ: Fiil kartının altında Perfekt kartı (Partizip II + hilfsverb).
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWordEdit } from '../../hooks/vocabulary/useWordEdit';
import { PartOfSpeech } from '../../types/word';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const POS_OPTIONS: PartOfSpeech[] = [
    'noun', 'verb', 'adjective', 'adverb',
    'preposition', 'conjunction', 'pronoun', 'other'
];

const POS_LABELS: Record<PartOfSpeech, string> = {
    noun: 'İsim', verb: 'Fiil', adjective: 'Sıfat', adverb: 'Zarf',
    preposition: 'Edat', conjunction: 'Bağlaç', pronoun: 'Zamir', other: 'Diğer'
};

const POS_COLORS: Record<PartOfSpeech, string> = {
    noun: '#5856D6', verb: '#FF9500', adjective: '#34C759', adverb: '#AF52DE',
    preposition: '#5AC8FA', conjunction: '#FF2D55', pronoun: '#FFCC00', other: '#8E8E93'
};

const CONJ_KEYS = ['ich', 'du', 'erSieEs', 'wir', 'ihr', 'sieSie'] as const;
const CONJ_LABELS: Record<string, string> = {
    ich: 'ich', du: 'du', erSieEs: 'er/sie/es', wir: 'wir', ihr: 'ihr', sieSie: 'sie/Sie'
};

// ─── Ana Ekran ────────────────────────────────────────────────────────────────

export default function WordDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const scrollRef = useRef<ScrollView>(null);

    const {
        word,
        isLoading,
        error,
        editWord,
        setEditWord,
        editMeaning,
        setEditMeaning,
        editPos,
        setEditPos,
        editExamples,
        editConjugations,
        setEditConjugations,
        editPerfekt,          // YENİ
        setEditPerfekt,       // YENİ
        isSaving,
        saveEdits,
        toggleFavorite,
        updateFamiliarity,
        addExample,
        removeExample,
        updateExample,
        confirmDelete,
    } = useWordEdit(id);

    const [editingWord, setEditingWord] = useState(false);
    const [editingConj, setEditingConj] = useState(false);
    const [editingPerfekt, setEditingPerfekt] = useState(false); // YENİ
    const [editingEx, setEditingEx] = useState<number | null>(null);

    // ── Yükleme / Hata ────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </SafeAreaView>
        );
    }

    if (error || !word) {
        return (
            <SafeAreaView style={styles.centered}>
                <Ionicons name="alert-circle-outline" size={52} color="#FF3B30" />
                <Text style={styles.errorText}>{error ?? 'Kelime bulunamadı.'}</Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
                    <Text style={styles.primaryBtnText}>Geri Dön</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const posColor = POS_COLORS[word.partOfSpeech];
    const totalPractice = (word.correctCount ?? 0) + (word.wrongCount ?? 0);
    const successRate = totalPractice > 0
        ? Math.round(((word.correctCount ?? 0) / totalPractice) * 100)
        : null;

    const hasUnsavedChanges = editWord !== word.word || editMeaning !== word.meaning;

    const handleSave = async () => {
        setEditingWord(false);
        setEditingConj(false);
        setEditingPerfekt(false);
        setEditingEx(null);
        await saveEdits();
    };

    // ── Header ────────────────────────────────────────────────────────────────
    const headerRight = () => (
        <View style={styles.headerActions}>
            <TouchableOpacity
                onPress={toggleFavorite}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Ionicons
                    name={word.isFavorite ? 'star' : 'star-outline'}
                    size={24}
                    color={word.isFavorite ? '#FFD700' : '#007AFF'}
                />
            </TouchableOpacity>
            {hasUnsavedChanges && (
                <TouchableOpacity
                    style={styles.headerSaveBtn}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.headerSaveText}>Kaydet</Text>}
                </TouchableOpacity>
            )}
        </View>
    );

    const isVerbCard = word.partOfSpeech === 'verb' || editPos === 'verb';

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <Stack.Screen
                options={{
                    title: word.word,
                    headerRight,
                    headerBackTitle: 'Sözlük'
                }}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    ref={scrollRef}
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    {/* ── 1. KELİME & ANLAM KARTI ──────────────────────────── */}
                    <TouchableOpacity
                        style={[styles.card, { borderTopColor: posColor, borderTopWidth: 4 }]}
                        onPress={() => !editingWord && setEditingWord(true)}
                        activeOpacity={editingWord ? 1 : 0.75}
                    >
                        {!editingWord ? (
                            <>
                                <View style={styles.wordViewRow}>
                                    <Text style={styles.wordDisplay}>{word.word}</Text>
                                    <View style={[styles.posBadge, { backgroundColor: posColor + '18', borderColor: posColor }]}>
                                        <Text style={[styles.posText, { color: posColor }]}>
                                            {POS_LABELS[word.partOfSpeech]}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.meaningDisplay}>{word.meaning}</Text>
                                <View style={styles.editHint}>
                                    <Ionicons name="create-outline" size={13} color="#AEAEB2" />
                                    <Text style={styles.editHintText}>Düzenlemek için dokun</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.cardEditLabel}>Kelime</Text>
                                <TextInput
                                    style={styles.cardInput}
                                    value={editWord}
                                    onChangeText={setEditWord}
                                    placeholder="Kelime"
                                    placeholderTextColor="#AEAEB2"
                                    autoCapitalize="none"
                                    autoFocus
                                    returnKeyType="next"
                                />
                                <Text style={styles.cardEditLabel}>Türkçe Anlam</Text>
                                <TextInput
                                    style={styles.cardInput}
                                    value={editMeaning}
                                    onChangeText={setEditMeaning}
                                    placeholder="Anlam"
                                    placeholderTextColor="#AEAEB2"
                                    returnKeyType="done"
                                    onSubmitEditing={() => setEditingWord(false)}
                                />
                                <Text style={styles.cardEditLabel}>Kelime Türü</Text>
                                <View style={styles.posRow}>
                                    {POS_OPTIONS.map((opt) => (
                                        <TouchableOpacity
                                            key={opt}
                                            style={[
                                                styles.posPill,
                                                editPos === opt && {
                                                    backgroundColor: POS_COLORS[opt],
                                                    borderColor: POS_COLORS[opt]
                                                }
                                            ]}
                                            onPress={() => setEditPos(opt)}
                                        >
                                            <Text style={[
                                                styles.posPillText,
                                                editPos === opt && { color: '#fff' }
                                            ]}>
                                                {POS_LABELS[opt]}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TouchableOpacity
                                    style={styles.doneBtn}
                                    onPress={() => setEditingWord(false)}
                                >
                                    <Text style={styles.doneBtnText}>Bitti ✓</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* ── 2. FİİL ÇEKİMLERİ KARTI ─────────────────────────── */}
                    {isVerbCard && (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => !editingConj && setEditingConj(true)}
                            activeOpacity={editingConj ? 1 : 0.75}
                        >
                            <Text style={styles.cardTitle}>Fiil Çekimleri</Text>
                            {!editingConj ? (
                                <>
                                    <View style={styles.conjViewGrid}>
                                        {CONJ_KEYS.map((key) => (
                                            <View key={key} style={styles.conjViewBox}>
                                                <Text style={styles.conjViewPronoun}>{CONJ_LABELS[key]}</Text>
                                                <Text style={styles.conjViewForm}>
                                                    {editConjugations[key] || '—'}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.editHint}>
                                        <Ionicons name="create-outline" size={13} color="#AEAEB2" />
                                        <Text style={styles.editHintText}>Düzenlemek için dokun</Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={styles.conjEditGrid}>
                                        {CONJ_KEYS.map((key) => (
                                            <View key={key} style={styles.conjEditBox}>
                                                <Text style={styles.conjEditLabel}>{CONJ_LABELS[key]}</Text>
                                                <TextInput
                                                    style={styles.conjEditInput}
                                                    value={editConjugations[key]}
                                                    onChangeText={(t) =>
                                                        setEditConjugations({ ...editConjugations, [key]: t })
                                                    }
                                                    placeholder="..."
                                                    placeholderTextColor="#AEAEB2"
                                                    autoCapitalize="none"
                                                />
                                            </View>
                                        ))}
                                    </View>
                                    <TouchableOpacity style={styles.doneBtn} onPress={() => setEditingConj(false)}>
                                        <Text style={styles.doneBtnText}>Bitti ✓</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* ── 3. YENİ: PERFEKT KARTI ──────────────────────────── */}
                    {isVerbCard && (
                        <TouchableOpacity
                            style={[styles.card, styles.perfektCard]}
                            onPress={() => !editingPerfekt && setEditingPerfekt(true)}
                            activeOpacity={editingPerfekt ? 1 : 0.75}
                        >
                            {/* Başlık + opsiyonel etiketi */}
                            <View style={styles.perfektCardHeader}>
                                <Text style={styles.cardTitle}>Perfekt Zamanı</Text>
                                {!editPerfekt.partizip2 && (
                                    <View style={styles.optionalBadge}>
                                        <Text style={styles.optionalBadgeText}>opsiyonel</Text>
                                    </View>
                                )}
                            </View>

                            {!editingPerfekt ? (
                                /* ── Görüntüleme ── */
                                editPerfekt.partizip2 ? (
                                    <>
                                        {/* Hilfsverb + Partizip II büyük gösterim */}
                                        <View style={styles.perfektViewRow}>
                                            <View style={[
                                                styles.hilfsverbChip,
                                                editPerfekt.hilfsverb === 'haben'
                                                    ? styles.habenChip
                                                    : styles.seinChip
                                            ]}>
                                                <Text style={styles.hilfsverbChipText}>
                                                    {editPerfekt.hilfsverb}
                                                </Text>
                                            </View>
                                            <Text style={styles.perfektPartizip}>
                                                {editPerfekt.partizip2}
                                            </Text>
                                        </View>

                                        {/* Tam çekim tablosu */}
                                        <View style={styles.perfektConjGrid}>
                                            {[
                                                ['ich', editPerfekt.hilfsverb === 'haben' ? 'habe' : 'bin'],
                                                ['du', editPerfekt.hilfsverb === 'haben' ? 'hast' : 'bist'],
                                                ['er/sie/es', editPerfekt.hilfsverb === 'haben' ? 'hat' : 'ist'],
                                                ['wir', editPerfekt.hilfsverb === 'haben' ? 'haben' : 'sind'],
                                                ['ihr', editPerfekt.hilfsverb === 'haben' ? 'habt' : 'seid'],
                                                ['sie/Sie', editPerfekt.hilfsverb === 'haben' ? 'haben' : 'sind'],
                                            ].map(([pronoun, aux]) => (
                                                <View key={pronoun} style={styles.perfektConjBox}>
                                                    <Text style={styles.perfektConjPronoun}>{pronoun}</Text>
                                                    <Text style={styles.perfektConjForm} numberOfLines={1}>
                                                        {aux}{' '}
                                                        <Text style={styles.perfektConjPartizip}>
                                                            {editPerfekt.partizip2}
                                                        </Text>
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        {/* Örnek cümle */}
                                        {editPerfekt.perfektSatz ? (
                                            <View style={styles.perfektSatzBox}>
                                                <Ionicons name="chatbubble-outline" size={13} color="#AF52DE" />
                                                <Text style={styles.perfektSatzText}>
                                                    {editPerfekt.perfektSatz}
                                                </Text>
                                            </View>
                                        ) : null}

                                        <View style={styles.editHint}>
                                            <Ionicons name="create-outline" size={13} color="#AEAEB2" />
                                            <Text style={styles.editHintText}>Düzenlemek için dokun</Text>
                                        </View>
                                    </>
                                ) : (
                                    /* Henüz girilmemiş */
                                    <View style={styles.perfektEmptyHint}>
                                        <Ionicons name="add-circle-outline" size={22} color="#AF52DE" />
                                        <Text style={styles.perfektEmptyText}>
                                            Perfekt bilgisi eklemek için dokun
                                        </Text>
                                    </View>
                                )
                            ) : (
                                /* ── Düzenleme ── */
                                <>
                                    {/* Partizip II */}
                                    <Text style={styles.cardEditLabel}>Partizip II</Text>
                                    <TextInput
                                        style={styles.cardInput}
                                        value={editPerfekt.partizip2}
                                        onChangeText={(t) =>
                                            setEditPerfekt({ ...editPerfekt, partizip2: t })
                                        }
                                        placeholder="ör: gemacht, gegangen"
                                        placeholderTextColor="#AEAEB2"
                                        autoCapitalize="none"
                                        autoFocus
                                    />

                                    {/* Hilfsverb Seçici */}
                                    <Text style={styles.cardEditLabel}>Yardımcı Fiil (Hilfsverb)</Text>
                                    <View style={styles.hilfsverbRow}>
                                        <TouchableOpacity
                                            style={[
                                                styles.hilfsverbBtn,
                                                editPerfekt.hilfsverb === 'haben' && styles.hilfsverbBtnHaben
                                            ]}
                                            onPress={() =>
                                                setEditPerfekt({ ...editPerfekt, hilfsverb: 'haben' })
                                            }
                                        >
                                            <Text style={[
                                                styles.hilfsverbBtnText,
                                                editPerfekt.hilfsverb === 'haben' && { color: '#fff' }
                                            ]}>haben</Text>
                                            <Text style={[
                                                styles.hilfsverbBtnSub,
                                                editPerfekt.hilfsverb === 'haben' && { color: 'rgba(255,255,255,0.75)' }
                                            ]}>ich habe …</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.hilfsverbBtn,
                                                editPerfekt.hilfsverb === 'sein' && styles.hilfsverbBtnSein
                                            ]}
                                            onPress={() =>
                                                setEditPerfekt({ ...editPerfekt, hilfsverb: 'sein' })
                                            }
                                        >
                                            <Text style={[
                                                styles.hilfsverbBtnText,
                                                editPerfekt.hilfsverb === 'sein' && { color: '#fff' }
                                            ]}>sein</Text>
                                            <Text style={[
                                                styles.hilfsverbBtnSub,
                                                editPerfekt.hilfsverb === 'sein' && { color: 'rgba(255,255,255,0.75)' }
                                            ]}>ich bin …</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Önizleme */}
                                    {editPerfekt.partizip2.trim() ? (
                                        <View style={styles.perfektPreview}>
                                            <Ionicons name="eye-outline" size={13} color="#AF52DE" />
                                            <Text style={styles.perfektPreviewText}>
                                                ich {editPerfekt.hilfsverb === 'haben' ? 'habe' : 'bin'}{' '}
                                                <Text style={styles.perfektPreviewBold}>
                                                    {editPerfekt.partizip2}
                                                </Text>
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Örnek cümle */}
                                    <Text style={styles.cardEditLabel}>
                                        Örnek Cümle{' '}
                                        <Text style={{ color: '#AEAEB2', fontWeight: '400' }}>(opsiyonel)</Text>
                                    </Text>
                                    <TextInput
                                        style={[styles.cardInput, { minHeight: 60, textAlignVertical: 'top' }]}
                                        value={editPerfekt.perfektSatz ?? ''}
                                        onChangeText={(t) =>
                                            setEditPerfekt({ ...editPerfekt, perfektSatz: t })
                                        }
                                        placeholder="ör: Ich habe das Buch gelesen."
                                        placeholderTextColor="#AEAEB2"
                                        multiline
                                        autoCapitalize="sentences"
                                    />

                                    <TouchableOpacity
                                        style={[styles.doneBtn, { backgroundColor: '#F0E6FF' }]}
                                        onPress={() => setEditingPerfekt(false)}
                                    >
                                        <Text style={[styles.doneBtnText, { color: '#AF52DE' }]}>Bitti ✓</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* ── 4. AŞINALIK ──────────────────────────────────────── */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Aşinalık Seviyesi</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() =>
                                        updateFamiliarity(star === word.familiarity ? 0 : star)
                                    }
                                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                                >
                                    <Ionicons
                                        name={star <= (word.familiarity ?? 0) ? 'star' : 'star-outline'}
                                        size={34}
                                        color={star <= (word.familiarity ?? 0) ? '#FFD700' : '#D1D1D6'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.familiarityLabel}>
                            {['Henüz değerlendirilmedi', 'Yeni', 'Tanıdık', 'Biliyorum', 'İyi Biliyorum', 'Tam Öğrendim'][word.familiarity ?? 0]}
                        </Text>
                    </View>

                    {/* ── 5. PRATİK İSTATİSTİKLERİ ─────────────────────────── */}
                    {totalPractice > 0 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Pratik İstatistikleri</Text>
                            <View style={styles.statsRow}>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statNum, { color: '#34C759' }]}>
                                        {word.correctCount ?? 0}
                                    </Text>
                                    <Text style={styles.statLabel}>Doğru</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statNum, { color: '#FF3B30' }]}>
                                        {word.wrongCount ?? 0}
                                    </Text>
                                    <Text style={styles.statLabel}>Yanlış</Text>
                                </View>
                                {successRate !== null && (
                                    <View style={styles.statBox}>
                                        <Text style={[styles.statNum, { color: '#007AFF' }]}>
                                            %{successRate}
                                        </Text>
                                        <Text style={styles.statLabel}>Başarı</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* ── 6. ÖRNEK CÜMLELER ─────────────────────────────────── */}
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.cardTitle}>Örnek Cümleler</Text>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => {
                                    addExample();
                                    setEditingEx(editExamples.length);
                                }}
                            >
                                <Ionicons name="add-circle" size={20} color="#007AFF" />
                                <Text style={styles.addBtnText}>Ekle</Text>
                            </TouchableOpacity>
                        </View>

                        {editExamples.length === 0 && (
                            <Text style={styles.emptyHint}>Henüz örnek cümle yok.</Text>
                        )}

                        {editExamples.map((ex, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.exCard, editingEx === i && styles.exCardActive]}
                                onPress={() => editingEx !== i && setEditingEx(i)}
                                activeOpacity={editingEx === i ? 1 : 0.75}
                            >
                                {editingEx !== i ? (
                                    <>
                                        <Text style={styles.exSentence}>{ex.example || '(cümle yok)'}</Text>
                                        {ex.exampleMeaning ? (
                                            <Text style={styles.exTranslation}>{ex.exampleMeaning}</Text>
                                        ) : null}
                                        <View style={styles.editHint}>
                                            <Ionicons name="create-outline" size={12} color="#AEAEB2" />
                                            <Text style={styles.editHintText}>Düzenlemek için dokun</Text>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <TextInput
                                            style={styles.cardInput}
                                            value={ex.example}
                                            onChangeText={(t) => updateExample(i, 'example', t)}
                                            placeholder="Örnek cümle (Almanca/İngilizce)"
                                            placeholderTextColor="#AEAEB2"
                                            multiline autoFocus
                                        />
                                        <TextInput
                                            style={styles.cardInput}
                                            value={ex.exampleMeaning}
                                            onChangeText={(t) => updateExample(i, 'exampleMeaning', t)}
                                            placeholder="Türkçe çeviri"
                                            placeholderTextColor="#AEAEB2"
                                            returnKeyType="done"
                                            onSubmitEditing={() => setEditingEx(null)}
                                        />
                                        <View style={styles.exEditActions}>
                                            <TouchableOpacity
                                                style={styles.exDeleteBtn}
                                                onPress={() => { removeExample(i); setEditingEx(null); }}
                                            >
                                                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                                                <Text style={styles.exDeleteText}>Sil</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.doneBtn} onPress={() => setEditingEx(null)}>
                                                <Text style={styles.doneBtnText}>Bitti ✓</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ── 7. KAYDET & SİL ──────────────────────────────────── */}
                    <TouchableOpacity
                        style={[styles.primaryBtn, !hasUnsavedChanges && styles.primaryBtnDisabled]}
                        onPress={handleSave}
                        disabled={!hasUnsavedChanges || isSaving}
                    >
                        {isSaving
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.primaryBtnText}>
                                {hasUnsavedChanges ? 'Değişiklikleri Kaydet' : 'Kaydedildi ✓'}
                            </Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => confirmDelete(() => router.replace('/(tabs)/vocabulary'))}
                    >
                        <Ionicons name="trash-outline" size={17} color="#FF3B30" />
                        <Text style={styles.deleteBtnText}>Kelimeyi Sil</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    scrollContent: { padding: 16, paddingBottom: 60 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F2F2F7' },
    errorText: { marginTop: 14, fontSize: 16, color: '#FF3B30', textAlign: 'center' },

    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerSaveBtn: { backgroundColor: '#007AFF', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
    headerSaveText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12,
        shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
    },

    // ── YENİ: Perfekt Kart Stilleri ────────────────────────────────────────
    perfektCard: { borderLeftWidth: 4, borderLeftColor: '#AF52DE' },
    perfektCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 0 },
    optionalBadge: { backgroundColor: '#E5E5EA', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    optionalBadgeText: { fontSize: 9, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.3 },

    perfektViewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
    hilfsverbChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
    habenChip: { backgroundColor: '#007AFF' },
    seinChip: { backgroundColor: '#34C759' },
    hilfsverbChipText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    perfektPartizip: { fontSize: 26, fontWeight: '800', color: '#1C1C1E' },

    // 6'lı çekim tablosu
    perfektConjGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    perfektConjBox: {
        width: '30%', flexGrow: 1, backgroundColor: '#F8F0FF', borderRadius: 10,
        padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E8D5FF',
    },
    perfektConjPronoun: { fontSize: 10, fontWeight: '700', color: '#AF52DE', marginBottom: 3 },
    perfektConjForm: { fontSize: 12, color: '#3A3A3C', textAlign: 'center' },
    perfektConjPartizip: { fontWeight: '700', color: '#1C1C1E' },

    perfektSatzBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#F8F0FF', padding: 10, borderRadius: 10, marginBottom: 8 },
    perfektSatzText: { fontSize: 13, color: '#3A3A3C', fontStyle: 'italic', flex: 1 },

    perfektEmptyHint: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
    perfektEmptyText: { fontSize: 14, color: '#AEAEB2' },

    // Düzenleme: hilfsverb seçici
    hilfsverbRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    hilfsverbBtn: {
        flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10,
        borderWidth: 1.5, borderColor: '#E5E5EA', backgroundColor: '#F2F2F7', alignItems: 'center',
    },
    hilfsverbBtnHaben: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    hilfsverbBtnSein: { backgroundColor: '#34C759', borderColor: '#34C759' },
    hilfsverbBtnText: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
    hilfsverbBtnSub: { fontSize: 11, color: '#8E8E93', marginTop: 2 },

    perfektPreview: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#F8F0FF', padding: 10, borderRadius: 10, marginVertical: 6,
    },
    perfektPreviewText: { fontSize: 13, color: '#3A3A3C' },
    perfektPreviewBold: { fontWeight: '700', color: '#AF52DE' },

    // Genel kart stilleri
    cardTitle: { fontSize: 12, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 },
    cardEditLabel: { fontSize: 12, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, marginTop: 10 },
    cardInput: { backgroundColor: '#F2F2F7', borderRadius: 10, padding: 13, fontSize: 16, color: '#1C1C1E', borderWidth: 1, borderColor: '#E5E5EA', marginBottom: 8 },

    wordViewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    wordDisplay: { fontSize: 30, fontWeight: '800', color: '#1C1C1E', flex: 1, marginRight: 10 },
    meaningDisplay: { fontSize: 18, color: '#3A3A3C', lineHeight: 26 },
    posBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
    posText: { fontSize: 13, fontWeight: '700' },
    editHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
    editHintText: { fontSize: 12, color: '#AEAEB2' },

    posRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
    posPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E5EA', backgroundColor: '#F2F2F7' },
    posPillText: { fontSize: 13, fontWeight: '600', color: '#3A3A3C' },

    conjViewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    conjViewBox: { width: '30%', flexGrow: 1, backgroundColor: '#F8F9FA', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5EA' },
    conjViewPronoun: { fontSize: 11, fontWeight: '700', color: '#8E8E93', marginBottom: 4 },
    conjViewForm: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', textAlign: 'center' },

    conjEditGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    conjEditBox: { width: '47%', flexGrow: 1 },
    conjEditLabel: { fontSize: 12, fontWeight: '700', color: '#8E8E93', marginBottom: 5 },
    conjEditInput: { backgroundColor: '#F2F2F7', borderRadius: 8, padding: 10, fontSize: 15, color: '#1C1C1E', borderWidth: 1, borderColor: '#D1D1D6', textAlign: 'center' },

    doneBtn: { alignSelf: 'flex-end', marginTop: 10, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#E8F4FF', borderRadius: 8 },
    doneBtnText: { fontSize: 14, fontWeight: '700', color: '#007AFF' },

    starsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    familiarityLabel: { fontSize: 13, color: '#8E8E93', fontStyle: 'italic' },

    statsRow: { flexDirection: 'row', gap: 10 },
    statBox: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 10, padding: 14, alignItems: 'center' },
    statNum: { fontSize: 24, fontWeight: '800' },
    statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 2 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    addBtnText: { fontSize: 14, fontWeight: '600', color: '#007AFF' },
    emptyHint: { fontSize: 14, color: '#C7C7CC', textAlign: 'center', paddingVertical: 12 },

    exCard: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#34C759', borderWidth: 1, borderColor: '#E5E5EA' },
    exCardActive: { borderColor: '#007AFF', borderLeftColor: '#007AFF', backgroundColor: '#FAFCFF' },
    exSentence: { fontSize: 16, fontWeight: '500', color: '#1C1C1E', marginBottom: 4 },
    exTranslation: { fontSize: 14, color: '#636366', fontStyle: 'italic' },
    exEditActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    exDeleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
    exDeleteText: { fontSize: 14, color: '#FF3B30', fontWeight: '600' },

    primaryBtn: { backgroundColor: '#007AFF', padding: 17, borderRadius: 14, alignItems: 'center', marginBottom: 10, shadowColor: '#007AFF', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4 },
    primaryBtnDisabled: { backgroundColor: '#C7C7CC', shadowOpacity: 0, elevation: 0 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#FFCDD2', backgroundColor: '#FFF5F5', marginBottom: 8 },
    deleteBtnText: { fontSize: 16, fontWeight: '600', color: '#FF3B30' },
});
