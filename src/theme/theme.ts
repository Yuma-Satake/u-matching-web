import { createTheme } from '@mui/material';

export const theme = createTheme({
  typography: {
    fontFamily: ['"Noto Sans JP"', 'sans-serif'].join(','),
  },
  palette: {
    primary: {
      main: '#00C8DA',
    },
  },
});
