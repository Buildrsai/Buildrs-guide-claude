export function PageHeader({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between">
        <h1 className="headline-lg text-secondary" data-testid="page-title">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
