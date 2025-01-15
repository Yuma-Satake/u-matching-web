import { NotFoundPage } from '@/components/pageContent/NotFoundPage';
import { IndexPage } from '@/features/index/IndexPage';
import { AuthPage } from '@/features/auth/AuthPage';
import { FC, ReactNode, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { User, UserWithIcon } from '@/types/supabase';
import { LOCAL_STORAGE_PREFIX } from '@/lib/const';
import { supabaseClient } from '@/lib/supabaseClient';
import { ProfileUserPage } from '@/features/profile/ProfileUserPage';

type RouteItemType = {
  path: string;
  element: ReactNode;
};

export const RouterInstance: FC = () => {
  const [user, setUser] = useState<UserWithIcon | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}USER_ID`);

    (async () => {
      const res = await supabaseClient.from('users').select('*').eq('id', userId!);
      if (!res.data) return;

      const user = res.data[0];
      const res2 = await supabaseClient.from('photos').select('*').eq('id', user.icon_img_id);

      if (!res2.data) return;

      const icon = res2.data[0].img_url;
      setUser({ ...user, icon });
    })();
  }, []);

  const routeArray: RouteItemType[] = [
    {
      path: '/',
      element: user && (
        <AuthLayout>
          <IndexPage user={user} />
        </AuthLayout>
      ),
    },
    {
      path: '/auth',
      element: <AuthPage setUser={setUser} />,
    },
    {
      path: '/profile',
      element: user && (
        <AuthLayout>
          <ProfilePage user={user} />
        </AuthLayout>
      ),
    },
    {
      path: '/profile/:id',
      element: user && (
        <AuthLayout>
          <ProfileUserPage />
        </AuthLayout>
      ),
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ];

  return (
    <BrowserRouter>
      <Routes>
        {routeArray.map((routeItem) => (
          <Route key={routeItem.path} path={routeItem.path} element={routeItem.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
};
