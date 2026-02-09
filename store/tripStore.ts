import { create } from 'zustand';
import { Trip, Day, ContentItem } from '@/types';
import { storage } from '@/lib/storage';

interface TripState {
    trips: Trip[];
    currentTrip: Trip | null;
    isLoading: boolean;
    error: string | null;

    // 액션
    loadTrips: () => Promise<void>;
    setCurrentTrip: (id: string) => void;
    addTrip: (title: string, startDate: string, endDate: string) => Promise<void>;
    addContentItem: (tripId: string, dayId: string, item: Omit<ContentItem, 'id' | 'createdAt'>) => Promise<void>;
}

/**
 * 여행 상태 관리 스토어 (Zustand)
 * 전역 상태를 관리하고 비즈니스 로직을 처리합니다.
 */
export const useTripStore = create<TripState>((set, get) => ({
    trips: [],
    currentTrip: null,
    isLoading: false,
    error: null,

    loadTrips: async () => {
        set({ isLoading: true, error: null });
        try {
            const trips = await storage.getTrips();
            set({ trips, isLoading: false });
        } catch (error) {
            set({ error: '여행 목록을 불러오는데 실패했습니다', isLoading: false });
        }
    },

    setCurrentTrip: (id: string) => {
        const { trips } = get();
        const trip = trips.find((t) => t.id === id) || null;
        set({ currentTrip: trip });
    },

    addTrip: async (title: string, startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        try {
            // 여행 기간 계산하여 일차(Day) 자동 생성
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const newTripId = Date.now().toString(); // 임시 ID 생성

            const days: Day[] = Array.from({ length: diffDays }, (_, i) => {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                return {
                    id: `${newTripId}_day_${i + 1}`,
                    tripId: newTripId,
                    dayNumber: i + 1,
                    date: date.toISOString().split('T')[0],
                    items: [],
                };
            });

            const newTrip: Trip = {
                id: newTripId,
                title,
                startDate,
                endDate,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                days,
            };

            await storage.addTrip(newTrip);
            const trips = await storage.getTrips();
            set({ trips, isLoading: false });
        } catch (error) {
            set({ error: '여행을 생성하는데 실패했습니다', isLoading: false });
        }
    },

    addContentItem: async (tripId: string, dayId: string, itemData) => {
        set({ isLoading: true, error: null });
        try {
            const { trips } = get();
            const tripIndex = trips.findIndex((t) => t.id === tripId);

            if (tripIndex === -1) throw new Error('여행을 찾을 수 없습니다');

            const updatedTrip = { ...trips[tripIndex] };
            const dayIndex = updatedTrip.days.findIndex((d) => d.id === dayId);

            if (dayIndex === -1) throw new Error('해당 날짜를 찾을 수 없습니다');

            const newItem: ContentItem = {
                id: Date.now().toString(),
                dayId,
                ...itemData,
                createdAt: new Date().toISOString(),
            };

            updatedTrip.days[dayIndex].items.push(newItem);
            updatedTrip.updatedAt = new Date().toISOString();

            await storage.updateTrip(updatedTrip);

            // 상태 업데이트
            const newTrips = [...trips];
            newTrips[tripIndex] = updatedTrip;

            set({
                trips: newTrips,
                currentTrip: updatedTrip.id === get().currentTrip?.id ? updatedTrip : get().currentTrip,
                isLoading: false
            });
        } catch (error) {
            set({ error: '자료를 추가하는데 실패했습니다', isLoading: false });
        }
    },
}));
