"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface IModalProps {
  children?: ReactNode;
  canClose?: boolean;
  open: boolean;
  onClose: Function;
}

export function Modal(props: IModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted ? (
    createPortal(
      <div
        className={`${
          props.open ? "flex" : "hidden"
        } fixed z-40 inset-0 bg-slate-950 bg-opacity-95 overflow-y-auto w-full`}
        onClick={() => (props.canClose ? props.onClose() : null)}
      >
        <div className="relative my-auto mx-auto p-4 max-w-fit min-w-80 shadow-lg shadow-slate-700 rounded-lg bg-sky-600 animate__animated animate__rubberBand">
          {props.children}
        </div>
      </div>,
      global.document.body
    )
  ) : (
    <></>
  );
}
