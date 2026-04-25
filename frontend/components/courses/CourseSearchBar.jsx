"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CourseSearchBar = memo(({ 
  value, 
  onChange, 
  placeholder = "Search courses by name, code, or description...",
  debounceMs = 300 
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceMs]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
  }, [onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-14 pr-14 h-14 text-base font-medium border-2 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white focus:ring-2 focus:ring-white/20 rounded-xl backdrop-blur-sm"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          onClick={handleClear}
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
});

CourseSearchBar.displayName = "CourseSearchBar";

export default CourseSearchBar;
