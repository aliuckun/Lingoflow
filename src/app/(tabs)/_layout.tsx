import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { ROUTES } from '../../constants/routes';

// Tab konfigürasyonu
const TAB_CONFIG = [
    {
        name: ROUTES.HOME,
        title: 'LingoFlow',
        label: 'Ana Sayfa',
        icon: 'home' as const,
        iconOutline: 'home-outline' as const,
        color: '#5856D6',
    },
    {
        name: ROUTES.LIBRARY,
        title: 'Kitaplık',
        label: 'Kitaplar',
        icon: 'library' as const,
        iconOutline: 'library-outline' as const,
        color: '#007AFF',
    },
    {
        name: ROUTES.PRACTICE,
        title: 'Pratik Yap',
        label: 'Pratik',
        icon: 'pulse' as const,
        iconOutline: 'pulse-outline' as const,
        color: '#FF3B30',
    },
    {
        name: ROUTES.PROGRESS,
        title: 'İlerleme',
        label: 'Profil',
        icon: 'bar-chart' as const,
        iconOutline: 'bar-chart-outline' as const,
        color: '#34C759',
    },
    {
        name: ROUTES.VOCABULARY,
        title: 'Sözlük',
        label: 'Sözlük',
        icon: 'language' as const,
        iconOutline: 'language-outline' as const,
        color: '#FF9500',
    },
];

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#fff',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F2F2F7',
                } as any,
                headerTitleStyle: {
                    fontSize: 17,
                    fontWeight: '700',
                    color: '#1C1C1E',
                },
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false, // label'ı kendimiz çiziyoruz
            }}
        >
            {TAB_CONFIG.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused, color }) => (
                            <TabIcon
                                focused={focused}
                                icon={tab.icon}
                                iconOutline={tab.iconOutline}
                                label={tab.label}
                                activeColor={tab.color}
                            />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
}

// ── Özel Tab İkonu ────────────────────────────────────────────────────────────
interface TabIconProps {
    focused: boolean;
    icon: any;
    iconOutline: any;
    label: string;
    activeColor: string;
}

function TabIcon({ focused, icon, iconOutline, label, activeColor }: TabIconProps) {
    return (
        <View style={styles.tabItem}>
            {/* Aktifken renkli arka plan pill */}
            <View style={[
                styles.iconWrapper,
                focused && { backgroundColor: activeColor + '18' }
            ]}>
                <Ionicons
                    name={focused ? icon : iconOutline}
                    size={22}
                    color={focused ? activeColor : '#AEAEB2'}
                />
            </View>
            {/* Etiket */}
            <Text style={[
                styles.tabLabel,
                { color: focused ? activeColor : '#AEAEB2' },
                focused && styles.tabLabelActive
            ]}>
                {label}
            </Text>
        </View>
    );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        height: Platform.OS === 'ios' ? 90 : 72,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        paddingHorizontal: 0,
        elevation: 0,
        shadowOpacity: 0,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        flex: 1,
    },
    iconWrapper: {
        width: 38,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        letterSpacing: 0.1,
    },
    tabLabelActive: {
        fontWeight: '700',
    },
});