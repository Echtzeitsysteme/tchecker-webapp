import { Radio, RadioGroup, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormLabel, FormControlLabel } from '@mui/material';
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
    const [generate_witness, setGenerateWitness] = useState(false);
    const [result, setResult] = useState<{ stats: TCheckerCompareStats, certificate: string } | null>(null); // Replace 'any' with the actual type of the result if known
    const [loading, setLoading] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [tcheckerError, setTcheckerError] = useState<string | undefined>(undefined);
    const [abortAnalysisDialogOpen, setAbortAnalysisDialogOpen] = useState(false);

    useEffect(() => {
        if (!open) {
            setFirstSystem(undefined);
            setSecondSystem(undefined);
            setGenerateWitness(false);
            setResult(undefined);
            setLoading(false);
        }
        setView('form');
    }, [open]);

    // Handle changes in RadioGroups
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('RadioGroup changed:', e.target.name, e.target.value);
        if (e.target.name == "first system") {
            setFirstSystem(e.target.value);
        }
        else {
            setSecondSystem(e.target.value)
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
            generate_witness,
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

        setResult(result);
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
        setGenerateWitness(false);
        setResult(undefined);
        setLoading(false);
        setAbortController(null);
        setTcheckerError(undefined);

    }

    function downloadCertificate() {
        if (!result) {
            return;
        }

        try {
            const blob = new Blob([result!.certificate]);
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${firstSystem}_${secondSystem}_certificate.txt`;
            a.click();
        } catch (error) {
            console.error(error);
        }

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
                                {t('tcheckerLivenessAnalysisDialog.result.relationshipFulfilled')}: {result?.stats.relationshipFulfilled.toString()}
                            </div>
                            <div>
                                {t('tcheckerLivenessAnalysisDialog.result.visitedPairOfStates')}: {result?.stats.visitedPairOfStates.toString()}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div>
                                <h3>{t('tcheckerCompareAnalysisDialog.selectSystems')}</h3>
                                <FormControl>
                                    <FormLabel>{t('tcheckerCompareAnalysisDialog.firstSystem')}</FormLabel>
                                    <RadioGroup
                                        name="first system"
                                        value={firstSystem}
                                        onChange={handleRadioChange}
                                    >
                                    {openedSystems.systemOptions.map((system) => (
                                        <div key={system.label}>
                                            <FormControlLabel value={system.label} control={<Radio />} label={system.label} />
                                        </div>
                                    ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>{t('tcheckerCompareAnalysisDialog.secondSystem')}</FormLabel>
                                    <RadioGroup
                                        name="second system"
                                        value={secondSystem}
                                        onChange={handleRadioChange}
                                    >
                                    {openedSystems.systemOptions.map((system) => (
                                        <div key={system.label}>
                                            <FormControlLabel value={system.label} control={<Radio />} label={system.label} />
                                        </div>
                                    ))}
                                    </RadioGroup>
                                </FormControl>
                            </div>
                            <div>
                                <h3>{t('tcheckerCompareAnalysisDialog.generateWitness')}</h3>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={generate_witness}
                                            onChange={() => setGenerateWitness(!generate_witness)}
                                            color="primary"
                                        />
                                    }
                                    label={t('tcheckerCompareAnalysisDialog.generateWitness')}
                                /> 
                            </div>
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
                        <Button
                            disabled={!result || !result.certificate}
                            onMouseDown={() => downloadCertificate()}
                            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
                            variant="contained"
                        >
                            {t('tcheckerCompareAnalysisDialog.downloadCertificate')}
                        </Button>
                    ) : (
                        <Button
                            onMouseDown={() => startCompareAnalysis()}
                            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => startCompareAnalysis())}
                            variant="contained"
                            color="primary"
                            disabled={!firstSystem || !secondSystem}
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