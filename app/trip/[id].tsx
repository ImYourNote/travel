import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTripStore } from '@/store/tripStore';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Trip, Day, ContentItem } from '@/types';

/**
 * 여행 상세 화면
 * 일차별 탭으로 구성되어 각 날짜의 콘텐츠를 관리합니다
 */
export default function TripDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    // store에서 필요한 상태와 함수들을 가져옵니다
    const { trips, loadTrips, addContentItem } = useTripStore();

    const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
    const [selectedDay, setSelectedDay] = useState(1);
    const [isUploading, setIsUploading] = useState(false);

    // ID로 현재 여행 찾기
    useEffect(() => {
        if (trips.length === 0) {
            loadTrips();
        }
    }, []);

    useEffect(() => {
        if (id && trips.length > 0) {
            const foundTrip = trips.find(t => t.id === id);
            if (foundTrip) {
                setCurrentTrip(foundTrip);
            }
        }
    }, [id, trips]);

    if (!currentTrip) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const currentDay = currentTrip.days.find(d => d.dayNumber === selectedDay);

    const handleAddPhoto = async () => {
        try {
            // 갤러리 접근 권한 요청
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '사진을 올리려면 갤러리 접근 권한이 필요합니다.');
                return;
            }

            // 이미지 선택
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && currentDay) {
                setIsUploading(true);
                // TODO: 실제로는 여기서 제목을 입력받는 모달을 띄워야 함
                // 지금은 임시로 자동 제목 생성
                const asset = result.assets[0];
                const defaultTitle = `${selectedDay}일차 사진 ${currentDay.items.length + 1}`;

                await addContentItem(currentTrip.id, currentDay.id, {
                    title: defaultTitle,
                    type: 'photo',
                    uri: asset.uri,
                });
                setIsUploading(false);
            }
        } catch (error) {
            console.error('사진 추가 실패:', error);
            Alert.alert('오류', '사진을 추가하는데 실패했습니다.');
            setIsUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: currentTrip.title,
                }}
            />

            {/* 일차 탭 영역 */}
            <View style={styles.tabWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabContainer}
                    contentContainerStyle={styles.tabContentContainer}
                >
                    {currentTrip.days.map((day) => (
                        <TouchableOpacity
                            key={day.id}
                            style={[
                                styles.tab,
                                selectedDay === day.dayNumber && styles.tabActive,
                            ]}
                            onPress={() => setSelectedDay(day.dayNumber)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    selectedDay === day.dayNumber && styles.tabTextActive,
                                ]}
                            >
                                {day.dayNumber}일차
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* 콘텐츠 영역 */}
            <View style={styles.content}>
                {currentDay && currentDay.items.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📸</Text>
                        <Text style={styles.emptyTitle}>
                            {selectedDay}일차 자료가 없습니다
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            티켓이나 바우처를 추가해보세요!
                        </Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddPhoto}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.addButtonText}>+ 사진 추가</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <ScrollView style={styles.itemsList}>
                            {currentDay?.items.map((item) => (
                                <TouchableOpacity key={item.id} style={styles.itemCard}>
                                    <Image source={{ uri: item.uri }} style={styles.itemImage} />
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                        <Text style={styles.itemType}>
                                            {item.type === 'photo' ? '사진' : '파일'}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </TouchableOpacity>
                            ))}
                            <View style={{ height: 100 }} />
                        </ScrollView>

                        {/* 리스트가 있을 때만 우측 하단 플로팅 버튼 표시 */}
                        <TouchableOpacity
                            style={styles.floatingButton}
                            onPress={handleAddPhoto}
                        >
                            <Ionicons name="add" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
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
    tabWrapper: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tabContainer: {
        flexGrow: 0,
    },
    tabContentContainer: {
        paddingHorizontal: 10,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#007AFF',
        fontWeight: '700',
    },
    content: {
        flex: 1,
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
        marginBottom: 24,
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    itemsList: {
        flex: 1,
        padding: 16,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemType: {
        fontSize: 12,
        color: '#999',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});
