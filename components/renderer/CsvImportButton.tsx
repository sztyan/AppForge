"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { csvToTableData } from "@/lib/csv/parse-csv";
import { toast } from "sonner";

interface CsvImportButtonProps {
  columnKeys: string[];
  onImport: (data: Record<string, unknown>[]) => void;
  disabled?: boolean;
}

export default function CsvImportButton({
  columnKeys,
  onImport,
  disabled,
}: CsvImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const data = csvToTableData(text, columnKeys);
        if (data.length === 0) {
          toast.error("CSV import failed", { description: "No rows found in file." });
          return;
        }
        onImport(data);
        toast.success(`Imported ${data.length} row(s)`);
      } catch {
        toast.error("CSV import failed", { description: "Could not parse CSV file." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="gap-1.5"
      >
        <Upload className="h-3.5 w-3.5" />
        Import CSV
      </Button>
    </>
  );
}
