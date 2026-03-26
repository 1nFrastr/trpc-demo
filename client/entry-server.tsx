import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createServerSideHelpers } from "@trpc/react-query/server";
import App from "./App.js";
import { appRouter } from "../server/appRouter.js";

export async function render(_url: string) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {},
  });

  await helpers.userList.prefetch();
  await helpers.userById.prefetch("1");

  const dehydratedState = helpers.dehydrate();
  const appHtml = renderToString(
    <StrictMode>
      <App dehydratedState={dehydratedState} />
    </StrictMode>,
  );

  return {
    appHtml,
    dehydratedState,
  };
}
