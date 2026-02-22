import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🚀 KidCode Studio</Text>
        <Text style={styles.subtitle}>Create Games with AI Magic!</Text>
      </View>

      <View style={styles.modeGrid}>
        <TouchableOpacity 
          style={[styles.modeCard, { backgroundColor: '#F59E0B' }]}
          onPress={() => navigation.navigate('Create', { mode: 'GAME' })}
        >
          <Text style={styles.modeIcon}>🎮</Text>
          <Text style={styles.modeTitle}>Game Maker</Text>
          <Text style={styles.modeDesc}>Create 2D & 3D games</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.modeCard, { backgroundColor: '#3B82F6' }]}
          onPress={() => navigation.navigate('Create', { mode: 'APP' })}
        >
          <Text style={styles.modeIcon}>📱</Text>
          <Text style={styles.modeTitle}>App Builder</Text>
          <Text style={styles.modeDesc}>Build mobile apps</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.modeCard, { backgroundColor: '#10B981' }]}
          onPress={() => navigation.navigate('Create', { mode: 'HARDWARE' })}
        >
          <Text style={styles.modeIcon}>⚡</Text>
          <Text style={styles.modeTitle}>Circuit Lab</Text>
          <Text style={styles.modeDesc}>Design circuits</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.modeCard, { backgroundColor: '#EC4899' }]}
          onPress={() => navigation.navigate('Projects')}
        >
          <Text style={styles.modeIcon}>📁</Text>
          <Text style={styles.modeTitle}>My Projects</Text>
          <Text style={styles.modeDesc}>View & edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.aiTools}>
        <Text style={styles.sectionTitle}>🤖 FREE AI Tools</Text>
        <View style={styles.aiGrid}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiIcon}>🧊</Text>
            <Text style={styles.aiText}>3D Generator</Text>
          </View>
          <View style={styles.aiBadge}>
            <Text style={styles.aiIcon}>🎵</Text>
            <Text style={styles.aiText}>Music AI</Text>
          </View>
          <View style={styles.aiBadge}>
            <Text style={styles.aiIcon}>✂️</Text>
            <Text style={styles.aiText}>Sprite Extractor</Text>
          </View>
          <View style={styles.aiBadge}>
            <Text style={styles.aiIcon}>💻</Text>
            <Text style={styles.aiText}>Code Helper</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modeCard: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  modeIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  modeDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  aiTools: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  aiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  aiBadge: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 15,
  },
  aiIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  aiText: {
    fontSize: 11,
    color: 'white',
    textAlign: 'center',
  },
});
