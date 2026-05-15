import React from 'react';
import { StyleSheet, SafeAreaView, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { WEB_APP_URL } from '../config';

export default function BlockEditorScreen() {

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
