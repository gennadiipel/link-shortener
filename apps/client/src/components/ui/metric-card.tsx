type MetricCardProps = {
  label: string;
  value: string | number;
  description: string;
  valueSize?: "default" | "large";
};

export function MetricCard({
  label,
  value,
  description,
  valueSize = "default",
}: MetricCardProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-[10px] border border-outline bg-subtle p-4">
      <dt className="text-xs leading-normal font-semibold text-muted">
        {label}
      </dt>
      <dd className="flex min-w-0 flex-col gap-1.5">
        <span
          className={`wrap-anywhere ${valueSize === "large" ? "text-[28px] leading-[1.2] font-bold" : "text-lg leading-[1.3] font-semibold"}`}
        >
          {value}
        </span>
        <span className="text-xs leading-normal text-muted">{description}</span>
      </dd>
    </div>
  );
}
