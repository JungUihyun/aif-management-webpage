import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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
      <div className="pt-2 pb-2 px-2">
        <h1 className="text-[26px] leading-[1.35] font-bold text-gray-900 tracking-tight mb-1">
          {user.name}님,
          <br />
          AIF에 오신 것을 환영합니다.
        </h1>
        <p className="text-gray-500 text-[15px] font-medium mt-2">
          FC AIF 팀 현황 및 일정
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 그리드 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 최근 경기 섹션 */}
          <div>
            <div className="flex justify-between items-end mb-4 px-2 mt-4">
              <h3 className="font-bold text-[19px] text-gray-900 tracking-tight">
                최근 경기 결과
              </h3>
              <Link
                to="/schedule"
                className="text-[14px] font-semibold text-gray-400 hover:text-gray-600 flex items-center"
              >
                더보기 <ChevronRight size={16} className="ml-0.5" />
              </Link>
            </div>

            <div className="grid gap-4">
              {recentCompletedMatches.length > 0 ? (
                recentCompletedMatches.map((match) => (
                  <Link
                    key={match.id}
                    to={`/match/${match.id}`}
                    className="block"
                  >
                    <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow flex justify-between items-center active:scale-[0.98] transform duration-200">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md">
                            {match.date.split('-').slice(1).join('/')}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md">
                            종료
                          </span>
                          {match.score && (
                            <span
                              className={`${match.score.us > match.score.opponent ? 'bg-blue-50 text-blue-600' : match.score.us < match.score.opponent ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'} text-xs font-bold px-2.5 py-1 rounded-md`}
                            >
                              {match.score.us > match.score.opponent
                                ? '승리'
                                : match.score.us < match.score.opponent
                                  ? '패배'
                                  : '무승부'}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-900 font-bold text-lg mb-1 leading-tight">
                          {match.opponent}
                        </div>
                        {match.score && (
                          <div className="text-[15px] font-bold text-primary mt-1">
                            {match.score.us} : {match.score.opponent}
                          </div>
                        )}
                        <div className="text-gray-500 text-[13px] font-medium mt-1">
                          {match.location}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center">
                        <span className="text-[11px] text-gray-400 font-medium mb-1 relative right-1">
                          참석 인원
                        </span>
                        <div className="bg-gray-50 text-gray-700 font-bold text-[14px] px-3.5 py-1.5 rounded-xl">
                          {match.participants.length}명
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white p-6 rounded-3xl text-center font-medium text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  최근 경기가 존재하지 않아요.
                </div>
              )}
            </div>
          </div>

          {/* 예정된 경기 섹션 */}
          <div>
            <div className="flex justify-between items-end mb-4 px-2 mt-8">
              <h3 className="font-bold text-[19px] text-gray-900 tracking-tight">
                다가오는 일정
              </h3>
            </div>

            <div className="grid gap-4">
              {upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
                  <Link
                    key={match.id}
                    to={`/match/${match.id}`}
                    className="block"
                  >
                    <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow flex justify-between items-center active:scale-[0.98] transform duration-200">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-[#e8f3ee] text-[#00a550] text-xs font-bold px-2.5 py-1 rounded-md">
                            {match.date.split('-').slice(1).join('/')}
                          </span>
                          <span className="text-[13px] font-bold text-gray-700">
                            {match.time}
                          </span>
                          {match.status === MatchStatus.CANCELLED && (
                            <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                              취소
                            </span>
                          )}
                        </div>
                        <div className="text-gray-900 font-bold text-lg mb-1 leading-tight">
                          {match.opponent}
                        </div>
                        <div className="text-gray-500 text-[13px] font-medium mt-1">
                          {match.location}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center">
                        <span className="text-[11px] text-gray-400 font-medium mb-1 relative right-1">
                          참석 예정
                        </span>
                        <div className="bg-[#e8f3ee] text-[#00a550] font-bold text-[14px] px-3.5 py-1.5 rounded-xl">
                          {match.participants.length}명
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white p-6 rounded-3xl text-center font-medium text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  예정된 일정이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 컬럼: 공지사항 */}
        <div className="lg:col-span-1 border-t md:border-t-0 border-gray-100 pt-6 md:pt-0 mt-6 md:mt-0">
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="font-bold text-[19px] text-gray-900 tracking-tight">
              공지사항
            </h2>
            <Link
              to="/notices"
              className="text-[14px] font-semibold text-gray-400 hover:text-gray-600 flex items-center"
            >
              더보기 <ChevronRight size={16} className="ml-0.5" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col">
              {recentNotices.map((notice, idx) => (
                <Link
                  key={notice.id}
                  to={`/notices?openId=${notice.id}`}
                  className={`block p-4 mx-1 transition-colors active:bg-gray-50 ${idx !== recentNotices.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 overflow-hidden pr-4">
                      <div className="flex items-center space-x-2 mb-1">
                        {notice.isImportant === 1 && (
                          <span className="text-white bg-[#00a550] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            필독
                          </span>
                        )}
                        <h4 className="text-[15px] font-semibold text-gray-900 line-clamp-1">
                          {notice.title}
                        </h4>
                      </div>
                      <p className="text-[13px] text-gray-400 font-medium ml-1">
                        {notice.date?.split('T')[0] ||
                          notice.createdAt?.split('T')[0] ||
                          '날짜 없음'}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-300 flex-shrink-0"
                    />
                  </div>
                </Link>
              ))}
              {recentNotices.length === 0 && (
                <div className="p-6 text-center text-sm font-medium text-gray-400">
                  새로운 공지가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
