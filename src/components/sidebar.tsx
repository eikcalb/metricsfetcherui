"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface ISidebar {
  children?: ReactNode;
  className?: string;
  routes: {
    name: string;
    icon: ReactNode;
    url: string;
    description?: string;
  }[];
}

const RouteItem = ({
  route,
}: {
  route: { name: string; icon: ReactNode; url: string; description?: string };
}) => {
  const pathname = usePathname();
  const active =
    route.url === "/" ? pathname === route.url : pathname.startsWith(route.url);

  return (
    <Link
      title={route.description}
      href={route.url}
      className={`p-4 group transition-all hover:bg-blue-400/40 rounded-full ${
        active ? "bg-cyan-600" : "bg-transparent"
      }`}
    >
      <div>{route.icon}</div>
    </Link>
  );
};

export default function Sidebar(props: ISidebar) {
  return (
    <div className={props.className}>
      {props.routes.map((route) => (
        <RouteItem key={route.name} route={route} />
      ))}
    </div>
  );
}
