import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/home.page";
import { ConfigContextProvider } from "./contexts/config-context";
import { SearchElementsPage } from "./pages/search-elements";
import { routes } from "./routes";
import { ListElements } from "./pages/list-elements";

const router = createBrowserRouter([
  {
    path: routes.root,
    element: <HomePage />,
  },
  {
    path: routes.searchElements,
    element: <SearchElementsPage />,
  },
  {
    path: routes.listElements,
    element: <ListElements />,
  },
  {
    path: routes.notFound,
    element: <h1>Not Found</h1>,
  },
]);

function App() {
  return (
    <ConfigContextProvider>
      <RouterProvider router={router} />
    </ConfigContextProvider>
  );
}

export default App;
