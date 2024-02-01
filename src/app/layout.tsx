import Sidebar from "@/components/sidebar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  HiCog,
  HiOutlineCodeBracket,
  HiOutlineSquares2X2,
} from "react-icons/hi2";
import { ToastContainer } from "react-toastify";
import "./globals.css";
import "animate.css";
import "highlight.js/styles/dark.css";
import "react-toastify/dist/ReactToastify.css";
import { LoadingContextProvider } from "@/contexts/loading";
import ApplicationContextProvider from "@/contexts/application";
import Configuration from "@/components/configuration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Metrics Fetcher",
  description:
    "This software is designed to monitor Windows computers for various metrics, utilizing the PDH API. The application collects real-time data on system performance, resource usage, and other relevant metrics. This data is then elegantly displayed to provide insights into computer health and performance. One notable feature is the integration of a JavaScript engine, allowing users to define and collect custom metrics to meet specific monitoring needs. The collected custom metrics are efficiently stored in an SQLite database, streamlining data management and accessibility. This software offers a holistic solution for in-depth system monitoring and custom metric tracking on Windows computers.",
};

const ROUTES = [
  {
    name: "Dashboard",
    url: "/",
    icon: (
      <HiOutlineSquares2X2 className="text-2xl group-hover:scale-125 transition-all" />
    ),
  },
  {
    name: "Scripting",
    url: "/scripting",
    icon: (
      <HiOutlineCodeBracket className="text-2xl group-hover:scale-125 transition-all" />
    ),
  },
  {
    name: "Config",
    url: "/configure",
    icon: <HiCog className="text-2xl group-hover:scale-125 transition-all" />,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApplicationContextProvider>
          <LoadingContextProvider>
            <div className="flex h-screen max-h-screen flex-row items-stretch justify-start bg-gradient-to-bl from-slate-950 to-50% to-sky-950 overflow-hidden">
              <Sidebar
                className="bg-slate-900 px-3 py-2 space-y-4 border-e border-e-gray-700/50 flex flex-col justify-center items-center"
                routes={ROUTES}
              />
              <div className="flex flex-1">{children}</div>
            </div>
            <Configuration />
          </LoadingContextProvider>
        </ApplicationContextProvider>
        <ToastContainer
          hideProgressBar
          position="top-center"
          theme="dark"
          autoClose={5000}
        />
      </body>
    </html>
  );
}
