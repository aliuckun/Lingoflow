// src/app/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ROUTES } from '../constants/routes';

export default function RootLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#6200ee',
                tabBarInactiveTintColor: '#999',
                headerShown: true,
            }}
        >
            <Tabs.Screen
                name={ROUTES.HOME} // 'index' yerine
                options={{
                    title: 'LingoFlow',
                    tabBarLabel: 'Öğren',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name={ROUTES.LIBRARY} // 'library/index' yerine
                options={{
                    title: 'Kitaplık',
                    tabBarLabel: 'Kitaplar',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="library" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name={ROUTES.PRACTICE} // 'practice/index' yerine
                options={{
                    title: 'Pratik Yap',
                    tabBarLabel: 'Pratik',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="fitness" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name={ROUTES.PROGRESS} // 'progress/index' yerine
                options={{
                    title: 'İlerleme',
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="words/[id]" // Dinamik rotalar genellikle sabitlerden ziyade bu şekilde kalır
                options={{
                    href: null,
                    title: 'Kelime Detay',
                }}
            />

            <Tabs.Screen
                name={ROUTES.VOCABULARY}
                options={{
                    title: 'Kelimelerim',
                    tabBarLabel: 'Sözlük',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="language" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}