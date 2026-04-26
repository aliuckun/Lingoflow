import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('screen');

interface Props {
    onFinish: () => void;
}

export default function AppSplashScreen({ onFinish }: Props) {
    const opacity = useRef(new Animated.Value(0)).current;
    const loaderWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Ekran fade in
        Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start(() => {
            // Loading bar animasyonu
            Animated.timing(loaderWidth, {
                toValue: 1,
                duration: 1800,
                useNativeDriver: false,
            }).start(() => {
                // Fade out ve çıkış
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }).start(onFinish);
            });
        });
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity }]}>
            <Image
                source={require('../../assets/images/bcg.png')}
                style={styles.image}
                resizeMode="cover"
            />
            {/* Loading bar - altta */}
            <View style={styles.loaderContainer}>
                <View style={styles.loaderTrack}>
                    <Animated.View
                        style={[
                            styles.loaderBar,
                            {
                                width: loaderWidth.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width,
        height,
        backgroundColor: '#000',
        zIndex: 999,
    },
    image: {
        width,
        height,
    },
    loaderContainer: {
        position: 'absolute',
        bottom: 60,
        left: 40,
        right: 40,
    },
    loaderTrack: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    loaderBar: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 2,
    },
});