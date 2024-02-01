"use client";

import { Application } from "@/lib/app";
import { createContext, useEffect, useState } from "react";

const DEFAULT_APPLICATION = new Application();
export const APPLICATION_CONTEXT = createContext<{
  app: Application;
  metrics: string[];
}>({
  app: DEFAULT_APPLICATION,
  metrics: []
});

export default function ApplicationContextProvider(props: any) {
  const [metrics, setMetrics] = useState<string[]>([]);

  useEffect(() => {
    if(!metrics || metrics.length == 0) {
      DEFAULT_APPLICATION.getAvailableMetrics()
      .then(m => setMetrics(m.counters.sort()))
      .catch(e => console.error("Failed to fetch available metrics from computer.", e));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  return (
    <APPLICATION_CONTEXT.Provider
      value={{
        app: DEFAULT_APPLICATION,
        metrics,
      }}
    >
      {props.children}
    </APPLICATION_CONTEXT.Provider>
  );
}
