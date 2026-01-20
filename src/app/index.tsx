// src/app/index.tsx
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { ROUTES } from '../constants/routes';
import { globalStyles } from '../styles/globalStyles';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.card}>
                <Text style={globalStyles.title}>LingoFlow</Text>
                <Text style={globalStyles.subtitle}>Bugünün kelimelerine hazır mısın?</Text>

                <TouchableOpacity
                    style={globalStyles.button}
                    onPress={() => router.push(ROUTES.WORD_DETAIL('test-kelimesi'))}
                >
                    <Text style={globalStyles.buttonText}>Öğrenmeye Başla</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}