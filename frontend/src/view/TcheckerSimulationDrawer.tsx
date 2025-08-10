import { Button } from '@mui/material';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel';
import { PlayArrow, Stop } from '@mui/icons-material';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses';
import { IntegerValue, SimulationModel } from '../viewmodel/SimulationModel';
import React, { useEffect } from 'react';
import styles from '../styles/TCheckerSimulationDrawer.module.css';

export interface TCheckerSimulationDrawerProps {
  viewModel: AnalysisViewModel;
  openedProcesses: OpenedProcesses;
  simulationModel: SimulationModel;
}

export const TCheckerSimulationDrawer: React.FC<TCheckerSimulationDrawerProps> = (props) => {
  const { simulationModel } = props;

  const [locations, setLocations] = React.useState<string[]>([]);
  const [zone, setZone] = React.useState<string>('');
  const [integerValues, setIntegerValues] = React.useState<IntegerValue[]>([]);
  const [labels, setLabels] = React.useState<string[]>([]);



  useEffect(() => {

    if (simulationModel.currentState) {
      setLocations(simulationModel.currentState.locations);
      setZone(simulationModel.currentState.zone?.trim());
      setIntegerValues(simulationModel.currentState.integerValues);
      setLabels(simulationModel.currentState.labels);

      console.log('Labels', zone, zone.length);
    }




  }, [simulationModel.currentState, simulationModel.nextStates]);

  function stopSimulation() {
    simulationModel.stopSimulation();
  }

  return (

    <div className={styles.simulationContainer}>
      <h2 style={{ margin: 0 }}>TChecker Simulation</h2>
      <div className={styles.divider}></div>
      <div className={styles.sectionTitle}>
        Aktueller Status
      </div>

      <div className={styles.statusContainer}>

        <div className={styles.statusKey}>Locations</div>
        <div className={styles.statusValue}>{locations && locations.length > 0 ? locations.join(', ') : '-'}</div>

        <div className={styles.statusKey}>Labels</div>
        <div className={styles.statusValue}>{labels && labels?.length > 0 ? labels : '-'}</div>

        <div className={styles.statusKey}>Zone</div>
        <div className={styles.statusValue}>{zone && zone.length > 0 ? zone : '-'}</div>


        <div className={styles.statusKey}>Integer Values</div>
        <div className={styles.statusValue}>
          {
            integerValues && integerValues.length > 0 ? (
              integerValues.map((iv) => <div>
                {iv.name}={iv.value}
              </div>
              )) : (
              <div>
                -
              </div>

            )
          }
        </div>
      </div>


      <div className={styles.divider}></div>
      <div className={styles.sectionTitle} >Transitionen</div>

      <div>


        {simulationModel.nextStates.map((nextState, index) =>

          <div key={index} className={styles.transitionItem} onMouseDown={() => simulationModel.simulateNextState(nextState.state)}>

            <span>{nextState.transition?.vedge}</span>
            <PlayArrow style={{ marginLeft: '8px', color: 'green' }} />
          </div>

        )}
      </div>


      <div style={{ marginTop: 'auto', alignSelf: 'center' }}>
        <Button onMouseDown={() => stopSimulation()} variant="contained" color="error">
          <Stop />
          Stop Simulation
        </Button>
      </div>
    </div>

  );
}


export default TCheckerSimulationDrawer;