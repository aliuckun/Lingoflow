// src/app/library/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import allStories from '../../../assets/books/german_stories.json';

export default function StoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>(); // ID'nin string olduğunu belirttik

    const story = allStories.find(s => s.id === id);

    const speak = (text: string) => {
        Speech.speak(text, { language: 'de', rate: 0.85 });
    };

    if (!story) {
        return (
            <View style={styles.center}>
                <Text>Hikaye bulunamadı.</Text>
            </View>
        );
    }

    const paragraphs = story.text.split('\n\n');

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: story.title }} />
            <Text style={styles.mainTitle}>{story.title}</Text>

            {paragraphs.map((para, index) => (
                <View key={index} style={styles.paragraphContainer}>
                    <Text style={styles.text}>{para}</Text>
                    <TouchableOpacity onPress={() => speak(para)} style={styles.speakBtn}>
                        <Ionicons name="volume-medium" size={24} color="#6200ee" />
                    </TouchableOpacity>
                </View>
            ))}
            <View style={{ height: 50 }} />
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    mainTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    paragraphContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'flex-start'
    },
    text: { flex: 1, fontSize: 18, lineHeight: 28, color: '#444' },
    speakBtn: { marginLeft: 10, marginTop: 5 }
});