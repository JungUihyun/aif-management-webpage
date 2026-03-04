import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Match, MatchStatus, UserRole } from '../types';
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
  const getStatusBadge = (match: Match) => {
    switch (match.status) {
      case MatchStatus.UPCOMING:
        return (
          <span className="bg-[#e8f3ee] text-[#00a550] text-[11px] font-bold px-2.5 py-1 rounded-full">
            예정
          </span>
        );
      case MatchStatus.COMPLETED:
        if (match.score) {
          const isWin = match.score.us > match.score.opponent;
          const isLoss = match.score.us < match.score.opponent;

          let resultText = '무승부';
          let resultColor = 'bg-gray-100 text-gray-600';
          if (isWin) {
            resultText = '승리';
            resultColor = 'bg-blue-50 text-blue-600';
          } else if (isLoss) {
            resultText = '패배';
            resultColor = 'bg-red-50 text-red-600';
          }

          return (
            <div className="flex items-center space-x-1.5">
              <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
                종료
              </span>
              <span
                className={`${resultColor} text-[11px] font-bold px-2.5 py-1 rounded-full`}
              >
                {resultText}
              </span>
            </div>
          );
        }

        return (
          <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
            종료
          </span>
        );
      case MatchStatus.CANCELLED:
        return (
          <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
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
      <div className="flex flex-col sm:flex-row justify-between items-center px-3 py-2 gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center">
            <h2 className="text-[22px] md:text-[24px] font-bold text-gray-900 tracking-tight">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h2>
          </div>
          <div className="flex space-x-1 sm:ml-4">
            <button
              onClick={prevMonth}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={26} strokeWidth={2.5} />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight size={26} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center sm:space-x-2 w-full sm:w-auto">
          <div className="flex bg-gray-100/80 p-1 rounded-xl flex-shrink-0 mr-3 sm:mr-0">
            <button
              onClick={() => setView('list')}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                view === 'list'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              리스트
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                view === 'month'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              달력
            </button>
          </div>
          {/* 권한이 있는 경우에만 경기 추가 버튼 표시 */}
          {canCreateMatch && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center bg-[#00a550] text-white px-4 py-2 rounded-[14px] hover:bg-[#008f45] transition-colors text-[14px] font-bold shadow-sm"
            >
              <Plus size={18} className="mr-1 stroke-2" /> 일정 추가
            </button>
          )}
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
          {/* 날짜순 정렬 후 맵핑 - 최신순(내림차순) */}
          {filteredMatches
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((match) => {
              // 경기 결과 판정 (스코어 기준)
              const isCompleted = match.status === MatchStatus.COMPLETED;
              const hasScore = match.score !== undefined;

              return (
                <Link
                  key={match.id}
                  to={`/match/${match.id}`}
                  className="block"
                >
                  <div
                    className={`bg-white p-5 rounded-[24px] shadow-[0_2px_14px_rgba(0,0,0,0.02)] transition-all group ${
                      isCompleted && hasScore
                        ? 'border-2 border-transparent hover:border-gray-100'
                        : 'border-0'
                    } active:scale-[0.98] transform duration-200`}
                  >
                    {/* 모바일: 세로 레이아웃, 태블릿 이상: 가로 레이아웃 */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      {/* 메인 정보 영역 */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* 날짜 박스 */}
                        <div
                          className={`flex flex-col items-center justify-center w-[60px] h-[60px] rounded-2xl flex-shrink-0 ${
                            isCompleted && hasScore
                              ? match.score.us > match.score.opponent
                                ? 'bg-[#f0f9f4]'
                                : match.score.us < match.score.opponent
                                  ? 'bg-red-50'
                                  : 'bg-gray-50'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span
                            className={`text-[11px] font-bold ${
                              isCompleted && hasScore
                                ? match.score.us > match.score.opponent
                                  ? 'text-[#00a550]'
                                  : match.score.us < match.score.opponent
                                    ? 'text-red-500'
                                    : 'text-gray-500'
                                : 'text-gray-500'
                            }`}
                          >
                            {match.date.split('-')[1]}월
                          </span>
                          <span
                            className={`text-[20px] font-bold -mt-1 ${
                              isCompleted && hasScore
                                ? match.score.us > match.score.opponent
                                  ? 'text-[#00a550]'
                                  : match.score.us < match.score.opponent
                                    ? 'text-red-600'
                                    : 'text-gray-700'
                                : 'text-gray-900'
                            }`}
                          >
                            {match.date.split('-')[2]}
                          </span>
                        </div>

                        {/* 타이틀 및 세부 정보 */}
                        <div className="min-w-0 flex-1 py-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {getStatusBadge(match)}
                            <h3 className="font-bold text-[18px] text-gray-900 truncate tracking-tight">
                              {match.opponent}
                            </h3>
                          </div>

                          {/* 시간과 장소 */}
                          <div className="flex items-center text-[13px] text-gray-500 font-medium gap-3">
                            <span className="flex items-center">
                              {match.time}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="flex items-center truncate">
                              <span className="truncate">{match.location}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 상태 및 결과 영역 */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-gray-50 sm:border-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                        <span className="text-[13px] font-semibold text-gray-400 order-2 sm:order-1 sm:mb-1">
                          {match.participants.length}명 참여
                        </span>

                        {match.status === MatchStatus.COMPLETED &&
                          match.score && (
                            <div className="order-1 sm:order-2">
                              <div className="flex items-center justify-center bg-gray-50 px-3 py-1.5 rounded-xl">
                                <span className="text-[16px] font-bold text-gray-900">
                                  {match.score.us}
                                </span>
                                <span className="text-[14px] text-gray-400 mx-1.5 font-bold">
                                  :
                                </span>
                                <span className="text-[16px] font-bold text-gray-500">
                                  {match.score.opponent}
                                </span>
                              </div>
                            </div>
                          )}
                        {match.status !== MatchStatus.COMPLETED && (
                          <div className="order-1 sm:order-2">
                            <div className="flex items-center justify-center text-gray-300">
                              <ChevronRight size={20} strokeWidth={2.5} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
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

      {/* 경기 생성 모달창 / 바텀시트 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 sm:p-4 transition-opacity">
          <div className="bg-white w-full max-w-md sm:rounded-[28px] rounded-t-[28px] rounded-b-none shadow-xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-300 pb-safe">
            <div className="px-6 pt-7 pb-2 flex justify-between items-center text-gray-900 border-b border-gray-50">
              <h3 className="font-bold text-[22px] tracking-tight">
                새 일정 추가
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors bg-gray-50"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            <form onSubmit={handleCreateMatch} className="p-6 space-y-6">
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">
                  상대팀 이름
                </label>
                <input
                  type="text"
                  name="opponent"
                  value={newMatch.opponent}
                  onChange={handleInputChange}
                  placeholder="예: 경영대 FC"
                  className="w-full bg-[#f2f4f6] rounded-[16px] px-5 py-4 text-[16px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a550]/20 transition-all border-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-2">
                    경기 날짜
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newMatch.date}
                    onChange={handleInputChange}
                    className="w-full bg-[#f2f4f6] rounded-[16px] px-5 py-4 text-[16px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00a550]/20 transition-all border-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-2">
                    경기 시간
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={newMatch.time}
                    onChange={handleInputChange}
                    className="w-full bg-[#f2f4f6] rounded-[16px] px-5 py-4 text-[16px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00a550]/20 transition-all border-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">
                  경기 장소
                </label>
                <input
                  type="text"
                  name="location"
                  value={newMatch.location}
                  onChange={handleInputChange}
                  placeholder="예: 대운동장"
                  className="w-full bg-[#f2f4f6] rounded-[16px] px-5 py-4 text-[16px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a550]/20 transition-all border-none"
                  required
                />
              </div>

              <div className="pt-4 pb-2">
                <button
                  type="submit"
                  className="w-full bg-[#00a550] text-white font-bold text-[16px] py-4 rounded-[16px] hover:bg-[#008f45] active:scale-[0.98] transition-all"
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
