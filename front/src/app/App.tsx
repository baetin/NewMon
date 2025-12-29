import { RouterProvider } from 'react-router-dom';

import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router/AppRouter';

export const App = () => {
  return (
    <AppProviders>
      <RouterProvider router={AppRouter} />
    </AppProviders>
  );
};
