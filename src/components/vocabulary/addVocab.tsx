import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator, Alert, KeyboardAvoidingView, Modal,
    Platform, ScrollView, StyleSheet, Text, TextInput,
    TouchableOpacity, View
} from 'react-native';

import { useAddVocabulary } from '../../hooks/vocabulary/useAddVocabulary';
import { useImportExport } from '../../hooks/vocabulary/useImportExport';
import { Artikel, PartOfSpeech, PerfektDetails, Word } from '../../types/word';

interface AddVocabProps { onSuccess: () => void; }

const ARTIKEL_OPTIONS: Artikel[] = ['der', 'die', 'das', 'pl'];
const ARTIKEL_COLORS: Record<Artikel, string> = {
    der: '#007AFF', die: '#FF2D55', das: '#34C759', pl: '#FF9500'
};

export const AddVocab = ({ onSuccess }: AddVocabProps) => {
    const { state, actions } = useAddVocabulary({ onSuccess });
    const importExport = useImportExport(onSuccess);

    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    const [word, setWord] = useState('');
    const [meaning, setMeaning] = useState('');
    const [pos, setPos] = useState<PartOfSpeech>('noun');
    const [artikel, setArtikel] = useState<Artikel | null>(null);
    const [example, setExample] = useState('');
    const [exampleMeaning, setExampleMeaning] = useState('');
    const [conjugations, setConjugations] = useState({
        ich: '', du: '', erSieEs: '', wir: '', ihr: '', sieSie: ''
    });
    const [perfektPartizip, setPerfektPartizip] = useState('');
    const [perfektHilfsverb, setPerfektHilfsverb] = useState<'haben' | 'sein'>('haben');
    const [perfektSatz, setPerfektSatz] = useState('');

    const posOptions: PartOfSpeech[] = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'other'];
    const posLabels: Record<PartOfSpeech, string> = {
        noun: 'İsim', verb: 'Fiil', adjective: 'Sıfat', adverb: 'Zarf',
        preposition: 'Edat', conjunction: 'Bağlaç', pronoun: 'Zamir', other: 'Diğer'
    };

    const handleSave = async () => {
        if (!word.trim() || !meaning.trim()) {
            Alert.alert('Hata', 'Lütfen kelime ve anlam alanlarını doldurun.');
            return;
        }
        const perfektDetails: PerfektDetails | undefined =
            pos === 'verb' && perfektPartizip.trim()
                ? { partizip2: perfektPartizip.trim(), hilfsverb: perfektHilfsverb, perfektSatz: perfektSatz.trim() || undefined }
                : undefined;

        const newWord: Word = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            word: word.trim(),
            meaning: meaning.trim(),
            partOfSpeech: pos,
            artikel: pos === 'noun' && artikel ? artikel : undefined,
            examples: example.trim() ? [{ example: example.trim(), exampleMeaning: exampleMeaning.trim() }] : [],
            verbDetails: pos === 'verb' ? { infinitive: word.trim(), conjugations, perfekt: perfektDetails } : undefined,
            createdAt: Date.now(),
            familiarity: 0, correctCount: 0, wrongCount: 0, isFavorite: false,
        };
        await actions.addWord(newWord);
        resetForm();
    };

    const resetForm = () => {
        setWord(''); setMeaning(''); setPos('noun'); setArtikel(null);
        setExample(''); setExampleMeaning('');
        setConjugations({ ich: '', du: '', erSieEs: '', wir: '', ihr: '', sieSie: '' });
        setPerfektPartizip(''); setPerfektHilfsverb('haben'); setPerfektSatz('');
    };

    const isDisabled = state.isLoading || importExport.isLoading;

    const renderConjInput = (label: string, value: string, key: keyof typeof conjugations) => (
        <View style={styles.conjInputWrapper}>
            <Text style={styles.conjLabel}>{label}</Text>
            <TextInput style={styles.inputSmall} value={value}
                onChangeText={t => setConjugations({ ...conjugations, [key]: t })}
                placeholder="..." placeholderTextColor="#AEAEB2" editable={!isDisabled} />
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
                <View style={styles.form}>

                    {/* Kelime */}
                    <Text style={styles.label}>Yeni Kelime</Text>
                    <TextInput style={styles.input} placeholder="Almanca kelime"
                        placeholderTextColor="#AEAEB2" value={word} onChangeText={setWord}
                        editable={!isDisabled} autoCapitalize="none" />

                    {/* Anlam */}
                    <Text style={styles.label}>Türkçe Anlamı</Text>
                    <TextInput style={styles.input} placeholder="Türkçe karşılığı"
                        placeholderTextColor="#AEAEB2" value={meaning} onChangeText={setMeaning} editable={!isDisabled} />

                    {/* POS */}
                    <Text style={styles.label}>Kelime Türü</Text>
                    <View style={styles.posContainer}>
                        {posOptions.map(opt => (
                            <TouchableOpacity key={opt}
                                style={[styles.posBadge, pos === opt && styles.posBadgeActive]}
                                onPress={() => { setPos(opt); if (opt !== 'noun') setArtikel(null); }}
                                disabled={isDisabled}>
                                <Text style={[styles.posBadgeText, pos === opt && styles.posBadgeTextActive]}>
                                    {posLabels[opt]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* YENİ: Artikel seçici — yalnızca isim */}
                    {pos === 'noun' && (
                        <View style={[styles.extraSection, styles.artikelSection]}>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.subTitle}>Artikel</Text>
                                <View style={styles.optionalBadge}><Text style={styles.optionalBadgeText}>opsiyonel</Text></View>
                            </View>
                            <View style={styles.artikelRow}>
                                {ARTIKEL_OPTIONS.map(art => {
                                    const active = artikel === art;
                                    const color = ARTIKEL_COLORS[art];
                                    return (
                                        <TouchableOpacity key={art}
                                            style={[styles.artikelBtn, active && { backgroundColor: color, borderColor: color }]}
                                            onPress={() => setArtikel(active ? null : art)}
                                            disabled={isDisabled}>
                                            <Text style={[styles.artikelBtnText, active && { color: '#fff' }]}>{art}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            {artikel && word.trim() && (
                                <View style={styles.artikelPreview}>
                                    <Ionicons name="eye-outline" size={13} color={ARTIKEL_COLORS[artikel]} />
                                    <Text style={[styles.artikelPreviewText, { color: ARTIKEL_COLORS[artikel] }]}>
                                        {artikel} <Text style={styles.artikelPreviewWord}>{word.trim()}</Text>
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Fiil çekimleri + Perfekt */}
                    {pos === 'verb' && (
                        <>
                            <View style={styles.extraSection}>
                                <Text style={styles.subTitle}>Almanca Şahıs Çekimleri</Text>
                                <View style={styles.conjGrid}>
                                    <View style={styles.conjColumn}>
                                        {renderConjInput('ich', conjugations.ich, 'ich')}
                                        {renderConjInput('du', conjugations.du, 'du')}
                                        {renderConjInput('er/sie/es', conjugations.erSieEs, 'erSieEs')}
                                    </View>
                                    <View style={styles.conjColumn}>
                                        {renderConjInput('wir', conjugations.wir, 'wir')}
                                        {renderConjInput('ihr', conjugations.ihr, 'ihr')}
                                        {renderConjInput('sie/Sie', conjugations.sieSie, 'sieSie')}
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.extraSection, styles.perfektSection]}>
                                <View style={styles.sectionHeaderRow}>
                                    <Text style={styles.subTitle}>Perfekt Zamanı</Text>
                                    <View style={styles.optionalBadge}><Text style={styles.optionalBadgeText}>opsiyonel</Text></View>
                                </View>
                                <Text style={styles.fieldLabel}>Partizip II</Text>
                                <TextInput style={styles.input}
                                    placeholder="ör: gemacht, gegangen" placeholderTextColor="#AEAEB2"
                                    value={perfektPartizip} onChangeText={setPerfektPartizip}
                                    editable={!isDisabled} autoCapitalize="none" />

                                <Text style={styles.fieldLabel}>Yardımcı Fiil (Hilfsverb)</Text>
                                <View style={styles.hilfsverbRow}>
                                    {(['haben', 'sein'] as const).map(hv => (
                                        <TouchableOpacity key={hv}
                                            style={[styles.hilfsverbBtn,
                                                perfektHilfsverb === hv && (hv === 'haben' ? styles.habenActive : styles.seinActive)]}
                                            onPress={() => setPerfektHilfsverb(hv)} disabled={isDisabled}>
                                            <Text style={[styles.hilfsverbText, perfektHilfsverb === hv && { color: '#fff' }]}>{hv}</Text>
                                            <Text style={[styles.hilfsverbSub, perfektHilfsverb === hv && { color: 'rgba(255,255,255,0.75)' }]}>
                                                ich {hv === 'haben' ? 'habe' : 'bin'} …
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {perfektPartizip.trim() ? (
                                    <View style={styles.perfektPreview}>
                                        <Ionicons name="eye-outline" size={13} color="#007AFF" />
                                        <Text style={styles.perfektPreviewText}>
                                            ich {perfektHilfsverb === 'haben' ? 'habe' : 'bin'}{' '}
                                            <Text style={styles.perfektPreviewBold}>{perfektPartizip.trim()}</Text>
                                        </Text>
                                    </View>
                                ) : null}
                                <Text style={styles.fieldLabel}>
                                    Örnek Cümle <Text style={styles.optionalInline}>(opsiyonel)</Text>
                                </Text>
                                <TextInput style={[styles.input, styles.inputMultiline]}
                                    placeholder="ör: Ich habe das Buch gelesen."
                                    placeholderTextColor="#AEAEB2" value={perfektSatz}
                                    onChangeText={setPerfektSatz} multiline numberOfLines={2}
                                    editable={!isDisabled} autoCapitalize="sentences" />
                            </View>
                        </>
                    )}

                    {/* Örnek cümle */}
                    <Text style={styles.label}>Örnek Cümle <Text style={styles.labelOptional}>(opsiyonel)</Text></Text>
                    <TextInput style={[styles.input, styles.inputMultiline]}
                        placeholder="Örnek cümle yazın..." placeholderTextColor="#AEAEB2"
                        value={example} onChangeText={setExample} multiline numberOfLines={2} editable={!isDisabled} />
                    <TextInput style={styles.input} placeholder="Cümlenin Türkçe anlamı"
                        placeholderTextColor="#AEAEB2" value={exampleMeaning} onChangeText={setExampleMeaning} editable={!isDisabled} />

                    {/* Kaydet */}
                    <TouchableOpacity style={[styles.saveButton, isDisabled && styles.saveButtonDisabled]}
                        onPress={handleSave} disabled={isDisabled}>
                        {state.isLoading ? <ActivityIndicator color="#fff" /> : (
                            <View style={styles.saveButtonInner}>
                                <Ionicons name="add-circle-outline" size={22} color="#fff" />
                                <Text style={styles.saveButtonText}>Listeye Ekle</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Toplu işlem */}
                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>TOPLU İŞLEM</Text>
                    <View style={styles.divider} />
                </View>
                <View style={styles.batchActions}>
                    <TouchableOpacity style={styles.batchButton} onPress={() => setShowImportModal(true)} disabled={isDisabled}>
                        {importExport.isLoading ? <ActivityIndicator size="small" color="#007AFF" /> : (
                            <><Ionicons name="cloud-upload-outline" size={22} color="#007AFF" /><Text style={styles.batchButtonText}>İçe Aktar</Text></>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.batchButton, styles.exportButton]} onPress={() => setShowExportModal(true)} disabled={isDisabled}>
                        {importExport.isLoading ? <ActivityIndicator size="small" color="#34C759" /> : (
                            <><Ionicons name="cloud-download-outline" size={22} color="#34C759" /><Text style={[styles.batchButtonText, { color: '#34C759' }]}>Dışa Aktar</Text></>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Import Modal */}
            <Modal visible={showImportModal} transparent animationType="slide" onRequestClose={() => setShowImportModal(false)}>
                <View style={styles.modalOverlay}><View style={styles.modalContent}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>İçe Aktar</Text>
                    <Text style={styles.modalDescription}>Hangi formattan içe aktarmak istersiniz?</Text>
                    <TouchableOpacity style={styles.modalButton} onPress={() => { setShowImportModal(false); importExport.importFromCSV(); }}>
                        <View style={[styles.modalIconBg, { backgroundColor: '#EAF4FF' }]}><Ionicons name="document-text" size={26} color="#007AFF" /></View>
                        <View style={styles.modalButtonTextContainer}>
                            <Text style={styles.modalButtonTitle}>CSV Dosyası</Text>
                            <Text style={styles.modalButtonSubtitle}>Excel'den kaydedilmiş CSV</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButton} onPress={() => { setShowImportModal(false); importExport.importFromJSON(); }}>
                        <View style={[styles.modalIconBg, { backgroundColor: '#FFF4E5' }]}><Ionicons name="code-slash" size={26} color="#FF9500" /></View>
                        <View style={styles.modalButtonTextContainer}>
                            <Text style={styles.modalButtonTitle}>JSON Dosyası</Text>
                            <Text style={styles.modalButtonSubtitle}>Tam veri yapısı</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowImportModal(false)}>
                        <Text style={styles.modalCancelText}>Vazgeç</Text>
                    </TouchableOpacity>
                </View></View>
            </Modal>

            {/* Export Modal */}
            <Modal visible={showExportModal} transparent animationType="slide" onRequestClose={() => setShowExportModal(false)}>
                <View style={styles.modalOverlay}><View style={styles.modalContent}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Dışa Aktar</Text>
                    <Text style={styles.modalDescription}>Hangi formatta dışa aktarmak istersiniz?</Text>
                    <TouchableOpacity style={styles.modalButton} onPress={() => { setShowExportModal(false); importExport.exportToCSV(); }}>
                        <View style={[styles.modalIconBg, { backgroundColor: '#EAFAF1' }]}><Ionicons name="document-text" size={26} color="#34C759" /></View>
                        <View style={styles.modalButtonTextContainer}>
                            <Text style={styles.modalButtonTitle}>CSV Dosyası</Text>
                            <Text style={styles.modalButtonSubtitle}>Excel'de açılabilir</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButton} onPress={() => { setShowExportModal(false); importExport.exportToJSON(); }}>
                        <View style={[styles.modalIconBg, { backgroundColor: '#FFF4E5' }]}><Ionicons name="code-slash" size={26} color="#FF9500" /></View>
                        <View style={styles.modalButtonTextContainer}>
                            <Text style={styles.modalButtonTitle}>JSON Dosyası</Text>
                            <Text style={styles.modalButtonSubtitle}>Tam yedekleme</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowExportModal(false)}>
                        <Text style={styles.modalCancelText}>Vazgeç</Text>
                    </TouchableOpacity>
                </View></View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#F8F9FA' },
    form: { marginTop: 16 },
    label: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 8, marginTop: 14 },
    labelOptional: { fontSize: 13, fontWeight: '400', color: '#8E8E93' },
    input: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, fontSize: 17, color: '#1C1C1E', marginBottom: 10, borderWidth: 1, borderColor: '#E5E5EA' },
    inputMultiline: { minHeight: 68, textAlignVertical: 'top' },
    posContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    posBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E5E5EA' },
    posBadgeActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    posBadgeText: { fontSize: 13, color: '#3A3A3C', fontWeight: '600' },
    posBadgeTextActive: { color: '#FFF' },
    extraSection: { backgroundColor: '#FFF', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E5E5EA', marginBottom: 14 },

    // Artikel
    artikelSection: { borderColor: '#D1D1D6', backgroundColor: '#FAFAFA' },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
    artikelRow: { flexDirection: 'row', gap: 10 },
    artikelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E5EA', backgroundColor: '#F2F2F7', alignItems: 'center' },
    artikelBtnText: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
    artikelPreview: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8F8F8', padding: 10, borderRadius: 10, marginTop: 10 },
    artikelPreviewText: { fontSize: 16, fontWeight: '600' },
    artikelPreviewWord: { fontWeight: '800', color: '#1C1C1E' },

    // Perfekt
    perfektSection: { borderColor: '#D6E4FF', backgroundColor: '#F8FBFF' },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: '#636366', marginBottom: 6, marginTop: 8 },
    optionalInline: { fontSize: 12, fontWeight: '400', color: '#AEAEB2' },
    hilfsverbRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    hilfsverbBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E5EA', backgroundColor: '#F2F2F7', alignItems: 'center' },
    habenActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    seinActive: { backgroundColor: '#34C759', borderColor: '#34C759' },
    hilfsverbText: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
    hilfsverbSub: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
    perfektPreview: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EAF4FF', padding: 10, borderRadius: 10, marginVertical: 6 },
    perfektPreviewText: { fontSize: 14, color: '#3A3A3C' },
    perfektPreviewBold: { fontWeight: '700', color: '#007AFF' },

    subTitle: { fontSize: 13, fontWeight: '700', color: '#8E8E93', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
    optionalBadge: { backgroundColor: '#E5E5EA', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    optionalBadgeText: { fontSize: 10, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.3 },
    conjGrid: { flexDirection: 'row', gap: 12 },
    conjColumn: { flex: 1, gap: 10 },
    conjInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    conjLabel: { fontSize: 13, color: '#636366', width: 52, fontWeight: '600' },
    inputSmall: { flex: 1, backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: '#D1D1D6', padding: 8, borderRadius: 8, fontSize: 15, color: '#1C1C1E' },
    saveButton: { backgroundColor: '#007AFF', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 18, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    saveButtonDisabled: { opacity: 0.55 },
    saveButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    divider: { flex: 1, height: 1, backgroundColor: '#E5E5EA' },
    dividerText: { marginHorizontal: 12, fontSize: 11, fontWeight: '800', color: '#C7C7CC', letterSpacing: 1 },
    batchActions: { flexDirection: 'row', gap: 12 },
    batchButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#D6E4FF', gap: 8 },
    exportButton: { borderColor: '#C9EDD4', backgroundColor: '#F2FAF3' },
    batchButtonText: { fontSize: 15, fontWeight: '600', color: '#007AFF' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
    modalHandle: { width: 40, height: 4, backgroundColor: '#D1D1D6', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 6, textAlign: 'center' },
    modalDescription: { fontSize: 15, color: '#8E8E93', marginBottom: 24, textAlign: 'center' },
    modalButton: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F8F9FA', borderRadius: 14, marginBottom: 12, gap: 14 },
    modalIconBg: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    modalButtonTextContainer: { flex: 1 },
    modalButtonTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E', marginBottom: 3 },
    modalButtonSubtitle: { fontSize: 14, color: '#8E8E93' },
    modalCancelButton: { padding: 16, alignItems: 'center', marginTop: 4 },
    modalCancelText: { fontSize: 17, fontWeight: '600', color: '#FF3B30' },
});
