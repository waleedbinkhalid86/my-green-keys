"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import {
  BULK_UPLOAD_MAX_ROWS,
  parseBulkUploadSheetRows,
  TEMPLATE_EXAMPLE_ROWS,
  validRowsForSubmit,
} from "@/lib/kid-login/bulk-upload-parse";
import type {
  BulkStudentsApiResponse,
  BulkStudentRowResult,
  ParsedBulkRow,
} from "@/lib/kid-login/bulk-upload-types";

type Step = "upload" | "results";

const FOREST = {
  deep: "#1B4332",
  main: "#2D6A4F",
  cta: "#52B788",
  accent: "#74C69D",
  pale: "#F0F9F4",
  border: "#E5E7EB",
  muted: "#6B7280",
} as const;

interface BulkStudentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  schoolName: string;
  onStudentsAdded?: () => void;
}

function downloadTemplateXlsx() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Name", "Grade"],
    ...TEMPLATE_EXAMPLE_ROWS.map((r) => [r.name, r.grade]),
  ]);
  ws["!cols"] = [{ wch: 24 }, { wch: 8 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  XLSX.writeFile(wb, "my-green-keys-student-template.xlsx");
}

function readXlsxRows(file: File): Promise<Array<[string, string]>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Could not read file"));
          return;
        }
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error("Spreadsheet has no sheets"));
          return;
        }
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
          header: 1,
          defval: "",
          raw: false,
        }) as (string | number)[][];

        const dataRows = rows.slice(1).filter((row) => {
          const a = String(row[0] ?? "").trim();
          const b = String(row[1] ?? "").trim();
          return a.length > 0 || b.length > 0;
        });

        resolve(
          dataRows.map((row) => [String(row[0] ?? ""), String(row[1] ?? "")] as [string, string])
        );
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Failed to parse spreadsheet"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export function BulkStudentUploadModal({
  open,
  onOpenChange,
  classId,
  className,
  schoolName,
  onStudentsAdded,
}: BulkStudentUploadModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSucceededRef = useRef(false);
  const [step, setStep] = useState<Step>("upload");
  const [fileError, setFileError] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedBulkRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<BulkStudentRowResult[]>([]);
  const [resultClassName, setResultClassName] = useState(className);

  const validRows = useMemo(() => validRowsForSubmit(parsedRows), [parsedRows]);
  const hasRowErrors = parsedRows.some((r) => r.errors.length > 0);
  const tooManyRows = parsedRows.length > BULK_UPLOAD_MAX_ROWS;

  const resetState = useCallback(() => {
    setStep("upload");
    setFileError("");
    setParsedRows([]);
    setSubmitting(false);
    setResults([]);
    setResultClassName(className);
    uploadSucceededRef.current = false;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [className]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      if (uploadSucceededRef.current) {
        onStudentsAdded?.();
      }
      resetState();
    }
    onOpenChange(next);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    setParsedRows([]);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setFileError("Only .xlsx files are supported.");
      e.target.value = "";
      return;
    }

    try {
      const rawRows = await readXlsxRows(file);
      if (rawRows.length > BULK_UPLOAD_MAX_ROWS) {
        setFileError(`Too many rows (${rawRows.length}). Maximum is ${BULK_UPLOAD_MAX_ROWS}.`);
        return;
      }
      setParsedRows(parseBulkUploadSheetRows(rawRows));
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Could not parse file.");
    }
  };

  const handleConfirm = async () => {
    if (validRows.length === 0 || hasRowErrors || tooManyRows) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/bulk-students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: validRows.map((r) => ({
            name: r.name,
            grade: r.grade as number,
          })),
        }),
      });
      const json = (await res.json()) as BulkStudentsApiResponse & { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Upload failed");
      }
      setResults(json.results);
      setResultClassName(json.className || className);
      setStep("results");
      uploadSucceededRef.current = true;
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  const copyAllCodes = async () => {
    const added = results.filter((r) => r.status === "added" && r.loginCode);
    if (added.length === 0) {
      showToast("error", "No codes to copy.");
      return;
    }
    const text = added.map((r) => `${r.name}\t${r.loginCode}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      showToast("success", "Codes copied to clipboard.");
    } catch {
      showToast("error", "Could not copy codes.");
    }
  };

  const downloadPdf = () => {
    const added = results.filter((r) => r.status === "added" && r.loginCode);
    if (added.length === 0) {
      showToast("error", "No students to export.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageSize = 20;
    const chunks: typeof added[] = [];
    for (let i = 0; i < added.length; i += pageSize) {
      chunks.push(added.slice(i, i + pageSize));
    }

    chunks.forEach((chunk, pageIdx) => {
      if (pageIdx > 0) doc.addPage();
      const title = schoolName.trim() || "My Green Keys";
      doc.setFontSize(16);
      doc.setTextColor(27, 67, 50);
      doc.text(title, 14, 18);
      doc.setFontSize(11);
      doc.setTextColor(45, 106, 79);
      doc.text(`Class: ${resultClassName}`, 14, 26);
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text("Student login codes — keep private", 14, 32);

      autoTable(doc, {
        startY: 38,
        head: [["Name", "Kid code"]],
        body: chunk.map((r) => [r.name, r.loginCode ?? ""]),
        theme: "grid",
        headStyles: {
          fillColor: [45, 106, 79],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 50, fontStyle: "bold" } },
      });
    });

    doc.save(`student-codes-${resultClassName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]"
        style={{ borderColor: FOREST.border }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: FOREST.deep, fontWeight: 700 }}>
            Bulk add students
          </DialogTitle>
          <DialogDescription style={{ color: FOREST.muted }}>
            {className} — upload an Excel file with student names and grades.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <section style={sectionStyle}>
              <h3 style={sectionTitleStyle}>1. Download template</h3>
              <button type="button" onClick={downloadTemplateXlsx} style={secondaryBtnStyle}>
                Download Excel template
              </button>
              <p style={hintStyle}>
                Download the template, fill in your students (one per row), and upload it back. Max{" "}
                {BULK_UPLOAD_MAX_ROWS} students per upload. Example rows in the template are ignored if
                left unchanged.
              </p>
            </section>

            <section style={sectionStyle}>
              <h3 style={sectionTitleStyle}>2. Upload file</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => void handleFileChange(e)}
                style={{
                  width: "100%",
                  fontSize: "14px",
                  padding: "10px",
                  borderRadius: "12px",
                  border: `2px dashed ${FOREST.accent}`,
                  background: FOREST.pale,
                }}
              />
              {fileError ? <p style={errorTextStyle}>{fileError}</p> : null}
              {tooManyRows ? (
                <p style={errorTextStyle}>
                  Too many students ({parsedRows.length}). Maximum is {BULK_UPLOAD_MAX_ROWS}.
                </p>
              ) : null}
            </section>

            {parsedRows.length > 0 ? (
              <section style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Preview</h3>
            <div
              style={{
                maxHeight: "240px",
                overflow: "auto",
                borderRadius: "12px",
                border: `1px solid ${FOREST.border}`,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: FOREST.pale, color: FOREST.deep }}>
                    <th style={thStyle}>Row</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Grade</th>
                        <th style={thStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.map((row) => (
                        <tr key={row.rowIndex} style={{ borderTop: `1px solid ${FOREST.border}` }}>
                          <td style={tdStyle}>{row.rowIndex}</td>
                          <td style={tdStyle}>{row.name || "—"}</td>
                          <td style={tdStyle}>{row.gradeRaw || "—"}</td>
                          <td style={tdStyle}>
                            {row.errors.length > 0 ? (
                              <span style={{ color: "#B91C1C", fontSize: "12px" }}>
                                {row.errors.map((e) => `Row ${row.rowIndex}: ${e}`).join("; ")}
                              </span>
                            ) : (
                              <span style={{ color: FOREST.main }}>Ready</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
            </div>
              </section>
            ) : null}

            <button
              type="button"
              disabled={
                submitting ||
                validRows.length === 0 ||
                hasRowErrors ||
                tooManyRows ||
                parsedRows.length === 0
              }
              onClick={() => void handleConfirm()}
              style={{
                ...primaryBtnStyle,
                opacity:
                  submitting ||
                  validRows.length === 0 ||
                  hasRowErrors ||
                  tooManyRows ||
                  parsedRows.length === 0
                    ? 0.5
                    : 1,
                cursor:
                  submitting ||
                  validRows.length === 0 ||
                  hasRowErrors ||
                  tooManyRows ||
                  parsedRows.length === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {submitting
                ? "Adding students…"
                : `Confirm and add ${validRows.length} student${validRows.length === 1 ? "" : "s"}`}
            </button>
          </div>
        ) : (
          <section>
            <h3 style={sectionTitleStyle}>Results</h3>
            <div
              style={{
                maxHeight: "280px",
                overflow: "auto",
                borderRadius: "12px",
                border: `1px solid ${FOREST.border}`,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: FOREST.pale, color: FOREST.deep }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Grade</th>
                    <th style={thStyle}>Kid code</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, idx) => (
                    <tr key={`${row.name}-${idx}`} style={{ borderTop: `1px solid ${FOREST.border}` }}>
                      <td style={tdStyle}>{row.name}</td>
                      <td style={tdStyle}>{row.grade}</td>
                      <td style={{ ...tdStyle, fontFamily: "monospace", fontWeight: 700 }}>
                        {row.loginCode ?? "—"}
                      </td>
                      <td style={tdStyle}>
                        {row.status === "added" ? (
                          <span style={{ color: FOREST.main }}>✅ Added</span>
                        ) : (
                          <span style={{ color: "#B91C1C" }} title={row.reason}>
                            ❌ Failed{row.reason ? ` — ${row.reason}` : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
              <Button
                type="button"
                variant="outline"
                className="font-semibold"
                style={{ borderColor: FOREST.cta, color: FOREST.deep }}
                onClick={() => void copyAllCodes()}
              >
                Copy all codes
              </Button>
              <Button
                type="button"
                className="font-semibold"
                style={{ background: FOREST.cta, color: "#fff" }}
                onClick={downloadPdf}
              >
                Download as PDF
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="font-semibold"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}

const sectionStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "14px",
  background: "#FAFAF5",
  border: `1px solid ${FOREST.border}`,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: FOREST.deep,
  marginBottom: "12px",
};

const hintStyle: React.CSSProperties = {
  fontSize: "13px",
  color: FOREST.muted,
  marginTop: "10px",
  lineHeight: 1.5,
};

const errorTextStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#B91C1C",
  marginTop: "8px",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "8px",
  padding: "14px 20px",
  borderRadius: "12px",
  border: "none",
  background: `linear-gradient(135deg, ${FOREST.cta} 0%, #40916C 100%)`,
  color: "#fff",
  fontSize: "15px",
  fontWeight: 700,
  boxShadow: "0 4px 12px rgba(82, 183, 136, 0.25)",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: "12px",
  border: `2px solid ${FOREST.cta}`,
  background: "#fff",
  color: FOREST.deep,
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  verticalAlign: "top",
};
