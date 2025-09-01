import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { Box } from '@mui/material';

export interface LayoutButtonProps {
  viewModel: AnalysisViewModel;
}

const LayoutButton: React.FC<LayoutButtonProps> = (props) => {
  const { viewModel } = props;
  const { t } = useTranslation();

  const adjustLayout = () => {
    const locs = viewModel.ta.locations;
    locs.forEach((loc) => {
      loc.setLayout = false;
    });
    viewModel.setAutomaton(viewModel, viewModel.ta);
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.4, mb: 2.3 }}>
      <Button variant="contained" onClick={adjustLayout}>
        {t('layoutButton.text')}
      </Button>
    </Box>
  );
};

export default LayoutButton;
