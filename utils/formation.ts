/**
 * 포메이션 관련 유틸리티 함수
 */

export interface FormationLine {
  label: string;
  positions: string[];
}

/**
 * 포메이션별 포지션 목록 반환
 */
export const getPositionsForFormation = (formationStr: string): string[] => {
  switch (formationStr) {
    case '4-3-3':
      return [
        'GK',
        'LB',
        'CB1',
        'CB2',
        'RB',
        'CM1',
        'DM',
        'CM2',
        'LW',
        'ST',
        'RW',
      ];
    case '4-4-2':
      return ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'];
    case '3-5-2':
      return [
        'GK',
        'CB1',
        'CB2',
        'CB3',
        'LWB',
        'CM1',
        'DM',
        'CM2',
        'RWB',
        'ST1',
        'ST2',
      ];
    case '4-2-3-1':
      return [
        'GK',
        'LB',
        'CB1',
        'CB2',
        'RB',
        'DM1',
        'DM2',
        'LW',
        'CAM',
        'RW',
        'ST',
      ];
    default:
      return [];
  }
};

/**
 * 포메이션별 라인 구성 반환
 */
export const getFormationLines = (formationStr: string): FormationLine[] => {
  switch (formationStr) {
    case '4-3-3':
      return [
        { label: '공격', positions: ['LW', 'ST', 'RW'] },
        { label: '미드필더', positions: ['CM1', 'DM', 'CM2'] },
        { label: '수비', positions: ['LB', 'CB1', 'CB2', 'RB'] },
        { label: '골키퍼', positions: ['GK'] },
      ];
    case '4-4-2':
      return [
        { label: '공격', positions: ['ST1', 'ST2'] },
        { label: '미드필더', positions: ['LM', 'CM1', 'CM2', 'RM'] },
        { label: '수비', positions: ['LB', 'CB1', 'CB2', 'RB'] },
        { label: '골키퍼', positions: ['GK'] },
      ];
    case '3-5-2':
      return [
        { label: '공격', positions: ['ST1', 'ST2'] },
        { label: '미드필더', positions: ['LWB', 'CM1', 'DM', 'CM2', 'RWB'] },
        { label: '수비', positions: ['CB1', 'CB2', 'CB3'] },
        { label: '골키퍼', positions: ['GK'] },
      ];
    case '4-2-3-1':
      return [
        { label: '공격', positions: ['ST'] },
        { label: '공격형 미드필더', positions: ['LW', 'CAM', 'RW'] },
        { label: '수비형 미드필더', positions: ['DM1', 'DM2'] },
        { label: '수비', positions: ['LB', 'CB1', 'CB2', 'RB'] },
        { label: '골키퍼', positions: ['GK'] },
      ];
    default:
      return [];
  }
};
