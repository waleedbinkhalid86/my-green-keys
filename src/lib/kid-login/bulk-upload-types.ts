export interface BulkStudentRowInput {
  name: string;
  grade: number;
}

export interface BulkStudentRowResult {
  name: string;
  grade: number;
  loginCode: string | null;
  status: "added" | "failed";
  reason?: string;
}

export interface BulkStudentsApiResponse {
  results: BulkStudentRowResult[];
  className: string;
}

export interface ParsedBulkRow {
  rowIndex: number;
  name: string;
  gradeRaw: string;
  grade: number | null;
  errors: string[];
  isExampleRow: boolean;
}
