import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, ArrowLeft, Shield, Edit2 } from 'lucide-react';
import { Match, MatchStatus, User, UserRole } from '../types';
import { api } from '../services/api';

interface MatchDetailProps {
  user: User;
}

const MatchDetail: React.FC<MatchDetailProps> = ({ user }) => {
  // URL에서 match id 파라미터 추출
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 (UI만 구현됨)
  const [isJoined, setIsJoined] = useState(false); // 현재 유저의 참여 여부

  useEffect(() => {
    if (id) {
      api.getMatchById(id).then((data) => {
        if (data) {
          setMatch(data);
          // 참여자 목록에 내 학번이 있는지 확인
          setIsJoined(data.participants.includes(user.id));
        }
      });
    }
  }, [id, user.id]);

  const handleToggleJoin = () => {
    // 실제 앱에서는 API를 호출하여 참여 상태를 DB에 업데이트해야 함
    setIsJoined(!isJoined);
  };

  // 관리자 권한 확인 (수정 버튼 표시용)
  const canEdit =
    user.role === UserRole.EXECUTIVE || user.role === UserRole.MANAGER;

  if (!match) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={16} className="mr-1" /> 목록으로
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 경기 헤더 섹션 (스코어 및 기본 정보) */}
        <div className="bg-primary p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              {match.status === MatchStatus.UPCOMING
                ? '경기 예정'
                : '경기 종료'}
            </span>
            {/* 관리자에게만 수정 버튼 표시 */}
            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 p-2 rounded-full hover:bg-white/30 backdrop-blur-sm"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold mb-2">vs {match.opponent}</h1>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-white/80">
                <span className="flex items-center">
                  <Clock size={16} className="mr-1" /> {match.date} {match.time}
                </span>
                <span className="flex items-center">
                  <MapPin size={16} className="mr-1" /> {match.location}
                </span>
              </div>
            </div>

            {/* 종료된 경기인 경우 스코어 보드 표시 */}
            {match.status === MatchStatus.COMPLETED && match.score && (
              <div className="mt-6 md:mt-0 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-sm opacity-80 mb-1">FINAL SCORE</div>
                <div className="text-4xl font-bold font-mono tracking-widest">
                  {match.score.us} : {match.score.opponent}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 액션 바 (참여 신청 버튼) */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center text-gray-600">
            <Users size={20} className="mr-2" />
            <span className="font-bold">{match.participants.length}</span>
            <span className="text-sm ml-1">명 참여 중</span>
          </div>
          {match.status === MatchStatus.UPCOMING && (
            <button
              onClick={handleToggleJoin}
              className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                isJoined
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-primary text-white hover:bg-green-800'
              }`}
            >
              {isJoined ? '참여 취소' : '참여 신청'}
            </button>
          )}
        </div>

        {/* 하단 컨텐츠 (라인업 및 명단) */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 라인업 시각화 */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Shield size={20} className="mr-2 text-primary" />
              선발 라인업 (포메이션: {match.formation || '미정'})
            </h3>

            {/* 축구장 그래픽 구현 */}
            <div className="relative w-full aspect-[2/3] bg-green-600 rounded-lg border-2 border-white/20 shadow-inner overflow-hidden p-4">
              {/* 경기장 라인 드로잉 */}
              <div className="absolute top-0 left-1/4 right-1/4 h-16 border-b-2 border-l-2 border-r-2 border-white/30 rounded-b-lg"></div>
              <div className="absolute bottom-0 left-1/4 right-1/4 h-16 border-t-2 border-l-2 border-r-2 border-white/30 rounded-t-lg"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

              {/* 선수 배치 (Mock 데이터를 기반으로 위치 계산) */}
              {match.lineup ? (
                Object.entries(match.lineup).map(([pos, userId]) => (
                  <div
                    key={pos}
                    className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      top: getPosCoords(pos).top, // 포지션별 % 좌표
                      left: getPosCoords(pos).left,
                    }}
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-primary text-xs shadow-md z-10">
                      {pos}
                    </div>
                  </div>
                ))
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                  라인업이 아직 등록되지 않았습니다.
                </div>
              )}
            </div>
          </div>

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
    </div>
  );
};

// 포지션 코드에 따라 경기장 위 좌표(top, left %)를 반환하는 헬퍼 함수
const getPosCoords = (pos: string) => {
  const map: Record<string, { top: string; left: string }> = {
    GK: { top: '90%', left: '50%' },
    CB1: { top: '75%', left: '35%' },
    CB2: { top: '75%', left: '65%' },
    CM: { top: '50%', left: '50%' },
    ST: { top: '20%', left: '50%' },
  };
  return map[pos] || { top: '50%', left: '50%' };
};

export default MatchDetail;
