import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AnalysisViewModel } from '../../viewmodel/AnalysisViewModel';
import { OpenedProcesses } from '../../viewmodel/OpenedProcesses';
import LayoutButton from '../../view/LayoutButton.tsx';
import { ProcessSelection } from '../../view/ProcessSelection.tsx';
import AutomatonVisualization from '../../view/AutomatonVisualization.tsx';
import { NodeAttributeKey, NodeModel } from 'ts-graphviz';
import { SystemOptionType } from '../../viewmodel/OpenedSystems.ts';

interface StateDisplayProps {
  viewModel: AnalysisViewModel;
  openedProcesses: OpenedProcesses;
  system: SystemOptionType;
  attributeNames: Map<string, NodeAttributeKey>;
  contentHeight: number;
  currentNode: NodeModel;
}

const TAStateDisplay = (props: StateDisplayProps) => {

  const { viewModel, openedProcesses, system, attributeNames, contentHeight, currentNode } = props;

  const { t } = useTranslation();

  return <Box sx={{ display: 'flex', flexDirection: 'column', height: `${7/8 * contentHeight}px`, width: '50%', overflow: 'hidden' }}>
          <Grid item xs={12} sm={8} md={9} lg={9} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', 
            justifyContent: "center", overflow: 'auto', height: `${1/8 * contentHeight}px`, border: "1px solid grey" }}>
            <h3 style={{ textAlign: 'center' }}>
              {system.label}
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
                coloredLoc={currentNode.attributes.get(attributeNames.get("vloc"))[openedProcesses.automatonOptions.indexOf(openedProcesses.selectedOption)]} 
                coloredSwitch='' />
            </Grid>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: `${6/8 * contentHeight}px`, width: '20%', overflow: 'hidden' }}>
              <Grid item xs={12} sm={8} md={9} lg={9} sx={{ overflowY: 'auto', height: '50%', width: '100%', border: "1px solid grey" }}>
                <h4 style={{ textAlign: 'center' }}> {t('manipulation.table.clockPlural')} </h4>
                {Array.from((currentNode.attributes.get(attributeNames.get("clockval")) as Map<string, string>).keys()).map(clock => 
                  (<h4 style={{ textAlign: 'center' }} key={clock}> 
                  {clock} = {(currentNode.attributes.get(attributeNames.get("clockval")) as Map<string, string>).get(clock)} </h4>))}
              </Grid>
              <Grid item xs={12} sm={8} md={9} lg={9} sx={{overflowY: 'auto', height: '50%', width: '100%', border: "1px solid grey" }}>
                <h4 style={{ textAlign: 'center' }}> {t('manipulation.table.integerPlural')} </h4>
                {Array.from((currentNode.attributes.get(attributeNames.get("intval")) as Map<string, string>).keys()).map(val => 
                  (<h4 style={{ textAlign: 'center' }} key={val}> 
                  {val} = {(currentNode.attributes.get(attributeNames.get("intval")) as Map<string, string>).get(val)} </h4>))
                }
              </Grid>
            </Box>
          </Box>
        </Box>;
};

export default TAStateDisplay;
