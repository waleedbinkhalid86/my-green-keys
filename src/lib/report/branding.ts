export const REPORT_BRANDING_STORAGE_KEY = "mgk_report_school_branding";

export type ReportSchoolBranding = {
  name: string;
  logoDataUrl: string | null;
};

export function loadReportBranding(): ReportSchoolBranding {
  if (typeof window === "undefined") {
    return { name: "", logoDataUrl: null };
  }
  try {
    const raw = localStorage.getItem(REPORT_BRANDING_STORAGE_KEY);
    if (!raw) return { name: "", logoDataUrl: null };
    const parsed = JSON.parse(raw) as Partial<ReportSchoolBranding>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      logoDataUrl: typeof parsed.logoDataUrl === "string" ? parsed.logoDataUrl : null,
    };
  } catch {
    return { name: "", logoDataUrl: null };
  }
}

export function saveReportBranding(branding: ReportSchoolBranding) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REPORT_BRANDING_STORAGE_KEY, JSON.stringify(branding));
}
