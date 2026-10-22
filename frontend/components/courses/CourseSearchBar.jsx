"use client";

import { memo, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CourseSearchBar = memo(function CourseSearchBar({ value, onChange, placeholder = "Search courses…", debounceMs = 250 }) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    const t = setTimeout(() => onChange(local), debounceMs);
    return () => clearTimeout(t);
  }, [local, onChange, debounceMs]);

  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={local} onChange={(e) => setLocal(e.target.value)} placeholder={placeholder} className="h-10 pr-10 pl-9" autoFocus />
      {local && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1.5 -translate-y-1/2"
          onClick={() => {
            setLocal("");
            onChange("");
          }}
          aria-label="Clear search"
        >
          <X />
        </Button>
      )}
    </div>
  );
});

export default CourseSearchBar;
