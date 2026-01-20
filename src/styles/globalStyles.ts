// src/styles/globalStyles.ts
import { StyleSheet } from 'react-native';
import { COLORS, SPACING } from './theme';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: SPACING.m,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.subtext,
        marginVertical: SPACING.m,
        textAlign: 'center',
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: 12,
        elevation: 3, // Android gölge
        shadowColor: '#000', // iOS gölge
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 15,
        padding: SPACING.l,
        width: '90%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
    }
});