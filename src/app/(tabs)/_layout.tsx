import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ROUTES } from '../../constants/routes';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#6200ee',
                tabBarInactiveTintColor: '#999',
                headerShown: true,
            }}
        >
            <Tabs.Screen
                name={ROUTES.HOME}
                options={{
                    title: 'LingoFlow',
                    tabBarLabel: 'Öğren',
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name={ROUTES.LIBRARY}
                options={{
                    title: 'Kitaplık',
                    tabBarLabel: 'Kitaplar',
                    tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name={ROUTES.PRACTICE}
                options={{
                    title: 'Pratik Yap',
                    tabBarLabel: 'Pratik',
                    // 'heart-pulse' yerine hata vermeyen 'pulse' veya 'fitness' kullan
                    tabBarIcon: ({ color, size }) => <Ionicons name="pulse" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name={ROUTES.PROGRESS}
                options={{
                    title: 'İlerleme',
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name={ROUTES.VOCABULARY}
                options={{
                    title: 'Sözlük',
                    tabBarLabel: 'Sözlük',
                    tabBarIcon: ({ color, size }) => <Ionicons name="language" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}