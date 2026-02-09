import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Day, ContentItem } from '@/types';

const KEYS = {
    TRIPS: '@daygo_trips',
    SETTINGS: '@daygo_settings',
};

/**
 * 로컬 저장소 유틸리티
 * 오프라인 상태에서도 앱이 동작하도록 데이터를 로컬에 저장하고 불러옵니다.
 */
export const storage = {
    /**
     * 모든 여행 목록 불러오기
     */
    getTrips: async (): Promise<Trip[]> => {
        try {
            const jsonValue = await AsyncStorage.getItem(KEYS.TRIPS);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('여행 목록 불러오기 실패:', e);
            return [];
        }
    },

    /**
     * 여행 목록 저장하기
     */
    saveTrips: async (trips: Trip[]): Promise<void> => {
        try {
            const jsonValue = JSON.stringify(trips);
            await AsyncStorage.setItem(KEYS.TRIPS, jsonValue);
        } catch (e) {
            console.error('여행 목록 저장 실패:', e);
        }
    },

    /**
     * 새로운 여행 추가하기
     */
    addTrip: async (trip: Trip): Promise<void> => {
        try {
            const trips = await storage.getTrips();
            const newTrips = [trip, ...trips];
            await storage.saveTrips(newTrips);
        } catch (e) {
            console.error('여행 추가 실패:', e);
        }
    },

    /**
     * 특정 여행 불러오기
     */
    getTrip: async (id: string): Promise<Trip | undefined> => {
        try {
            const trips = await storage.getTrips();
            return trips.find((t) => t.id === id);
        } catch (e) {
            console.error('여행 상세 불러오기 실패:', e);
            return undefined;
        }
    },

    /**
     * 여행 업데이트하기 (일차, 콘텐츠 추가 등)
     */
    updateTrip: async (updatedTrip: Trip): Promise<void> => {
        try {
            const trips = await storage.getTrips();
            const newTrips = trips.map((t) =>
                t.id === updatedTrip.id ? updatedTrip : t
            );
            await storage.saveTrips(newTrips);
        } catch (e) {
            console.error('여행 업데이트 실패:', e);
        }
    },
};
