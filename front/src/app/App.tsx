import { RouterProvider } from "react-router-dom";
import { AppRouter } from "./routes/AppRouter";

export const App = () => {
  return <RouterProvider router={AppRouter} />;
};
