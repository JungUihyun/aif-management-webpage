import React, { useEffect, useState } from 'react';
import { User, UserStats } from '../types';
import { api } from '../services/api';
import { getUserRoleLabel } from '../utils/formatters';
import { getCurrentYear } from '../utils/date';
import { Trophy, Activity } from 'lucide-react';

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
      <div className="bg-white p-7 md:p-8 rounded-[28px] shadow-[0_2px_14px_rgba(0,0,0,0.02)] flex flex-col items-center sm:flex-row sm:items-start text-center sm:text-left relative overflow-hidden">
        <div className="relative z-10 mb-5 sm:mb-0 sm:mr-6">
          <img
            src={user.avatarUrl}
            alt="Profile"
            className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full bg-gray-100 object-cover shadow-sm"
          />
        </div>

        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-2">
            <div>
              <div className="flex items-center justify-center sm:justify-start mb-1">
                <h1 className="text-[22px] md:text-[26px] font-bold text-gray-900 mr-2 tracking-tight">
                  {user.name}
                  {user.backNumber && (
                    <span className="ml-1.5 bg-[#00a550] text-white px-2 py-0.5 rounded-md text-[13px] font-bold align-middle">
                      {user.backNumber}
                    </span>
                  )}
                </h1>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    user.role === 'EXECUTIVE'
                      ? 'bg-purple-50 text-purple-600'
                      : user.role === 'MANAGER'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-[#e8f3ee] text-[#00a550]'
                  }`}
                >
                  {getUserRoleLabel(user.role)}
                </span>
              </div>
              <p className="text-gray-500 font-medium text-[15px]">
                "{user.shortName}"
              </p>
            </div>
            <button className="mt-5 sm:mt-0 text-[14px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl transition-colors">
              내 정보 수정
            </button>
          </div>

          {/* 유저 기본 정보 리스트 */}
          <div className="mt-6 pt-2 self-stretch w-full">
            <div className="flex flex-col text-left w-full space-y-1">
              <div className="flex justify-between items-center py-3 px-2">
                <span className="text-[15px] text-gray-500 font-medium">
                  학번
                </span>
                <span className="text-[15px] font-semibold text-gray-900">
                  {user.id}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-2">
                <span className="text-[15px] text-gray-500 font-medium">
                  선호 포지션
                </span>
                <span className="text-[15px] font-semibold text-gray-900">
                  {user.position}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-2">
                <span className="text-[15px] text-gray-500 font-medium">
                  생년월일
                </span>
                <span className="text-[15px] font-semibold text-gray-900">
                  {user.birth}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-2">
                <span className="text-[15px] text-gray-500 font-medium">
                  {currentYear} 시즌 등록
                </span>
                <span className="text-[15px] font-bold text-[#00a550]">
                  완료
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 경기 기록이 있을 때만 스탯 표시 */}
      {stats && stats.matchesPlayed > 0 ? (
        <div className="space-y-6">
          {/* 개인 기록 요약 - 카드 그리드 */}
          <div className="bg-white p-7 rounded-[28px] shadow-[0_2px_14px_rgba(0,0,0,0.02)]">
            <h3 className="font-bold text-[19px] text-gray-900 tracking-tight mb-5 px-1">
              내 기록
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 경기 수 */}
              <div className="bg-[#f2f4f6] p-5 rounded-2xl flex flex-col justify-between h-[120px]">
                <p className="text-[14px] font-semibold text-gray-500">
                  출전 경기
                </p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.matchesPlayed}
                    <span className="text-[20px] font-semibold text-gray-500 ml-1">
                      회
                    </span>
                  </p>
                  <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center">
                    <Activity size={20} className="text-gray-700" />
                  </div>
                </div>
              </div>

              {/* 득점 */}
              <div className="bg-[#f2f4f6] p-5 rounded-2xl flex flex-col justify-between h-[120px]">
                <p className="text-[14px] font-semibold text-[#00a550]">득점</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.goals}
                    <span className="text-[20px] font-semibold text-gray-500 ml-1">
                      골
                    </span>
                  </p>
                  <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center">
                    <Trophy size={20} className="text-[#00a550]" />
                  </div>
                </div>
              </div>

              {/* 어시스트 */}
              <div className="bg-[#f2f4f6] p-5 rounded-2xl flex flex-col justify-between h-[120px]">
                <p className="text-[14px] font-semibold text-blue-500">
                  어시스트
                </p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.assists}
                    <span className="text-[20px] font-semibold text-gray-500 ml-1">
                      도움
                    </span>
                  </p>
                  <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center">
                    <Activity size={20} className="text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 시즌 참석률 - 카드 */}
          <div className="bg-white p-7 rounded-[28px] shadow-[0_2px_14px_rgba(0,0,0,0.02)]">
            <h3 className="font-bold text-[19px] text-gray-900 tracking-tight mb-5 px-1">
              시즌 참석률
            </h3>
            <div className="bg-[#f8fafb] p-8 rounded-2xl flex flex-col items-center">
              <div className="relative mb-6">
                <svg className="w-[140px] h-[140px] transform -rotate-90">
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    stroke="#eaecee"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    stroke="#00a550"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - stats.attendanceRate / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[32px] font-bold text-gray-900 mt-2">
                    {stats.attendanceRate}
                    <span className="text-[20px] font-bold text-gray-400 ml-0.5">
                      %
                    </span>
                  </span>
                </div>
              </div>
              <p className="text-[14px] font-medium text-gray-500">
                이번 시즌 최고의 기록을 만들어봐요!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[28px] shadow-[0_2px_14px_rgba(0,0,0,0.02)] text-center">
          <div className="flex flex-col items-center">
            <div className="w-[80px] h-[80px] bg-gray-50 rounded-full flex items-center justify-center mb-5">
              <Trophy size={36} className="text-gray-300" />
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-2">
              아직 경기 기록이 없어요
            </h3>
            <p className="text-[15px] text-gray-500 font-medium">
              첫 경기에 참가하면 여러 통계를 볼 수 있어요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
