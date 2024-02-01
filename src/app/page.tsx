"use client";

import Footer from "@/components/footer";
import { APPLICATION_CONTEXT } from "@/contexts/application";
import { LOADING_CONTEXT } from "@/contexts/loading";
import { IMutableProvider, IProviderAggregate, IProviders } from "@/lib/app";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Colors,
  Legend,
  LineController,
  LinearScale,
} from "chart.js/auto";
import autocolors from "chartjs-plugin-autocolors";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FiRefreshCcw } from "react-icons/fi";

Chart.register(
  Colors,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  Legend,
  autocolors
);

const ProviderRow = ({ name, setSelected, isSelected }: any) => {
  const { app } = useContext(APPLICATION_CONTEXT);
  const [agg, setAgg] = useState<IProviderAggregate>();

  const fetchAggregates = async (name: string) => {
    // We split the name into 2 when there is no custom data.
    const dotIndex = name.lastIndexOf(".");
    try {
      const data = await app.getProviderAggregate({
        isCustom: dotIndex === -1? 1 : 0,
        name: name.substring(0, dotIndex),
        column: name.substring(dotIndex + 1),
      });

      setAgg(data);
    } catch (e: any) {
      toast(e.message, { type: "error" });
    }
  };

  useEffect(() => {
    if (name) {
      fetchAggregates(name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <div className="auto-cols-auto space-x-2 bg-sky-200 hover:bg-slate-50 items-stretch text-slate-950 rounded-xl flex flex-row overflow-hidden">
      <div className="space-x-8 flex-grow flex flex-row flex-wrap p-4 items-stretch">
        <div className="flex flex-col flex-1 justify-center">
          <span className="text-sm">{name}</span>
        </div>
        <div className="flex flex-col flex-1 uppercase">
          <span className="text-xs font-semibold text-slate-400">Min</span>
          <span className="text-sm flex-1">{agg?.data.min || 0}</span>
        </div>
        <div className="flex flex-col flex-1 uppercase">
          <span className="text-xs font-semibold text-slate-400">Max</span>
          <span className="text-sm flex-1">{agg?.data.max || 0}</span>
        </div>{" "}
        <div className="flex flex-col flex-1 uppercase">
          <span className="text-xs font-semibold text-slate-400">Average</span>
          <span className="text-sm flex-1">{agg?.data.avg || 0}</span>
        </div>{" "}
        <div className="flex flex-col flex-1 uppercase">
          <span className="text-xs font-semibold text-slate-400">Total</span>
          <span className="text-sm flex-1">{agg?.data.total || 0}</span>
        </div>{" "}
        <div className="flex flex-col flex-1 uppercase">
          <span className="text-xs font-semibold text-slate-400">Count</span>
          <span className="text-sm flex-1">{agg?.data.count || 0}</span>
        </div>
        <div className="flex flex-col flex-1 uppercase items-stretch text-center space-y-2">
          <span className="text-xs font-semibold text-slate-400">Show</span>
          <input
            type="checkbox"
            onChange={() => setSelected(!isSelected)}
            checked={isSelected}
            className="text-sm"
          />
        </div>
      </div>

      <button
        className="group transition-all bg-cyan-100/25 hover:bg-sky-600/80 p-4 hover:text-slate-50"
        onClick={() => fetchAggregates(name)}
      >
        <FiRefreshCcw className="transition-all group-hover:scale-150" />
      </button>
    </div>
  );
};

export default function Home() {
  const { app } = useContext(APPLICATION_CONTEXT);
  const { setLoading } = useContext(LOADING_CONTEXT);
  const [providerData, setProviderData] = useState<IMutableProvider>({});
  const [selectedPath, setSelectedPath] = useState<Set<string>>(new Set());
  const [updateTime, setUpdateTime] = useState<number>(0);
  const [refreshTime, setRefreshTime] = useState<number>(60000);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart>();
  const updateInterval = useRef<ReturnType<typeof setInterval>>();

  const fetchProviderInternal = async () => {
    try {
      const providers = await app.getProviders();
      setProviderData(parseProviderData(providers));
      setUpdateTime(providers.nextUpdateTime);
      chart.current?.update();
      return providers;
    } catch (e) {
      toast("Error occurred while fetching provider data!", { type: "error" });
      console.error("Failed to retrieve providers.", e);
      throw e;
    }
  };

  const fetchProviders = async () => {
    clearInterval(updateInterval.current);
    setLoading(true);
    try {
      await fetchProviderInternal();

      updateInterval.current = setInterval(fetchProviderInternal, refreshTime);
    } catch (e) {
      console.log("Error occurred!");
    } finally {
      setLoading(false);
    }
  };

  const parseProviderData = (providerData: IProviders) => {
    // Given a provider metric path, generate the data that matches
    const result: IMutableProvider = {};
    // The path will be in format `provider`.`column`
    providerData.providers.forEach((prov) => {
      prov.data.forEach((d) => {
        for (const key in d) {
          if (["id", "timestamp", "counter"].includes(key)) {
            continue;
          }

          const newKey = prov.isCustom ? prov.name : `${prov.name}.${key}`;
          if (!(newKey in result)) {
            result[newKey] = [];
          }

          result[newKey].push({
            key,
            value: isNaN(d[key]) ? 0 : d[key],
            path: newKey,
            counter: d.counter,
            timestamp: d.timestamp,
            isCustom: prov.isCustom,
          });
        }
      });
    });

    return result;
  };

  useEffect(() => {
    if (canvasRef.current && !chart.current) {
      fetchProviders();

      const datasets = Object.entries(providerData).map(([key, provider]) => {
        return {
          label: key,
          data: provider.map((metric) => ({
            x: metric.timestamp * 1000,
            y: metric.value,
          })),
        };
      });

      chart.current = new Chart(canvasRef.current, {
        data: {
          datasets,
        },
        options: {
          layout: {
            padding: 4,
          },
          maintainAspectRatio: false,
          parsing: false,
          responsive: true,
          scales: {
            x: {
              type: "time",
            },
            y: {
              bounds: "data",
            },
          },
        },
        plugins: [autocolors as any],
        type: "line",
      });

      chart.current.options.plugins!.legend!.position = "bottom";
      chart.current.options.plugins!.legend!.position = "bottom";
      chart.current.update("none");

      canvasRef.current.classList.remove("hidden");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  useEffect(() => {
    const datasets = Object.entries(providerData)
      .filter(([key]) => selectedPath.has(key))
      .map(([key, provider]) => {
        return {
          label: key,
          data: provider.map((metric) => ({
            x: metric.timestamp * 1000,
            y: metric.value,
          })),
        };
      });
    if (chart.current) {
      chart.current.data.datasets = datasets;
      chart.current.update();
    }
  }, [providerData, selectedPath]);

  return (
    <main className="space-y-4 flex-1 flex flex-col overflow-auto py-4">
      <div className="w-full flex justify-between space-x-4 px-8 items-center">
        <h1 className="text-xl font-bold uppercase">Dashboard</h1>
        <div
          className="space-x-4 items-center flex"
          title={`Server suggests the next refreshg time to be ${
            updateTime / 1000
          } seconds.`}
        >
          <span className="text-slate-200/80 font-mono text-sm">
            Auto Refresh: {refreshTime / 1000} seconds
          </span>
          <button
            className="bg-cyan-900/25 hover:bg-green-400/80 border-2 rounded-lg px-4 py-2"
            onClick={fetchProviders}
          >
            <FiRefreshCcw />
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-300 px-8 font-semibold">
        <p className="inline">
          Data representing metrics fetched by the application are displayed
          here. The table following the chart can be used to configure what
          information should be displayed in the chart.
        </p>
      </div>
      <div className="bg-sky-800 px-8 w-full py-12 space-y-4 flex-grow flex-col justify-start">
        <div className="p-4 min-h-[80vh] relative bg-slate-50 border-0 rounded-lg">
          <canvas id="chart" className="hidden" ref={canvasRef} />
        </div>

        {Object.keys(providerData).map((k: any) => (
          <ProviderRow
            key={k}
            name={k}
            isSelected={selectedPath.has(k)}
            setSelected={(isSelected: boolean) => {
              if (isSelected) {
                selectedPath.add(k);
              } else {
                selectedPath.delete(k);
              }

              setSelectedPath(new Set(selectedPath));
            }}
          />
        ))}
      </div>
      <Footer />
    </main>
  );
}
