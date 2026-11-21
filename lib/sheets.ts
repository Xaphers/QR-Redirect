import { google } from "googleapis";

export type Slot = {
  row: number; // nomor baris di sheet
  slug: string;
  nama: string;
  url: string; // kosong = belum dipasangkan
};

const SLOTS = "events";
const SCANS = "scans";

function sheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

const id = () => process.env.SHEET_ID as string;

export async function getSlots(): Promise<Slot[]> {
  const res = await sheets().spreadsheets.values.get({
    spreadsheetId: id(),
    range: `${SLOTS}!A2:C`,
  });
  return (res.data.values || [])
    .map((r, i) => ({
      row: i + 2,
      slug: String(r[0] || "").trim(),
      nama: String(r[1] || "").trim(),
      url: String(r[2] || "").trim(),
    }))
    .filter((s) => s.slug);
}

export async function getSlotBySlug(slug: string) {
  const slots = await getSlots();
  return slots.find((s) => s.slug === slug) || null;
}

export async function saveSlot(slug: string, nama: string, url: string) {
  const slots = await getSlots();
  const existing = slots.find((s) => s.slug === slug);
  const api = sheets().spreadsheets.values;
  if (existing) {
    await api.update({
      spreadsheetId: id(),
      range: `${SLOTS}!B${existing.row}:C${existing.row}`,
      valueInputOption: "RAW",
      requestBody: { values: [[nama, url]] },
    });
  } else {
    await api.append({
      spreadsheetId: id(),
      range: `${SLOTS}!A:C`,
      valueInputOption: "RAW",
      requestBody: { values: [[slug, nama, url]] },
    });
  }
}

// Membuat slot qr-01 ... qr-NN yang belum ada (url masih kosong)
export async function seedSlots(count: number) {
  const slots = await getSlots();
  const have = new Set(slots.map((s) => s.slug));
  const rows: string[][] = [];
  for (let i = 1; i <= count; i++) {
    const slug = `qr-${String(i).padStart(2, "0")}`;
    if (!have.has(slug)) rows.push([slug, `QR ${String(i).padStart(2, "0")}`, ""]);
  }
  if (rows.length === 0) return 0;
  await sheets().spreadsheets.values.append({
    spreadsheetId: id(),
    range: `${SLOTS}!A:C`,
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
  return rows.length;
}

export async function logScan(slug: string) {
  try {
    await sheets().spreadsheets.values.append({
      spreadsheetId: id(),
      range: `${SCANS}!A:B`,
      valueInputOption: "RAW",
      requestBody: { values: [[new Date().toISOString(), slug]] },
    });
  } catch {
    // log gagal tidak boleh menghalangi redirect
  }
}

export function isValidUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
