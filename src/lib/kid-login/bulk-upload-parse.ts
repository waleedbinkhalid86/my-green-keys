import type { ParsedBulkRow } from "@/lib/kid-login/bulk-upload-types";

export const BULK_UPLOAD_MAX_ROWS = 50;

export const TEMPLATE_EXAMPLE_ROWS = [
  { name: "Ali Khan", grade: 4 },
  { name: "Sara Ahmed", grade: 5 },
  { name: "Hamza Iqbal", grade: 4 },
] as const;

function isUnchangedExampleRow(name: string, grade: number | null): boolean {
  if (grade === null) return false;
  return TEMPLATE_EXAMPLE_ROWS.some(
    (ex) => ex.name.toLowerCase() === name.toLowerCase() && ex.grade === grade
  );
}

function parseGradeValue(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 1 || n > 8) return null;
  return n;
}

/** Parse sheet rows (array of [name, grade]) into validated preview rows. */
export function parseBulkUploadSheetRows(
  rawRows: Array<[string, string]>
): ParsedBulkRow[] {
  const parsed: ParsedBulkRow[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowIndex = i + 2;
    const [nameRaw = "", gradeRaw = ""] = rawRows[i];
    const name = nameRaw.trim();
    const grade = parseGradeValue(String(gradeRaw ?? ""));
    const errors: string[] = [];

    if (!name) {
      errors.push("missing name");
    }
    if (!String(gradeRaw ?? "").trim()) {
      errors.push("missing grade");
    } else if (grade === null) {
      errors.push("invalid grade (must be 1–8)");
    }

    const isExampleRow =
      name.length > 0 && grade !== null && isUnchangedExampleRow(name, grade);

    if (isExampleRow) {
      continue;
    }

    if (!name && !String(gradeRaw ?? "").trim()) {
      continue;
    }

    parsed.push({
      rowIndex,
      name,
      gradeRaw: String(gradeRaw ?? "").trim(),
      grade,
      errors,
      isExampleRow: false,
    });
  }

  return parsed;
}

export function validRowsForSubmit(rows: ParsedBulkRow[]): ParsedBulkRow[] {
  return rows.filter((r) => r.errors.length === 0 && r.name && r.grade !== null);
}
