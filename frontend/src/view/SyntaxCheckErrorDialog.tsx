import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useButtonUtils } from '../utils/buttonUtils';
import { SystemOptionType } from '../viewmodel/OpenedSystems';
import { createTCheckerFile } from '../utils/tckFileUtils';
import HighlightCharacter from './HighlightCharacter';


interface ErrorDetails {
  line: number;
  columnStart: number;
  columnEnd: number;
  errorType: string;
  errorMessage: string;
  systemLine: string;
}

interface SyntaxCheckErrorDialogProps {

  checkedSystem: string | SystemOptionType | undefined;
  syntaxCheckErrors?: string[];

  open: boolean;
  onClose: () => void;
}

const SyntaxCheckErrorDialog: React.FC<SyntaxCheckErrorDialogProps> = (props: SyntaxCheckErrorDialogProps) => {
  const { checkedSystem, syntaxCheckErrors, open, onClose } = props;

  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();


  const [errorDetails, setErrorDetails] = React.useState<ErrorDetails[]>([]);

  async function extractErrorDetails(syntaxCheckErrors: string[], checkedSystem: string | SystemOptionType | undefined): Promise<ErrorDetails[]> {

    if (checkedSystem === undefined || syntaxCheckErrors === undefined || syntaxCheckErrors.length === 0) {
      return [];
    }

    if (typeof checkedSystem === "object") {
      checkedSystem = await createTCheckerFile(checkedSystem);
    }

    const checkedSystemLines = checkedSystem.split("\n");
    console.log("Checked System Lines: ", checkedSystemLines);

    const errorDetails: ErrorDetails[] = [];
    syntaxCheckErrors.forEach((error) => {

      if (error.startsWith("Warning")) {
        return;
      }

      const lineColumnRegex = /\b(?<line>\d+)\.(?<col_start>\d+)(?:-(?<col_end>\d+))?\b/g;

      const lineColumnMatch = lineColumnRegex.exec(error);

      if (lineColumnMatch) {
        const line = parseInt(lineColumnMatch.groups!.line, 10);
        const columnStart = parseInt(lineColumnMatch.groups!.col_start, 10) - 1;
        const columnEnd = lineColumnMatch.groups!.col_end ? parseInt(lineColumnMatch.groups!.col_end, 10) : columnStart + 1;

        const systemLine = checkedSystemLines[line - 1] || "";
        let errorType = "Unknown";

        if (error.includes("Invalid Character")) {
          errorType = "Invalid Character";
          error = error.replace(/''/g, "");
        }

        errorDetails.push({
          line,
          columnStart,
          columnEnd,
          errorType,
          errorMessage: error,
          systemLine
        });
      } else {
        errorDetails.push({
          line: -1,
          columnStart: -1,
          columnEnd: -1,
          errorType: "Unknown",
          errorMessage: error,
          systemLine: "Unknown"
        });
      }

      console.log("Error Details: ", errorDetails);
    });


    return errorDetails;
  }

  React.useEffect(() => {
    extractErrorDetails(syntaxCheckErrors!, checkedSystem).then((errorDetails) => {
      setErrorDetails(errorDetails);
      console.log("Error Details: ", errorDetails);
    });
  }, [syntaxCheckErrors, checkedSystem])







  return (
    <Dialog open={open} onClose={onClose} data-testid="dialog-delete-clock-confirm">
      <DialogTitle>{t('syntaxCheckErrorDialog.title')}</DialogTitle>
      <DialogContent>
        {(errorDetails !== undefined && errorDetails.length > 0) ? (
          <div>
            {errorDetails!.map((error, index) => (
              error.line !== -1 ? (
                <div>
                  <div style={{fontWeight: "bold"}} key={index}>
                    {error.errorMessage}
                  </div>
                  <HighlightCharacter text={error.systemLine} highlightStart={error.columnStart} highlightEnd={error.columnEnd}></HighlightCharacter>
                </div>
              ) : (
                <div style={{fontWeight: "bold"}} key={index}>
                  {error.errorMessage}
                </div>
              )

            ))}
          </div>
        ) : (<></>)}
      </DialogContent>
      <DialogActions>
        <Button
          onMouseDown={() => onClose()}
          onKeyDown={(e) => executeOnKeyboardClick(e.key, () => onClose())}
          variant="contained"
          color="primary"
        >
          {t('syntaxCheckErrorDialog.button.confirm')}
        </Button>
      </DialogActions>
    </Dialog >
  )
}

export default SyntaxCheckErrorDialog;