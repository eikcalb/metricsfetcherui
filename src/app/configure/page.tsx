"use client";

import { APPLICATION_CONTEXT } from "@/contexts/application";
import { LOADING_CONTEXT } from "@/contexts/loading";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { githubDark } from "@uiw/codemirror-theme-github";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useRouter } from "next/navigation";
import { HiCheck } from "react-icons/hi2";
import { toast } from "react-toastify";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  startTransition,
  useMemo,
} from "react";
import Footer from "@/components/footer";

const jsonLinter = jsonParseLinter();

export default function Configuration() {
  const { app } = useContext(APPLICATION_CONTEXT);
  const loading = useContext(LOADING_CONTEXT);
  const [value, setValue] = useState("");
  const [diagnostics, setDiagnostics] = useState<ReturnType<typeof jsonLinter>>(
    []
  );
  const router = useRouter();
  const ref = useRef<ReactCodeMirrorRef | null>(null);
  const initRef = useRef("");
  const isInitRef = useRef(false);

  const hasCodeChanged = useMemo(
    () =>
      initRef.current && value && diagnostics.length === 0
        ? JSON.stringify(JSON.parse(initRef.current)) !==
          JSON.stringify(JSON.parse(value))
        : false,
    [diagnostics.length, initRef, value]
  );

  const onChange = useCallback((val: string) => {
    if (ref.current?.view) {
      setDiagnostics(jsonLinter(ref.current.view));
    }
    setValue(val);
  }, []);

  const fetchConfig = async () => {
    loading.setLoading(true);
    try {
      const config = (await app.getConfig()).replace("\n", "\r\n");
      setValue(config);
      initRef.current = config;
    } catch (e) {
      // Error ocurred while fetching configuration
      console.error(e);
    } finally {
      loading.setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitRef.current) {
      fetchConfig();
      isInitRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <main className="space-y-4 flex-1 flex flex-col overflow-auto py-4">
      <h1 className="text-xl font-bold px-8 uppercase">Configuration</h1>
      <div className="text-sm text-gray-300 px-8 font-semibold">
        <p className="inline">
          Using this interface, you can update the configuration of this
          application. In order to implement the changes, a restart is required.
        </p>
      </div>
      <div className="flex-grow bg-sky-800 px-8 py-12 space-y-2">
        <CodeMirror
          autoFocus
          basicSetup={{ tabSize: 4 }}
          placeholder={"Configuration for the application"}
          ref={ref}
          theme={githubDark}
          value={value}
          height="400pt"
          extensions={[json()]}
          onChange={onChange}
        />
        <div className="flex space-x-8 items-start justify-between">
          <div className="flex items-center flex-grow self-center">
            {diagnostics.map((d, i) => (
              <span className="text-xs text-red-400 block" key={i}>
                {d.message}
              </span>
            ))}
          </div>
          <button
            disabled={!hasCodeChanged}
            title={hasCodeChanged ? `Save configuration` : `Update the configuration in to enable button`}
            onClick={async () => {
              loading.setLoading(true);
              const ok = global.confirm(
                "Updating the configuration will not take effect until you restart the application. Do you want to continue?"
              );

              if (ok) {
                try {
                  await app.saveConfig(value.trim());
                  initRef.current = value;
                  toast("Configuration saved successfully!", {
                    type: "success",
                  });
                } catch (e) {
                  console.log(e);
                }
              }
              loading.setLoading(false);
            }}
            className="px-3 py-2 rounded-lg flex text-gray-100 disabled:text-gray-500 disabled:bg-gray-800 bg-cyan-600 transition-all hover:bg-cyan-500 capitalize space-x-1 items-center"
          >
            <HiCheck className="text-lg" />
            <span>Save</span>
          </button>
        </div>
      </div>
      <Footer />
    </main>
  );
}
