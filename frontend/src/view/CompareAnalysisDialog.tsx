import { Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel } from '@mui/material';
import { OpenedSystems, SystemOptionType } from '../viewmodel/OpenedSystems';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { useButtonUtils } from '../utils/buttonUtils';
import { TCheckerCompareStats, TCheckerUtils } from '../utils/tcheckerUtils';
import TCheckerErrorDialog from './TCheckerErrorDialog';
import AbortAnalysisDialog from './AbortAnalysisDialog';

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
    const [loading, setLoading] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [tcheckerError, setTcheckerError] = useState<string | undefined>(undefined);
    const [abortAnalysisDialogOpen, setAbortAnalysisDialogOpen] = useState(false);

    useEffect(() => {
        if (!open) {
            setFirstSystem(undefined);
            setSecondSystem(undefined);
            setResult(undefined);
            setLoading(false);
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
        if (loading) {
            return;
        }

        setLoading(true);
        const abortController = new AbortController();
        setAbortController(abortController);
        const [result, error] = await TCheckerUtils.callCompareAnalysis(
            openedSystems.systemOptions.find(system => system.label === firstSystem) as SystemOptionType,
            openedSystems.systemOptions.find(system => system.label === secondSystem) as SystemOptionType,
            null,
            null,
            abortController.signal
        );

        setLoading(false);

        if (error) {
            if (error.name === 'AbortError') {
                return;
            }

            setTcheckerError(error.message);
            return;
        }

        setResult(result!.stats);
        setView('result');
    }

    function handleClose(force: boolean = false) {

        if (!force && loading) {
            setAbortAnalysisDialogOpen(true);
            return;
        }

        abortController?.abort();
        onClose();
        setView('form');
        setFirstSystem(undefined);
        setSecondSystem(undefined);
        setResult(undefined);
        setLoading(false);
        setAbortController(null);
        setTcheckerError(undefined);

    }

    function handleAbortAnalysisDialogClose(confirmed: boolean) {
        setAbortAnalysisDialogOpen(false);
        if (confirmed && abortController) {
            handleClose(true);
        }
    }

    return (
        <>
            <Dialog open={open} onClose={() => handleClose()} fullWidth maxWidth="md">
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
                        onMouseDown={() => handleClose(true)}
                        onKeyDown={(e) => executeOnKeyboardClick(e.key, () => handleClose(true))}
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
                            {loading ? (
                                <>
                                    <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                                        <CircularProgress size='20px' color='inherit' />
                                    </div>
                                    {t('tcheckerCompareAnalysisDialog.analysisInProgress')}
                                </>
                            ) : (
                                <>{t('tcheckerCompareAnalysisDialog.startCompare')}</>
                            )}

                        </Button>
                    )}
                </DialogActions>
            </Dialog>
            <TCheckerErrorDialog open={!!tcheckerError} onClose={() => setTcheckerError(undefined)} errorMessage={tcheckerError || ''}>
            </TCheckerErrorDialog>
            <AbortAnalysisDialog open={abortAnalysisDialogOpen} onClose={handleAbortAnalysisDialogClose} ></AbortAnalysisDialog>
        </>
    )
};

export default CompareAnalysisDialog;