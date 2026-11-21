import { isAdmin } from "@/lib/auth";
import { getSlots } from "@/lib/sheets";
import { loginAction, logoutAction, saveAction, seedAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const sp = await searchParams;

  if (!(await isAdmin())) {
    return (
      <main className="narrow">
        <h1>Masuk admin</h1>
        <form action={loginAction} className="stack">
          <label>
            Password
            <input type="password" name="password" required autoFocus />
          </label>
          <button type="submit">Masuk</button>
          {sp.error && <p className="err">Password salah.</p>}
        </form>
      </main>
    );
  }

  let slots: Awaited<ReturnType<typeof getSlots>> = [];
  let sheetError = "";
  try {
    slots = await getSlots();
  } catch (e) {
    sheetError = e instanceof Error ? e.message : "Gagal membaca Google Sheets";
  }
  const paired = slots.filter((s) => s.url).length;

  return (
    <main className="wide">
      <header className="top">
        <h1>QR tetap, form bisa diganti</h1>
        <form action={logoutAction}>
          <button className="ghost" type="submit">Keluar</button>
        </form>
      </header>

      {sp.ok === "seed" && <p className="ok">Slot QR sudah dibuat.</p>}
      {sp.error === "input" && (
        <p className="err">Link harus diawali http:// atau https://.</p>
      )}
      {sheetError && <p className="err">{sheetError}</p>}

      <section className="bar">
        <p>
          <strong>{paired}</strong> dari <strong>{slots.length}</strong> QR sudah dipasangkan ke form.
        </p>
        <div className="row">
          <a className="btn" href="/admin/cetak">Cetak / unduh semua QR</a>
          <form action={seedAction}>
            <button className="ghost" type="submit">Buat slot QR 01–50</button>
          </form>
        </div>
      </section>

      <ul className="slots">
        {slots.map((s) => (
          <li key={s.slug} id={s.slug} className={s.url ? "" : "empty"}>
            <form action={saveAction} className="slot">
              <input type="hidden" name="slug" value={s.slug} />
              <div className="slug">
                <strong>{s.slug}</strong>
                {s.url ? (
                  sp.ok === s.slug ? <span className="ok small">Tersimpan</span> : null
                ) : (
                  <span className="small muted">belum dipasangkan</span>
                )}
              </div>
              <input name="nama" defaultValue={s.nama} aria-label={`Nama ${s.slug}`} placeholder="Nama event" />
              <input
                name="url"
                type="url"
                defaultValue={s.url}
                aria-label={`Link form ${s.slug}`}
                placeholder="https://forms.gle/..."
              />
              <button type="submit">Simpan</button>
            </form>
          </li>
        ))}
      </ul>

      {slots.length === 0 && !sheetError && (
        <p className="muted">Belum ada slot. Klik “Buat slot QR 01–50”.</p>
      )}

      <section>
        <h2>Tambah QR dengan nama sendiri</h2>
        <form action={saveAction} className="slot add">
          <input name="slug" placeholder="slug, misal meja-vip" required pattern="[a-zA-Z0-9-]+" />
          <input name="nama" placeholder="Nama event" />
          <input name="url" type="url" placeholder="https://forms.gle/..." />
          <button type="submit">Tambah</button>
        </form>
      </section>
    </main>
  );
}
