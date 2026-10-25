import { createRouter } from "@tanstack/react-router";
import { clientEnv } from "./config/env";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    basepath: clientEnv.VITE_APP_BASE_PATH,
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
