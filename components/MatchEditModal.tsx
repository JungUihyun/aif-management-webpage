import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Match, User, Goal } from '../types';
import { api } from '../services/api';
import {
  getFormationLines,
  getPositionsForFormation,
} from '../utils/formation';

interface MatchEditModalProps {
  match: Match;
  allUsers: User[]; // 전체 유저 목록
  onClose: () => void;
  onSave: () => void;
}

const MatchEditModal: React.FC<MatchEditModalProps> = ({
  match,
  allUsers,
  onClose,
  onSave,
}) => {
  // 스코어 상태
  const [ourScore, setOurScore] = useState(match.score?.us || 0);
  const [opponentScore, setOpponentScore] = useState(
    match.score?.opponent || 0
  );

  // 참여자 상태 (학번 배열)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    match.participants.map((p) => p.id)
  );

  // 득점 기록 상태
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalScorer, setNewGoalScorer] = useState('');
  const [newGoalAssist, setNewGoalAssist] = useState('');

  // 포메이션 및 라인업 상태
  const [formation, setFormation] = useState(match.formation || '');
  const [lineup, setLineup] = useState<Record<string, string>>(
    match.lineup || {}
  );

  const [isSaving, setIsSaving] = useState(false);

  // 골 목록 로드
  useEffect(() => {
    api.getMatchGoals(match.id).then(setGoals);
  }, [match.id]);

  // 참여자 토글
  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // 골 추가
  const handleAddGoal = async () => {
    if (!newGoalScorer) {
      alert('득점자를 선택해주세요.');
      return;
    }

    const newGoal = await api.createGoal(
      match.id,
      newGoalScorer,
      newGoalAssist || null
    );

    if (newGoal) {
      setGoals([...goals, newGoal]);
      setNewGoalScorer('');
      setNewGoalAssist('');
      setIsAddingGoal(false);
    } else {
      alert('골 추가에 실패했습니다.');
    }
  };

  // 골 삭제
  const handleDeleteGoal = async (goalId: string) => {
    const success = await api.deleteGoal(goalId);
    if (success) {
      setGoals(goals.filter((g) => g.id !== goalId));
    } else {
      alert('골 삭제에 실패했습니다.');
    }
  };

  // 저장
  const handleSave = async () => {
    setIsSaving(true);

    try {
      // 1. 스코어 업데이트
      await api.updateMatchScore(match.id, ourScore, opponentScore);

      // 2. 참여자 업데이트
      await api.updateMatchParticipants(match.id, selectedParticipants);

      // 3. 포메이션 및 라인업 업데이트
      if (formation) {
        await api.updateMatchFormation(match.id, formation, lineup);
      }

      setIsSaving(false);
      onSave();
      onClose();
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert('저장에 실패했습니다.');
      setIsSaving(false);
    }
  };

  // 득점자/어시스트 이름 가져오기
  const getUserName = (userId: string) => {
    if (userId === 'guest') return '용병';
    const user = allUsers.find((u) => u.id === userId);
    return user ? user.name : userId;
  };

  // 포메이션 변경 시 라인업 초기화
  const handleFormationChange = (newFormation: string) => {
    setFormation(newFormation);
    setLineup({});
  };

  // 포지션에 선수 할당
  const handleLineupChange = (position: string, userId: string) => {
    setLineup((prev) => ({
      ...prev,
      [position]: userId,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">경기 수정</h3>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 내용 (스크롤 가능) */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 스코어 설정 */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              📊 스코어 설정
            </h4>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  우리 팀
                </label>
                <input
                  type="number"
                  min="0"
                  value={ourScore}
                  onChange={(e) => setOurScore(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-xl font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div className="text-2xl font-bold text-gray-400 pt-6">:</div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  상대 팀
                </label>
                <input
                  type="number"
                  min="0"
                  value={opponentScore}
                  onChange={(e) =>
                    setOpponentScore(parseInt(e.target.value) || 0)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-xl font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* 참여자 관리 */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              👥 참여자 관리
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {allUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(user.id)}
                      onChange={() => toggleParticipant(user.id)}
                      className="w-4 h-4 text-primary focus:ring-primary rounded"
                    />
                    <span className="text-sm text-gray-800">{user.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedParticipants.length}명 선택됨
            </p>
          </div>

          {/* 득점 기록 */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              ⚽ 득점 기록 (총 {goals.length}골)
            </h4>

            {/* 득점 내역 리스트 */}
            <div className="space-y-2 mb-3">
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between bg-green-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🎯</span>
                      <span className="font-medium text-gray-800">
                        {getUserName(goal.scorerId)}
                      </span>
                      {goal.assistId && (
                        <>
                          <span className="text-gray-400">←</span>
                          <span className="text-sm text-gray-600">
                            {getUserName(goal.assistId)}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  아직 득점 기록이 없습니다.
                </p>
              )}
            </div>

            {/* 골 추가 버튼 또는 폼 */}
            {!isAddingGoal ? (
              <button
                onClick={() => setIsAddingGoal(true)}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center space-x-2"
              >
                <Plus size={16} />
                <span>골 추가하기</span>
              </button>
            ) : (
              <div className="border-2 border-primary rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    득점자 *
                  </label>
                  <select
                    value={newGoalScorer}
                    onChange={(e) => setNewGoalScorer(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">선택하세요</option>
                    <option value="guest">용병</option>
                    {selectedParticipants.map((userId) => {
                      const user = allUsers.find((u) => u.id === userId);
                      return user ? (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ) : null;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    어시스트 (선택)
                  </label>
                  <select
                    value={newGoalAssist}
                    onChange={(e) => setNewGoalAssist(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">없음</option>
                    {newGoalScorer !== 'guest' && (
                      <option value="guest">용병</option>
                    )}
                    {selectedParticipants
                      .filter((id) => id !== newGoalScorer)
                      .map((userId) => {
                        const user = allUsers.find((u) => u.id === userId);
                        return user ? (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ) : null;
                      })}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddGoal}
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-green-800 transition-colors font-medium"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingGoal(false);
                      setNewGoalScorer('');
                      setNewGoalAssist('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 포메이션 및 라인업 설정 */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              ⚽ 포메이션 & 라인업
            </h4>

            {/* 포메이션 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                포메이션 선택
              </label>
              <select
                value={formation}
                onChange={(e) => handleFormationChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">미정</option>
                <option value="4-3-3">4-3-3</option>
                <option value="4-4-2">4-4-2</option>
                <option value="3-5-2">3-5-2</option>
                <option value="4-2-3-1">4-2-3-1</option>
              </select>
            </div>

            {/* 라인업 설정 */}
            {formation && formation !== '미정' && (
              <div className="bg-gradient-to-b from-green-600 to-green-700 rounded-lg p-6 space-y-6">
                <p className="text-sm text-white/90 text-center mb-4">
                  각 포지션에 선수를 배치하세요
                </p>

                {/* 라인별 포지션 표시 */}
                <div className="space-y-6">
                  {getFormationLines(formation).map((line) => (
                    <div key={line.label} className="space-y-2">
                      {/* 라인 레이블 */}
                      <div className="text-center">
                        <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {line.label}
                        </span>
                      </div>

                      {/* 해당 라인의 포지션들을 가로로 배치 */}
                      <div className="flex justify-around items-start px-2 gap-1">
                        {line.positions.map((position) => {
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
                              <select
                                value={lineup[position] || ''}
                                onChange={(e) =>
                                  handleLineupChange(position, e.target.value)
                                }
                                className="w-full border-2 border-white/30 bg-white/10 text-white rounded-lg px-1 py-1.5 text-[10px] font-medium focus:ring-2 focus:ring-white focus:border-white outline-none backdrop-blur-sm hover:bg-white/20 transition-colors"
                              >
                                <option value="" className="bg-gray-800">
                                  -
                                </option>
                                <option value="guest" className="bg-gray-800">
                                  용병
                                </option>
                                {selectedParticipants.map((userId) => {
                                  const user = allUsers.find(
                                    (u) => u.id === userId
                                  );
                                  return user ? (
                                    <option
                                      key={user.id}
                                      value={user.id}
                                      className="bg-gray-800"
                                    >
                                      {user.name}
                                    </option>
                                  ) : null;
                                })}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 진행 상황 표시 */}
                <div className="text-center pt-4 border-t border-white/20">
                  <p className="text-sm text-white/90">
                    <span className="font-bold text-white">
                      {Object.keys(lineup).filter((k) => lineup[k]).length}
                    </span>
                    {' / '}
                    <span className="font-bold text-white">
                      {getPositionsForFormation(formation).length}
                    </span>{' '}
                    포지션 배치 완료
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 (저장/취소 버튼) */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-medium disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchEditModal;
