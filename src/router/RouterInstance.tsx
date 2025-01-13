import { NotFoundPage } from '@/components/pageContent/NotFoundPage';
import { IndexPage } from '@/features/index/IndexPage';
import { FC, ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

type RouteItemType = {
  path: string;
  element: ReactNode;
};

export const RouterInstance: FC = () => {
  const routeArray: RouteItemType[] = [
    {
      path: '/',
      element: <IndexPage />,
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
