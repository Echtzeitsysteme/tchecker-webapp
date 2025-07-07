import { SystemOptionType } from '../viewmodel/OpenedSystems';
import { createTCheckerFile } from './tckFileUtils';
import { ErrorResult, tryCatchAsync } from './tryCatchUtil';


export enum TCheckerSearchOrder {
  dfs = 'dfs',
  bfs = 'bfs',
}

export enum TCheckerReachabilityAlgorithm {
  reach = 'reach',
  concur19 = 'concur19',
  covreach = 'covreach',
}

export enum TCheckerReachabilityCertificate {
  graph = 'graph',
  symbolic = 'symbolic',
  concrete = 'concrete',
  none = 'none',
}

export enum TCheckerLivenessAlgorithm {
  couvscc = 'couvscc',
  ndfs = 'ndfs',
}

export enum TCheckerLivenessCertificate {
  graph = 'graph',
  symbolic = 'symbolic',
}

export interface TCheckerReachabilityStats {
  reachable: boolean;
  visitedStates: number;
  visitedTransitions: number;
  runningTimeSeconds: string;
}

export interface TCheckerLivenessStats {
  cycle: boolean;
  visitedStates: number;
  visitedTransitions: number;
  runningTimeSeconds: string;
}

export interface TCheckerCompareStats {
  relationshipFulfilled: boolean;
  visitedPairOfStates: number;
  runningTimeSeconds: string;
}

export class TCheckerUtils {
  private static tckSyntaxBaseUrl: string = 'http://localhost:8000/tck_syntax';
  private static tckReachBaseUrl: string = 'http://localhost:8000/tck_reach';
  private static tckLivenessBaseUrl: string = 'http://localhost:8000/tck_liveness';
  private static tckCompareBaseUrl: string = 'http://localhost:8000/tck_compare';

  public static async callGenerateDotFile(system: SystemOptionType): Promise<ErrorResult<void>> {
    const ta = await createTCheckerFile(system);
    
    
    const [response, error] = await tryCatchAsync(() => fetch(`${this.tckSyntaxBaseUrl}/to_dot`, {
        method: 'PUT',
        body: ta,
        headers: {},
      }));
    
    if (error) {
      return [undefined, error];
    }

    const data = await response!.json();

    try {
      const blob = new Blob([data]);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${system.label}.dot`;
      a.click();
      return [undefined, null];
    } catch (error) {
      console.error(error);
      return [undefined, error as Error];
    }
  }

  public static async callGenerateJsonFile(system: SystemOptionType): Promise<ErrorResult<void>> {
    const ta = await createTCheckerFile(system);
    const [response, error] = await tryCatchAsync(() => fetch(`${this.tckSyntaxBaseUrl}/to_json`, {
      method: 'PUT',
      body: ta,
      headers: {},
    }));

    if (error) {
      return [undefined, error];
    }

    const data = await response!.json();

    try {
      const blob = new Blob([data]);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${system.label}.json`;
      a.click();
      return [undefined, null];
    } catch (error) {
      console.error(error);
      return [undefined, error as Error];
    }
  }

  public static async callSyntaxCheckForSystem(system: SystemOptionType): Promise<ErrorResult<string[]>> {
    const ta = await createTCheckerFile(system);
    return await this.callSyntaxCheck(ta);
  }

  public static async callSyntaxCheck(tck: string): Promise<ErrorResult<string[]>> {
    const [response, error] = await tryCatchAsync(() =>fetch(`${this.tckSyntaxBaseUrl}/check`, {
      method: 'PUT',
      body: tck,
      headers: {},
    }));

    if (error) {
      return [null, error];
    }

    if (!response!.ok) {
      const errorText = await response!.text();
      return [null, new Error(`Syntax check failed: ${errorText}`)];
    }

    const responseString = await response!.json();

    const syntaxErrors = responseString
      .split('\n')
      .filter(
        (line: string) =>
          line.trim() !== '' &&
          !line.toLocaleLowerCase().includes('warning') &&
          !line.toLocaleLowerCase().includes('error(s)')
      );

    return [syntaxErrors, null];
  }

  public static async callCreateSynchronizedProduct(system: SystemOptionType): Promise<ErrorResult<any>> {
    const ta = await createTCheckerFile(system);
    const body = {
      ta: ta,
      process_name: system.label,
    };

    const [response, error] = await tryCatchAsync(() => fetch(`${this.tckSyntaxBaseUrl}/create_synchronized_product`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }));

    if (error) {
      return [null, error];
    }

    if (!response!.ok) {
      const errorText = await response!.text();
      return [null, new Error(`Product automaton creation failed: ${errorText}`)];
    }

    const productAutomaton = await response!.json();

    return [productAutomaton, null];
  }

  public static async callReachabilityAnalysis(
    system: SystemOptionType,
    algorithm: TCheckerReachabilityAlgorithm,
    searchOrder: TCheckerSearchOrder,
    certificate: TCheckerReachabilityCertificate,
    labels: string[],
    blockSize: number | null,
    tableSize: number | null,
    abortSignal?: AbortSignal
  ): Promise<ErrorResult<{
    stats: TCheckerReachabilityStats;
    certificate: string;
  }>> {
    const ta = await createTCheckerFile(system);

    // Pass enums as indices

    const algorithmIndex = Object.values(TCheckerReachabilityAlgorithm).indexOf(algorithm);
    const searchOrderIndex = Object.values(TCheckerSearchOrder).indexOf(searchOrder);
    const certificateIndex = Object.values(TCheckerReachabilityCertificate).indexOf(certificate);

    const body = {
      ta: ta,
      algorithm: algorithmIndex,
      search_order: searchOrderIndex,
      certificate: certificateIndex,
      labels: labels.join(','),
      block_size: blockSize,
      table_size: tableSize,
    };

    const [response, error] = await tryCatchAsync(() => fetch(`${this.tckReachBaseUrl}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortSignal,
    }));

    if (error) {
      return [null, error];
    }

    if (!response!.ok) {
      const errorText = await response!.text();
      return [null, new Error(`Reachability analysis failed: ${errorText}`)];
    }

    const responseJson = (await response!.json()) as { stats: string; certificate: string };

    return [{
      stats: parseReachabilityStats(responseJson.stats),
      certificate: responseJson.certificate,
    }, null];
  }

  public static async callLivenessAnalysis(
    system: SystemOptionType,
    algorithm: TCheckerLivenessAlgorithm,
    searchOrder: TCheckerSearchOrder,
    certificate: TCheckerLivenessCertificate,
    labels: string[],
    blockSize: number | null,
    tableSize: number | null,
    abortSignal?: AbortSignal
  ): Promise<ErrorResult<{
    stats: TCheckerLivenessStats;
    certificate: string;
  }>> {
    const ta = await createTCheckerFile(system);

    // Pass enums as indices
    const algorithmIndex = Object.values(TCheckerLivenessAlgorithm).indexOf(algorithm);
    const searchOrderIndex = Object.values(TCheckerSearchOrder).indexOf(searchOrder);
    const certificateIndex = Object.values(TCheckerLivenessCertificate).indexOf(certificate);

    const body = {
      ta: ta,
      algorithm: algorithmIndex,
      search_order: searchOrderIndex,
      certificate: certificateIndex,
      labels: labels.join(','),
      block_size: blockSize,
      table_size: tableSize,
    };

    const [response, error] = await tryCatchAsync(() =>fetch(`${this.tckLivenessBaseUrl}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortSignal,
    }));

    if (error) {
      return [null, error];
    }

    if (!response!.ok) {
      const errorText = await response!.text();
      return [null, new Error(`Liveness analysis failed: ${errorText}`)];
    }

    const responseJson = (await response!.json()) as { stats: string; certificate: string };

    return [{
      stats: parseLivenessStats(responseJson.stats),
      certificate: responseJson.certificate,
    }, null];
  }

  public static async callCompareAnalysis(
    firstSystem: SystemOptionType,
    secondSystem: SystemOptionType,
    blockSize: number | null,
    tableSize: number | null,
    abortSignal?: AbortSignal
  ): Promise<ErrorResult<{
    stats: TCheckerCompareStats;
    certificate: string;
  }>> {
    const firstTa = await createTCheckerFile(firstSystem);
    const secondTa = await createTCheckerFile(secondSystem);

    const body = {
      first_ta: firstTa,
      second_ta: secondTa,
      block_size: blockSize,
      table_size: tableSize,
      relationship: 0
    };

    const [response, error] = await tryCatchAsync(() => fetch(`${this.tckCompareBaseUrl}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortSignal,
    }));

    if (error) {
      return [null, error];
    }

    if (!response!.ok) {
      const errorText = await response!.text();
      return [null, new Error(`Comparison analysis failed: ${errorText}`)];
    }

    const responseJson = (await response!.json()) as { stats: string; certificate: string };

    return [{
      stats: parseCompareStats(responseJson.stats),
      certificate: responseJson.certificate,
    }, null];
  }
}

function parseReachabilityStats(stats: string): TCheckerReachabilityStats {
  const lines = stats.split('\n');
  const reachable = lines[1].split(' ')[1] === 'true';
  const runningTimeSeconds = lines[2].split(' ')[1];
  const visitedStates = parseInt(lines[3].split(' ')[1], 10);
  const visitedTransitions = parseInt(lines[4].split(' ')[1], 10);
  
  return {
    reachable,
    visitedStates,
    visitedTransitions,
    runningTimeSeconds,
  };
}

function parseLivenessStats(stats: string): TCheckerLivenessStats {
  const lines = stats.split('\n');
  const cycle = lines[1].split(' ')[1] === 'true';
  const runningTimeSeconds = lines[2].split(' ')[1];
  const visitedStates = parseInt(lines[3].split(' ')[1], 10);
  const visitedTransitions = parseInt(lines[4].split(' ')[1], 10);
  
  return {
    cycle,
    visitedStates,
    visitedTransitions,
    runningTimeSeconds,
  };
}

function parseCompareStats(stats: string): TCheckerCompareStats {
  const lines = stats.split('\n');
  const relationshipFulfilled = lines[1].split(' ')[1] === 'true';
  const runningTimeSeconds = lines[2].split(' ')[1];
  const visitedPairOfStates = parseInt(lines[3].split(' ')[1], 10);
  return {
    relationshipFulfilled,
    visitedPairOfStates,
    runningTimeSeconds,
  };
}
