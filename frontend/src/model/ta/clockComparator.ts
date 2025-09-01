export enum ClockComparator {
  EQ = '==',
  NEQ = '≠',
  LEQ = '≤',
  GEQ = '≥',
  LESSER = '<',
  GREATER = '>',
}

export function parseClockComparator(input: string): ClockComparator {
  switch (input) {
    case '=':
      return ClockComparator.EQ;
    case '==':
      return ClockComparator.EQ;
    case '!=':
      return ClockComparator.NEQ;
    case '≠':
      return ClockComparator.NEQ;
    case '≤':
      return ClockComparator.LEQ;
    case '<=':
      return ClockComparator.LEQ;
    case '≥':
      return ClockComparator.GEQ;
    case '>=':
      return ClockComparator.GEQ;
    case '<':
      return ClockComparator.LESSER;
    case '>':
      return ClockComparator.GREATER;
    default:
      throw Error(`parseClockComparator: input ${input} is not a valid clock comparator`);
  }
}

export function deParseClockComparator(input: ClockComparator): string {
  switch (input) {
    case ClockComparator.NEQ:
      return '!=';
    case ClockComparator.EQ:
      return '==';
    case ClockComparator.LEQ:
      return '<=';
    case ClockComparator.GEQ:
      return '>=';
    case ClockComparator.GREATER:
      return '>';
    case ClockComparator.LESSER:
      return '<';
    default:
      throw Error(`deParseClockComparator: input ${input} is not a valid clock comparator`);
  }
}
