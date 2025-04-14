import Button from '@mui/material/Button';
import { t } from 'i18next';
import React, { useState } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel';
import { OpenedSystems } from '../viewmodel/OpenedSystems';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses';
import { createTCheckerFile } from '../utils/tckFileUtils';

export interface TCheckerActionsProps {
  // viewModel: AnalysisViewModel;
  openedSystems: OpenedSystems;
  // openedProcesses: OpenedProcesses;
}
export const TCheckerActions: React.FC<TCheckerActionsProps> = (props) => {

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const collapseLabel = isCollapsed
    ? t('manipulation.table.showContent', { content: "TChecker" })
    : t('manipulation.table.hideContent', { content: "TChecker" });

  function executeOnKeyboardClick(key: string, toggleCollapse: () => void): void {
    throw new Error('Function not implemented.');
  }

  async function callSyntaxCheck(): Promise<void> {

      const file = await createTCheckerFile(props.openedSystems.selectedSystem);
      fetch("http://localhost:8000/tck_syntax/check", {
        method: 'PUT',
        body: file,
        headers: {
        }
      });

  }

  return (
    <div>
      <Button
        startIcon={isCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        variant="text"
        onMouseDown={toggleCollapse}
        onKeyDown={(e) => executeOnKeyboardClick(e.key, toggleCollapse)}
        data-testid="button-hide-tchecker-actions"
      >
        {collapseLabel}
      </Button>
      {!isCollapsed && (

        <div>
          <Button
            onMouseDown={callSyntaxCheck}
            variant="contained"
            color="primary">
              Syntax überprüfen
          </Button>
          <Button
            style={{marginTop: '12px'}}
            onMouseDown={callSyntaxCheck}
            variant="contained"
            color="primary">
              Produktautomat generieren
          </Button>
        </div>
      )}
    </div>
  );
}