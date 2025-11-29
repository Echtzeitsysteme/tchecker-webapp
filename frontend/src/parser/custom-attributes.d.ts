import { $keywords } from '@ts-graphviz/common';

declare module '@ts-graphviz/common' {
  
  export namespace NodeAttributeKey {
    export interface $values extends $keywords<'clockval_1' | 'clockval_2' | 'initial' | 'first_intval' | 'first_vloc' | 'second_intval' | 'second_vloc'> {}
  }

  export namespace EdgeAttributeKey {
    export interface $values extends $keywords<'delay' | 'first_vedge' | 'first_vedge_do' | 'first_vedge_prov' | 'second_vedge' | 'second_vedge_do' | 'second_vedge_prov'> {}
  }

  export namespace Attribute {
    export interface $types {
      // nodes
      clockval_1: string[];
      clockval_2: string[];
      first_intval: string[];
      first_vloc: string[];
      initial: boolean;
      second_intval: string[];
      second_vloc: string[];
      // edges
      delay: Double;
      first_vedge: string[];
      first_vedge_do: string[];
      first_vedge_prov: string[];
      second_vedge: string[];
      second_vedge_do: string[];
      second_vedge_prov: string[];
    }
  }
}