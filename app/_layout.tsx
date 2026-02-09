import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * 루트 레이아웃
 * 전체 앱의 최상위 레이아웃 컴포넌트
 */
export default function RootLayout() {
    return (
        <>
            <StatusBar style="auto" />
            <Slot />
        </>
    );
}
