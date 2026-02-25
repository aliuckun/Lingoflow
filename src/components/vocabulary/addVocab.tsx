import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useAddVocabulary } from '../../hooks/vocabulary/useAddVocabulary';
import { useImportExport } from '../../hooks/vocabulary/useImportExport';
import { PartOfSpeech, Word } from "../../types/word";

interface AddVocabProps {
    onSuccess: () => void;
}

export const AddVocab = ({ onSuccess }: AddVocabProps) => {
    const { state, actions } = useAddVocabulary({ onSuccess });
    const importExport = useImportExport(onSuccess);

    // Modal states
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Temel Bilgiler
    const [word, setWord] = useState('');
    const [meaning, setMeaning] = useState('');
    const [pos, setPos] = useState<PartOfSpeech>('noun');

    // Örnek Cümle
    const [example, setExample] = useState('');
    const [exampleMeaning, setExampleMeaning] = useState('');

    // Almanca Fiil Çekimleri
    const [conjugations, setConjugations] = useState({
        ich: '', du: '', erSieEs: '', wir: '', ihr: '', sieSie: ''
    });

    const posOptions: PartOfSpeech[] = [
        "noun",
        "verb",
        "adjective",
        "adverb",
        "preposition",
        "conjunction",
        "pronoun",
        "other"
    ];

    const handleSave = async () => {
        // Validasyon
        if (!word.trim() || !meaning.trim()) {
            Alert.alert("Hata", "Lütfen kelime ve anlam alanlarını doldurun.");
            return;
        }

        const newWord: Word = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            word: word.trim(),
            meaning: meaning.trim(),
            partOfSpeech: pos,
            examples: example.trim() ? [{
                example: example.trim(),
                exampleMeaning: exampleMeaning.trim()
            }] : [],
            verbDetails: pos === 'verb' ? {
                infinitive: word.trim(),
                conjugations: conjugations
            } : undefined,
            createdAt: Date.now(),
            familiarity: 0,
            correctCount: 0,
            wrongCount: 0,
            isFavorite: false
        };

        // Hook üzerinden kaydet
        await actions.addWord(newWord);

        // Başarılı kayıt sonrası formu temizle
        resetForm();
    };

    const resetForm = () => {
        setWord('');
        setMeaning('');
        setPos('noun');
        setExample('');
        setExampleMeaning('');
        setConjugations({
            ich: '', du: '', erSieEs: '', wir: '', ihr: '', sieSie: ''
        });
    };

    const renderConjInput = (label: string, value: string, key: keyof typeof conjugations) => (
        <View style={styles.conjInputWrapper}>
            <Text style={styles.conjLabel}>{label}</Text>
            <TextInput
                style={styles.inputSmall}
                value={value}
                onChangeText={(t) => setConjugations({ ...conjugations, [key]: t })}
                placeholder="..."
                editable={!state.isLoading && !importExport.isLoading}
            />
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View style={styles.form}>
                    {/* Temel Girişler */}
                    <Text style={styles.label}>Yeni Kelime</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="İngilizce/Almanca Kelime"
                        value={word}
                        onChangeText={setWord}
                        editable={!state.isLoading && !importExport.isLoading}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Türkçe Anlamı"
                        value={meaning}
                        onChangeText={setMeaning}
                        editable={!state.isLoading && !importExport.isLoading}
                    />

                    {/* POS Seçimi */}
                    <Text style={styles.label}>Kelime Türü</Text>
                    <View style={styles.posContainer}>
                        {posOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[styles.posBadge, pos === option && styles.posBadgeActive]}
                                onPress={() => setPos(option)}
                                disabled={state.isLoading || importExport.isLoading}
                            >
                                <Text style={[
                                    styles.posBadgeText,
                                    pos === option && styles.posBadgeTextActive
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Dinamik Fiil Çekim Alanı */}
                    {pos === 'verb' && (
                        <View style={styles.extraSection}>
                            <Text style={styles.subTitle}>Almanca Şahıs Çekimleri</Text>
                            <View style={styles.conjGrid}>
                                <View style={styles.conjColumn}>
                                    {renderConjInput("ich", conjugations.ich, "ich")}
                                    {renderConjInput("du", conjugations.du, "du")}
                                    {renderConjInput("er/sie/es", conjugations.erSieEs, "erSieEs")}
                                </View>
                                <View style={styles.conjColumn}>
                                    {renderConjInput("wir", conjugations.wir, "wir")}
                                    {renderConjInput("ihr", conjugations.ihr, "ihr")}
                                    {renderConjInput("sie/Sie", conjugations.sieSie, "sieSie")}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Örnek Cümle Alanı */}
                    <Text style={styles.label}>Örnek Cümle (Opsiyonel)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Örnek cümle"
                        value={example}
                        onChangeText={setExample}
                        multiline
                        editable={!state.isLoading && !importExport.isLoading}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Cümlenin anlamı"
                        value={exampleMeaning}
                        onChangeText={setExampleMeaning}
                        editable={!state.isLoading && !importExport.isLoading}
                    />

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            (state.isLoading || importExport.isLoading) && styles.saveButtonDisabled
                        ]}
                        onPress={handleSave}
                        disabled={state.isLoading || importExport.isLoading}
                    >
                        {state.isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Listeye Ekle</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Import / Export Bölümü */}
                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>TOPLU İŞLEM</Text>
                    <View style={styles.divider} />
                </View>

                <View style={styles.batchActions}>
                    <TouchableOpacity
                        style={styles.batchButton}
                        onPress={() => setShowImportModal(true)}
                        disabled={state.isLoading || importExport.isLoading}
                    >
                        {importExport.isLoading ? (
                            <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload-outline" size={20} color="#007AFF" />
                                <Text style={styles.batchButtonText}>İçe Aktar</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.batchButton, styles.exportButton]}
                        onPress={() => setShowExportModal(true)}
                        disabled={state.isLoading || importExport.isLoading}
                    >
                        {importExport.isLoading ? (
                            <ActivityIndicator size="small" color="#34C759" />
                        ) : (
                            <>
                                <Ionicons name="cloud-download-outline" size={20} color="#34C759" />
                                <Text style={[styles.batchButtonText, { color: '#34C759' }]}>Dışa Aktar</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Import Modal */}
            <Modal
                visible={showImportModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowImportModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>İçe Aktar</Text>
                        <Text style={styles.modalDescription}>
                            Hangi formattan içe aktarmak istersiniz?
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setShowImportModal(false);
                                importExport.importFromCSV();
                            }}
                        >
                            <Ionicons name="document-text" size={24} color="#007AFF" />
                            <View style={styles.modalButtonTextContainer}>
                                <Text style={styles.modalButtonTitle}>CSV Dosyası</Text>
                                <Text style={styles.modalButtonSubtitle}>
                                    Excel'den kaydedilmiş CSV
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setShowImportModal(false);
                                importExport.importFromJSON();
                            }}
                        >
                            <Ionicons name="code-slash" size={24} color="#FF9500" />
                            <View style={styles.modalButtonTextContainer}>
                                <Text style={styles.modalButtonTitle}>JSON Dosyası</Text>
                                <Text style={styles.modalButtonSubtitle}>
                                    Tam veri yapısı
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowImportModal(false)}
                        >
                            <Text style={styles.modalCancelText}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Export Modal */}
            <Modal
                visible={showExportModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowExportModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Dışa Aktar</Text>
                        <Text style={styles.modalDescription}>
                            Hangi formatta dışa aktarmak istersiniz?
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setShowExportModal(false);
                                importExport.exportToCSV();
                            }}
                        >
                            <Ionicons name="document-text" size={24} color="#34C759" />
                            <View style={styles.modalButtonTextContainer}>
                                <Text style={styles.modalButtonTitle}>CSV Dosyası</Text>
                                <Text style={styles.modalButtonSubtitle}>
                                    Excel'de açılabilir
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setShowExportModal(false);
                                importExport.exportToJSON();
                            }}
                        >
                            <Ionicons name="code-slash" size={24} color="#FF9500" />
                            <View style={styles.modalButtonTextContainer}>
                                <Text style={styles.modalButtonTitle}>JSON Dosyası</Text>
                                <Text style={styles.modalButtonSubtitle}>
                                    Tam yedekleme
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowExportModal(false)}
                        >
                            <Text style={styles.modalCancelText}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20
    },
    form: {
        marginTop: 10
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 8,
        marginTop: 10
    },
    input: {
        backgroundColor: '#F2F2F7',
        padding: 12,
        borderRadius: 10,
        fontSize: 15,
        marginBottom: 10
    },
    posContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 10
    },
    posBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: '#E5E5EA'
    },
    posBadgeActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF'
    },
    posBadgeText: {
        fontSize: 11,
        color: '#8E8E93',
        fontWeight: '600'
    },
    posBadgeTextActive: {
        color: '#FFF'
    },
    extraSection: {
        backgroundColor: '#F9F9FB',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        marginBottom: 15
    },
    subTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
        marginBottom: 10,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    conjGrid: {
        flexDirection: 'row',
        gap: 10
    },
    conjColumn: {
        flex: 1,
        gap: 8
    },
    conjInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    conjLabel: {
        fontSize: 11,
        color: '#8E8E93',
        width: 45
    },
    inputSmall: {
        flex: 1,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#D1D1D6',
        padding: 6,
        borderRadius: 6,
        fontSize: 12
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 15
    },
    saveButtonDisabled: {
        opacity: 0.6
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E5EA'
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 10,
        fontWeight: '800',
        color: '#C7C7CC'
    },
    batchActions: {
        flexDirection: 'row',
        gap: 10
    },
    batchButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        gap: 6
    },
    exportButton: {
        borderColor: '#D1EAD3',
        backgroundColor: '#F2FAF3'
    },
    batchButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#007AFF'
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 400
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 8,
        textAlign: 'center'
    },
    modalDescription: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 20,
        textAlign: 'center'
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        marginBottom: 12,
        gap: 12
    },
    modalButtonTextContainer: {
        flex: 1
    },
    modalButtonTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 2
    },
    modalButtonSubtitle: {
        fontSize: 13,
        color: '#8E8E93'
    },
    modalCancelButton: {
        padding: 16,
        alignItems: 'center',
        marginTop: 8
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF'
    }
});