import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTripStore } from '@/store/tripStore';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '@/types';
import { saveFileToLocal, generateFileName } from '@/lib/fileSystem';
import ChecklistTab from '@/components/ChecklistTab';

/**
 * 여행 상세 화면
 * 일차별 탭으로 구성되어 각 날짜의 콘텐츠를 관리합니다
 */
export default function TripDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { trips, loadTrips, addContentItem } = useTripStore();

    const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
    const [selectedDay, setSelectedDay] = useState(1); // 1~N: Day, -1: Checklist
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (trips.length === 0) {
            loadTrips();
        }
    }, [loadTrips, trips.length]);

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
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '사진을 올리려면 갤러리 접근 권한이 필요합니다.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && currentDay) {
                setIsUploading(true);
                const asset = result.assets[0];

                // 웹에서는 로컬 저장소 복사 생략 (fileSystem.web.ts 처리가 되어 있음)
                const fileName = generateFileName(asset.uri);
                const savedUri = await saveFileToLocal(asset.uri, fileName);

                const defaultTitle = `${selectedDay}일차 사진 ${currentDay.items.length + 1}`;

                // dayId는 store 함수 인자로 넘기므로 객체에는 포함하지 않음
                await addContentItem(currentTrip.id, currentDay.id, {
                    title: defaultTitle,
                    type: 'photo',
                    uri: savedUri,
                });
                setIsUploading(false);
            }
        } catch (error) {
            console.error('사진 추가 실패:', error);
            Alert.alert('오류', '사진을 추가하는데 실패했습니다.');
            setIsUploading(false);
        }
    };

    const handleAddFile = async () => {
        try {
            if (Platform.OS === 'web') {
                // 웹: input type="file" 사용
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = async (e: any) => {
                    const file = e.target.files[0];
                    if (file && currentDay) {
                        // File 객체를 object URL로 변환하여 임시 사용
                        const objectUrl = URL.createObjectURL(file);

                        await addContentItem(currentTrip.id, currentDay.id, {
                            title: file.name,
                            type: 'file',
                            uri: objectUrl
                        });
                    }
                };
                input.click();
                return;
            }

            // 네이티브: DocumentPicker 사용
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && currentDay) {
                setIsUploading(true);
                const asset = result.assets[0];
                const fileName = generateFileName(asset.uri);
                const savedUri = await saveFileToLocal(asset.uri, fileName);

                await addContentItem(currentTrip.id, currentDay.id, {
                    title: asset.name,
                    type: 'file',
                    uri: savedUri,
                });
                setIsUploading(false);
            }
        } catch (error) {
            console.error('파일 추가 실패:', error);
            Alert.alert('오류', '파일을 추가하는데 실패했습니다.');
            setIsUploading(false);
        }
    };

    const showAddOptions = () => {
        // 웹에서는 Alert.alert 옵션 버튼이 제대로 동작 안 할 수 있음 -> 바로 모달을 띄우거나 confirm 사용
        if (Platform.OS === 'web') {
            const choice = confirm('어떤 자료를 추가하시겠습니까?\n확인: 사진/캡처\n취소: 파일(PDF 등)');
            if (choice) {
                handleAddPhoto();
            } else {
                handleAddFile();
            }
            return;
        }

        Alert.alert(
            '자료 추가하기',
            '어떤 자료를 추가하시겠습니까?',
            [
                {
                    text: '사진/캡처',
                    onPress: handleAddPhoto,
                },
                {
                    text: '파일(PDF 등)',
                    onPress: handleAddFile,
                },
                {
                    text: '취소',
                    style: 'cancel',
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: currentTrip.title,
                }}
            />

            {/* 일차 탭 영역 - 웹 호환성을 위해 스타일 조정 */}
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
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            selectedDay === -1 && styles.tabActive,
                        ]}
                        onPress={() => setSelectedDay(-1)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedDay === -1 && styles.tabTextActive,
                            ]}
                        >
                            준비물
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* 콘텐츠 영역 */}
            <View style={styles.content}>
                {selectedDay === -1 ? (
                    <ChecklistTab trip={currentTrip} />
                ) : currentDay && currentDay.items.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📂</Text>
                        <Text style={styles.emptyTitle}>
                            {selectedDay}일차 자료가 없습니다
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            티켓, 바우처, PDF 등을 추가해보세요!
                        </Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={showAddOptions}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.addButtonText}>+ 자료 추가</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <ScrollView style={styles.itemsList}>
                            {currentDay?.items.map((item) => (
                                <TouchableOpacity key={item.id} style={styles.itemCard}>
                                    {item.type === 'photo' ? (
                                        <Image source={{ uri: item.uri }} style={styles.itemImage} />
                                    ) : (
                                        <View style={[styles.itemImage, styles.fileIcon]}>
                                            <Ionicons name="document-text" size={32} color="#666" />
                                            <Text style={styles.fileExt} numberOfLines={1}>
                                                {item.title.split('.').pop()}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.itemType}>
                                            {item.type === 'photo' ? '사진' : '파일'} • {new Date(item.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </TouchableOpacity>
                            ))}
                            <View style={{ height: 100 }} />
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.floatingButton}
                            onPress={showAddOptions}
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
    fileIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
    },
    fileExt: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666',
        marginTop: -4,
        maxWidth: 50,
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
