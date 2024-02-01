"use client";

import { Code } from "@/components/code";
import Footer from "@/components/footer";
import { APPLICATION_CONTEXT } from "@/contexts/application";
import { LOADING_CONTEXT } from "@/contexts/loading";
import { IScript } from "@/lib/app";
import { javascript } from "@codemirror/lang-javascript";
import { githubDark } from "@uiw/codemirror-theme-github";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HiCheck, HiTrash } from "react-icons/hi2";
import { toast } from "react-toastify";

const DEFAULT_CODE = `
/**
 * This function is called on each cycle of the metrics runner.
 * To get the current metric value from PDH for this cycle, use the function \`getCounterValue\`.
 * It returns a \`double\` value which is the counter value for this cycle.
 * You can save metric values to the database by calling \`persist\` which accepts a \`double\` value.
 * 
 * Ideally, you should save save a value for this custom script provider on each cycle.
 *
 * @returns {void} There is no return value from this function.
 */
function execute() {

};
`.trim();

const DEFAULT_SCRIPT: IScript = {
  metricName: "",
  name: "",
  scriptText: DEFAULT_CODE,
};

export default function Scripting() {
  const { app, metrics } = useContext(APPLICATION_CONTEXT);
  const { setLoading } = useContext(LOADING_CONTEXT);
  const [value, setValue] = useState(DEFAULT_SCRIPT.scriptText);
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("");
  const ref = useRef<ReactCodeMirrorRef | null>(null);
  const isInit = useRef(false);
  const router = useRouter();
  const params = useSearchParams();

  const metricsFilter = useMemo(() => {
    if (metric) {
      return metrics
        .filter((m) => m.toLowerCase().includes(metric.toLowerCase()))
        .slice(0, 400);
    } else {
      return metrics.slice(0, 400);
    }
  }, [metric, metrics]);

  const initRef = useRef<IScript>(DEFAULT_SCRIPT);
  const isNew = useMemo(() => !Boolean(params.get("name")), [params]);
  const hasCodeChanged = useMemo(
    () =>
      initRef.current.scriptText && value
        ? initRef.current.scriptText !== value
        : false,
    [value]
  );

  const findInitial = useCallback(async () => {
    try {
      const scripts = await app.getScripts();
      // Find this script
      const script = scripts.find(
        (script) => script.name === params.get("name")
      );
      if (script) {
        initRef.current = script;
        setValue(script?.scriptText || "");
        setName(script.name);
        setMetric(script.metricName);
      } else {
        toast("Failed to fetch script details!", { type: "error" });
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }, [app, params, setLoading]);

  useEffect(() => {
    if (!isNew && !isInit.current) {
      setLoading(true);

      // Fetch all saved scripts and find this script
      findInitial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <main className="space-y-4 flex-1 flex flex-col overflow-auto py-4">
      <h1 className="text-xl font-bold px-8 uppercase">Scripting</h1>
      <div className="text-sm text-gray-300 px-8 font-semibold space-x-1">
        <p className="inline">
          Using this interface, you can save custom metrics. This works by
          allowing you listen to custom performance counters.
        </p>
        <p className="inline">
          You can also chose to save arbitrary data. Each script provided will
          be run in parrallel with other metrics providers.
        </p>
        <p className="inline">
          Each script has access to 2 built-in functions <Code>persist()</Code>
          &nbsp; and <Code>getCounterValue()</Code>.
        </p>
        <p className="inline">
          The expected Metric Name will be a PDH path that will be used to query
          Windows at intervals for performance details. Details of how to build
          this path can be found
          <Link
            className="mx-2 text-cyan-300 hover:text-cyan-600"
            target="_blank"
            href="https://learn.microsoft.com/en-us/windows/win32/perfctrs/specifying-a-counter-path"
          >
            here
          </Link>
        </p>
      </div>
      <div className="bg-sky-800 px-8 w-full py-12 space-y-2">
        <div className="flex space-x-2 justify-between items-center">
          <input
            readOnly={!isNew}
            className="bg-gray-800 text-white rounded w-full py-2 px-3 leading-tight focus:bg-gray-950"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Script Name"
          />
          <input
            className="bg-gray-800 text-white rounded w-full py-2 px-3 leading-tight focus:bg-gray-950"
            type="text"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            placeholder="Metric Name"
            list="metric_name"
          />
        </div>
        <CodeMirror
          ref={ref}
          placeholder={"Add script logic to store custom metrics"}
          basicSetup={{
            tabSize: 4,
          }}
          theme={githubDark}
          value={value}
          height="400pt"
          extensions={[javascript({ jsx: false, typescript: false })]}
          onChange={(text) => setValue(text)}
          className="z-10"
        />

        <div className="flex space-x-8 items-end justify-between float-right">
          {isNew ? (
            <button
              disabled={!hasCodeChanged || !name || !metric}
              title={
                hasCodeChanged
                  ? `Save Script`
                  : `Update the code in to enable button`
              }
              onClick={async () => {
                setLoading(true);
                try {
                  await app.saveScript({
                    name,
                    scriptText: value,
                    metricName: metric,
                  });
                  toast("Script saved successfully!", {
                    type: "success",
                  });
                  router.replace(`/scripting/details?name=${name}`);
                } catch (e) {
                  console.log(e);
                }
                setLoading(false);
              }}
              className="px-3 py-2 rounded-lg flex text-gray-100 disabled:text-gray-500 disabled:bg-gray-800 bg-cyan-600 transition-all hover:bg-cyan-500 capitalize space-x-1 items-center"
            >
              <HiCheck className="text-lg" />
              <span>Save</span>
            </button>
          ) : (
            <div className="space-x-4 flex justify-end">
              <button
                disabled={!value || !name || !metric}
                title={`Update Script`}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await app.UpdateScript({
                      name,
                      scriptText: value,
                      metricName: metric,
                    });
                    toast("Script updated successfully!", {
                      type: "success",
                    });
                    router.replace(`/scripting/details?name=${name}`);
                  } catch (e) {
                    console.log(e);
                  }
                  setLoading(false);
                }}
                className="px-3 py-2 rounded-lg flex text-gray-100 disabled:text-gray-500 disabled:bg-gray-800 bg-cyan-600 transition-all hover:bg-cyan-500 capitalize space-x-1 items-center"
              >
                <HiCheck className="text-lg" />
                <span>Update</span>
              </button>
              <button
                title={"Delete script"}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await app.deleteScript(initRef.current);
                    toast("Script deleted successfully!", {
                      type: "success",
                    });

                    router.replace("/scripting");
                  } catch (e) {
                    console.log(e);
                  }
                  setLoading(false);
                }}
                className="px-3 py-2 rounded-lg flex text-gray-100 disabled:text-gray-500 disabled:bg-gray-800 bg-red-600 transition-all hover:bg-red-500 capitalize space-x-1 items-center"
              >
                <HiTrash className="text-lg" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        <datalist id="metric_name">
          {metricsFilter.map((m, i) => (
            <option key={i}>{m}</option>
          ))}
        </datalist>
      </div>
      <Footer />
    </main>
  );
}
