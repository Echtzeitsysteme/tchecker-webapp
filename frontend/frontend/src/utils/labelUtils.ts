import { LabelsViewData } from '../viewmodel/LabelsListViewModel.ts';
import { useCallback } from 'react';

export interface LabelUtils {
  transformToLabelsList: (labels: LabelsViewData[]) => string[] | undefined;
}

export function useLabelUtils(): LabelUtils {
  const transformToLabelsList = useCallback((labels: LabelsViewData[]) => {
    if (!labels || labels.length === 0) {
      return undefined;
    }
    const labelsList: string[] = [];
    if (labels && labels.length >= 0) {
      labels.forEach((label) => {
        labelsList.push(label.term.trim());
      });
    }
    return labelsList;
  }, []);

  return {
    transformToLabelsList: transformToLabelsList,
  };
}
