import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Örnek Almanca Kitap Verileri
const GERMAN_BOOKS = [
    {
        id: '1',
        title: 'Der kleine Prinz',
        author: 'Antoine de Saint-Exupéry',
        level: 'A2',
        cover: 'https://images.thalia.media/00/-/7486895311f440599587a8f090740924/der-kleine-prinz-gebundene-ausgabe-antoine-de-saint-exupery.jpeg',
    },
    {
        id: '2',
        title: 'Hänsel und Gretel',
        author: 'Gebrüder Grimm',
        level: 'A1',
        cover: 'https://m.media-amazon.com/images/I/81sh9R8vGXL._AC_UF1000,1000_QL80_.jpg',
    },
    {
        id: '3',
        title: 'Die Verwandlung',
        author: 'Franz Kafka',
        level: 'B2',
        cover: 'https://m.media-amazon.com/images/I/71p0WfB6uWL._AC_UF1000,1000_QL80_.jpg',
    },
];

const { width } = Dimensions.get('window');
const columnWidth = (width - 40) / 2; // Yanlardan boşluk bırakmak için

export default function LibraryScreen() {
    const router = useRouter();

    const renderBook = ({ item }: { item: typeof GERMAN_BOOKS[0] }) => (
        <TouchableOpacity
            style={styles.bookCard}
            onPress={() => router.push(`/library/${item.id}`)} // Kitap detayına/okuma moduna gider
        >
            <Image source={{ uri: item.cover }} style={styles.coverImage} />
            <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{item.level}</Text>
            </View>
            <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.bookAuthor}>{item.author}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Almanca Kitaplığım</Text>
            <FlatList
                data={GERMAN_BOOKS}
                keyExtractor={(item) => item.id}
                renderItem={renderBook}
                numColumns={2}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', marginVertical: 20, color: '#333', marginLeft: 10 },
    listContent: { paddingBottom: 20 },
    bookCard: {
        width: columnWidth,
        margin: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        // Gölge ayarları
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    coverImage: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    levelBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#6200ee',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    levelText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    bookTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 8, paddingHorizontal: 8 },
    bookAuthor: { fontSize: 13, color: '#666', marginBottom: 10, paddingHorizontal: 8 },
});