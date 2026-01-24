import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Bell, ChevronRight, TrendingUp } from 'lucide-react';
import { User, MatchStatus } from '../types';
import { useMatches } from '../hooks/useMatches';
import { useNotices } from '../hooks/useNotices';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { matches } = useMatches();
  const { notices } = useNotices();

  const now = new Date();

  // 최근 경기: 날짜 상관없이 최근 완료된 경기 3개
  const recentCompletedMatches = matches
    .filter((m) => m.status === MatchStatus.COMPLETED)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // 예정된 경기: 오늘부터 가까운 예정된 경기 3개
  const upcomingMatches = matches
    .filter((m) => {
      const matchDateTime = new Date(`${m.date}T${m.time || '00:00'}:00`);
      return matchDateTime > now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // 최신 공지사항 4개만 표시
  const recentNotices = notices.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 웰컴 배너 */}
      <div className="bg-[#036b3f] rounded-xl p-6 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
        <div className="z-10">
          <h1 className="text-2xl font-bold mb-2">
            반갑습니다, {user.name}님! 👋
          </h1>
          <p className="opacity-90">FC AIF와 함께 즐거운 한 주 되세요</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 그리드 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 최근 경기 섹션 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center">
                <Calendar className="mr-2 text-primary" size={20} />
                최근 경기
              </h3>
              <Link
                to="/schedule"
                className="text-sm text-gray-500 hover:text-primary flex items-center"
              >
                전체보기 <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid gap-3">
              {recentCompletedMatches.length > 0 ? (
                recentCompletedMatches.map((match) => (
                  <Link key={match.id} to={`/match/${match.id}`}>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary transition-colors flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded">
                            {match.date.split('-').slice(1).join('/')}
                          </span>
                          <span className="text-sm font-medium text-gray-600">
                            {match.time}
                          </span>
                          <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                            종료
                          </span>
                        </div>
                        <div className="text-gray-900 font-medium">
                          {match.opponent}
                        </div>
                        {match.score && (
                          <div className="text-sm font-bold text-primary mt-1">
                            {match.score.us} : {match.score.opponent}
                          </div>
                        )}
                        <div className="text-gray-500 text-sm">
                          {match.location}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400 mb-1">참여</span>
                        <span className="text-lg font-bold text-primary">
                          {match.participants.length}명
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white p-6 rounded-xl text-center text-gray-500 shadow-sm">
                  최근 경기가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 예정된 경기 섹션 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center">
                <Calendar className="mr-2 text-primary" size={20} />
                예정된 경기
              </h3>
            </div>

            <div className="grid gap-3">
              {upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
                  <Link key={match.id} to={`/match/${match.id}`}>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary transition-colors flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                            {match.date.split('-').slice(1).join('/')}
                          </span>
                          <span className="text-sm font-medium text-gray-600">
                            {match.time}
                          </span>
                          {match.status === MatchStatus.CANCELLED && (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                              취소됨
                            </span>
                          )}
                        </div>
                        <div className="text-gray-900 font-medium">
                          {match.opponent}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {match.location}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400 mb-1">참여</span>
                        <span className="text-lg font-bold text-primary">
                          {match.participants.length}명
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white p-6 rounded-xl text-center text-gray-500 shadow-sm">
                  예정된 경기가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 컬럼: 공지사항 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800 flex items-center">
                <Bell size={18} className="mr-2 text-primary" />
                공지사항
              </h2>
              <Link
                to="/notices"
                className="text-sm text-gray-500 hover:text-primary flex items-center"
              >
                전체보기 <ChevronRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {recentNotices.map((notice) => (
                <Link
                  key={notice.id}
                  to={`/notices?openId=${notice.id}`}
                  className="block"
                >
                  <div className="border-b border-gray-100 pb-3 hover:bg-gray-50 transition-colors rounded p-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">
                          {notice.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {notice.date?.split('T')[0] ||
                            notice.createdAt?.split('T')[0] ||
                            '날짜 없음'}
                        </p>
                      </div>
                      {notice.isImportant === 1 && (
                        <span className="text-red-500 ml-2">
                          <TrendingUp size={14} />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
