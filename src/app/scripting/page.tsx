"use client";

import Footer from "@/components/footer";
import { APPLICATION_CONTEXT } from "@/contexts/application";
import { LOADING_CONTEXT } from "@/contexts/loading";
import { IScript } from "@/lib/app";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import Link from "next/link";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

export default function Scripting() {
  const { app } = useContext(APPLICATION_CONTEXT);
  const { setLoading } = useContext(LOADING_CONTEXT);
  const [value, setValue] = useState<IScript[]>();
  const ref = useRef<ReactCodeMirrorRef | null>(null);
  const isInit = useRef(false);

  const fetchScripts = useCallback(async () => {
    setLoading(true);

    try {
      const scripts = await app.getScripts();
      setValue(scripts);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }, [app, setLoading]);

  useEffect(() => {
    if (!isInit.current) {
      // Fetch all saved scripts
      fetchScripts();
      isInit.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="space-y-4 flex-1 flex flex-col overflow-auto py-4">
      <h1 className="text-xl font-bold px-8 uppercase">Scripting</h1>
      <div className="text-sm text-gray-300 px-8 font-semibold space-x-1">
        <p className="inline">
          You can provide custom scripts that will be executed at intervals in
          the application.
        </p>
        <p className="inline">
          On this page you can see the list of your current scripts and you can
          also add a new script.
        </p>
      </div>
      <div className="bg-sky-800 px-8 w-full py-4 space-y-4 flex-grow">
        <div className="y-2 flex justify-between items-center">
          <Link
            className="rounded-lg bg-cyan-50 hover:bg-blue-100 text-gray-900 text-sm font-semibold uppercase px-3 py-2"
            href="/scripting/details"
          >
            New Script
          </Link>
        </div>

        <div className="gap-4 grid md:grid-cols-3">
          {value?.map((script) => (
            <Link href={`/scripting/details?name=${script.name}`} key={script.name} className="auto- p-4 bg-sky-600 hover:bg-sky-500 rounded-xl flex flex-col">
              <div>
                <span className="text-lg">Name: {script.name}</span>
              </div>
              <div>
                <span className="text-sm">Metric Counter: {script.metricName}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
