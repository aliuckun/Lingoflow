import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AppSplashScreen from '../components/SplashScreen';

ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [appReady, setAppReady] = useState(false);
    const [splashDone, setSplashDone] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppReady(true);
                await ExpoSplashScreen.hideAsync();
            }
        }
        prepare();
    }, []);

    if (!appReady) return null;

    return (
        <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="library/[id]"
                    options={{
                        headerShown: true,
                        headerBackTitle: 'Geri',
                        title: '',
                        headerStyle: { backgroundColor: '#fff' },
                        headerShadowVisible: false,
                    }}
                />
                <Stack.Screen
                    name="vocabulary/[id]"
                    options={{
                        headerShown: true,
                        headerBackTitle: 'Geri',
                        title: '',
                        headerStyle: { backgroundColor: '#fff' },
                        headerShadowVisible: false,
                    }}
                />
            </Stack>

            {!splashDone && (
                <AppSplashScreen onFinish={() => setSplashDone(true)} />
            )}
        </View>
    );
}