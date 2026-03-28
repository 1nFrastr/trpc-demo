import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.js";

hydrateRoot(
  document.getElementById("app")!,
  <StrictMode>
    <App />
  </StrictMode>,
);
