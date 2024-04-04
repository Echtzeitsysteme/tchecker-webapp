import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface AddLocationDialogProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

export const AddLocationDialog: React.FC<AddLocationDialogProps> = (props) => {
  const { open, handleClose, handleSubmit } = props;
  const [name, setName] = useState('');
  const [isNameError, setIsNameError] = useState(false);
  const [initialLocationChecked, setInitialLocationChecked] = useState(false);
  const [invariantChecked, setInvariantChecked] = useState(false);
  const [dropdownOneValue, setDropdownOneValue] = useState('');
  const [dropdownTwoValue, setDropdownTwoValue] = useState('');
  const [numberInput, setNumberInput] = useState(0);

  useEffect(() => {
    setIsNameError(name.trim() === '');
  }, [name]);

  const handleFormSubmit = () => {
    if (name.trim() === '') {
      setIsNameError(true);
      return;
    }
    handleSubmit();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        Add Location
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={isNameError}
          helperText={isNameError && 'Name cannot be empty'}
        />
        <FormControlLabel
          control={
            <Checkbox checked={initialLocationChecked} onChange={(e) => setInitialLocationChecked(e.target.checked)} />
          }
          label="Initial Location"
        />
        <FormControlLabel
          control={<Checkbox checked={invariantChecked} onChange={(e) => setInvariantChecked(e.target.checked)} />}
          label="Add Invariant"
        />
        {invariantChecked && (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Clock</InputLabel>
                  <Select
                    value={dropdownOneValue}
                    label="Clock"
                    onChange={(e) => setDropdownOneValue(e.target.value as string)}
                  >
                    <MenuItem value="option1">Option 1</MenuItem>
                    <MenuItem value="option2">Option 2</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Comparison</InputLabel>
                  <Select
                    value={dropdownTwoValue}
                    label="Comparison"
                    onChange={(e) => setDropdownTwoValue(e.target.value as string)}
                  >
                    <MenuItem value="option1">Option 1</MenuItem>
                    <MenuItem value="option2">Option 2</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box>
                <TextField
                  margin="dense"
                  label="Value"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={numberInput}
                  onChange={(e) => setNumberInput(Math.max(0, parseInt(e.target.value, 10)))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="error">
          Cancel
        </Button>
        <Button onClick={handleFormSubmit} variant="contained" disabled={isNameError}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLocationDialog;
