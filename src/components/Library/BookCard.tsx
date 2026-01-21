// src/components/BookCard.tsx
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const columnWidth = (width - 40) / 2;

interface BookCardProps {
    title: string;
    author?: string;
    level: string;
    cover?: string;
    onPress: () => void;
}

export const BookCard = ({ title, author, level, cover, onPress }: BookCardProps) => (
    <TouchableOpacity style={styles.bookCard} onPress={onPress}>
        {cover ? (
            <Image source={{ uri: cover }} style={styles.coverImage} />
        ) : (
            <View style={[styles.coverImage, styles.placeholder]}>
                <Text>📖</Text>
            </View>
        )}
        <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level}</Text>
        </View>
        <View style={styles.info}>
            <Text style={styles.bookTitle} numberOfLines={1}>{title}</Text>
            {author && <Text style={styles.bookAuthor}>{author}</Text>}
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    bookCard: {
        width: columnWidth,
        margin: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
    },
    coverImage: { width: '100%', height: 180, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
    placeholder: { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
    levelBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#6200ee', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    levelText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    info: { padding: 10 },
    bookTitle: { fontSize: 15, fontWeight: 'bold' },
    bookAuthor: { fontSize: 12, color: '#666' },
});