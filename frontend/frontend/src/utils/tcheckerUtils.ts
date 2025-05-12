import { SystemOptionType } from '../viewmodel/OpenedSystems';
import { createTCheckerFile } from './tckFileUtils';

export enum TCheckerReachabilityAlgorithm {
  reach = 'reach',
  concur19 = 'concur19',
  covreach = 'covreach',
}

export enum TCheckerSearchOrder {
  dfs = 'dfs',
  bfs = 'bfs',
}
export enum TCheckerReachabilityCertificate {
  graph = 'graph',
  symbolic = 'symbolic',
  concrete = 'concrete',
  none = 'none',
}

export interface TCheckerReachabilityStats {
  reachable: boolean;
  visitedStates: number;
  visitedTransitions: number;
  runningTimeSeconds: string;
}

export class TCheckerUtils {
  private static tckSyntaxBaseUrl: string = 'http://localhost:8000/tck_syntax';
  private static tckReachBaseUrl: string = 'http://localhost:8000/tck_reach';

  public static async callGenerateDotFile(system: SystemOptionType): Promise<void> {
    const ta = await createTCheckerFile(system);
    const response = await fetch(`${this.tckSyntaxBaseUrl}/to_dot`, {
      method: 'PUT',
      body: ta,
      headers: {},
    });

    const data = await response.json();

    try {
      const blob = new Blob([data]);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${system.label}.dot`;
      a.click();
    } catch (error) {
      console.error(error);
    }
  }

  public static async callGenerateJsonFile(system: SystemOptionType): Promise<void> {
    const ta = await createTCheckerFile(system);
    const response = await fetch(`${this.tckSyntaxBaseUrl}/to_json`, {
      method: 'PUT',
      body: ta,
      headers: {},
    });

    const data = await response.json();

    try {
      const blob = new Blob([data]);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${system.label}.json`;
      a.click();
    } catch (error) {
      console.error(error);
    }
  }

  public static async callSyntaxCheckForSystem(system: SystemOptionType): Promise<string[]> {
    const ta = await createTCheckerFile(system);
    return await this.callSyntaxCheck(ta);
  }

  public static async callSyntaxCheck(tck: string): Promise<string[]> {
    const response = await fetch(`${this.tckSyntaxBaseUrl}/check`, {
      method: 'PUT',
      body: tck,
      headers: {},
    });
    const responseString = await response.json();

    const syntaxErrors = responseString
      .split('\n')
      .filter(
        (line: string) =>
          line.trim() !== '' &&
          !line.toLocaleLowerCase().includes('warning') &&
          !line.toLocaleLowerCase().includes('error(s)')
      );

    return syntaxErrors;
  }

  public static async callCreateSynchronizedProduct(system: SystemOptionType): Promise<string> {
    const ta = await createTCheckerFile(system);
    const body = {
      ta: ta,
      process_name: system.label,
    };

    const response = await fetch(`${this.tckSyntaxBaseUrl}/create_synchronized_product`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  }

  public static async callReachabilityAnalysis(
    system: SystemOptionType,
    algorithm: TCheckerReachabilityAlgorithm,
    searchOrder: TCheckerSearchOrder,
    certificate: TCheckerReachabilityCertificate,
    blockSize: number | null,
    tableSize: number | null
  ): Promise<{
    stats: TCheckerReachabilityStats;
    certificate: string;
  }> {
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
      block_size: blockSize,
      table_size: tableSize,
    };

    const response = await fetch(`${this.tckReachBaseUrl}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseJson = (await response.json()) as { stats: string; certificate: string };

    return {
      stats: parseReachabilityStats(responseJson.stats),
      certificate: responseJson.certificate,
    } 
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
