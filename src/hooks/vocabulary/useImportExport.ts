import { useState } from 'react';
import { Alert } from 'react-native';
import { ImportExportService } from '../../services/importExportService';

interface UseImportExportReturn {
    isLoading: boolean;
    importFromCSV: () => Promise<void>;
    importFromJSON: () => Promise<void>;
    exportToCSV: () => Promise<void>;
    exportToJSON: () => Promise<void>;
}

/**
 * Import/Export hook - Kelime içe/dışa aktarma işlemleri
 * 
 * Desteklenen formatlar:
 * - CSV (virgülle ayrılmış)
 * - JSON (tam veri yapısı)
 */
export const useImportExport = (onSuccess?: () => void): UseImportExportReturn => {
    const [isLoading, setIsLoading] = useState(false);

    /**
     * CSV dosyasından kelime içe aktar
     */
    const importFromCSV = async () => {
        setIsLoading(true);

        try {
            const result = await ImportExportService.importFromCSV();

            if (result.success) {
                Alert.alert(
                    'Başarılı ✓',
                    result.message,
                    [{ text: 'Tamam', onPress: onSuccess }]
                );
            } else {
                Alert.alert('Hata', result.message);
            }
        } catch (error) {
            Alert.alert('Hata', 'İçe aktarma sırasında bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * JSON dosyasından kelime içe aktar
     */
    const importFromJSON = async () => {
        setIsLoading(true);

        try {
            const result = await ImportExportService.importFromJSON();

            if (result.success) {
                Alert.alert(
                    'Başarılı ✓',
                    result.message,
                    [{ text: 'Tamam', onPress: onSuccess }]
                );
            } else {
                Alert.alert('Hata', result.message);
            }
        } catch (error) {
            Alert.alert('Hata', 'İçe aktarma sırasında bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Kelimeleri CSV formatında dışa aktar
     */
    const exportToCSV = async () => {
        setIsLoading(true);

        try {
            await ImportExportService.exportToCSV();
        } catch (error) {
            Alert.alert('Hata', 'Dışa aktarma sırasında bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Kelimeleri JSON formatında dışa aktar
     */
    const exportToJSON = async () => {
        setIsLoading(true);

        try {
            await ImportExportService.exportToJSON();
        } catch (error) {
            Alert.alert('Hata', 'Dışa aktarma sırasında bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        importFromCSV,
        importFromJSON,
        exportToCSV,
        exportToJSON
    };
};