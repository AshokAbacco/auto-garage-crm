import React from "react";
import ReactDOM from "react-dom/client";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { createBrowserHistory } from "history";
import App from "./App.jsx";
import "./index.css";

const history = createBrowserHistory();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HistoryRouter
      history={history}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
    </HistoryRouter>
  </React.StrictMode>
);
