import HomeIcon from '@mui/icons-material/Home';
import FaceIcon from '@mui/icons-material/Face';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { FC } from 'react';
import { useNavigate } from 'react-router';

type Props = {
  children: React.ReactNode;
  withProfile?: boolean;
  withHome?: boolean;
  label?: string;
};

export const HeaderLayout: FC<Props> = ({ children, withProfile, withHome, label }) => {
  const router = useNavigate();

  return (
    <Stack
      sx={{
        height: '100dvh',
        width: '100dvw',
        p: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {label ? label : 'U-Matching'}
        </Typography>
        <Stack direction="row" spacing={1}>
          {withProfile && (
            <IconButton onClick={() => router('/profile')}>
              <FaceIcon fontSize="medium" sx={{ color: 'black' }} />
            </IconButton>
          )}
          {withHome && (
            <IconButton onClick={() => router('/')}>
              <HomeIcon fontSize="medium" sx={{ color: 'black' }} />
            </IconButton>
          )}
        </Stack>
      </Stack>
      <Box>{children}</Box>
    </Stack>
  );
};
