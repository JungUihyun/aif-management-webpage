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
  Plus,
  X,
} from "lucide-react";
import { Match, Notice, User, UserRole } from "../types";
import { api } from "../services/api";

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    isImportant: false,
  });

  const loadNotices = async () => {
    const allNotices = await api.getNotices();
    setNotices(allNotices.slice(0, 4));
  };

  useEffect(() => {
    // 모든 필요 데이터를 병렬로 호출하여 로딩 시간 단축
    const loadData = async () => {
      const matches = await api.getMatches();
      await loadNotices();

      // [로직] 예정된 경기만 필터링하고 날짜순으로 정렬 후 상위 3개만 추출
      const upcoming = matches
        .filter((m) => m.status === "UPCOMING")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

      setUpcomingMatches(upcoming);
    };
    loadData();
  }, [user.id]);

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await api.createNotice({
        title: noticeForm.title,
        content: noticeForm.content,
        authorId: user.id,
        isImportant: noticeForm.isImportant ? 1 : 0,
      });

      if (success) {
        alert("공지사항이 작성되었습니다!");
        setNoticeForm({ title: "", content: "", isImportant: false });
        setIsNoticeModalOpen(false);
        // 공지사항 목록 새로고침
        await loadNotices();
      } else {
        alert("공지사항 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 공지사항 작성 권한 체크 (임원 또는 매니저)
  const canCreateNotice =
    user.role === UserRole.EXECUTIVE || user.role === UserRole.MANAGER;

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

        {/* 오른쪽 컬럼: 공지사항 */}
        <div className="space-y-6">
          {/* 공지사항 리스트 */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center">
                <Bell className="mr-2 text-primary" size={20} />
                공지사항
              </h3>
              {/* 임원/매니저만 작성 버튼 표시 */}
              {canCreateNotice && (
                <button
                  onClick={() => setIsNoticeModalOpen(true)}
                  className="flex items-center text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-green-800 transition-colors"
                >
                  <Plus size={16} className="mr-1" />
                  작성
                </button>
              )}
            </div>
            <ul className="space-y-3">
              {notices.map((notice) => (
                <li
                  key={notice.id}
                  className="border-b border-gray-50 last:border-0 pb-2 last:pb-0"
                >
                  <div className="flex items-start">
                    {/* 중요 공지는 빨간 점으로 표시 */}
                    {notice.isImportant === 1 && (
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1 hover:text-primary cursor-pointer transition-colors">
                        {notice.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {notice.createdAt}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 공지사항 작성 모달 */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  공지사항 작성
                </h3>
                <button
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleNoticeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목
                  </label>
                  <input
                    type="text"
                    value={noticeForm.title}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="공지사항 제목을 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    내용
                  </label>
                  <textarea
                    value={noticeForm.content}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, content: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                    rows={5}
                    placeholder="공지사항 내용을 입력하세요"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={noticeForm.isImportant}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        isImportant: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label
                    htmlFor="isImportant"
                    className="ml-2 text-sm text-gray-700"
                  >
                    중요 공지로 표시
                  </label>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNoticeModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "작성 중..." : "작성 완료"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
