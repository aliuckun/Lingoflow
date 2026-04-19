// src/components/Library/BookCard.tsx
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Her seviyeye özgü renk + emoji
const LEVEL_CONFIG: Record<string, { color: string; bg: string; emoji: string }> = {
    A1: { color: '#34C759', bg: '#E8FAF0', emoji: '🌱' },
    A2: { color: '#30D158', bg: '#E0F9E8', emoji: '🌿' },
    B1: { color: '#007AFF', bg: '#E5F1FF', emoji: '📘' },
    B2: { color: '#0A84FF', bg: '#DCEEff', emoji: '📗' },
    C1: { color: '#AF52DE', bg: '#F3E8FA', emoji: '🎓' },
    C2: { color: '#BF5AF2', bg: '#EDE0FA', emoji: '🏆' },
};

interface BookCardProps {
    title: string;
    level: string;
    wordCount?: number;
    onPress: () => void;
}

export const BookCard = ({ title, level, wordCount, onPress }: BookCardProps) => {
    const cfg = LEVEL_CONFIG[level] ?? { color: '#8E8E93', bg: '#F2F2F7', emoji: '📖' };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
            {/* Kitap kapağı alanı */}
            <View style={[styles.cover, { backgroundColor: cfg.bg }]}>
                {/* Dekoratif çizgiler */}
                <View style={[styles.stripe, { backgroundColor: cfg.color + '18', top: 20 }]} />
                <View style={[styles.stripe, { backgroundColor: cfg.color + '12', top: 44 }]} />
                <View style={[styles.stripe, { backgroundColor: cfg.color + '08', top: 68 }]} />
                {/* Emoji */}
                <Text style={styles.coverEmoji}>{cfg.emoji}</Text>
            </View>

            {/* Seviye rozeti */}
            <View style={[styles.levelBadge, { backgroundColor: cfg.color }]}>
                <Text style={styles.levelText}>{level}</Text>
            </View>

            {/* Bilgi alanı */}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                {wordCount !== undefined && (
                    <Text style={styles.meta}>{wordCount} kelime</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 3,
    },
    cover: {
        width: '100%',
        height: 148,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    stripe: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 18,
        borderRadius: 2,
    },
    coverEmoji: {
        fontSize: 44,
        zIndex: 1,
    },
    levelBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 8,
    },
    levelText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    info: {
        padding: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1C1C1E',
        lineHeight: 19,
        marginBottom: 4,
    },
    meta: {
        fontSize: 11,
        color: '#8E8E93',
        fontWeight: '500',
    },
});