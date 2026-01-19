import { useState, useEffect } from 'react';
import { Notice } from '../types';
import { api } from '../services/api';

/**
 * 공지사항 목록을 관리하는 커스텀 훅
 * @returns notices - 공지사항 목록, loading - 로딩 상태, refetch - 재조회 함수
 */
export const useNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotices = async (): Promise<Notice[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getNotices();
      setNotices(data);
      return data;
    } catch (err) {
      setError(err as Error);
      console.error('공지사항 조회 오류:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  return {
    notices,
    loading,
    error,
    refetch: fetchNotices,
  };
};
