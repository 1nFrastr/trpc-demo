import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import type { DehydratedState } from "@tanstack/react-query";
import App from "./App.js";

declare global {
  interface Window {
    __TRPC_DEHYDRATED_STATE__?: DehydratedState;
  }
}

hydrateRoot(
  document.getElementById("app")!,
  <StrictMode>
    <App dehydratedState={window.__TRPC_DEHYDRATED_STATE__} />
  </StrictMode>,
);
