import "./App.css";
import { useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/home.page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/auto-search",
    element: <h1>Auto Search</h1>,
  },
  {
    path: "/*",
    element: <h1>Not Found</h1>,
  },
]);

function App() {
  const [isExtension] = useState(() => {
    const path = window.location.href;
    if (
      path.startsWith("chrome-extension://") ||
      path.startsWith("moz-extension://")
    ) {
      return true;
    }

    return false;
  });

  if (isExtension) {
    return <HomePage />;
  }

  return <RouterProvider router={router} />;
}

export default App;
