import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AnalysisViewModel } from '../../viewmodel/AnalysisViewModel';
import { OpenedProcesses } from '../../viewmodel/OpenedProcesses';
import LayoutButton from '../../view/LayoutButton.tsx';
import { ProcessSelection } from '../../view/ProcessSelection.tsx';
import AutomatonVisualization from '../../view/AutomatonVisualization.tsx';
import { NodeAttributeKey, NodeModel } from 'ts-graphviz';

interface StateDisplayProps {
  viewModel: AnalysisViewModel;
  openedProcesses: OpenedProcesses;
  systemName: string;
  attributes: Map<string, NodeAttributeKey>;
  contentHeight: number;
  currentNode: NodeModel;
}

const TAStateDisplay = (props: StateDisplayProps) => {

  const { viewModel, openedProcesses, systemName, attributes, contentHeight, currentNode } = props;

  const { t } = useTranslation();

  return <Box sx={{ display: 'flex', flexDirection: 'column', height: `${7/8 * contentHeight}px`, width: '50%', overflow: 'hidden' }}>
          <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', 
            justifyContent: "center", overflow: 'auto', height: `${1/8 * contentHeight}px`, border: "1px solid grey" }}>
            <h3 style={{ textAlign: 'center' }}>
              {systemName}
            </h3>
            &nbsp;
            <ProcessSelection viewModel={viewModel} openedProcesses={openedProcesses}/>
            &nbsp;
            <LayoutButton viewModel={viewModel} />
          </Grid>
          <Box sx={{ display: 'flex', height: `${6/8 * contentHeight}px`, overflow: 'hidden' }}>
            <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflow: 'hidden', width: '80%', border: "1px solid grey" }}>
              <AutomatonVisualization 
                viewModel={viewModel} 
                coloredLoc={currentNode.attributes.get(attributes.get("vloc"))[openedProcesses.automatonOptions.indexOf(openedProcesses.selectedOption)]} 
                coloredSwitch='' />
            </Grid>
            <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'auto', width: '20%', border: "1px solid grey" }}>
              <h4 style={{ textAlign: 'center' }}> {t('manipulation.table.clockPlural')} </h4>
              {viewModel.ta.clocks.map(clock => 
                (<h4 style={{ textAlign: 'center' }} key={clock.name}> 
                {clock.name} = {(currentNode.attributes.get(attributes.get("clockval")) as Map<string, string>).get(clock.name)} </h4>))
              }
            </Grid>
          </Box>
        </Box>;
};

export default TAStateDisplay;
