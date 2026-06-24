/**
 * Minimal CSV parser for client-side table import.
 * Handles quoted fields and comma separators.
 */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

export function csvToTableData(
  text: string,
  columnKeys: string[]
): Record<string, unknown>[] {
  const { headers, rows } = parseCsv(text);
  if (headers.length === 0) return [];

  const keyMap = new Map<string, string>();
  columnKeys.forEach((key) => {
    const header = headers.find(
      (h) => h.toLowerCase() === key.toLowerCase() || h.toLowerCase().replace(/\s+/g, "") === key.toLowerCase()
    );
    if (header) keyMap.set(header, key);
  });

  // Fallback: map by column order
  if (keyMap.size === 0) {
    headers.forEach((h, i) => {
      if (columnKeys[i]) keyMap.set(h, columnKeys[i]);
    });
  }

  return rows.map((row) => {
    const record: Record<string, unknown> = {};
    headers.forEach((header, i) => {
      const key = keyMap.get(header) ?? columnKeys[i];
      if (key) record[key] = row[i] ?? "";
    });
    return record;
  });
}
