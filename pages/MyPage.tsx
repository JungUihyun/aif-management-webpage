import React, { useEffect, useState } from 'react';
import { User, UserStats } from '../types';
import { api } from '../services/api';
import { getUserRoleLabel } from '../utils/formatters';
import { getCurrentYear } from '../utils/date';
import { Trophy, Activity, Calendar } from 'lucide-react';

interface MyPageProps {
  user: User;
}

const MyPage: React.FC<MyPageProps> = ({ user }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const currentYear = getCurrentYear();

  useEffect(() => {
    // 유저 ID를 기반으로 통계 데이터 호출
    api.getUserStats(user.id).then(setStats);
  }, [user.id]);

  return (
    <div className="space-y-6">
      {/* 프로필 헤더 카드 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center sm:flex-row sm:items-start text-center sm:text-left relative overflow-hidden">
        {/* 배경 데코레이션 아이콘 */}
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Trophy size={120} />
        </div>

        <div className="relative z-10 mb-4 sm:mb-0 sm:mr-6">
          <img
            src={user.avatarUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-gray-50 bg-gray-200 object-cover"
          />
        </div>

        <div className="flex-1 z-10 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-4">
            <div>
              <div className="flex items-center justify-center sm:justify-start">
                <h1 className="flex items-center text-2xl font-bold text-gray-800 mr-2">
                  {user.name}
                  {user.backNumber && (
                    <span className="ml-1 bg-primary text-white px-2 py-1 rounded-md text-xs font-semibold">
                      {user.backNumber}
                    </span>
                  )}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    user.role === 'EXECUTIVE'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'MANAGER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {getUserRoleLabel(user.role)}
                </span>
              </div>
              <p className="text-gray-500 font-medium">"{user.shortName}"</p>
            </div>
            <button className="mt-4 sm:mt-0 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
              정보 수정
            </button>
          </div>

          {/* 유저 기본 정보 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left w-full">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                학번
              </p>
              <p className="font-bold text-gray-800 text-sm">{user.id}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                선호 포지션
              </p>
              <p className="font-bold text-gray-800 text-sm">{user.position}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                생년월일
              </p>
              <p className="font-bold text-gray-800 text-sm">{user.birth}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                {currentYear} 시즌 총 경기수
              </p>
              <p className="font-bold text-primary text-sm">
                {stats?.matchesPlayed ?? 0}회
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 경기 기록이 있을 때만 스탯 표시 */}
      {stats && stats.matchesPlayed > 0 ? (
        <div className="space-y-6">
          {/* 개인 기록 요약 - 카드 그리드 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Activity size={20} className="mr-2 text-primary" />
              개인 기록 요약
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 경기 수 */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-600">경기</p>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity size={20} className="text-blue-600" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-blue-700">
                  {stats.matchesPlayed}
                </p>
                <p className="text-xs text-gray-500 mt-1">출전 경기 수</p>
              </div>

              {/* 득점 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-600">득점</p>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Trophy size={20} className="text-green-600" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-green-700">
                  {stats.goals}
                </p>
                <p className="text-xs text-gray-500 mt-1">총 골</p>
              </div>

              {/* 어시스트 */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-purple-600">
                    어시스트
                  </p>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-purple-600" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-purple-700">
                  {stats.assists}
                </p>
                <p className="text-xs text-gray-500 mt-1">총 도움</p>
              </div>
            </div>
          </div>

          {/* 시즌 참석률 - 카드 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Calendar size={20} className="mr-2 text-primary" />
              시즌 참석률
            </h3>
            <div className="bg-gradient-to-br from-primary/10 to-white p-8 rounded-xl border border-primary/20">
              <div className="text-center">
                <div className="inline-block">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#036b3f"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.attendanceRate / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-800">
                        {stats.attendanceRate}%
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  이번 시즌의 경기 및 훈련 참석률입니다.
                </p>
                <div className="mt-4 inline-block px-4 py-2 bg-primary/10 rounded-full">
                  <span className="text-sm font-bold text-primary">
                    {stats.attendanceRate >= 80
                      ? '🎉 Excellent!'
                      : stats.attendanceRate >= 60
                        ? '👍 Good!'
                        : '💪 Keep Going!'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Trophy size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              아직 경기 기록이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              첫 경기에 참가하면 개인 기록과 통계를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
