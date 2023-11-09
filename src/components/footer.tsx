export default function Footer() {
  return (
    <section className="py-2 space-y-0 group flex flex-col justify-center items-center">
      <p className="text-xs text-slate-400 font-semibold">
        &copy; {process.env.NEXT_PUBLIC_YEAR} {process.env.NEXT_PUBLIC_AUTHOR}
      </p>
      <p className="text-xs text-center text-slate-300/40 group-hover:text-slate-100 font-semibold">
        v{process.env.NEXT_PUBLIC_VERSION}
      </p>
    </section>
  );
}
