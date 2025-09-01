import React, { useMemo, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { Add } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { useButtonUtils } from '../utils/buttonUtils';

export interface ElementRowData {
  id: number;
  displayName: string | JSX.Element;
}

interface ElementTableProps {
  rows: ElementRowData[];
  contentSingular: string;
  contentPlural: string;
  typeForTestId: string;
  onAddOpen: () => void;
  onEditOpen: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ElementTable: React.FC<ElementTableProps> = (props) => {
  const { rows, contentSingular, contentPlural, typeForTestId, onAddOpen, onEditOpen, onDelete } = props;
  const { t } = useTranslation();
  const { executeOnKeyboardClick } = useButtonUtils();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const collapseLabel = isCollapsed
    ? t('manipulation.table.showContent', { content: contentPlural })
    : t('manipulation.table.hideContent', { content: contentPlural });

  const styleActionsColumn: React.CSSProperties = useMemo(() => {
    return { width: '1%', whiteSpace: 'nowrap' };
  }, []);

  const contentRows: JSX.Element[] = useMemo(() => {
    return rows.map((row) => (
      <TableRow key={row.id}>
        <TableCell style={styleActionsColumn}>
          <IconButton
            onMouseDown={() => onEditOpen(row.id)}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => onEditOpen(row.id))}
            size="small"
            data-testid={`button-edit-${typeForTestId}-${row.id}`}
          >
            <Tooltip title={t('manipulation.table.editLabel', { type: contentSingular })}>
              <EditIcon />
            </Tooltip>
          </IconButton>
          <IconButton
            onMouseDown={() => onDelete(row.id)}
            onKeyDown={(e) => executeOnKeyboardClick(e.key, () => onDelete(row.id))}
            size="small"
            data-testid={`button-delete-${typeForTestId}-${row.id}`}
          >
            <Tooltip title={t('manipulation.table.deleteLabel', { type: contentSingular })}>
              <DeleteIcon />
            </Tooltip>
          </IconButton>
        </TableCell>
        <TableCell data-testid={`table-cell-${typeForTestId}-${row.id}`}>{row.displayName}</TableCell>
      </TableRow>
    ));
  }, [rows, styleActionsColumn, contentSingular, typeForTestId, t, onEditOpen, onDelete, executeOnKeyboardClick]);

  return (
    <>
      <Button
        startIcon={isCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        variant="text"
        onMouseDown={toggleCollapse}
        onKeyDown={(e) => executeOnKeyboardClick(e.key, toggleCollapse)}
        data-testid={'button-hide-' + typeForTestId}
      >
        {collapseLabel}
      </Button>
      {!isCollapsed && (
        <>
          <div style={{ marginBottom: '4px' }}>
            <Button
              startIcon={<Add />}
              variant="contained"
              size="small"
              onMouseDown={onAddOpen}
              onKeyDown={(e) => executeOnKeyboardClick(e.key, onAddOpen)}
              data-testid={'button-add-' + typeForTestId}
            >
              {t('manipulation.table.addElement', { content: contentSingular })}
            </Button>
          </div>
          <TableContainer component={Paper}>
            <Table size="small" data-testid={'table-' + typeForTestId}>
              <TableHead>
                <TableRow>
                  <TableCell style={styleActionsColumn}>{t('manipulation.table.actions')}</TableCell>
                  <TableCell>{contentSingular}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{contentRows}</TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </>
  );
};

export default ElementTable;
