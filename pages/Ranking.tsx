import React, { useEffect, useState } from 'react';
import { UserRankingItem, User } from '../types';
import { api } from '../services/api';
import { Trophy } from 'lucide-react';

interface RankingProps {
  user: User;
}

type SortType = 'goals' | 'assists' | 'matchesPlayed';

const Ranking: React.FC<RankingProps> = ({ user }) => {
  const [rankings, setRankings] = useState<UserRankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // 학번별(Year) 그룹핑 및 정렬
  const groupedRankings = React.useMemo(() => {
    const groups: Record<string, UserRankingItem[]> = {};
    rankings.forEach((item) => {
      const year = item.user.id.substring(2, 4);
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });

    // 학번 오름차순 정렬 (예: 22, 23, 24)
    const sortedYears = Object.keys(groups).sort(
      (a, b) => Number(a) - Number(b)
    );

    // 각 학번 내에서는 경기 수 내림차순 -> 이름 가나다순으로 정렬
    sortedYears.forEach((year) => {
      groups[year].sort((a, b) => {
        if (b.matchesPlayed === a.matchesPlayed) {
          return a.user.name.localeCompare(b.user.name);
        }
        return b.matchesPlayed - a.matchesPlayed;
      });
    });

    return { groups, sortedYears };
  }, [rankings]);

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
      <div className="flex items-center justify-between mb-5">
        <div className="bg-[#edf2fa] px-3 py-1.5 rounded-full flex items-center">
          <span className="font-bold text-[14px] text-[#2f55e6] tracking-tight whitespace-nowrap">
            {title}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#fff6d6] flex items-center justify-center flex-shrink-0">
          <Trophy size={16} className="text-[#ffbc00]" />
        </div>
      </div>

      <div className="flex flex-col space-y-4 relative min-h-[160px]">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] font-medium text-gray-400">
            기록이 없습니다
          </div>
        ) : (
          data.slice(0, 3).map((item, index) => (
            <div key={item.user.id || index} className="flex items-center">
              <img
                src={item.user.avatarUrl}
                alt={item.user.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white object-cover mr-2 sm:mr-4 shadow-sm flex-shrink-0"
              />
              <div className="flex-1 min-w-0 pr-1 sm:pr-2">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <h4
                    className="flex items-center text-[15px] sm:text-[16px] font-bold text-gray-900 max-w-[100px] sm:max-w-[150px]"
                    title={item.user.shortName || item.user.name}
                  >
                    <span className="truncate">
                      {item.user.shortName || item.user.name}
                    </span>
                  </h4>
                </div>
                <div className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5 flex items-center shrink-0 min-w-0">
                  {item.user.shortName && (
                    <>
                      <span className="truncate font-medium text-gray-600">
                        {item.user.name}
                      </span>
                      <span className="mx-1 sm:mx-1.5 text-gray-300">·</span>
                    </>
                  )}
                  <span className="truncate">
                    {item.user.id.substring(2, 4)}학번
                  </span>
                  <span className="mx-1 sm:mx-1.5 text-gray-300">·</span>
                  <span className="font-medium text-gray-600 truncate">
                    {item.user.position || '미지정'}
                  </span>
                </div>
              </div>
              <div className="font-bold text-[18px] sm:text-[20px] text-[#2f55e6] flex-shrink-0 flex items-baseline">
                {item[type]}
                <span className="text-[14px] sm:text-[15px] font-bold text-gray-600 ml-[1px] mb-[1px]">
                  {unit}
                </span>
              </div>
            </div>
          ))
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
            title="개근상"
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

        <div className="space-y-6 sm:space-y-8 mt-4">
          {groupedRankings.sortedYears.map((year) => (
            <div key={year} className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-3 px-2">
                <h3 className="font-bold text-[16px] sm:text-[17px] text-[#8b95a1] flex-shrink-0 tracking-tight">
                  {year}학번
                </h3>
                <div className="h-[1px] bg-gray-100 flex-1"></div>
              </div>
              <div className="space-y-2">
                {groupedRankings.groups[year].map((item) => {
                  const isMe = item.user.id === user.id;
                  return (
                    <div
                      key={item.user.id}
                      className={`flex items-center p-2 sm:p-3 rounded-2xl transition-colors ${
                        isMe
                          ? 'bg-[#f4fbf7] outline outline-1 outline-[#00a550]/20'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <img
                        src={item.user.avatarUrl}
                        alt={item.user.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white object-cover mr-3 sm:mr-4 shadow-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 pr-1 sm:pr-2">
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                          <h4
                            className="flex items-center text-[15px] sm:text-[16px] font-bold text-gray-900 max-w-[100px] sm:max-w-[150px]"
                            title={item.user.shortName || item.user.name}
                          >
                            <span className="truncate">
                              {item.user.shortName || item.user.name}
                            </span>
                          </h4>
                          {isMe && (
                            <span className="text-[10px] font-bold bg-[#00a550] text-white px-1.5 py-0.5 rounded-sm flex-shrink-0">
                              나
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5 flex items-center shrink-0 min-w-0">
                          {item.user.shortName && (
                            <>
                              <span className="truncate font-medium text-gray-600">
                                {item.user.name}
                              </span>
                              <span className="mx-1 sm:mx-1.5 text-gray-300">
                                ·
                              </span>
                            </>
                          )}
                          <span className="font-medium text-gray-600 truncate">
                            {item.user.position || '미지정'}
                          </span>
                        </div>
                        <div className="text-[13px] text-gray-500 mt-1 flex items-center space-x-3">
                          <span className="flex items-center font-medium">
                            <span className="mr-1 text-[12px] opacity-80 filter grayscale">
                              ⚽️
                            </span>{' '}
                            {item.goals}골
                          </span>
                          <span className="flex items-center font-medium">
                            <span className="mr-1 text-[12px] opacity-80 filter grayscale">
                              🤝
                            </span>{' '}
                            {item.assists}도움
                          </span>
                        </div>
                      </div>

                      <div className="font-bold text-[15px] sm:text-[16px] text-[#8b95a1] flex-shrink-0 text-right">
                        {item.matchesPlayed}경기
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ranking;
