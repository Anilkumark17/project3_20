"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// "[2]" / "[1][3]" → links the renderer turns into citation chips.
const linkCitations = (text) => text.replace(/\[(\d{1,2})\](?!\()/g, "[$1](#cite-$1)");

function CitationChip({ n, citation, onSelect }) {
  const chip = (
    <a
      href={`#source-${n}`}
      data-citation
      onClick={(e) => {
        e.preventDefault();
        onSelect?.(n);
      }}
      className="mx-0.5 inline-flex h-[1.15rem] min-w-[1.15rem] -translate-y-px items-center justify-center rounded-md bg-primary/12 px-1 align-middle font-mono text-[0.68rem] font-semibold text-primary no-underline transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {n}
    </a>
  );
  if (!citation) return chip;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{chip}</TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-semibold">
          {citation.courseTitle || "Syllabus"} {citation.courseCode && <span className="font-mono opacity-80">· {citation.courseCode}</span>}
        </p>
        <p className="opacity-80">{citation.section}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function Markdown({ content, citations = [], onCite }) {
  const byNumber = new Map(citations.map((c) => [c.n, c]));
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            const m = /^#cite-(\d+)$/.exec(href || "");
            if (m) return <CitationChip n={Number(m[1])} citation={byNumber.get(Number(m[1]))} onSelect={onCite} />;
            return (
              <a href={href} target="_blank" rel="noreferrer" {...props}>
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border">
              <table className="!my-0 w-full">{children}</table>
            </div>
          ),
        }}
      >
        {linkCitations(content)}
      </ReactMarkdown>
    </div>
  );
}

export default memo(Markdown);
