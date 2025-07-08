import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Button from '@mui/material/Button';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useButtonUtils } from '../utils/buttonUtils';
import { CircularProgress, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@mui/material';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses';
import { OpenedSystems } from '../viewmodel/OpenedSystems';
import { TCheckerLivenessAlgorithm, TCheckerLivenessCertificate, TCheckerLivenessStats, TCheckerSearchOrder, TCheckerUtils } from '../utils/tcheckerUtils';
import StringListInput from './TCheckerLabelsInput';
import TCheckerErrorDialog from './TCheckerErrorDialog';
import AbortAnalysisDialog from './AbortAnalysisDialog';


interface LivenessAnalysisDialogProps {

    openedSystems: OpenedSystems;
    openedProcesses: OpenedProcesses;
    open: boolean;
    onClose: () => void;
}


const LivenessAnalysisDialog = (props: LivenessAnalysisDialogProps) => {
    const { open, onClose, openedSystems } = props;

    const { t } = useTranslation();
    const { executeOnKeyboardClick } = useButtonUtils();


    const [formValues, setFormValues] = useState({
        algorithm: 'reach',
        searchOrder: 'dfs',
        certificate: 'none',
        blockSize: null,
        hashTableSize: null,
        labels: [] as string[],
    });

    const [view, setView] = useState<'form' | 'result'>('form');
    const [result, setResult] = useState<{ stats: TCheckerLivenessStats, certificate: string } | null>(null); // State to store the result of the analysis
    const [loading, setLoading] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [tcheckerError, setTcheckerError] = useState<string | undefined>(undefined);
    const [abortAnalysisDialogOpen, setAbortAnalysisDialogOpen] = useState(false);

    const [expandAdvancedOptions, setExpandAdvancedOptions] = useState(false);


    useEffect(() => {
        setFormValues((prev) => ({
            ...prev,
            algorithm: 'couvscc',
            searchOrder: 'dfs',
            certificate: 'none',
            blockSize: null,
            hashTableSize: null,
        }));

        setView('form');
    }, [open]);



    // Handle changes in RadioGroups
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('RadioGroup changed:', e.target.name, e.target.value);
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle changes in TextFields
    const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    async function startReachabilityAnalysis() {
        if (loading) {
            return;
        }

        setLoading(true);
        const abortController = new AbortController();
        setAbortController(abortController);


        const [result, error] = await TCheckerUtils.callLivenessAnalysis(
            openedSystems.selectedSystem,
            formValues.algorithm as TCheckerLivenessAlgorithm,
            formValues.searchOrder as TCheckerSearchOrder,
            formValues.certificate as TCheckerLivenessCertificate,
            formValues.labels,
            formValues.blockSize as number | null,
            formValues.hashTableSize as number | null,
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

    function downloadCertificate() {
        if (!result) {
            return;
        }

        try {
            const blob = new Blob([result!.certificate]);
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${openedSystems.selectedSystem.label}_certificate.txt`;
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

    function handleClose(force: boolean = false) {
        if (!force && loading) {
            setAbortAnalysisDialogOpen(true);
            return;
        }

        abortController?.abort();
        setLoading(false);
        setView('form');
        setResult(null);
        onClose();
    }

    return (
        <>
            <Dialog open={open} onClose={() => handleClose()} data-testid="dialog-delete-clock-confirm">
                <DialogTitle>{t('tcheckerLivenessAnalysisDialog.title')}</DialogTitle>
                <DialogContent>
                    {view === 'result' ? (
                        <div>
                            <div>
                                {t('tcheckerLivenessAnalysisDialog.result.cycle')}: {result?.stats?.cycle.toString()}
                            </div>
                            <div>
                                {t('tcheckerLivenessAnalysisDialog.result.visitedStates')}: {result?.stats?.visitedStates.toString()}
                            </div>

                            <div>
                                {t('tcheckerLivenessAnalysisDialog.result.visitedTransitions')}: {result?.stats?.visitedTransitions.toString()}
                            </div>

                        </div>
                    ) : (
                        <>
                            <FormControl>
                                <FormLabel>{t('tcheckerLivenessAnalysisDialog.form.algorithm')}</FormLabel>
                                <RadioGroup
                                    row
                                    name="algorithm"
                                    value={formValues.algorithm}
                                    onChange={handleRadioChange}

                                >
                                    <FormControlLabel value="couvscc" control={<Radio />} label="couvscc" />
                                    <FormControlLabel value="ndfs" control={<Radio />} label="ndfs" />
                                </RadioGroup>
                            </FormControl>

                            <FormControl>
                                <FormLabel>{t('tcheckerLivenessAnalysisDialog.form.searchOrder')}</FormLabel>
                                <RadioGroup
                                    row
                                    name="searchOrder"
                                    value={formValues.searchOrder}
                                    onChange={handleRadioChange}

                                >
                                    <FormControlLabel value="dfs" control={<Radio />} label={t('tcheckerLivenessAnalysisDialog.form.searchOrder.dfs')} />
                                    <FormControlLabel value="bfs" control={<Radio />} label={t('tcheckerLivenessAnalysisDialog.form.searchOrder.bfs')} />
                                </RadioGroup>
                            </FormControl>

                            <FormControl>
                                <FormLabel>{t('tcheckerLivenessAnalysisDialog.form.certificate')}</FormLabel>
                                <RadioGroup
                                    row
                                    name="certificate"
                                    value={formValues.certificate}
                                    onChange={handleRadioChange}

                                >
                                    <FormControlLabel value="none" control={<Radio />} label={t('tcheckerLivenessAnalysisDialog.form.certificate.none')} />
                                    <FormControlLabel value="graph" control={<Radio />} label={t('tcheckerLivenessAnalysisDialog.form.certificate.graph')} />
                                    <FormControlLabel value="symbolic" control={<Radio />} label={t('tcheckerLivenessAnalysisDialog.form.certificate.symbolic')} />
                                </RadioGroup>
                            </FormControl>


                            <div style={{ marginTop: '8px', marginBottom: '8px', fontWeight: '400', color: 'rgba(0, 0, 0, 0.6)' }}>
                                {t('tcheckerLivenessAnalysisDialog.form.labels')}
                            </div>
                            <StringListInput
                                value={formValues.labels}
                                onChange={(items) => setFormValues((prev) => ({ ...prev, labels: items }))}
                                label={t('tcheckerLivenessAnalysisDialog.form.newLabel')} ></StringListInput>

                            {expandAdvancedOptions ? (
                                <div>
                                    <TextField
                                        name="blockSize"
                                        margin="dense"
                                        label={t('tcheckerLivenessAnalysisDialog.form.blockSize')}
                                        type="number"
                                        fullWidth
                                        variant="outlined"
                                        InputProps={{ inputProps: { min: 0 } }}
                                        data-testid={'select-integer-min'}
                                        onChange={handleTextFieldChange}
                                    />

                                    <TextField
                                        name="hashTableSize"
                                        margin="dense"
                                        label={t('tcheckerLivenessAnalysisDialog.form.certificate.hashTableSize')}
                                        type="number"
                                        fullWidth
                                        variant="outlined"
                                        InputProps={{ inputProps: { min: 0 } }}
                                        data-testid={'select-integer-min'}
                                        onChange={handleTextFieldChange}
                                    />
                                    <Button
                                        onMouseDown={() => setExpandAdvancedOptions(false)}
                                        onKeyDown={(e) => executeOnKeyboardClick(e.key, () => setExpandAdvancedOptions(false))}
                                        variant="text"
                                        startIcon={<KeyboardArrowUpIcon />}
                                    >
                                        <span style={{ marginLeft: '4px' }}>
                                            {t('tcheckerLivenessAnalysisDialog.closeAdvancedOptions')}
                                        </span>
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <Button
                                        onMouseDown={() => setExpandAdvancedOptions(true)}
                                        onKeyDown={(e) => executeOnKeyboardClick(e.key, () => setExpandAdvancedOptions(true))}
                                        variant="text"
                                        startIcon={<KeyboardArrowDownIcon />}
                                    >
                                        <span style={{ marginLeft: '4px' }}>
                                            {t('tcheckerLivenessAnalysisDialog.openAdvancedOptions')}
                                        </span>
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onMouseDown={() => handleClose(true)}
                        onKeyDown={(e) => executeOnKeyboardClick(e.key, () => handleClose(true))}
                        variant="contained"
                        color="error"
                    >
                        {t('tcheckerLivenessAnalysisDialog.cancel')}
                    </Button>

                    {view === 'result' ? (
                        <Button
                            disabled={!result || !result.certificate}
                            onMouseDown={() => downloadCertificate()}
                            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
                            variant="contained"
                        >
                            {t('tcheckerLivenessAnalysisDialog.downloadCertificate')}
                        </Button>
                    ) : (
                        <Button
                            onMouseDown={() => startReachabilityAnalysis()}
                            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => startReachabilityAnalysis())}
                            variant="contained"
                            color="primary"
                        >
                            {loading ? (
                                <>
                                    <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                                        <CircularProgress size='20px' color='inherit' />
                                    </div>
                                    {t('tcheckerLivenessAnalysisDialog.analysisInProgress')}
                                </>

                            ) : (
                                <>{t('tcheckerLivenessAnalysisDialog.startAnalysis')}</>
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

export default LivenessAnalysisDialog;