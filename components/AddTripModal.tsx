import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    Pressable,
    Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddTripModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (title: string, startDate: string, endDate: string) => Promise<void>;
}

export function AddTripModal({ visible, onClose, onAdd }: AddTripModalProps) {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert('여행 제목을 입력해주세요!');
            return;
        }

        // YYYY-MM-DD 형식으로 변환
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        await onAdd(title, startStr, endStr);
        setTitle('');
        setStartDate(new Date());
        setEndDate(new Date());
        onClose();
    };

    const onDateChange = (event: any, selectedDate?: Date, isStart = true) => {
        const currentDate = selectedDate || (isStart ? startDate : endDate);
        if (Platform.OS === 'android') {
            isStart ? setShowStartPicker(false) : setShowEndPicker(false);
        }

        if (isStart) {
            setStartDate(currentDate);
            // 종료일이 시작일보다 빠르면 종료일을 시작일로 맞춤
            if (endDate < currentDate) {
                setEndDate(currentDate);
            }
        } else {
            setEndDate(currentDate);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>새 여행 만들기</Text>

                    <Text style={styles.label}>여행 이름</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="예: 파리 여행"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={styles.label}>기간 설정</Text>
                    <View style={styles.dateContainer}>
                        <View style={styles.dateField}>
                            <Text style={styles.dateLabel}>가는 날</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowStartPicker(true)}
                            >
                                <Text>{startDate.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateArrow}>
                            <Text>→</Text>
                        </View>

                        <View style={styles.dateField}>
                            <Text style={styles.dateLabel}>오는 날</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowEndPicker(true)}
                            >
                                <Text>{endDate.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={(e, date) => onDateChange(e, date, true)}
                            minimumDate={new Date()}
                        />
                    )}

                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display="default"
                            onChange={(e, date) => onDateChange(e, date, false)}
                            minimumDate={startDate}
                        />
                    )}

                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={[styles.button, styles.buttonCancel]}
                            onPress={onClose}
                        >
                            <Text style={styles.textStyle}>취소</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonSave]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.textStyle}>만들기</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'stretch',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
    },
    modalTitle: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    dateField: {
        flex: 1,
    },
    dateArrow: {
        paddingHorizontal: 10,
    },
    dateLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    dateButton: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        borderRadius: 10,
        padding: 15,
        elevation: 2,
        flex: 0.48,
    },
    buttonCancel: {
        backgroundColor: '#9E9E9E',
    },
    buttonSave: {
        backgroundColor: '#007AFF',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});
