"use client";

import { Application } from "@/lib/app";
import { createContext } from "react";

const DEFAULT_APPLICATION = new Application();
export const APPLICATION_CONTEXT = createContext<{
  app: Application;
}>({
  app: DEFAULT_APPLICATION,
});

export default function ApplicationContextProvider(props: any) {
  return (
    <APPLICATION_CONTEXT.Provider
      value={{
        app: DEFAULT_APPLICATION,
      }}
    >
      {props.children}
    </APPLICATION_CONTEXT.Provider>
  );
}
