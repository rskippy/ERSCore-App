import type { ScenarioInput } from "./scenario/types";

export type ImportedLocation = {
  name: string;
  input: ScenarioInput;
};

export type ExcelImportResult =
  | { success: true; locations: ImportedLocation[] }
  | { success: false; error: string };

export function parseExcelFile(file: File): Promise<ExcelImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const XLSX = await import("xlsx");
        const buffer = event.target?.result;
        if (!buffer) {
          resolve({ success: false, error: "Could not read file." });
          return;
        }
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // Expand !ref to cover all actual cells — sheet_to_json silently stops
        // at the worksheet's stored !ref boundary, which Excel may not update
        // when rows are appended to an existing file.
        const cellAddrs = Object.keys(firstSheet).filter((k) => !k.startsWith("!"));
        if (cellAddrs.length > 0) {
          const extent = cellAddrs.reduce(
            (acc, addr) => {
              const cell = XLSX.utils.decode_cell(addr);
              return {
                s: { r: Math.min(acc.s.r, cell.r), c: Math.min(acc.s.c, cell.c) },
                e: { r: Math.max(acc.e.r, cell.r), c: Math.max(acc.e.c, cell.c) },
              };
            },
            { s: { r: Infinity, c: Infinity }, e: { r: -Infinity, c: -Infinity } },
          );
          firstSheet["!ref"] = XLSX.utils.encode_range(extent);
        }

        const rawRows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
          header: 1,
          defval: null,
        });

        resolve(processRows(rawRows as unknown[][]));
      } catch {
        resolve({
          success: false,
          error: "Failed to parse Excel file. Ensure the file is a valid .xlsx workbook.",
        });
      }
    };

    reader.onerror = () => resolve({ success: false, error: "Failed to read file." });
    reader.readAsArrayBuffer(file);
  });
}

function isBlankRow(row: unknown[]): boolean {
  return row.every(
    (cell) => cell === null || cell === undefined || String(cell).trim() === "",
  );
}

function isHeaderRow(row: unknown[]): boolean {
  return String(row[0] ?? "").trim().toLowerCase() === "location name";
}

function requireNumeric(
  value: unknown,
  label: string,
  rowNum: number,
): { value: number } | { error: string } {
  if (value === null || value === undefined || String(value).trim() === "") {
    return { error: `Row ${rowNum}: "${label}" is required.` };
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return {
      error: `Row ${rowNum}: "${label}" must be a valid number (got "${value}").`,
    };
  }
  return { value: n };
}

function parseMemberReporting(
  value: unknown,
  rowNum: number,
): { value: boolean } | { error: string } {
  const str = String(value ?? "").trim().toLowerCase();
  if (str === "available") return { value: true };
  if (str === "not available") return { value: false };
  return {
    error: `Row ${rowNum}: "Member Reporting Availability" must be "Available" or "Not Available" (got "${value}").`,
  };
}

function processRows(rows: unknown[][]): ExcelImportResult {
  const dataRows = rows.filter((row) => !isBlankRow(row) && !isHeaderRow(row));

  if (dataRows.length === 0) {
    return { success: false, error: "No data rows found in the spreadsheet." };
  }
  const locations: ImportedLocation[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 1;

    // Column 0: Location Name
    const locationName = String(row[0] ?? "").trim();
    if (!locationName) {
      return { success: false, error: `Row ${rowNum}: Location Name is required.` };
    }

    // Column 1: Work Orders Started
    const workOrdersStarted = requireNumeric(row[1], "Work Orders Started", rowNum);
    if ("error" in workOrdersStarted) return { success: false, error: workOrdersStarted.error };

    // Column 2: Preventive Maintenance Touches
    const pmTouches = requireNumeric(row[2], "Preventive Maintenance Touches", rowNum);
    if ("error" in pmTouches) return { success: false, error: pmTouches.error };

    // Column 3: Member Reporting Availability
    const memberReporting = parseMemberReporting(row[3], rowNum);
    if ("error" in memberReporting) return { success: false, error: memberReporting.error };

    // Column 4: Average Days to Close
    const avgDays = requireNumeric(row[4], "Average Days to Close", rowNum);
    if ("error" in avgDays) return { success: false, error: avgDays.error };

    // Column 5: Completed Equipment Work Orders
    const completedWOs = requireNumeric(row[5], "Completed Equipment Work Orders", rowNum);
    if ("error" in completedWOs) return { success: false, error: completedWOs.error };

    // Column 6: Total Open Equipment Work Orders
    const totalOpenWOs = requireNumeric(row[6], "Total Open Equipment Work Orders", rowNum);
    if ("error" in totalOpenWOs) return { success: false, error: totalOpenWOs.error };

    // Column 7: Older Than 15 Days
    const older15 = requireNumeric(row[7], "Older Than 15 Days", rowNum);
    if ("error" in older15) return { success: false, error: older15.error };

    // Column 8: Older Than 30 Days
    const older30 = requireNumeric(row[8], "Older Than 30 Days", rowNum);
    if ("error" in older30) return { success: false, error: older30.error };

    // Column 9: Older Than 45 Days
    const older45 = requireNumeric(row[9], "Older Than 45 Days", rowNum);
    if ("error" in older45) return { success: false, error: older45.error };

    // Column 10: Total Monitored Assets
    const totalAssets = requireNumeric(row[10], "Total Monitored Assets", rowNum);
    if ("error" in totalAssets) return { success: false, error: totalAssets.error };

    // Column 11: Assets with 3+ Repairs
    const assets3Plus = requireNumeric(row[11], "Assets with 3+ Repairs", rowNum);
    if ("error" in assets3Plus) return { success: false, error: assets3Plus.error };

    locations.push({
      name: locationName,
      input: {
        workOrdersStarted: workOrdersStarted.value,
        preventiveMaintenanceTouches: pmTouches.value,
        memberReportingAvailable: memberReporting.value,
        averageDaysToClose: avgDays.value,
        completedEquipmentWorkOrders: completedWOs.value,
        totalOpenEquipmentWorkOrders: totalOpenWOs.value,
        olderThan15Days: older15.value,
        olderThan30Days: older30.value,
        olderThan45Days: older45.value,
        totalMonitoredAssets: totalAssets.value,
        assetsWith3PlusRepairs: assets3Plus.value,
      },
    });
  }

  return { success: true, locations };
}
