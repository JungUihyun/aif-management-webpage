import React, { useEffect, useState } from 'react';
import { UserRankingItem, User } from '../types';
import { api } from '../services/api';
import { Trophy, Hash } from 'lucide-react';

interface RankingProps {
  user: User;
}

type SortType = 'goals' | 'assists' | 'matchesPlayed';

const Ranking: React.FC<RankingProps> = ({ user }) => {
  const [rankings, setRankings] = useState<UserRankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortType, setSortType] = useState<SortType>('goals');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true);
        const data = await api.getUserRankings();
        setRankings(data);
      } catch (error) {
        console.error('랭킹 데이터 로딩 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, []);

  // Top 3 계산 헬퍼
  const getTop3 = (type: SortType) => {
    return [...rankings]
      .filter((r) => r[type] > 0) // 실적이 0인 사람은 순위권에서 제외
      .sort((a, b) => {
        if (b[type] === a[type]) {
          // 동률 시 출전수나 이름 순 등으로 추가 정렬 가능
          return a.user.name.localeCompare(b.user.name);
        }
        return b[type] - a[type];
      })
      .slice(0, 3);
  };

  const topScorers = getTop3('goals');
  const topAssisters = getTop3('assists');
  const topPlayers = getTop3('matchesPlayed');

  // 전체 리스트 정렬
  const sortedRankings = [...rankings].sort((a, b) => {
    if (b[sortType] === a[sortType]) {
      return a.user.name.localeCompare(b.user.name);
    }
    return b[sortType] - a[sortType];
  });

  const PodiumWidget = ({
    title,
    data,
    type,
    unit,
  }: {
    title: string;
    data: UserRankingItem[];
    type: SortType;
    unit: string;
  }) => (
    <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex-shrink-0 w-[280px] snap-center">
      <div className="flex items-center space-x-2 mb-5">
        <Trophy size={18} className="text-[#00a550]" />
        <h3 className="font-bold text-[17px] text-gray-900 tracking-tight">
          {title}
        </h3>
      </div>
      <div className="flex bg-gray-50/50 rounded-2xl pt-6 pb-2 px-2 h-[160px] relative items-end justify-center gap-2">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] font-medium text-gray-400">
            기록이 없습니다
          </div>
        ) : (
          <>
            {/* 2위 */}
            {data[1] && (
              <div className="flex flex-col items-center w-1/3">
                <div className="relative flex justify-center w-full">
                  <div className="absolute -top-3 bg-gray-200 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10 whitespace-nowrap">
                    2위
                  </div>
                  <img
                    src={data[1].user.avatarUrl}
                    alt={data[1].user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm bg-white"
                  />
                </div>
                <div className="mt-2 text-[12px] font-bold text-gray-800 line-clamp-1">
                  {data[1].user.shortName || data[1].user.name}
                </div>
                <div className="text-[14px] font-bold text-[#00a550] mt-0.5">
                  {data[1][type]}
                  {unit}
                </div>
                <div className="w-full h-12 bg-gray-200/50 rounded-t-xl mt-2 flex items-end justify-center pb-2"></div>
              </div>
            )}

            {/* 1위 */}
            {data[0] && (
              <div className="flex flex-col items-center justify-end w-1/3 -mt-6">
                <div className="relative flex justify-center w-full">
                  <div className="absolute -top-4 text-2xl z-10 filter drop-shadow-sm whitespace-nowrap">
                    👑
                  </div>
                  <img
                    src={data[0].user.avatarUrl}
                    alt={data[0].user.name}
                    className="w-14 h-14 rounded-full object-cover border-[3px] border-[#00a550] shadow-md relative z-0 bg-white"
                  />
                </div>
                <div className="mt-2 text-[13px] font-bold text-gray-900 line-clamp-1">
                  {data[0].user.shortName || data[0].user.name}
                </div>
                <div className="text-[16px] font-extrabold text-[#00a550] mt-0.5">
                  {data[0][type]}
                  {unit}
                </div>
                <div className="w-full h-16 bg-[#e8f3ee] rounded-t-xl mt-2 flex items-end justify-center pb-2"></div>
              </div>
            )}

            {/* 3위 */}
            {data[2] && (
              <div className="flex flex-col items-center w-1/3">
                <div className="relative flex justify-center w-full">
                  <div className="absolute -top-3 bg-[#cd7f32] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10 whitespace-nowrap">
                    3위
                  </div>
                  <img
                    src={data[2].user.avatarUrl}
                    alt={data[2].user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm bg-white"
                  />
                </div>
                <div className="mt-2 text-[12px] font-bold text-gray-800 line-clamp-1">
                  {data[2].user.shortName || data[2].user.name}
                </div>
                <div className="text-[13px] font-bold text-[#00a550] mt-0.5">
                  {data[2][type]}
                  {unit}
                </div>
                <div className="w-full h-8 bg-gray-200/40 rounded-t-xl mt-2 flex items-end justify-center pb-2"></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="pt-2 px-2">
        <h1 className="text-[26px] leading-[1.35] font-bold text-gray-900 tracking-tight mb-1">
          올 시즌 랭킹
        </h1>
        <p className="text-gray-500 text-[15px] font-medium mt-1">
          가장 돋보이는 선수를 확인해보세요.
        </p>
      </div>

      {/* 명예의 전당 (가로 스크롤 위젯) */}
      <div className="pb-2">
        <div className="flex overflow-x-auto space-x-4 px-2 pb-4 snap-x snap-mandatory no-scrollbar -mx-2">
          <PodiumWidget
            title="득점왕"
            data={topScorers}
            type="goals"
            unit="골"
          />
          <PodiumWidget
            title="도움왕"
            data={topAssisters}
            type="assists"
            unit="어시"
          />
          <PodiumWidget
            title="출전왕"
            data={topPlayers}
            type="matchesPlayed"
            unit="경기"
          />
        </div>
      </div>

      {/* 전체 멤버 리스트 */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-[19px] text-gray-900 tracking-tight">
            전체 멤버 리스트
          </h2>
        </div>

        {/* 필터 칩 */}
        <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
          {(['goals', 'assists', 'matchesPlayed'] as SortType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSortType(type)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${
                sortType === type
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {type === 'goals'
                ? '득점순'
                : type === 'assists'
                  ? '도움순'
                  : '출전순'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {sortedRankings.map((item, index) => {
            const isMe = item.user.id === user.id;
            return (
              <div
                key={item.user.id}
                className={`flex items-center p-2 sm:p-3 rounded-2xl transition-colors ${isMe ? 'bg-[#f4fbf7] outline outline-1 outline-[#00a550]/20' : 'hover:bg-gray-50'}`}
              >
                <div className="font-bold text-[14px] sm:text-[15px] w-5 sm:w-6 text-center text-gray-400 mr-1 sm:mr-2 flex-shrink-0">
                  {index + 1}
                </div>
                <img
                  src={item.user.avatarUrl}
                  alt={item.user.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white object-cover mr-2 sm:mr-4 shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0 pr-1 sm:pr-2">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <h4 className="text-[15px] sm:text-[16px] font-bold text-gray-900 truncate">
                      {item.user.name}
                    </h4>
                    {isMe && (
                      <span className="text-[10px] font-bold bg-[#00a550] text-white px-1.5 py-0.5 rounded-sm flex-shrink-0">
                        나
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5 flex items-center shrink-0 min-w-0">
                    {/* <Hash size={12} className="mr-0.5 shrink-0" /> */}
                    <span className="truncate">
                      {item.user.id.substring(2, 4)}학번
                    </span>
                    <span className="mx-1 sm:mx-1.5 text-gray-300">·</span>
                    <span className="font-medium text-gray-600 truncate">
                      {item.user.position || '미지정'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4 text-right flex-shrink-0">
                  <div
                    className={`flex flex-col items-center w-8 sm:w-10 ${sortType === 'goals' ? 'opacity-100 font-bold' : 'opacity-40 font-medium'}`}
                  >
                    <span className="text-[10px] text-gray-500 mb-0.5">골</span>
                    <span
                      className={`text-[14px] sm:text-[15px] ${sortType === 'goals' ? 'text-[#00a550]' : 'text-gray-900'}`}
                    >
                      {item.goals}
                    </span>
                  </div>
                  <div
                    className={`flex flex-col items-center w-8 sm:w-10 ${sortType === 'assists' ? 'opacity-100 font-bold' : 'opacity-40 font-medium'}`}
                  >
                    <span className="text-[10px] text-gray-500 mb-0.5">
                      도움
                    </span>
                    <span
                      className={`text-[14px] sm:text-[15px] ${sortType === 'assists' ? 'text-[#00a550]' : 'text-gray-900'}`}
                    >
                      {item.assists}
                    </span>
                  </div>
                  <div
                    className={`flex flex-col items-center w-9 sm:w-12 ${sortType === 'matchesPlayed' ? 'opacity-100 font-bold' : 'opacity-40 font-medium'}`}
                  >
                    <span className="text-[10px] text-gray-500 mb-0.5">
                      출전
                    </span>
                    <span
                      className={`text-[14px] sm:text-[15px] ${sortType === 'matchesPlayed' ? 'text-[#00a550]' : 'text-gray-900'}`}
                    >
                      {item.matchesPlayed}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Ranking;
