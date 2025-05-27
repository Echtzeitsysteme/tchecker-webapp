import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { AnalysisViewModel } from '../viewmodel/AnalysisViewModel.ts';
import SystemSelection from './SystemSelection.tsx';
import { OpenedSystems } from '../viewmodel/OpenedSystems.ts';
import UploadButton from './UploadButton.tsx';
import DownloadButton from './DownloadButton.tsx';
import { OpenedProcesses } from '../viewmodel/OpenedProcesses.ts';

const drawerWidth = '25%';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export interface AutomatonDrawerProps {
  viewModel: AnalysisViewModel;
  openedSystems: OpenedSystems;
  openedProcesses: OpenedProcesses;
}

const AutomatonDrawer: React.FC<AutomatonDrawerProps> = (props) => {
  const { viewModel, openedSystems, openedProcesses } = props;
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'inline-flex', mb: 2 }}>
      <CssBaseline />
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        edge="start"
        sx={{ ml: 1, mr: 1, ...(open && { display: 'none' }) }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', mt: 1, mb: 1 }}>
            <Box sx={{ ml: "2%", mr: "1%", mb: 0.2}}>
              <UploadButton viewModel={viewModel} openedSystems={openedSystems} openedProcesses={openedProcesses} />
            </Box>
            <Box sx={{ mr: "2%", ml: "1%", mb: 0.2 }}>
                <DownloadButton viewModel={viewModel} openedSystems={openedSystems} openedProcesses={openedProcesses} />
            </Box>
        </Box>
        <Divider />
        <Box sx={{ justifyContent: 'flex-start', display: 'inline-flex', mt: 1, mb: 1, ml: '5%' }}>
          <SystemSelection viewModel={viewModel} openedSystems={openedSystems} openedProcesses={openedProcesses} />
        </Box>
      </Drawer>
    </Box>
  );
};

export default AutomatonDrawer;
