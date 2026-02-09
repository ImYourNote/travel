import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * 탭 네비게이션 레이아웃
 * 여행 목록과 설정 화면을 탭으로 구성
 */
export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                headerShown: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: '내 여행',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="airplane" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: '설정',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
