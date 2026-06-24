"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { TableRendererProps } from "@/lib/types";
import CsvImportButton from "./CsvImportButton";

export default function TableRenderer({
  table,
  mode = "runtime",
  onDataChange,
}: TableRendererProps) {
  const [data, setData] = useState<Record<string, unknown>[]>(table.data ?? []);

  function handleImport(rows: Record<string, unknown>[]) {
    const merged = [...data, ...rows];
    setData(merged);
    onDataChange?.(merged);
  }

  const columnKeys = table.columns.map((c) => c.key);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{table.title ?? table.id}</h3>
        {table.csvImport && mode === "runtime" && (
          <CsvImportButton columnKeys={columnKeys} onImport={handleImport} />
        )}
      </div>

      {data.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No data rows.{" "}
          {table.csvImport ? "Import a CSV file to populate this table." : "Add data in the schema."}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {table.columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                {table.columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.type === "badge" ? (
                      <Badge variant="secondary">{String(row[col.key] ?? "")}</Badge>
                    ) : (
                      String(row[col.key] ?? "")
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
