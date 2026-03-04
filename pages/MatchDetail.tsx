import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Users,
  ArrowLeft,
  Shield,
  Edit2,
  ChevronDown,
} from 'lucide-react';
import { Match, MatchStatus, User, UserRole, Goal } from '../types';
import { api } from '../services/api';
import MatchEditModal from '../components/MatchEditModal';
import { getFormationLines } from '../utils/formation';

interface MatchDetailProps {
  user: User;
}

const MatchDetail: React.FC<MatchDetailProps> = ({ user }) => {
  // URL에서 match id 파라미터 추출
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [isEditing, setIsEditing] = useState(false); // 수정 모달 표시 여부
  const [isJoined, setIsJoined] = useState(false); // 현재 유저의 참여 여부
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // 상태 업데이트 중
  const [allUsers, setAllUsers] = useState<User[]>([]); // 전체 유저 목록 (참여자 관리용)
  const [goals, setGoals] = useState<Goal[]>([]); // 득점 기록

  const fetchMatchData = useCallback(() => {
    if (id) {
      api.getMatchById(id).then((data) => {
        if (data) {
          setMatch(data);
          // 참여자 목록에 내 학번이 있는지 확인
          setIsJoined(data.participants.some((p) => p.id === user.id));
        }
      });
      // 득점 기록 조회
      api.getMatchGoals(id).then(setGoals);
    }
  }, [id, user.id]);

  useEffect(() => {
    fetchMatchData();
    // 전체 유저 목록 가져오기 (수정 모달용)
    api.getUsers().then(setAllUsers);
  }, [fetchMatchData]);

  const handleToggleJoin = async () => {
    if (!id) return;

    // API 호출하여 참가 신청/취소
    const success = await api.toggleMatchParticipation(id, user.id);

    if (success) {
      // 성공 시 경기 데이터 새로고침
      fetchMatchData();
    } else {
      alert('참가 신청/취소에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 경기 상태 변경 핸들러 (임원/매니저만 사용)
  const handleStatusChange = async (newStatus: MatchStatus) => {
    if (!match || !id) return;

    setIsUpdatingStatus(true);
    const success = await api.updateMatchStatus(id, newStatus);

    if (success) {
      // 로컬 상태 업데이트
      setMatch({ ...match, status: newStatus });
    } else {
      alert('경기 상태 변경에 실패했습니다.');
    }
    setIsUpdatingStatus(false);
  };

  // 관리자 권한 확인 (수정 버튼 표시용)
  const canEdit =
    user.role === UserRole.EXECUTIVE || user.role === UserRole.MANAGER;

  if (!match) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center px-1 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-800 hover:text-gray-500 transition-colors p-2 -ml-2 rounded-full active:bg-gray-100"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className="bg-white rounded-[28px] shadow-[0_2px_14px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* 경기 헤더 섹션 (스코어 및 기본 정보) */}
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            {/* 상태 표시 - 관리자는 드롭다운, 일반 유저는 뱃지만 */}
            {canEdit ? (
              <div className="flex items-center gap-2">
                <div className="relative inline-block">
                  <select
                    value={match.status}
                    onChange={(e) =>
                      handleStatusChange(e.target.value as MatchStatus)
                    }
                    disabled={isUpdatingStatus}
                    className="bg-gray-100 text-gray-800 px-4 py-2 pr-9 rounded-full text-[13px] font-bold appearance-none cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-[#00a550]/20"
                  >
                    <option value={MatchStatus.UPCOMING}>경기 예정</option>
                    <option value={MatchStatus.COMPLETED}>경기 종료</option>
                    <option value={MatchStatus.CANCELLED}>경기 취소</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    strokeWidth={2.5}
                  />
                </div>
                {match.status === MatchStatus.COMPLETED && match.score && (
                  <span
                    className={`px-3 py-1.5 rounded-full text-[13px] font-bold ${match.score.us > match.score.opponent ? 'bg-blue-50 text-blue-600' : match.score.us < match.score.opponent ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {match.score.us > match.score.opponent
                      ? '승리'
                      : match.score.us < match.score.opponent
                        ? '패배'
                        : '무승부'}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`px-4 py-2 rounded-full text-[13px] font-bold ${
                    match.status === MatchStatus.UPCOMING
                      ? 'bg-[#e8f3ee] text-[#00a550]'
                      : match.status === MatchStatus.COMPLETED
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-red-50 text-red-600'
                  }`}
                >
                  {match.status === MatchStatus.UPCOMING
                    ? '경기 예정'
                    : match.status === MatchStatus.COMPLETED
                      ? '경기 종료'
                      : '경기 취소'}
                </span>
                {match.status === MatchStatus.COMPLETED && match.score && (
                  <span
                    className={`px-4 py-2 rounded-full text-[13px] font-bold ${match.score.us > match.score.opponent ? 'bg-blue-50 text-blue-600' : match.score.us < match.score.opponent ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {match.score.us > match.score.opponent
                      ? '승리'
                      : match.score.us < match.score.opponent
                        ? '패배'
                        : '무승부'}
                  </span>
                )}
              </div>
            )}
            {/* 관리자에게만 수정 버튼 표시 */}
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gray-50 p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                title="경기 수정"
              >
                <Edit2 size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="flex flex-col text-left">
            <h1 className="text-[28px] sm:text-[32px] font-bold text-gray-900 mb-4 tracking-tight leading-tight">
              {match.opponent}
            </h1>

            {/* 스코어 표시 - 스코어가 설정되어 있으면 항상 표시 */}
            {match.score && (
              <div className="mb-6 bg-gray-50 p-5 rounded-[20px] inline-block self-start border border-gray-100">
                <div className="text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Result
                </div>
                <div className="text-[36px] font-bold tracking-tight text-gray-900 flex items-center justify-center">
                  <span
                    className={
                      match.score.us > match.score.opponent
                        ? 'text-[#00a550]'
                        : ''
                    }
                  >
                    {match.score.us}
                  </span>
                  <span className="text-gray-300 mx-3 text-[24px]">:</span>
                  <span
                    className={
                      match.score.us < match.score.opponent
                        ? 'text-red-500'
                        : 'text-gray-600'
                    }
                  >
                    {match.score.opponent}
                  </span>
                </div>
              </div>
            )}

            {/* 득점 내역 표시 */}
            {goals.length > 0 && (
              <div className="mb-6 space-y-2">
                {goals.map((goal) => {
                  const scorer = allUsers.find((u) => u.id === goal.scorerId);
                  const assister = goal.assistId
                    ? allUsers.find((u) => u.id === goal.assistId)
                    : null;
                  return (
                    <div
                      key={goal.id}
                      className="text-gray-700 text-[14px] flex items-center bg-gray-50/50 py-1 px-3 rounded-lg inline-flex"
                    >
                      <span className="mr-2 text-[12px]">⚽</span>
                      <span className="font-bold text-gray-900">
                        {scorer?.name || goal.scorerId}
                      </span>
                      {assister && (
                        <>
                          <span className="mx-2 text-gray-400 text-[12px]">
                            도움
                          </span>
                          <span className="font-medium text-gray-600">
                            {assister.name}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 text-[15px] font-medium text-gray-600 mt-2">
              <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                {match.date.split('-')[1]}월 {match.date.split('-')[2]}일{' '}
                {match.time}
              </span>
              <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                <MapPin size={16} className="mr-1.5 text-gray-400" />{' '}
                {match.location}
              </span>
            </div>
          </div>
        </div>

        {/* 액션 바 (참여 신청 버튼) */}
        <div className="px-6 pb-6 pt-2">
          {match.status === MatchStatus.UPCOMING && (
            <button
              onClick={handleToggleJoin}
              className={`w-full py-4 rounded-[16px] font-bold text-[17px] active:scale-[0.98] transition-all flex items-center justify-center ${
                isJoined
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-[#00a550] text-white hover:bg-[#008f45] shadow-sm'
              }`}
            >
              {isJoined ? '참여 취소' : '참여하기'}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-y border-gray-100">
          <div className="flex items-center text-gray-700">
            <span className="font-bold text-[15px]">참여 인원</span>
          </div>
          <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            <Users size={16} className="mr-1.5 text-gray-400" />
            <span className="font-bold text-[15px] text-gray-900">
              {match.participants.length}
            </span>
            <span className="text-[14px] text-gray-500 ml-0.5">명</span>
          </div>
        </div>

        {/* 하단 컨텐츠 (라인업 및 명단) */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 라인업 시각화 - 포메이션이 있을 때만 표시 */}
          {match.formation && match.formation !== '미정' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Shield size={20} className="mr-2 text-primary" />
                선발 라인업 (포메이션: {match.formation})
              </h3>

              {/* 라인별 포메이션 표시 */}
              <div className="bg-gradient-to-b from-green-600 to-green-700 rounded-lg p-6 space-y-6">
                {getFormationLines(match.formation).map((line) => (
                  <div key={line.label} className="space-y-2">
                    {/* 라인 레이블 */}
                    {/* <div className="text-center">
                      <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {line.label}
                      </span>
                    </div> */}

                    {/* 해당 라인의 포지션들을 가로로 배치 */}
                    <div className="flex justify-around items-start px-2 gap-1">
                      {line.positions.map((position) => {
                        const playerId = match.lineup?.[position];
                        const player = playerId
                          ? match.participants.find((p) => p.id === playerId)
                          : null;

                        // 포지션 개수에 따라 동적으로 너비 조정
                        const positionCount = line.positions.length;
                        const widthClass =
                          positionCount >= 5
                            ? 'w-14' // 5개 이상: 56px
                            : positionCount === 4
                              ? 'w-16' // 4개: 64px
                              : 'w-20'; // 3개 이하: 80px

                        return (
                          <div
                            key={position}
                            className={`flex flex-col items-center ${widthClass}`}
                          >
                            <div className="text-[10px] font-bold text-white mb-1 text-center">
                              {position}
                            </div>
                            <div className="w-full bg-white/10 border-2 border-white/30 text-white rounded-lg px-1 py-1.5 text-center text-[10px] font-medium backdrop-blur-sm min-h-[2rem] flex items-center justify-center">
                              {player ? (
                                <span className="truncate w-full text-[10px]">
                                  {player.name}
                                </span>
                              ) : (
                                <span className="text-white/50">-</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 오른쪽: 참여 명단 리스트 */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              참여 신청 명단
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 max-h-[500px] overflow-y-auto">
              <div className="space-y-2">
                {match.participants.length > 0 ? (
                  match.participants.map((participant, idx) => (
                    <div
                      key={idx}
                      className="flex items-center p-2 bg-white rounded-lg shadow-sm"
                    >
                      <img
                        src={participant.avatarUrl}
                        alt={participant.name}
                        className="w-10 h-10 rounded-full border border-gray-200 object-cover bg-gray-100 flex-shrink-0 mr-3"
                      />
                      <div>
                        <div className="font-bold text-gray-800 flex items-center">
                          {participant.name}
                          <span className="ml-2 text-[10px] text-gray-400">
                            ({participant.id})
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          주 포지션:{' '}
                          <span className="font-medium text-primary">
                            {participant.position}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4 text-sm">
                    신청 인원 없음
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 경기 수정 모달 */}
      {isEditing && (
        <MatchEditModal
          match={match}
          allUsers={allUsers}
          onClose={() => setIsEditing(false)}
          onSave={() => {
            fetchMatchData();
          }}
        />
      )}
    </div>
  );
};

export default MatchDetail;
