import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-1.5">
        {eyebrow && <p className="text-xs font-semibold tracking-wider text-primary uppercase">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageContainer({ children, className }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10", className)}>{children}</div>;
}

export function StatCard({ icon: Icon, label, value, hint, accent = false, children }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md",
        accent && "border-primary/20 bg-gradient-to-br from-brand-soft to-card"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}
