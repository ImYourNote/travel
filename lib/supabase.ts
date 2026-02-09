import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase 프로젝트 URL과 Anon Key
// 실제 운영 환경에서는 환경 변수(.env)로 관리해야 합니다.
// 현재는 개발 편의를 위해 여기에 직접 입력하거나 나중에 설정할 수 있도록 비워둡니다.
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

/**
 * Supabase 클라이언트 초기화
 * React Native 환경에서는 AsyncStorage를 사용하여 세션을 유지합니다.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
