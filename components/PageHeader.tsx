export default function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1a2e2e] leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-[#5a7272] mt-1 max-w-[600px]">
              {subtitle}
            </p>
          )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
