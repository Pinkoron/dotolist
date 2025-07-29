'use client';
import { checkSession } from '@/lib/apiClient';
import { useEffect } from 'react';

function useSessionCheck(intervalMinutes = 10) {
    useEffect(() => {
        const intervalId = setInterval(() => {
            // ここにcheckSession関数を呼ぶ処理
            checkSession();
        }, intervalMinutes * 60 * 1000);

        return () => clearInterval(intervalId); // クリーンアップ
    }, [intervalMinutes]);
}

export default function RefreshTokenHandler() {
    useSessionCheck(50); // 5分毎にチェック
    return null;
}
