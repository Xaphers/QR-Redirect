import { NextResponse, after } from "next/server";
import { getSlotBySlug, logScan } from "@/lib/sheets";

export const dynamic = "force-dynamic";

// Setiap QR punya alamat tetap: /go/qr-01, /go/qr-02, ...
// Tujuannya dibaca dari Google Sheets setiap kali di-scan.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const slot = await getSlotBySlug(slug).catch(() => null);
  if (!slot || !slot.url) {
    return NextResponse.redirect(new URL("/belum-dipasangkan", req.url), 307);
  }
  after(() => logScan(slot.slug));
  const res = NextResponse.redirect(slot.url, 307);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
