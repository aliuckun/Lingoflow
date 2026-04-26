import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy'; // ← sadece bu satır değişti
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { PartOfSpeech, Word } from '../types/word';
import { VocabularyService } from './vocabularyService';

/**
 * IMPORT/EXPORT UTILITY
 * 
 * Yeni expo-file-system API kullanılıyor (v17+)
 * - readAsStringAsync yerine File API
 * - documentDirectory yerine cacheDirectory
 */

export class ImportExportService {
    /**
     * CSV dosyasından kelimeleri içe aktar
     */
    static async importFromCSV(): Promise<{ success: boolean; count: number; message: string }> {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
                copyToCacheDirectory: true
            });

            if (result.canceled) {
                return { success: false, count: 0, message: 'İptal edildi' };
            }

            // Yeni API: File objesinden text okuma
            const file = result.assets[0];
            const response = await fetch(file.uri);
            const fileContent = await response.text();

            const words = this.parseCSV(fileContent);

            if (words.length === 0) {
                return { success: false, count: 0, message: 'Dosyada kelime bulunamadı' };
            }

            let successCount = 0;
            for (const word of words) {
                const success = await VocabularyService.addWord(word);
                if (success) successCount++;
            }

            return {
                success: true,
                count: successCount,
                message: `${successCount} kelime başarıyla eklendi`
            };
        } catch (error) {
            console.error('Import hatası:', error);
            return {
                success: false,
                count: 0,
                message: error instanceof Error ? error.message : 'Bilinmeyen hata'
            };
        }
    }

    /**
     * JSON dosyasından kelimeleri içe aktar
     */
    static async importFromJSON(): Promise<{ success: boolean; count: number; message: string }> {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) {
                return { success: false, count: 0, message: 'İptal edildi' };
            }

            // Yeni API: File objesinden text okuma
            const file = result.assets[0];
            const response = await fetch(file.uri);
            const fileContent = await response.text();

            const success = await VocabularyService.importData(fileContent);

            if (success) {
                const words = JSON.parse(fileContent);
                return {
                    success: true,
                    count: words.length,
                    message: `${words.length} kelime başarıyla eklendi`
                };
            }
            return { success: false, count: 0, message: 'İçe aktarma başarısız' };
        } catch (error) {
            console.error('Import hatası:', error);
            return {
                success: false,
                count: 0,
                message: error instanceof Error ? error.message : 'Hata oluştu'
            };
        }
    }

    /**
     * CSV formatında dışa aktar
     */
    static async exportToCSV(): Promise<boolean> {
        try {
            const words = await VocabularyService.getAllWords();
            if (words.length === 0) {
                Alert.alert('Uyarı', 'Dışa aktarılacak kelime bulunamadı');
                return false;
            }

            const csv = this.generateCSV(words);
            const fileName = `lingoflow_vocabulary_${Date.now()}.csv`;

            // Type assertion ile cacheDirectory erişimi
            const fileUri = (FileSystem as any).cacheDirectory + fileName;

            // Blob oluştur ve kaydet
            await FileSystem.writeAsStringAsync(fileUri, csv);

            // Paylaşım kontrolü
            const canShare = await Sharing.isAvailableAsync();
            if (!canShare) {
                Alert.alert('Hata', 'Paylaşım özelliği bu cihazda desteklenmiyor');
                return false;
            }

            // Dosyayı paylaş
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Kelime Listesini Kaydet',
                UTI: 'public.comma-separated-values-text'
            });

            // Başarı mesajı
            Alert.alert(
                'Başarılı ✓',
                `${words.length} kelime CSV formatında dışa aktarıldı`
            );

            return true;
        } catch (error) {
            console.error('Export hatası:', error);
            Alert.alert('Hata', 'Dışa aktarma sırasında bir hata oluştu');
            return false;
        }
    }

    /**
     * JSON formatında dışa aktar
     */
    static async exportToJSON(): Promise<boolean> {
        try {
            const jsonData = await VocabularyService.exportData();
            const words = JSON.parse(jsonData);

            if (words.length === 0) {
                Alert.alert('Uyarı', 'Dışa aktarılacak kelime bulunamadı');
                return false;
            }

            const fileName = `lingoflow_vocabulary_${Date.now()}.json`;

            // Type assertion ile cacheDirectory erişimi
            const fileUri = (FileSystem as any).cacheDirectory + fileName;

            // JSON dosyasını kaydet
            await FileSystem.writeAsStringAsync(fileUri, jsonData);

            // Paylaşım kontrolü
            const canShare = await Sharing.isAvailableAsync();
            if (!canShare) {
                Alert.alert('Hata', 'Paylaşım özelliği bu cihazda desteklenmiyor');
                return false;
            }

            // Dosyayı paylaş
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Kelime Listesini Kaydet',
                UTI: 'public.json'
            });

            // Başarı mesajı
            Alert.alert(
                'Başarılı ✓',
                `${words.length} kelime JSON formatında dışa aktarıldı`
            );

            return true;
        } catch (error) {
            console.error('Export hatası:', error);
            Alert.alert('Hata', 'Dışa aktarma sırasında bir hata oluştu');
            return false;
        }
    }

    /**
     * CSV string'ini Word array'ine dönüştür
     */
    private static parseCSV(csvContent: string): Word[] {
        const lines = csvContent.split('\n').filter(line => line.trim());
        const words: Word[] = [];

        // İlk satırı atla (header)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = this.parseCSVLine(line);
            if (parts.length < 3) continue;

            const word: Word = {
                id: `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                word: parts[0]?.trim() || '',
                meaning: parts[1]?.trim() || '',
                partOfSpeech: (parts[2]?.trim() as PartOfSpeech) || 'noun',
                examples: [],
                createdAt: Date.now(),
                familiarity: 0,
                correctCount: 0,
                wrongCount: 0,
                isFavorite: false
            };

            // Örnek cümle varsa ekle
            if (parts[3] && parts[4]) {
                word.examples.push({
                    example: parts[3].trim(),
                    exampleMeaning: parts[4].trim()
                });
            }

            // Fiil çekimleri varsa ekle
            if (word.partOfSpeech === 'verb' && parts.length >= 11) {
                word.verbDetails = {
                    infinitive: word.word,
                    conjugations: {
                        ich: parts[5]?.trim() || '',
                        du: parts[6]?.trim() || '',
                        erSieEs: parts[7]?.trim() || '',
                        wir: parts[8]?.trim() || '',
                        ihr: parts[9]?.trim() || '',
                        sieSie: parts[10]?.trim() || ''
                    }
                };
            }
            words.push(word);
        }
        return words;
    }

    /**
     * CSV satırını parse et
     */
    private static parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }

    /**
     * Word array'ini CSV string'e dönüştür
     */
    private static generateCSV(words: Word[]): string {
        let csv = 'word,meaning,partOfSpeech,example,exampleMeaning,ich,du,erSieEs,wir,ihr,sieSie\n';

        for (const word of words) {
            const example = word.examples?.[0];
            const verb = word.verbDetails?.conjugations;

            const row = [
                this.escapeCSV(word.word),
                this.escapeCSV(word.meaning),
                word.partOfSpeech,
                this.escapeCSV(example?.example || ''),
                this.escapeCSV(example?.exampleMeaning || ''),
                this.escapeCSV(verb?.ich || ''),
                this.escapeCSV(verb?.du || ''),
                this.escapeCSV(verb?.erSieEs || ''),
                this.escapeCSV(verb?.wir || ''),
                this.escapeCSV(verb?.ihr || ''),
                this.escapeCSV(verb?.sieSie || '')
            ];
            csv += row.join(',') + '\n';
        }
        return csv;
    }

    /**
     * CSV için string escape
     */
    private static escapeCSV(str: string): string {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
}