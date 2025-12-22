import { $keywords } from '@ts-graphviz/common';

declare module '@ts-graphviz/common' {
  
  export namespace NodeAttributeKey {
    export interface $values extends $keywords<'clockval_1' | 'clockval_2' | 'final' | 'final_delay' | 'final_edge' | 'initial' | 'first_intval' | 'first_vloc' | 'second_intval' | 'second_vloc'> {}
  }

  export namespace EdgeAttributeKey {
    export interface $values extends $keywords<'delay' | 'first_vedge' | 'first_vedge_do' | 'first_vedge_prov' | 'second_vedge' | 'second_vedge_do' | 'second_vedge_prov'> {}
  }

  export namespace Attribute {
    export interface $types {
      // nodes
      clockval_1: string[] | Map<string, string>;
      clockval_2: string[] | Map<string, string>;
      final: string;
      final_delay: number;
      final_edge: string;
      first_intval: string[] | Map<string, string>;
      first_vloc: string[];
      initial: boolean;
      second_intval: string[] | Map<string, string>;
      second_vloc: string[];
      // edges
      delay: number;
      first_vedge: string[];
      first_vedge_do: string[];
      first_vedge_prov: string[];
      second_vedge: string[];
      second_vedge_do: string[];
      second_vedge_prov: string[];
    }
  }
}