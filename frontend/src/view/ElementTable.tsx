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

export interface ElementRowData {
  id: number;
  displayName: string;
}

interface ElementTableProps {
  rows: ElementRowData[];
  contentSingular: string;
  contentPlural: string;
  onAdd: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ElementTable: React.FC<ElementTableProps> = (props) => {
  const { rows, contentSingular, contentPlural, onAdd, onEdit, onDelete } = props;
  const { t } = useTranslation();

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
          <IconButton onClick={() => onEdit(row.id)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => onDelete(row.id)} size="small">
            <DeleteIcon />
          </IconButton>
        </TableCell>
        <TableCell>{row.displayName}</TableCell>
      </TableRow>
    ));
  }, [rows, styleActionsColumn, onEdit, onDelete]);

  return (
    <>
      <Button
        startIcon={isCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        variant="text"
        onClick={toggleCollapse}
      >
        {collapseLabel}
      </Button>
      <div style={{ marginBottom: '4px' }}>
        <Button startIcon={<Add />} variant="contained" size="small" onClick={() => onAdd()}>
          {t('manipulation.table.addElement', { content: contentSingular })}
        </Button>
      </div>
      {!isCollapsed && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell style={styleActionsColumn}>{t('manipulation.table.actions')}</TableCell>
                <TableCell>{contentSingular}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{contentRows}</TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default ElementTable;
