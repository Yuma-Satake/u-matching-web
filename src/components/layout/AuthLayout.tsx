import { LOCAL_STORAGE_PREFIX } from '@/lib/const';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';

type Props = {
  children: React.ReactNode;
};

export const AuthLayout: FC<Props> = ({ children }) => {
  const router = useNavigate();

  useEffect(() => {
    if (
      !localStorage.getItem(`${LOCAL_STORAGE_PREFIX}MAIL`) ||
      !localStorage.getItem(`${LOCAL_STORAGE_PREFIX}USER_ID`)
    ) {
      router('/auth');
    }
  }, []);

  return children;
};
