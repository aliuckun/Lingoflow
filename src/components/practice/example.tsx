/**
 * EXAMPLE COMPONENT - Örnek Cümle Gösterici
 * 
 * Cevap verildikten sonra:
 * - Kelimenin örnek cümlesini gösterir
 * - Türkçe çevirisini gösterir
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ExampleProps {
    sentence: string;
    translation: string;
}

export const ExampleComponent = ({ sentence, translation }: ExampleProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Cümle İçinde Kullanımı</Text>
            <View style={styles.card}>
                <Text style={styles.sentence}>{sentence}</Text>
                <Text style={styles.translation}>{translation}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginTop: 10
    },
    header: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
        marginLeft: 5
    },
    card: {
        backgroundColor: '#F9F9F9',
        padding: 20,
        borderRadius: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#34C759',
    },
    sentence: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8
    },
    translation: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic'
    },
});