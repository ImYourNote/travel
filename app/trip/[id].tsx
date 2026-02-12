import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Platform, TextInput } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTripStore } from '@/store/tripStore';
import { Trip, Day } from '@/types';
import { saveFileToLocal, generateFileName } from '@/lib/fileSystem';
import ChecklistTab from '@/components/ChecklistTab';

/**
 * 여행 상세 화면
 * [코다리 부장] 준비물 탭을 맨 앞으로! 날짜 제목도 내 맘대로! 아주 끝내주게 업그레이드했습니다! 😎🫡
 */
export default function TripDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { trips, loadTrips, addContentItem, updateDayTitle, addDay, deleteDay } = useTripStore();

    const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
    const [selectedDay, setSelectedDay] = useState(-1); // 기본값: 준비물 탭 🎒
    const [isUploading, setIsUploading] = useState(false);
    const [editingDayId, setEditingDayId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [itemMemo, setItemMemo] = useState(''); // [코다리 부장] 새로운 자료에 붙일 꼬리표! 🏷️
    const [isMemoInputVisible, setIsMemoInputVisible] = useState(false);
    const [pendingAsset, setPendingAsset] = useState<{ uri: string; name: string; type: 'photo' | 'file' } | null>(null);

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

    const handleUpdateDayTitle = async (dayId: string) => {
        if (!editingTitle.trim()) {
            setEditingDayId(null);
            return;
        }
        await updateDayTitle(currentTrip.id, dayId, editingTitle.trim());
        setEditingDayId(null);
        setEditingTitle('');
    };

    const handleAddDay = async () => {
        await addDay(currentTrip.id);
    };

    const handleConfirmAddItem = async () => {
        if (!pendingAsset || !currentDay) return;

        setIsUploading(true);
        try {
            const asset = pendingAsset;
            let savedUri = asset.uri;

            if (Platform.OS !== 'web' || asset.type === 'photo') {
                const fileName = generateFileName(asset.uri);
                savedUri = await saveFileToLocal(asset.uri, fileName);
            }

            await addContentItem(currentTrip.id, currentDay.id, {
                title: asset.name,
                type: asset.type,
                uri: savedUri,
                memo: itemMemo.trim() || undefined, // 대표님의 메모를 함께 저장! 📝
            });

            setPendingAsset(null);
            setItemMemo('');
            setIsMemoInputVisible(false);
        } catch (error) {
            console.error('자료 추가 실패:', error);
            Alert.alert('오류', '자료를 추가하는데 실패했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteDay = (dayId: string, dayNumber: number) => {
        Alert.alert(
            '일차 삭제',
            `${dayNumber}일차를 삭제하시겠습니까? 해당 일차의 모든 자료가 삭제됩니다.`,
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteDay(currentTrip.id, dayId);
                        if (selectedDay === dayNumber) {
                            setSelectedDay(-1);
                        }
                    }
                }
            ]
        );
    };

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
                const asset = result.assets[0];
                const defaultTitle = `${currentDay.title || currentDay.dayNumber + '일차'} 사진 ${currentDay.items.length + 1}`;

                setPendingAsset({
                    uri: asset.uri,
                    name: defaultTitle,
                    type: 'photo'
                });
                setIsMemoInputVisible(true); // 메모 입력창 띄우기! ✨
            }
        } catch (error) {
            console.error('사진 추가 실패:', error);
            Alert.alert('오류', '사진을 추가하는데 실패했습니다.');
        }
    };

    const handleAddFile = async () => {
        try {
            if (Platform.OS === 'web') {
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = async (e: any) => {
                    const file = e.target.files[0];
                    if (file && currentDay) {
                        const objectUrl = URL.createObjectURL(file);
                        setPendingAsset({
                            uri: objectUrl,
                            name: file.name,
                            type: 'file'
                        });
                        setIsMemoInputVisible(true);
                    }
                };
                input.click();
                return;
            }

            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && currentDay) {
                const asset = result.assets[0];
                setPendingAsset({
                    uri: asset.uri,
                    name: asset.name,
                    type: 'file'
                });
                setIsMemoInputVisible(true);
            }
        } catch (error) {
            console.error('파일 추가 실패:', error);
            Alert.alert('오류', '파일을 추가하는데 실패했습니다.');
        }
    };

    const showAddOptions = () => {
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
                { text: '사진/캡처', onPress: handleAddPhoto },
                { text: '파일(PDF 등)', onPress: handleAddFile },
                { text: '취소', style: 'cancel' },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: currentTrip.title }} />

            <View style={styles.tabWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabContainer}
                    contentContainerStyle={styles.tabContentContainer}
                >
                    <TouchableOpacity
                        style={[styles.tab, selectedDay === -1 && styles.tabActive]}
                        onPress={() => setSelectedDay(-1)}
                    >
                        <Text style={[styles.tabText, selectedDay === -1 && styles.tabTextActive]}>준비물</Text>
                    </TouchableOpacity>

                    {currentTrip.days.map((day) => (
                        <View key={day.id} style={styles.tabItemWrapper}>
                            <TouchableOpacity
                                style={[styles.tab, selectedDay === day.dayNumber && styles.tabActive, { flexDirection: 'row', alignItems: 'center' }]}
                                onPress={() => setSelectedDay(day.dayNumber)}
                            >
                                <Text style={[styles.tabText, selectedDay === day.dayNumber && styles.tabTextActive]}>
                                    {day.title || `${day.dayNumber}일차`}
                                </Text>
                                {/* [코다리 부장] 이름 수정 버튼을 더 잘 보이게! 🖊️ */}
                                <TouchableOpacity
                                    onPress={() => {
                                        setEditingDayId(day.id);
                                        setEditingTitle(day.title || `${day.dayNumber}일차`);
                                    }}
                                    style={{ marginLeft: 4 }}
                                >
                                    <Ionicons name="pencil" size={14} color={selectedDay === day.dayNumber ? "#007AFF" : "#999"} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                            {selectedDay === day.dayNumber && (
                                <TouchableOpacity
                                    style={styles.dayDeleteIcon}
                                    onPress={() => handleDeleteDay(day.id, day.dayNumber)}
                                >
                                    <Ionicons name="close-circle" size={16} color="#FF3B30" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addDayTab} onPress={handleAddDay}>
                        <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <View style={styles.content}>
                {editingDayId && (
                    <View style={styles.editTitleBanner}>
                        <TextInput
                            style={styles.editTitleInput}
                            value={editingTitle}
                            onChangeText={setEditingTitle}
                            autoFocus
                            placeholder="날짜 이름 입력 (예: 도쿄 도착!)"
                            onSubmitEditing={() => handleUpdateDayTitle(editingDayId)}
                        />
                        <TouchableOpacity
                            onPress={() => handleUpdateDayTitle(editingDayId)}
                            style={styles.editTitleButton}
                        >
                            <Text style={styles.editTitleButtonText}>저장</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setEditingDayId(null)}
                            style={{ marginLeft: 8 }}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                )}

                {isMemoInputVisible && (
                    <View style={[styles.editTitleBanner, { backgroundColor: '#E8F5E9' }]}>
                        <TextInput
                            style={styles.editTitleInput}
                            value={itemMemo}
                            onChangeText={setItemMemo}
                            autoFocus
                            placeholder="메모를 남겨주세요 (예: 루브르 바우처)"
                            onSubmitEditing={handleConfirmAddItem}
                        />
                        <TouchableOpacity
                            onPress={handleConfirmAddItem}
                            style={[styles.editTitleButton, { backgroundColor: '#4CAF50' }]}
                            disabled={isUploading}
                        >
                            {isUploading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.editTitleButtonText}>확인</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setIsMemoInputVisible(false);
                                setPendingAsset(null);
                                setItemMemo('');
                            }}
                            style={{ marginLeft: 8 }}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                )}

                {selectedDay === -1 ? (
                    <ChecklistTab trip={currentTrip} />
                ) : (
                    <View style={{ flex: 1 }}>
                        {currentDay && currentDay.items.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>📂</Text>
                                <Text style={styles.emptyTitle}>{currentDay.title || `${selectedDay}일차`} 자료가 없습니다</Text>
                                <Text style={styles.emptySubtitle}>티켓, 바우처, PDF 등을 추가해보세요!</Text>
                                <TouchableOpacity style={styles.addButton} onPress={showAddOptions} disabled={isUploading}>
                                    {isUploading ? <ActivityIndicator color="white" /> : <Text style={styles.addButtonText}>+ 자료 추가</Text>}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView style={styles.itemsList}>
                                {currentDay?.items.map((item) => (
                                    <TouchableOpacity key={item.id} style={styles.itemCard}>
                                        {item.type === 'photo' ? (
                                            <Image source={{ uri: item.uri }} style={styles.itemImage} />
                                        ) : (
                                            <View style={[styles.itemImage, styles.fileIcon]}>
                                                <Ionicons name="document-text" size={32} color="#666" />
                                                <Text style={styles.fileExt} numberOfLines={1}>{item.title.split('.').pop()}</Text>
                                            </View>
                                        )}
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                                            {item.memo && (
                                                <Text style={styles.itemMemo} numberOfLines={2}>📝 {item.memo}</Text>
                                            )}
                                            <Text style={styles.itemType}>
                                                {item.type === 'photo' ? '사진' : '파일'} • {new Date(item.createdAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#999" />
                                    </TouchableOpacity>
                                ))}
                                {/* [코다리 부장] 리스트가 비어있지 않을 때도 자료 추가 버튼을 아래에! ➕ */}
                                <TouchableOpacity
                                    style={[styles.addButton, { marginTop: 10, alignSelf: 'center', marginBottom: 40 }]}
                                    onPress={showAddOptions}
                                >
                                    <Text style={styles.addButtonText}>+ 자료 추가</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabWrapper: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    tabContainer: { flexGrow: 0 },
    tabContentContainer: { paddingHorizontal: 10, alignItems: 'center' },
    tabItemWrapper: { flexDirection: 'row', alignItems: 'center' },
    tab: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: '#007AFF' },
    tabText: { fontSize: 16, color: '#666', fontWeight: '500' },
    tabTextActive: { color: '#007AFF', fontWeight: '700' },
    dayDeleteIcon: { marginLeft: -8, marginRight: 8 },
    addDayTab: { padding: 10, marginLeft: 5 },
    content: { flex: 1 },
    editTitleBanner: { flexDirection: 'row', padding: 12, backgroundColor: '#E3F2FD', alignItems: 'center' },
    editTitleInput: { flex: 1, height: 40, backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 12, marginRight: 10 },
    editTitleButton: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    editTitleButtonText: { color: 'white', fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    emptySubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
    addButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, minWidth: 120, alignItems: 'center' },
    addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    itemsList: { flex: 1, padding: 16 },
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F0F0F0' },
    fileIcon: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' },
    fileExt: { fontSize: 10, fontWeight: 'bold', color: '#666', marginTop: -4, maxWidth: 50 },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 },
    itemMemo: { fontSize: 13, color: '#4CAF50', marginBottom: 4, fontWeight: '500' },
    itemType: { fontSize: 12, color: '#999' },
});
