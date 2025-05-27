import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel } from '@mui/material';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel';
import { OpenedSystems, SystemOptionType } from '../viewmodel/OpenedSystems';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { useButtonUtils } from '../utils/buttonUtils';
import { TCheckerCompareStats, TCheckerUtils } from '../utils/tcheckerUtils';

export interface CompareAnalysisDialog {
    open: boolean;
    onClose: () => void;
    openedSystems: OpenedSystems

}


const CompareAnalysisDialog: React.FC<CompareAnalysisDialog> = (props) => {
    const { open, onClose, openedSystems } = props;
    const { t } = useTranslation();
    const { executeOnKeyboardClick } = useButtonUtils();

    const [view, setView] = useState<'form' | 'result'>('form');
    const [firstSystem, setFirstSystem] = useState<string | undefined>(undefined);
    const [secondSystem, setSecondSystem] = useState<string | undefined>(undefined);
    const [result, setResult] = useState<TCheckerCompareStats | undefined>(undefined); // Replace 'any' with the actual type of the result if known

    useEffect(() => {
        if (!open) {
            setFirstSystem(undefined);
            setSecondSystem(undefined);
            setResult(undefined);
        }
        setView('form');
    }, [open]);

    const toggleSystemSelection = (systemName: string) => {
        if (firstSystem === undefined) {
            setFirstSystem(systemName);
        }
        else if (secondSystem === undefined && systemName !== firstSystem) {
            setSecondSystem(systemName);
        }
        else if (systemName === firstSystem) {
            setFirstSystem(undefined);
        }
        else if (systemName === secondSystem) {
            setSecondSystem(undefined);
        }
    };

    async function startCompareAnalysis() {
        TCheckerUtils.callCompareAnalysis(
            openedSystems.systemOptions.find(system => system.label === firstSystem) as SystemOptionType,
            openedSystems.systemOptions.find(system => system.label === secondSystem) as SystemOptionType,
            null,
            null
        ).then((result) => {
            console.log('Compare Analysis Result:', result);
            setResult(result.stats);
            setView('result');
        });
    }



    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{t('tcheckerCompareAnalysisDialog.title')}</DialogTitle>
            <DialogContent>
                {view === 'result' ? (
                    <div>
                        <div>
                            {t('tcheckerLivenessAnalysisDialog.result.relationshipFulfilled')}: {result?.relationshipFulfilled.toString()}
                        </div>
                        <div>
                            {t('tcheckerLivenessAnalysisDialog.result.visitedPairOfStates')}: {result?.visitedPairOfStates.toString()}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3>{t('tcheckerCompareAnalysisDialog.selectSystems')}</h3>
                        {openedSystems.systemOptions.map((system) => (
                            <div key={system.label}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={system.label === firstSystem || system.label === secondSystem}
                                            onChange={() => toggleSystemSelection(system.label)}
                                            color="primary"
                                        />
                                    }
                                    label={system.label}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    onMouseDown={() => onClose()}
                    onKeyDown={(e) => executeOnKeyboardClick(e.key, () => onClose())}
                    variant="contained"
                    color="error"
                >
                    {t('tcheckerCompareAnalysisDialog.cancel')}
                </Button>

                {view === 'result' ? (
                    <></>
                ) : (
                    <Button
                        onMouseDown={() => startCompareAnalysis()}
                        onKeyDown={(e) => executeOnKeyboardClick(e.key, () => startCompareAnalysis())}
                        variant="contained"
                        color="primary"
                        disabled={!firstSystem || !secondSystem || firstSystem === secondSystem}
                    >
                        {t('tcheckerCompareAnalysisDialog.startCompare')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
};

export default CompareAnalysisDialog;