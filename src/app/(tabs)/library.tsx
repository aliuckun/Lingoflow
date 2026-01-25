// src/app/library/index.tsx
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import allStories from '../../../assets/books/german_stories.json';
import { BookCard } from '../../components/Library/BookCard';
import { ROUTES } from '../../constants/routes';

export default function LibraryScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Almanca Kitaplığım</Text>
            <FlatList
                data={allStories}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={({ item }) => (
                    <BookCard
                        title={item.title}
                        level={item.level}
                        // ✅ Tıklayınca detay sayfasına yönlendir
                        onPress={() => router.push(ROUTES.LIBRARY_DETAIL(item.id))}
                    />
                )}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        padding: 20,
        backgroundColor: '#fff',
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
});