import { View, Text, StyleSheet, ScrollView } from 'react-native';

/**
 * 설정 화면
 * 앱 환경설정 및 계정 관리
 */
export default function SettingsScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>앱 정보</Text>
                <View style={styles.item}>
                    <Text style={styles.itemLabel}>버전</Text>
                    <Text style={styles.itemValue}>1.0.0</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>계정</Text>
                <View style={styles.item}>
                    <Text style={styles.itemLabel}>로그인</Text>
                    <Text style={styles.itemValue}>준비 중</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>데이터</Text>
                <View style={styles.item}>
                    <Text style={styles.itemLabel}>클라우드 동기화</Text>
                    <Text style={styles.itemValue}>준비 중</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    section: {
        backgroundColor: '#FFFFFF',
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemLabel: {
        fontSize: 16,
        color: '#333',
    },
    itemValue: {
        fontSize: 16,
        color: '#666',
    },
});
