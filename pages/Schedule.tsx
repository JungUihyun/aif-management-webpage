import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Plus,
  X,
} from 'lucide-react';
import { MatchStatus, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useMatches } from '../hooks/useMatches';

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const { matches, refetch } = useMatches();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'list'>('list'); // 뷰 모드: 리스트형 vs 달력형

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMatch, setNewMatch] = useState({
    date: '',
    time: '',
    opponent: '',
    location: '',
  });

  // 경기 생성 권한 확인 (임원 또는 매니저만 가능)
  const canCreateMatch =
    user?.role === UserRole.EXECUTIVE || user?.role === UserRole.MANAGER;

  // 해당 월의 총 일수 계산 (마지막 날짜)
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // 현재 보고 있는 월의 경기만 필터링
  const filteredMatches = matches.filter((m) => {
    const matchDate = new Date(m.date);
    return (
      matchDate.getMonth() === currentDate.getMonth() &&
      matchDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // 상태에 따른 배지 UI 반환
  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.UPCOMING:
        return (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            예정
          </span>
        );
      case MatchStatus.COMPLETED:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            종료
          </span>
        );
      case MatchStatus.CANCELLED:
        return (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            취소
          </span>
        );
    }
  };

  // 입력 폼 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMatch((prev) => ({ ...prev, [name]: value }));
  };

  // 경기 생성 제출 핸들러
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    // 유효성 검사
    if (
      !newMatch.date ||
      !newMatch.time ||
      !newMatch.opponent ||
      !newMatch.location
    ) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    await api.createMatch({
      date: newMatch.date,
      time: newMatch.time,
      opponent: newMatch.opponent,
      location: newMatch.location,
    });

    setIsModalOpen(false);
    setNewMatch({ date: '', time: '', opponent: '', location: '' }); // 폼 초기화
    refetch(); // 목록 새로고침
  };

  return (
    <div className="space-y-6 relative">
      {/* 상단 컨트롤 바 (날짜 이동, 뷰 전환, 생성 버튼) */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm gap-4">
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* 권한이 있는 경우에만 경기 추가 버튼 표시 */}
          {canCreateMatch && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm font-bold shadow-sm"
            >
              <Plus size={16} className="mr-1" /> 일정 추가
            </button>
          )}
          <div className="flex bg-gray-100 p-1 rounded-lg flex-shrink-0">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'list'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-500'
              }`}
            >
              리스트
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'month'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-500'
              }`}
            >
              달력
            </button>
          </div>
        </div>
      </div>

      {/* 리스트 뷰 렌더링 */}
      {view === 'list' && (
        <div className="space-y-3">
          {filteredMatches.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
              이 달의 경기 일정이 없습니다.
            </div>
          )}
          {/* 날짜순 정렬 후 맵핑 */}
          {filteredMatches
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .map((match) => (
              <Link key={match.id} to={`/match/${match.id}`} className="block">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-primary transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-center bg-gray-50 p-2 rounded-lg min-w-[60px]">
                        <span className="text-xs text-gray-500">
                          {match.date.split('-')[1]}월
                        </span>
                        <span className="text-xl font-bold text-gray-800">
                          {match.date.split('-')[2]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">
                          vs {match.opponent}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" /> {match.time}
                          </span>
                          <span className="flex items-center">
                            <MapPin size={14} className="mr-1" />{' '}
                            {match.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(match.status)}
                      <span className="text-xs text-gray-400">
                        {match.participants.length}명 참여
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}

      {/* 달력 뷰 렌더링 */}
      {view === 'month' && (
        <div className="bg-white rounded-xl shadow-sm p-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-1 min-w-[600px]">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <div
                key={d}
                className="text-center text-sm font-bold text-gray-500 py-2"
              >
                {d}
              </div>
            ))}

            {/* 달력 시작 전 빈칸 채우기 (해당 월 1일의 요일만큼) */}
            {Array.from({
              length: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
              ).getDay(),
            }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-24 bg-gray-50 rounded-lg"
              ></div>
            ))}

            {/* 날짜 셀 생성 */}
            {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(
                currentDate.getMonth() + 1
              ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayMatches = matches.filter((m) => m.date === dateStr);
              return (
                <div
                  key={day}
                  className="h-24 border border-gray-100 rounded-lg p-2 relative hover:bg-gray-50"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayMatches.map((m) => (
                      <Link
                        key={m.id}
                        to={`/match/${m.id}`}
                        className="block text-[10px] bg-green-100 text-green-800 px-1 py-0.5 rounded truncate"
                      >
                        {m.time} vs {m.opponent}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 경기 생성 모달창 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">새로운 경기 일정 생성</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateMatch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  상대팀 이름
                </label>
                <input
                  type="text"
                  name="opponent"
                  value={newMatch.opponent}
                  onChange={handleInputChange}
                  placeholder="예: 경영대 FC"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    경기 날짜
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newMatch.date}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    경기 시간
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={newMatch.time}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  경기 장소
                </label>
                <input
                  type="text"
                  name="location"
                  value={newMatch.location}
                  onChange={handleInputChange}
                  placeholder="예: 대운동장"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors shadow-md"
                >
                  일정 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
