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
import { CircularProgress, FormControl, FormControlLabel, FormLabel, Icon, Radio, RadioGroup, TextField } from '@mui/material';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses';
import { OpenedSystems } from '../viewmodel/OpenedSystems';
import { TCheckerReachabilityAlgorithm, TCheckerReachabilityCertificate, TCheckerReachabilityStats, TCheckerSearchOrder, TCheckerUtils } from '../utils/tcheckerUtils';
import StringListInput from './TCheckerLabelsInput';
import TCheckerErrorDialog from './TCheckerErrorDialog';
import AbortAnalysisDialog from './AbortAnalysisDialog';


interface ReachabilityAnalysisDialogProps {

    openedSystems: OpenedSystems;
    openedProcesses: OpenedProcesses;
    open: boolean;
    onClose: () => void;
}


const ReachabilityAnalysisDialog = (props: ReachabilityAnalysisDialogProps) => {
    const { open, onClose, openedProcesses, openedSystems } = props;

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
    const [result, setResult] = useState<{ stats: TCheckerReachabilityStats, certificate: string } | null>(null); // State to store the result of the analysis
    const [loading, setLoading] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [tcheckerError, setTcheckerError] = useState<string | undefined>(undefined);
    const [abortAnalysisDialogOpen, setAbortAnalysisDialogOpen] = useState(false);

    const [expandAdvancedOptions, setExpandAdvancedOptions] = useState(false);


    useEffect(() => {
        setFormValues((prev) => ({
            ...prev,
            algorithm: 'reach',
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
        try {
            const [result, error] = await TCheckerUtils.callReachabilityAnalysis(
                openedSystems.selectedSystem,
                formValues.algorithm as TCheckerReachabilityAlgorithm,
                formValues.searchOrder as TCheckerSearchOrder,
                formValues.certificate as TCheckerReachabilityCertificate,
                formValues.labels,
                formValues.blockSize as number | null,
                formValues.hashTableSize as number | null,
                abortController.signal
            );

            if (error) {
                console.log('Error during reachability analysis:', error);
                if (error.name === 'AbortError') {
                    console.log('Request was aborted');
                }

                setLoading(false);
                setTcheckerError(error.message);
                return;
            }

            setLoading(false);
            setResult(result);
            setView('result');
        } catch (error) {
            setLoading(false);
            return;
        }
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
        <><Dialog open={open} onClose={() => handleClose()} data-testid="dialog-delete-clock-confirm">
            <DialogTitle>{t('tcheckerReachabilityAnalysisDialog.title')}</DialogTitle>
            <DialogContent>
                {view === 'result' ? (
                    <div>
                        <div>
                            {t('tcheckerReachabilityAnalysisDialog.result.reachable')}: {result?.stats?.reachable.toString()}
                        </div>
                        <div>
                            {t('tcheckerReachabilityAnalysisDialog.result.visitedStates')}: {result?.stats?.visitedStates.toString()}
                        </div>

                        <div>
                            {t('tcheckerReachabilityAnalysisDialog.result.visitedTransitions')}: {result?.stats?.visitedTransitions.toString()}
                        </div>

                    </div>
                ) : (
                    <>
                        <FormControl>
                            <FormLabel>{t('tcheckerReachabilityAnalysisDialog.form.algorithm')}</FormLabel>
                            <RadioGroup
                                row
                                name="algorithm"
                                value={formValues.algorithm}
                                onChange={handleRadioChange}

                            >
                                <FormControlLabel value="reach" control={<Radio />} label="reach" />
                                <FormControlLabel value="concur19" control={<Radio />} label="concur19" />
                                <FormControlLabel value="covreach" control={<Radio />} label="covreach" />
                            </RadioGroup>
                        </FormControl>

                        <FormControl>
                            <FormLabel>{t('tcheckerReachabilityAnalysisDialog.form.searchOrder')}</FormLabel>
                            <RadioGroup
                                row
                                name="searchOrder"
                                value={formValues.searchOrder}
                                onChange={handleRadioChange}

                            >
                                <FormControlLabel value="dfs" control={<Radio />} label={t('tcheckerReachabilityAnalysisDialog.form.searchOrder.dfs')} />
                                <FormControlLabel value="bfs" control={<Radio />} label={t('tcheckerReachabilityAnalysisDialog.form.searchOrder.bfs')} />
                            </RadioGroup>
                        </FormControl>

                        <FormControl>
                            <FormLabel>{t('tcheckerReachabilityAnalysisDialog.form.certificate')}</FormLabel>
                            <RadioGroup
                                row
                                name="certificate"
                                value={formValues.certificate}
                                onChange={handleRadioChange}

                            >
                                <FormControlLabel value="none" control={<Radio />} label={t('tcheckerReachabilityAnalysisDialog.form.certificate.none')} />
                                <FormControlLabel value="graph" control={<Radio />} label={t('tcheckerReachabilityAnalysisDialog.form.certificate.graph')} />
                                <FormControlLabel value="symbolic" control={<Radio />} label={t('tcheckerReachabilityAnalysisDialog.form.certificate.symbolic')} />
                                <FormControlLabel value="concrete" control={<Radio />} label={t('tcheckerReachabilityAnalysisDialog.form.certificate.concrete')} />
                            </RadioGroup>
                        </FormControl>


                        <div style={{ marginTop: '8px', marginBottom: '8px', fontWeight: '400', color: 'rgba(0, 0, 0, 0.6)' }}>
                            {t('tcheckerReachabilityAnalysisDialog.form.labels')}
                        </div>
                        <StringListInput
                            value={formValues.labels}
                            onChange={(items) => setFormValues((prev) => ({ ...prev, labels: items }))}
                            label={t('tcheckerReachabilityAnalysisDialog.form.newLabel')} ></StringListInput>

                        {expandAdvancedOptions ? (
                            <div>
                                <TextField
                                    name="blockSize"
                                    margin="dense"
                                    label={t('tcheckerReachabilityAnalysisDialog.form.blockSize')}
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
                                    label={t('tcheckerReachabilityAnalysisDialog.form.certificate.hashTableSize')}
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
                                        {t('tcheckerReachabilityAnalysisDialog.closeAdvancedOptions')}
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
                                        {t('tcheckerReachabilityAnalysisDialog.openAdvancedOptions')}
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
                    {t('tcheckerReachabilityAnalysisDialog.cancel')}
                </Button>

                {view === 'result' ? (
                    <Button
                        disabled={!result || !result.certificate}
                        onMouseDown={() => downloadCertificate()}
                        onKeyDown={(e) => executeOnKeyboardClick(e.key, () => downloadCertificate())}
                        variant="contained"
                    >
                        {t('tcheckerReachabilityAnalysisDialog.downloadCertificate')}
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
                                {t('tcheckerReachabilityAnalysisDialog.analysisInProgress')}
                            </>
                        ) : (
                            <>{t('tcheckerReachabilityAnalysisDialog.startAnalysis')}</>
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

export default ReachabilityAnalysisDialog;