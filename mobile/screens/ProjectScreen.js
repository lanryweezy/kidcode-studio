import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProjectScreen() {
    const mockProjects = [
        { id: '1', name: 'My First Robot', type: 'Game', date: '2 days ago' },
        { id: '2', name: 'Smart Alarm', type: 'Hardware', date: '5 days ago' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Projects</Text>
            </View>
            <FlatList
                data={mockProjects}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.projectCard}>
                        <View style={styles.projectInfo}>
                            <Text style={styles.projectName}>{item.name}</Text>
                            <Text style={styles.projectMeta}>{item.type} • {item.date}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
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
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    list: {
        padding: 15,
    },
    projectCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
    },
    projectInfo: {
        flex: 1,
    },
    projectName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    projectMeta: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
});
