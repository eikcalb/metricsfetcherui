"use client";

import { createContext, useState } from "react";

export const Loading = () => {
  const circleClass = "fill-slate-100 dark:fill-neutral-50";

  return (
    <svg
      className="h-full w-full"
      version="1.1"
      id="L5"
      x="0px"
      y="0px"
      viewBox="0 0 100 100"
    >
      <circle className={circleClass} stroke="none" cx="40" cy="50" r="2">
        <animateTransform
          attributeName="transform"
          dur="1s"
          type="translate"
          values="0 6 ; 0 -6; 0 6"
          repeatCount="indefinite"
          begin="0"
        />
      </circle>
      <circle className={circleClass} stroke="none" cx="50" cy="50" r="2">
        <animateTransform
          attributeName="transform"
          dur="1s"
          type="translate"
          values="0 2 ; 0 -2; 0 2"
          repeatCount="indefinite"
          begin="0.3"
        />
      </circle>
      <circle className={circleClass} stroke="none" cx="60" cy="50" r="2">
        <animateTransform
          attributeName="transform"
          dur="1s"
          type="translate"
          values="0 -6 ; 0 6; 0 -6"
          repeatCount="indefinite"
          begin="0.2"
        />
      </circle>
    </svg>
  );
};

export const LOADING_CONTEXT = createContext<{
  setLoading: Function;
  isLoading: boolean;
}>({
  isLoading: false,
  setLoading: (loading: boolean) => {},
});

export function LoadingContextProvider(props: any) {
  const [isLoading, setLoading] = useState(false);

  return (
    <LOADING_CONTEXT.Provider
      value={{
        isLoading,
        setLoading,
      }}
    >
      {props.children}
      <div
        className={`flex fixed bg-gray-950/80 z-50 bottom-0 top-0 left-0 right-0 animate__animated ${
          isLoading ? "animate__slideInLeft" : "animate__slideOutLeft"
        }`}
      >
        {isLoading ? <Loading /> : null}
      </div>
    </LOADING_CONTEXT.Provider>
  );
}
