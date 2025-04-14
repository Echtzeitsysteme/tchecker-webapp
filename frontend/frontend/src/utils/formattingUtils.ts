import { useCallback } from 'react';
import { ClockConstraint } from '../model/ta/clockConstraint';
import { Clock } from '../model/ta/clock';
import { Switch } from '../model/ta/switch';
import { Location } from '../model/ta/location';
import { SwitchStatement } from '../model/ta/switchStatement.ts';
import {Sync} from "../model/ta/sync.ts";

export interface FormattingUtils {
  formatClockConstraint: (clockConstraint?: ClockConstraint, clauseJoinStr?: string) => string | undefined;
  formatLabels: (labels?: string[], labelJoinStr?: string) =>  string | undefined;
  formatReset: (clocks?: Clock[]) => string | undefined;
  formatStatement: (statement: SwitchStatement) => string | undefined;
  formatLocationLabelTable: (location: Location) => string;
  formatLocationLabelVisual: (location: Location) => string;
  formatSwitchTable: (sw: Switch) => string;
  formatSwitchLabelVisual: (sw: Switch) => string;
  formatSyncTable: (syncs: Sync[]) =>  string;
}

export function useFormattingUtils(): FormattingUtils {
  const formatClockConstraint = useCallback((clockConstraint?: ClockConstraint, clauseJoinStr: string = ' ∧ ') => {
    const cc = clockConstraint;
    if (!cc || (!cc.clauses && !cc.freeClauses) || (cc.clauses.length === 0 && cc.freeClauses.length === 0)) {
      return undefined;
    }
    let clauses = '';
    let freeClauses = '';
    if (cc.clauses) {
      if (cc.clauses.length !== 0) {
        clauses = cc.clauses.map((c) => `${c.lhs.name} ${c.op} ${c.rhs}`).join(clauseJoinStr);
        if (cc.freeClauses && cc.freeClauses.length !== 0) {
          clauses += clauseJoinStr;
        }
      }
    }
    if (cc.freeClauses && cc.freeClauses.length !== 0) {
      freeClauses = cc.freeClauses.map((c) => `${c.term}`).join(clauseJoinStr);
    }
    return clauses + freeClauses;
  }, []);

  const formatUrgent = useCallback((urgent?: boolean) =>{
    if(!urgent){
      return undefined;
    }
    return "urgent";
  }, []);

  const formatCommitted = useCallback((committed?: boolean) =>{
    if(!committed){
      return undefined;
    }
    return "committed";
  }, []);

  const formatLabels = useCallback((labels?: string[], labelJoinStr: string= ', ') => {
    if(!labels || labels.length === 0){
      return undefined;
    }
    let labelStr: string = 'labels: [';
    labelStr += labels.map((label) => label).join(labelJoinStr);
    labelStr += ']'
    return labelStr;
  }, []);

  const formatReset = useCallback((clocks?: Clock[], compact: boolean = false) => {
    if (!clocks || clocks.length === 0) {
      return undefined;
    }
    if (compact) {
      return `{${clocks.map((c) => c.name).join(',')}}`;
    }
    return `{ ${clocks.map((c) => c.name).join(', ')} }`;
  }, []);

  const formatStatement = useCallback((statement?: SwitchStatement, clauseJoinStr: string = '; ') => {
    const stmt = statement;
    if (!stmt || !stmt.statements || stmt.statements.length === 0) {
      return undefined;
    }
    let formattedStatements = '';
    if (stmt.statements && stmt.statements.length !== 0) {
      formattedStatements = stmt.statements.map((c) => `${c.term}`).join(clauseJoinStr);
    }
    return formattedStatements;
  }, []);

  const formatLocationLabelTable = useCallback(
    (location: Location) => {
      const invariant = formatClockConstraint(location.invariant);
      const committed = formatCommitted(location.committed);
      const urgent = formatUrgent(location.urgent);
      const labels = formatLabels(location.labels);
      return [location.name, invariant, committed, urgent, labels].filter((e) => e !== undefined).join(', ');
    },
    [formatClockConstraint, formatCommitted, formatLabels, formatUrgent]
  );

  const formatLocationLabelVisual = useCallback(
    (location: Location) => {
      const invariant = formatClockConstraint(location.invariant);
      const urgent = formatUrgent(location.urgent);
      const committed = formatCommitted(location.committed);
      const labels = formatLabels(location.labels);
      //return invariant ? `${location.name}\n${invariant}` : location.name;
      return [location.name, invariant, committed, urgent, labels].filter((e) => e !== undefined).join('\n');
    },
    [formatClockConstraint, formatCommitted, formatLabels, formatUrgent]
  );

  const formatSwitchTable = useCallback(
    (sw: Switch) => {
      const guard = formatClockConstraint(sw.guard);
      const reset = formatReset(sw.reset, true);
      const statement = formatStatement(sw.statement);
      return [sw.source.name, sw.actionLabel, guard, reset, statement, sw.target.name]
        .filter((e) => e !== undefined)
        .join(', ');
    },
    [formatClockConstraint, formatReset, formatStatement]
  );

  const formatSwitchLabelVisual = useCallback(
    (sw: Switch) => {
      const guard = formatClockConstraint(sw.guard, ' ∧\n');
      const reset = formatReset(sw.reset);
      const statement = formatStatement(sw.statement);
      return [sw.actionLabel, guard, reset, statement].filter((e) => e !== undefined).join('\n');
    },
    [formatClockConstraint, formatReset, formatStatement]
  );

  const formatSyncTable = useCallback( (syncs: Sync[]) => {
    if(!syncs || syncs.length === 0){
      return '';
    }
    let first = true;
    let formattedSync = '<'
    syncs.forEach((sync) => {
      if(!first){
        formattedSync += ', ';
      }
      else{
        first = false;
      }
      formattedSync += sync.process + '@' + sync.event;
      if(sync.weakSynchronisation){
        formattedSync += '?';
      }
    });
    formattedSync += '>';

    return formattedSync;
      }, []
  );



  return {
    formatClockConstraint: formatClockConstraint,
    formatLabels: formatLabels,
    formatReset: formatReset,
    formatStatement: formatStatement,
    formatLocationLabelTable: formatLocationLabelTable,
    formatLocationLabelVisual: formatLocationLabelVisual,
    formatSwitchTable: formatSwitchTable,
    formatSwitchLabelVisual: formatSwitchLabelVisual,
    formatSyncTable: formatSyncTable,
  };
}
