import "./App.css";
import {
  RouterProvider,
  createBrowserRouter,
  createMemoryRouter,
} from "react-router-dom";
import { HomePage } from "./pages/home.page";
import { ConfigContextProvider } from "./contexts/config-context";
import { SearchElementsPage } from "./pages/search-selectors";
import { routes } from "./routes";
import { ListElements } from "./pages/list-elements";

const path = window.location.href;
const isExtension =
  path.startsWith("chrome-extension://") || path.startsWith("moz-extension://");

const createRouter = isExtension ? createMemoryRouter : createBrowserRouter;

const router = createRouter([
  {
    path: routes.root,
    element: <HomePage />,
  },
  {
    path: routes.searchSelectors,
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
    <ConfigContextProvider isExtension={isExtension}>
      <RouterProvider router={router} />
    </ConfigContextProvider>
  );
}

export default App;
