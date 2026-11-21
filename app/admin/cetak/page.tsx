import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getBaseUrl } from "@/lib/base-url";
import { getSlots } from "@/lib/sheets";
import PrintButton from "./print-button";

export const dynamic = "force-dynamic";

export default async function CetakPage() {
  if (!(await isAdmin())) redirect("/admin");
  const base = await getBaseUrl();
  const slots = await getSlots();
  const items = await Promise.all(
    slots.map(async (s) => ({
      ...s,
      link: `${base}/go/${s.slug}`,
      img: await QRCode.toDataURL(`${base}/go/${s.slug}`, { width: 600, margin: 2 }),
    }))
  );

  return (
    <main className="wide cetak">
      <header className="top noprint">
        <h1>Semua QR</h1>
        <div className="row">
          <a className="btn ghost-link" href="/admin">Kembali</a>
          <PrintButton />
        </div>
      </header>
      <p className="muted noprint">
        Isi QR hanya berupa alamat <code>{base}/go/…</code>, jadi tidak perlu dicetak ulang saat form diganti.
        Klik gambar untuk mengunduh PNG satu per satu.
      </p>
      <div className="grid">
        {items.map((it) => (
          <figure key={it.slug}>
            <a href={it.img} download={`${it.slug}.png`}>
              <img src={it.img} alt={`QR ${it.slug}`} />
            </a>
            <figcaption>
              <strong>{it.slug}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
