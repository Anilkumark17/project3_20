import { Badge } from "@/components/ui/badge";
import { difficultyMeta } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function DifficultyBadge({ level, className }) {
  const meta = difficultyMeta(level);
  if (!meta) return null;
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", meta.className, className)}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={cn("h-2.5 w-1 rounded-full bg-current", i > level && "opacity-25")} />
        ))}
      </span>
      {meta.label}
    </Badge>
  );
}
