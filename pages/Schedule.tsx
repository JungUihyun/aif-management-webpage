import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { Match, MatchStatus } from '../types';
import { api } from '../services/mockData';

const Schedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState<Match[]>([]);
  const [view, setView] = useState<'month' | 'list'>('list');

  useEffect(() => {
    api.getMatches().then(setMatches);
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const filteredMatches = matches.filter(m => {
    const matchDate = new Date(m.date);
    return matchDate.getMonth() === currentDate.getMonth() && matchDate.getFullYear() === currentDate.getFullYear();
  });

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.UPCOMING: return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">예정</span>;
      case MatchStatus.COMPLETED: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">종료</span>;
      case MatchStatus.CANCELLED: return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">취소</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
           <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
           <h2 className="text-xl font-bold text-gray-800">
             {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
           </h2>
           <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('list')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
          >
            리스트
          </button>
          <button 
            onClick={() => setView('month')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'month' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
          >
            달력
          </button>
        </div>
      </div>

      {view === 'list' && (
        <div className="space-y-3">
            {filteredMatches.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
                    이 달의 경기 일정이 없습니다.
                </div>
            )}
            {filteredMatches.map(match => (
            <Link key={match.id} to={`/match/${match.id}`} className="block">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-primary transition-all group">
                <div className="flex justify-between items-start">
                   <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-center bg-gray-50 p-2 rounded-lg min-w-[60px]">
                         <span className="text-xs text-gray-500">{match.date.split('-')[1]}월</span>
                         <span className="text-xl font-bold text-gray-800">{match.date.split('-')[2]}</span>
                      </div>
                      <div>
                         <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">vs {match.opponent}</h3>
                         <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                            <span className="flex items-center"><Clock size={14} className="mr-1"/> {match.time}</span>
                            <span className="flex items-center"><MapPin size={14} className="mr-1"/> {match.location}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col items-end space-y-2">
                       {getStatusBadge(match.status)}
                       <span className="text-xs text-gray-400">{match.participants.length}명 참여</span>
                   </div>
                </div>
              </div>
            </Link>
            ))}
        </div>
      )}

      {/* Simplified Calendar View */}
      {view === 'month' && (
         <div className="bg-white rounded-xl shadow-sm p-4 overflow-x-auto">
             <div className="grid grid-cols-7 gap-1 min-w-[600px]">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                    <div key={d} className="text-center text-sm font-bold text-gray-500 py-2">{d}</div>
                ))}
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg"></div>
                ))}
                {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayMatches = matches.filter(m => m.date === dateStr);
                    return (
                        <div key={day} className="h-24 border border-gray-100 rounded-lg p-2 relative hover:bg-gray-50">
                            <span className="text-sm font-semibold text-gray-700">{day}</span>
                            <div className="mt-1 space-y-1">
                                {dayMatches.map(m => (
                                    <Link key={m.id} to={`/match/${m.id}`} className="block text-[10px] bg-green-100 text-green-800 px-1 py-0.5 rounded truncate">
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
    </div>
  );
};

export default Schedule;