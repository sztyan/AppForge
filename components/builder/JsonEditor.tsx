"use client";

/**
 * JsonEditor — thin shell that dynamically imports MonacoJsonEditor
 * with ssr:false so Next.js never tries to run Monaco on the server.
 * Per Next.js 16 docs, ssr:false MUST live inside a Client Component.
 */

import dynamic from "next/dynamic";

const MonacoJsonEditor = dynamic(
  () => import("@/components/builder/MonacoJsonEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-600 border-t-blue-400" />
          <span className="text-xs text-neutral-500 font-mono">
            Loading editor…
          </span>
        </div>
      </div>
    ),
  }
);

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JsonEditor({ value, onChange }: JsonEditorProps) {
  return <MonacoJsonEditor value={value} onChange={onChange} height="100%" />;
}
