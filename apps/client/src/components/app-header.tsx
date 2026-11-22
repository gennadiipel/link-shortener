import brandMark from "../assets/brand-mark.svg";

export function AppHeader() {
  return (
    <header className="flex min-h-19 flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-outline bg-white px-4 py-4 sm:px-7">
      <div className="flex min-w-0 items-center gap-2.5">
        <img
          src={brandMark}
          width={32}
          height={32}
          alt=""
          className="shrink-0"
        />
        <span className="text-lg leading-tight font-bold sm:text-[23px]">
          Lapin AMK link shortener
        </span>
      </div>
      <span className="shrink-0 text-[13px] leading-normal text-muted">
        About the project
      </span>
    </header>
  );
}
