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

  // 최근 경기: 지난 1주일 종료 경기 + 앞으로의 경기
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const recentMatches = matches
    .filter((m) => {
      const matchDateTime = new Date(`${m.date}T${m.time || '00:00'}:00`);
      // 지난 1주일 이내의 종료된 경기 또는 미래 경기
      return (
        (m.status === MatchStatus.COMPLETED && matchDateTime >= oneWeekAgo) ||
        matchDateTime > now
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // 최신순
    .slice(0, 3);

  // 최신 공지사항 4개만 표시
  const recentNotices = notices.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 웰컴 배너 */}
      <div className="bg-[#036b3f] rounded-xl p-6 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
        <div className="z-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            반갑습니다, {user.name}님!
          </h2>
          <p className="opacity-90 text-sm">
            오늘도 부상 없이 즐거운 축구 하세요 ⚽️
          </p>
        </div>
        <div className="hidden sm:block opacity-20 transform translate-x-4">
          <TrendingUp size={64} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 다가오는 경기 리스트 섹션 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
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
            {recentMatches.length > 0 ? (
              recentMatches.map((match) => (
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
                        {/* 경기 상태 표시 */}
                        {match.status === MatchStatus.COMPLETED && (
                          <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                            종료
                          </span>
                        )}
                        {match.status === MatchStatus.CANCELLED && (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                            취소됨
                          </span>
                        )}
                      </div>
                      <div className="text-gray-900 font-medium">
                        FC AIF vs {match.opponent}
                      </div>
                      {/* 종료된 경기는 스코어 표시 */}
                      {match.status === MatchStatus.COMPLETED &&
                        match.score && (
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

        {/* 오른쪽 컬럼: 공지사항 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800 flex items-center">
              <Bell className="mr-2 text-primary" size={20} />
              공지사항
            </h3>
            <Link
              to="/notices"
              className="text-sm text-gray-500 hover:text-primary flex items-center"
            >
              전체보기 <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid gap-3">
            {recentNotices.length > 0 ? (
              recentNotices.map((notice) => (
                <Link key={notice.id} to={`/notices?openId=${notice.id}`}>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {notice.isImportant === 1 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded mr-2">
                              중요
                            </span>
                          )}
                          <h4 className="text-sm font-bold text-gray-800 line-clamp-1">
                            {notice.title}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-400">
                          {notice.createdAt}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-white p-6 rounded-xl text-center text-gray-500 shadow-sm">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
