import React from 'react';
import { StyleSheet, SafeAreaView, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function BlockEditorScreen() {
    // In production, this would point to the deployed Vercel/Netlify URL
    // For local testing on an emulator or real device, use your machine's IP address instead of localhost
    // e.g., 'http://192.168.1.xxx:5173'
    const WEB_APP_URL = 'http://localhost:5173'; // Change to local IP if testing on physical device

    const onMessage = (event) => {
        const data = event.nativeEvent.data;
        console.log('Message from Web App:', data);
        // Here we can handle native actions sent from the web app
        // e.g., if (data === 'TRIGGER_CAMERA') { openCamera(); }
    };

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                source={{ uri: WEB_APP_URL }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                onMessage={onMessage}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#8B5CF6" size="large" />
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    }
});
