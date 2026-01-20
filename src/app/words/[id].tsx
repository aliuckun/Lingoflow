// src/app/words/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS, SPACING } from '../../styles/theme';

export default function WordDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.subtitle}>Kelime Detayı</Text>
            <Text style={[globalStyles.title, { color: COLORS.primary, marginBottom: SPACING.l }]}>
                {id}
            </Text>

            <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: COLORS.subtext }]}
                onPress={() => router.back()}
            >
                <Text style={globalStyles.buttonText}>Geri Dön</Text>
            </TouchableOpacity>
        </View>
    );
}