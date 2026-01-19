import React, { useEffect, useState } from 'react';
import { User, UserStats } from '../types';
import { api } from '../services/api';
import { getUserRoleLabel } from '../utils/formatters';
import { getCurrentYear } from '../utils/date';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
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

  // 막대 그래프용 데이터 포맷팅 (경기/골/어시)
  const chartData = stats
    ? [
        { name: '경기', value: user.matches || stats.matchesPlayed },
        { name: '골', value: stats.goals },
        { name: '어시', value: stats.assists },
      ]
    : [];

  // 도넛 차트(출석률)용 데이터 포맷팅
  const donutData = stats
    ? [
        { name: 'attended', value: stats.attendanceRate },
        { name: 'missed', value: 100 - stats.attendanceRate },
      ]
    : [];

  const COLORS = ['#036b3f', '#e5e7eb']; // 도넛 차트 색상 (메인색, 회색)

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

      {/* 경기 기록이 있을 때만 차트 표시 */}
      {stats && stats.matchesPlayed > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 개인 기록 막대 그래프 (Recharts 사용) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Activity size={20} className="mr-2 text-primary" />
              개인 기록 요약
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: '#f0fdf4' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#036b3f"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 참석률 도넛 차트 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Calendar size={20} className="mr-2 text-primary" />
              시즌 참석률
            </h3>
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* 차트 중앙 텍스트 오버레이 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-bold text-gray-800">
                    {stats?.attendanceRate}%
                  </span>
                  <span className="text-sm text-gray-400 mt-1">Excellent!</span>
                </div>
              </div>
              <p className="text-sm text-center text-gray-500 mt-4">
                최근 3개월 간의 경기 및 훈련 참석률입니다.
              </p>
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
