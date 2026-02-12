/**
 * 웹 환경을 위한 파일 시스템 유틸리티 (Web Compatible)
 * expo-file-system은 웹을 지원하지 않으므로, 웹에서는 단순히 원본 URI를 반환하거나
 * 아무 작업도 수행하지 않도록 처리합니다.
 */

// 웹에서는 디렉토리 생성 필요 없음
export const ensureDirExists = async () => {
    console.log('Web environment: ensureDirExists skipped');
};

// 웹에서는 파일 로컬 저장 불가능 -> 원본 URI 그대로 사용
export const saveFileToLocal = async (uri: string, fileName: string): Promise<string> => {
    console.log('Web environment: saveFileToLocal skipped, returning original URI');
    return uri;
};

export const getFileExtension = (uri: string): string => {
    return uri.split('.').pop() || '';
};

export const generateFileName = (originalUri: string): string => {
    const ext = getFileExtension(originalUri);
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `asset_${timestamp}_${random}.${ext}`;
};
export const deleteFile = async (uri: string): Promise<void> => {
    console.log('Web environment: deleteFile skipped for URL', uri);
    // URL.revokeObjectURL(uri)를 호출할 수도 있지만, 여기서는 단순히 로그만 남깁니다.
};
