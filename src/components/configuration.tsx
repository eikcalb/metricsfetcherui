"use client";

import { APPLICATION_CONTEXT } from "@/contexts/application";
import { LOADING_CONTEXT } from "@/contexts/loading";
import { useContext, useEffect, useRef, useState } from "react";
import { Modal } from "./modal";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Configuration() {
  const { app } = useContext(APPLICATION_CONTEXT);
  const { setLoading } = useContext(LOADING_CONTEXT);
  const [show, setShow] = useState(false);
  const [port, setPort] = useState(
    global?.localStorage?.getItem("Application.port") || ""
  );
  const isInit = useRef(false);
  const router =  useRouter();

  const initialize = async () => {
    setLoading(true);
    // Check if application is active.
    isInit.current = await app.initialize();
    if (!isInit.current) {
      toast("Could not connect to server. Configure the server to continue.", {
        type: "error",
      });
      setShow(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isInit.current) {
      initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal open={show} onClose={() => setShow(false)}>
      <form
        className="space-y-4"
        onSubmit={async () => {
          // We will save the port and try to connect
          setLoading(true);
          try {
            const newPort = Number.parseInt(port, 10);
            const isSet = await app.setBaseURL(newPort);
            if (!isSet) {
              throw new Error(
                "Could not connect to server. Please confirm port."
              );
            }

            setShow(false);
            toast("Server configured successfully", {
              type: "success",
            });

            router.refresh();
            isInit.current = true;
          } catch (e: any) {
            console.log(e);
            toast(e.message, { type: "error" });
          } finally {
            setLoading(false);
          }
        }}
      >
        <h1 className="uppercase text-lg font-semibold">Setup Application</h1>
        <h4 className="text-xs opacity-80 font-semibold">
          To continue using the application, you must specify the port where
          this server is running.
        </h4>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="port"
          type="number"
          placeholder="Enter application port"
          value={port}
          onChange={(e) => setPort(e.target.value)}
        />
        <button
          className="cursor-pointer text-center rounded-lg bg-cyan-50 hover:bg-blue-200 text-gray-900 text-sm font-semibold uppercase px-3 py-2"
          type="submit"
        >
          Save
        </button>
      </form>
    </Modal>
  );
}
