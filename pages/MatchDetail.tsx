import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, ArrowLeft, Shield, Edit2 } from 'lucide-react';
import { Match, MatchStatus, User, UserRole } from '../types';
import { api } from '../services/mockData';

interface MatchDetailProps {
  user: User;
}

const MatchDetail: React.FC<MatchDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (id) {
        api.getMatchById(id).then(data => {
            if (data) {
                setMatch(data);
                setIsJoined(data.participants.includes(user.id));
            }
        });
    }
  }, [id, user.id]);

  const handleToggleJoin = () => {
    setIsJoined(!isJoined);
    // In real app, call API to update participants
  };

  const canEdit = user.role === UserRole.EXECUTIVE || user.role === UserRole.MANAGER;

  if (!match) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800">
        <ArrowLeft size={16} className="mr-1" /> 목록으로
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Match Header */}
        <div className="bg-primary p-6 text-white">
            <div className="flex justify-between items-start mb-4">
               <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                 {match.status === MatchStatus.UPCOMING ? 'D-Day 예정' : '경기 종료'}
               </span>
               {canEdit && (
                   <button onClick={() => setIsEditing(!isEditing)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 backdrop-blur-sm">
                       <Edit2 size={16} />
                   </button>
               )}
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                <div>
                   <h1 className="text-3xl font-bold mb-2">vs {match.opponent}</h1>
                   <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-white/80">
                      <span className="flex items-center"><Clock size={16} className="mr-1"/> {match.date} {match.time}</span>
                      <span className="flex items-center"><MapPin size={16} className="mr-1"/> {match.location}</span>
                   </div>
                </div>
                
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

        {/* Actions Bar */}
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

        {/* Content Tabs */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Lineup / Field */}
            <div>
               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Shield size={20} className="mr-2 text-primary" />
                  선발 라인업 (Formation: {match.formation || '미정'})
               </h3>
               
               {/* Soccer Field Visualization */}
               <div className="relative w-full aspect-[2/3] bg-green-600 rounded-lg border-2 border-white/20 shadow-inner overflow-hidden p-4">
                  {/* Field Markings */}
                  <div className="absolute top-0 left-1/4 right-1/4 h-16 border-b-2 border-l-2 border-r-2 border-white/30 rounded-b-lg"></div>
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-16 border-t-2 border-l-2 border-r-2 border-white/30 rounded-t-lg"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

                  {/* Players (Simplified visualization based on mockup data) */}
                  {match.lineup ? Object.entries(match.lineup).map(([pos, userId]) => (
                      <div key={pos} className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                           style={{
                               top: getPosCoords(pos).top,
                               left: getPosCoords(pos).left
                           }}>
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-primary text-xs shadow-md z-10">
                              {/* In real app, fetch user name by ID */}
                              {pos}
                          </div>
                      </div>
                  )) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/50">
                          라인업이 아직 등록되지 않았습니다.
                      </div>
                  )}
               </div>
            </div>

            {/* Right: Participants List */}
            <div>
               <h3 className="text-lg font-bold text-gray-800 mb-4">참여 신청 명단</h3>
               <div className="bg-gray-50 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                   <div className="space-y-2">
                       {/* This would map through real user objects in production */}
                       {match.participants.map((pid, idx) => (
                           <div key={idx} className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                               <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 mr-3"></div>
                               <div>
                                   <div className="font-medium text-sm">회원 {pid}</div>
                                   <div className="text-xs text-gray-400">포지션: 미정</div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Helper to position players on the field roughly (top % , left %)
const getPosCoords = (pos: string) => {
    const map: Record<string, { top: string, left: string }> = {
        'GK': { top: '90%', left: '50%' },
        'CB1': { top: '75%', left: '35%' },
        'CB2': { top: '75%', left: '65%' },
        'CM': { top: '50%', left: '50%' },
        'ST': { top: '20%', left: '50%' },
    };
    return map[pos] || { top: '50%', left: '50%' };
}

export default MatchDetail;