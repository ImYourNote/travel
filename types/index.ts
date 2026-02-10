// 여행 관련 타입 정의

export type Trip = {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    days: Day[];
    checklist: ChecklistItem[];
};

export type ChecklistItem = {
    id: string;
    tripId: string;
    text: string;
    isChecked: boolean;
    createdAt: string;
};

export type Day = {
    id: string;
    tripId: string;
    dayNumber: number;
    date: string;
    items: ContentItem[];
};

export type ContentItem = {
    id: string;
    dayId: string;
    title: string;
    type: 'photo' | 'file';
    uri: string; // 로컬 URI
    cloudUrl?: string; // Supabase 클라우드 URL
    createdAt: string;
};

export type CreateTripInput = {
    title: string;
    startDate: string;
    endDate: string;
};

export type CreateContentItemInput = {
    dayId: string;
    title: string;
    type: 'photo' | 'file';
    uri: string;
};
