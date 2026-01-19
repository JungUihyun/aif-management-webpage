import { useState, useEffect } from 'react';
import { Match } from '../types';
import { api } from '../services/api';

/**
 * 경기 목록을 관리하는 커스텀 훅
 * @returns matches - 경기 목록, loading - 로딩 상태, refetch - 재조회 함수
 */
export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = async (): Promise<Match[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMatches();
      setMatches(data);
      return data;
    } catch (err) {
      setError(err as Error);
      console.error('경기 목록 조회 오류:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
  };
};
