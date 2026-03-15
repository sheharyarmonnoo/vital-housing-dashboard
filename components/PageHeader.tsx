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
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-[#18181b]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-[#71717a] mt-0.5">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
