import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Bell,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { Match, Notice, DuesRecord, User } from "../types";
import { api } from "../services/mockData";

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [myDuesStatus, setMyDuesStatus] = useState<DuesRecord | null>(null);

  useEffect(() => {
    // 모든 필요 데이터를 병렬로 호출하여 로딩 시간 단축
    const loadData = async () => {
      const matches = await api.getMatches();
      const allNotices = await api.getNotices();
      const dues = await api.getDues();

      // [로직] 예정된 경기만 필터링하고 날짜순으로 정렬 후 상위 3개만 추출
      const upcoming = matches
        .filter((m) => m.status === "UPCOMING")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

      // [로직] 현재 로그인한 유저의 이번 달(데모용 하드코딩 2023-11) 회비 내역 찾기
      const myDue = dues.find(
        (d) => d.userId === user.id && d.month === "2023-11"
      );

      setUpcomingMatches(upcoming);
      setNotices(allNotices.slice(0, 4)); // 공지사항은 최신 4개만 표시
      setMyDuesStatus(myDue || null);
    };
    loadData();
  }, [user.id]);

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
              다가오는 경기
            </h3>
            <Link
              to="/schedule"
              className="text-sm text-gray-500 hover:text-primary flex items-center"
            >
              전체보기 <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid gap-3">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <Link key={match.id} to={`/match/${match.id}`}>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary transition-colors flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded">
                          {match.date.split("-").slice(1).join("/")}
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                          {match.time}
                        </span>
                      </div>
                      <div className="text-gray-900 font-medium">
                        <span className="text-gray-500 text-sm mr-2">
                          {match.location}
                        </span>
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

        {/* 오른쪽 컬럼: 회비 상태 및 공지사항 */}
        <div className="space-y-6">
          {/* 공지사항 리스트 */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center">
                <Bell className="mr-2 text-primary" size={20} />
                공지사항
              </h3>
            </div>
            <ul className="space-y-3">
              {notices.map((notice) => (
                <li
                  key={notice.id}
                  className="border-b border-gray-50 last:border-0 pb-2 last:pb-0"
                >
                  <div className="flex items-start">
                    {/* 중요 공지는 빨간 점으로 표시 */}
                    {notice.isImportant && (
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1 hover:text-primary cursor-pointer transition-colors">
                        {notice.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {notice.date}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
