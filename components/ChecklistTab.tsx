import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip, ChecklistItem } from '@/types';
import { useTripStore } from '@/store/tripStore';

interface ChecklistTabProps {
    trip: Trip;
}

export default function ChecklistTab({ trip }: ChecklistTabProps) {
    // [코다리 부장] 준비물 추가/토글/삭제 기능을 스토어에서 쏙쏙 가져옵니다!
    const { addChecklistItem, toggleChecklistItem, removeChecklistItem } = useTripStore();
    const [newItemText, setNewItemText] = useState('');

    // [코다리 부장] 준비물 추가 함수입니다. 빈 칸은 안 돼요! 🙅‍♂️
    const handleAddItem = async () => {
        if (!newItemText.trim()) return;

        await addChecklistItem(trip.id, newItemText.trim());
        setNewItemText(''); // 입력창 비워주는 센스! ✨
    };

    const renderItem = ({ item }: { item: ChecklistItem }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => toggleChecklistItem(trip.id, item.id)}
            >
                <Ionicons
                    name={item.isChecked ? "checkbox" : "square-outline"}
                    size={24}
                    color={item.isChecked ? "#007AFF" : "#666"}
                />
                <Text style={[styles.itemText, item.isChecked && styles.itemTextChecked]}>
                    {item.text}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => removeChecklistItem(trip.id, item.id)}
                style={styles.deleteButton}
            >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
        </View>
    );

    const checklist = trip.checklist || [];
    // [코다리 부장] 완료 여부와 상관없이 추가한 순서대로 유지하도록 정렬을 제거합니다! ✨
    const sortedChecklist = [...checklist];

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="준비물을 입력하세요 (예: 여권, 충전기)"
                    value={newItemText}
                    onChangeText={setNewItemText}
                    onSubmitEditing={handleAddItem}
                    returnKeyType="done"
                />
                <TouchableOpacity
                    style={[styles.addButton, !newItemText.trim() && styles.addButtonDisabled]}
                    onPress={handleAddItem}
                    disabled={!newItemText.trim()}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={sortedChecklist}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>아직 등록된 준비물이 없습니다.</Text>
                        <Text style={styles.emptySubText}>여행에 필요한 물건들을 적어보세요!</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginRight: 10,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: '#A0A0A0',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    checkboxContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    itemTextChecked: {
        color: '#999',
        textDecorationLine: 'line-through',
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
    },
});
