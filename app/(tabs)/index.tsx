import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Trip } from '@/types';
import { useTripStore } from '@/store/tripStore';
import { AddTripModal } from '@/components/AddTripModal';
import { Ionicons } from '@expo/vector-icons';

/**
 * 여행 목록 화면
 * 사용자의 모든 여행을 표시하고 새 여행을 생성할 수 있습니다
 */
export default function TripsScreen() {
    const { trips, isLoading, loadTrips, addTrip } = useTripStore();
    const [isModalVisible, setIsModalVisible] = useState(false);

    // 화면이 포커스될 때마다 데이터 로드
    useFocusEffect(
        useCallback(() => {
            loadTrips();
        }, [])
    );

    const handleAddTrip = async (title: string, startDate: string, endDate: string) => {
        await addTrip(title, startDate, endDate);
        // 모달은 AddTripModal 내부에서 onClose 호출로 닫힘
    };

    if (isLoading && trips.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>내 여행</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>+ 새 여행</Text>
                </TouchableOpacity>
            </View>

            {trips.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>✈️</Text>
                    <Text style={styles.emptyTitle}>아직 여행이 없습니다</Text>
                    <Text style={styles.emptySubtitle}>
                        새 여행을 만들어 일정을 정리해보세요!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={trips}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.tripCard}
                            onPress={() => router.push(`/trip/${item.id}`)}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.tripTitle}>{item.title}</Text>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </View>
                            <View style={styles.cardFooter}>
                                <Text style={styles.tripDate}>
                                    {item.startDate} ~ {item.endDate}
                                </Text>
                                <View style={styles.dayBadge}>
                                    <Text style={styles.dayBadgeText}>
                                        {item.days.length}일
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            <AddTripModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onAdd={handleAddTrip}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    listContainer: {
        padding: 16,
    },
    tripCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tripTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    tripDate: {
        fontSize: 14,
        color: '#666',
    },
    dayBadge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    dayBadgeText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
    },
});
