import { RouterProvider } from "react-router-dom";
import { AppRouter } from "./router/AppRouter";
import { AppProviders } from "./providers/AppProviders";

export const App = () => {
  return (
    <AppProviders>
      <RouterProvider router={AppRouter} />
    </AppProviders>
  );
};
