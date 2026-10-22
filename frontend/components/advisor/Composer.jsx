"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_LEN = 2000;

const Composer = forwardRef(function Composer({ onSend, onStop, isStreaming, placeholder }, ref) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    setValue: (v) => setValue(v),
  }));

  const submit = () => {
    if (!value.trim() || isStreaming) return;
    onSend(value);
    setValue("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="relative rounded-2xl border bg-card shadow-lg shadow-foreground/[0.03] transition-colors focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-primary/10"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX_LEN))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        rows={1}
        placeholder={placeholder}
        aria-label="Ask the advisor"
        className="field-sizing-content max-h-48 min-h-14 w-full resize-none bg-transparent py-4 pr-14 pl-4 text-[0.95rem] outline-none placeholder:text-muted-foreground"
      />
      <div className="absolute right-2.5 bottom-2.5">
        {isStreaming ? (
          <Button type="button" size="icon-lg" variant="secondary" onClick={onStop} aria-label="Stop generating">
            <Square className="fill-current" />
          </Button>
        ) : (
          <Button type="submit" size="icon-lg" disabled={!value.trim()} aria-label="Send">
            <ArrowUp />
          </Button>
        )}
      </div>
    </form>
  );
});

export default Composer;
