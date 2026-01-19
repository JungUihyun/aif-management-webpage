import { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

/**
 * 유저 목록을 관리하는 커스텀 훅
 * @returns users - 유저 목록, loading - 로딩 상태, refetch - 재조회 함수
 */
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async (): Promise<User[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUsers();
      setUsers(data);
      return data;
    } catch (err) {
      setError(err as Error);
      console.error('유저 목록 조회 오류:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
};
