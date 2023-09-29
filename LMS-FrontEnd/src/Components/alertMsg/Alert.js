import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
// import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';

export default function DescriptionAlerts({ openSnackbar, handleCloseSnackbar,severity,alertMessage }) {
  return (
    <Snackbar
      open={openSnackbar}
      autoHideDuration={3000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{
        vertical: 'top', // Change to 'top' to center the Snackbar
        horizontal: 'center',
      }}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Stack sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }} spacing={2}>
        <Alert severity={severity}>
          {/* <AlertTitle>{severity}</AlertTitle> */}
          {alertMessage}
        </Alert>
      </Stack>
    </Snackbar>
  );
}
