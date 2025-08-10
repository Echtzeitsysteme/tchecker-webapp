import { SystemOptionType } from '../viewmodel/OpenedSystems';
import { RawSimulationState } from '../viewmodel/SimulationModel';
import { getAppConfig } from './appConfigUtils';
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

enum TCheckerExecutables {
  TckSyntax = 'TckSyntax',
  TckReach = 'TckReach',
  TckLiveness = 'TckLiveness',
  TckCompare = 'TckCompare',
  TckSimulate = 'TckSimulate',
}


export class TCheckerUtils {


  private static async getUrlForExecutable(executable: TCheckerExecutables): Promise<string> {
    const baseUrl = (await getAppConfig()).backend.url;

    const executableUrls: Record<TCheckerExecutables, string> = {
      [TCheckerExecutables.TckSyntax]: `${baseUrl}/tck_syntax`,
      [TCheckerExecutables.TckReach]: `${baseUrl}/tck_reach`,
      [TCheckerExecutables.TckLiveness]: `${baseUrl}/tck_liveness`,
      [TCheckerExecutables.TckCompare]: `${baseUrl}/tck_compare`,
      [TCheckerExecutables.TckSimulate]: `${baseUrl}/tck_simulate`,
    };

    return executableUrls[executable];
  }
  
  public static async callGenerateDotFile(system: SystemOptionType): Promise<ErrorResult<void>> {
    const sysdecl = await createTCheckerFile(system);
    const url = `${await this.getUrlForExecutable(TCheckerExecutables.TckSyntax)}/to_dot`;
    
    
    const [response, error] = await tryCatchAsync(() => fetch(url, {
        method: 'PUT',
        body: sysdecl,
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
    const sysdecl = await createTCheckerFile(system);
    const url = `${await this.getUrlForExecutable(TCheckerExecutables.TckSyntax)}/to_json`;

    const [response, error] = await tryCatchAsync(() => fetch(url, {
      method: 'PUT',
      body: sysdecl,
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

  public static async callSyntaxCheckForSystem(system: SystemOptionType): Promise<ErrorResult<{success: boolean, messages: string[]}>> {
    const sysdecl = await createTCheckerFile(system);
    return await this.callSyntaxCheck(sysdecl);
  }

  public static async callSyntaxCheck(ta: string): Promise<ErrorResult<{success: boolean, messages: string[]}>> {
    const url = `${await this.getUrlForExecutable(TCheckerExecutables.TckSyntax)}/check`;
    
    const [response, error] = await tryCatchAsync(() =>fetch(url, {
      method: 'PUT',
      body: ta,
      headers: {},
    }));

    if (error) {
      return [null, error];
    }

    if (!response!.ok) {
      const errorText = await response!.text();
      return [null, new Error(`Syntax check failed: ${errorText}`)];
    }

    const responseObj = await response!.json() as {status: string, message: string};

    const parsedMessages = responseObj.message
      .split('\n')
      .filter(
        (line: string) =>
          line.trim() !== '' &&
          !line.toLocaleLowerCase().includes('warning') &&
          !line.toLocaleLowerCase().includes('error(s)')
      );

    const success = responseObj.status === 'success';

    return [{success: success, messages: parsedMessages}, null];
  }

  public static async callCreateSynchronizedProduct(system: SystemOptionType): Promise<ErrorResult<any>> {
    const sysdecl = await createTCheckerFile(system);
    const url = `${await this.getUrlForExecutable(TCheckerExecutables.TckSyntax)}/create_synchronized_product`;

    const body = {
      sysdecl: sysdecl,
      process_name: system.label,
    };

    const [response, error] = await tryCatchAsync(() => fetch(url, {
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
    const sysdecl = await createTCheckerFile(system);
    const url = await this.getUrlForExecutable(TCheckerExecutables.TckReach);

    // Pass enums as indices

    const algorithmIndex = Object.values(TCheckerReachabilityAlgorithm).indexOf(algorithm);
    const searchOrderIndex = Object.values(TCheckerSearchOrder).indexOf(searchOrder);
    const certificateIndex = Object.values(TCheckerReachabilityCertificate).indexOf(certificate);

    const body = {
      sysdecl: sysdecl,
      algorithm: algorithmIndex,
      search_order: searchOrderIndex,
      certificate: certificateIndex,
      labels: labels.join(','),
      block_size: blockSize,
      table_size: tableSize,
    };

    const [response, error] = await tryCatchAsync(() => fetch(url, {
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
    const sysdecl = await createTCheckerFile(system);
    const url = await this.getUrlForExecutable(TCheckerExecutables.TckLiveness);

    // Pass enums as indices
    const algorithmIndex = Object.values(TCheckerLivenessAlgorithm).indexOf(algorithm);
    const searchOrderIndex = Object.values(TCheckerSearchOrder).indexOf(searchOrder);
    const certificateIndex = Object.values(TCheckerLivenessCertificate).indexOf(certificate);

    const body = {
      sysdecl: sysdecl,
      algorithm: algorithmIndex,
      search_order: searchOrderIndex,
      certificate: certificateIndex,
      labels: labels.join(','),
      block_size: blockSize,
      table_size: tableSize,
    };

    const [response, error] = await tryCatchAsync(() =>fetch(url, {
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
    const firstSysdecl = await createTCheckerFile(firstSystem);
    const secondSysdecl = await createTCheckerFile(secondSystem);
    const url = await this.getUrlForExecutable(TCheckerExecutables.TckCompare);

    const body = {
      first_sysdecl: firstSysdecl,
      second_sysdecl: secondSysdecl,
      block_size: blockSize,
      table_size: tableSize,
      relationship: 0
    };
    
    const [response, error] = await tryCatchAsync(() => fetch(url, {
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

  public static async callSimulate(system: SystemOptionType, startingState: RawSimulationState): Promise<ErrorResult<string>> {
    const sysdecl = await createTCheckerFile(system);
    const url = `${await this.getUrlForExecutable(TCheckerExecutables.TckSimulate)}/simulate`;

    const body = {
      sysdecl: sysdecl,
      starting_state: startingState ? JSON.stringify(startingState) : null,
    };

    const [response, error] = await tryCatchAsync(() => fetch(url, {
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
      return [null, new Error(`Simulation failed: ${errorText}`)];
    }

    const simulationResult = await response!.text();
    return [simulationResult, null];
  }
}

function parseReachabilityStats(stats: string): TCheckerReachabilityStats {
  const parsedStats = parseTCheckerStats(stats);

  const reachable = parsedStats['REACHABLE'] === 'true';
  const runningTimeSeconds = parsedStats['RUNNING_TIME_SECONDS'] || '0';
  const visitedStates = parseInt(parsedStats['VISITED_STATES'] || '0', 10);
  const visitedTransitions = parseInt(parsedStats['VISITED_TRANSITIONS'] || '0', 10);

  return {
    reachable,
    visitedStates,
    visitedTransitions,
    runningTimeSeconds,
  };
}

function parseLivenessStats(stats: string): TCheckerLivenessStats {
  const parsedStats = parseTCheckerStats(stats);
  const cycle = parsedStats['CYCLE'] === 'true';
  const runningTimeSeconds = parsedStats['RUNNING_TIME_SECONDS'] || '0';
  const visitedStates = parseInt(parsedStats['VISITED_STATES'] || '0', 10);
  const visitedTransitions = parseInt(parsedStats['VISITED_TRANSITIONS'] || '0', 10);
  
  return {
    cycle,
    visitedStates,
    visitedTransitions,
    runningTimeSeconds,
  };
}

function parseCompareStats(stats: string): TCheckerCompareStats {
  const parsedStats = parseTCheckerStats(stats);

  
  const relationshipFulfilled = parsedStats['RELATIONSHIP_FULFILLED'] === 'true';
  const runningTimeSeconds = parsedStats['RUNNING_TIME_SECONDS'] || '0';
  const visitedPairOfStates = parseInt(parsedStats['VISITED_PAIR_OF_STATES'] || '0', 10);
  return {
    relationshipFulfilled,
    visitedPairOfStates,
    runningTimeSeconds,
  };
}

function parseTCheckerStats(stats): Record<string, string> {
  const lines = stats.split('\n');
  const parsedStats: Record<string, string> = {};

  for (const line of lines) {
    const [key, value] = line.split(' ').map((part) => part.trim());
    if (key && value) {
      parsedStats[key] = value;
    }
  }

  return parsedStats;
  
}
