import { labData } from "../data";
import { spaceGrotesk, plexMono } from "../fonts";
import Atlas from "./Atlas";
import s from "./v3.module.css";

export const dynamic = "force-static";
export const metadata = { title: "v3 — Latent atlas" };

export default function V3() {
  const d = labData();

  return (
    <div className={`proto ${s.proto} ${spaceGrotesk.variable} ${plexMono.variable}`}>
      <main className={s.wrap}>
        <header className={s.head}>
          <h1 className={s.h1}>{d.name}</h1>
          <p className={s.role}>{d.roleLine}</p>
        </header>

        <ul className={s.legend}>
          <li>
            <span className={s.swatch} style={{ background: "var(--lang)" }} />
            Languages
          </li>
          <li>
            <span className={s.swatch} style={{ background: "var(--fw)" }} />
            Frameworks/Libraries
          </li>
          <li>
            <span className={s.swatch} style={{ background: "var(--tool)" }} />
            Tools/Platforms
          </li>
        </ul>

        <Atlas data={d} />

        {/* §6.3: the semantic layer is PRIMARY, not an afterthought. This list
            is always in the DOM — it is what screen readers and crawlers get,
            and it says everything the canvas says. */}
        <section className={s.fallback}>
          <h2 className={s.srHeading}>Skills by category</h2>
          {d.categories.map((c) => (
            <div key={c}>
              <h3 className={s.groupName}>{c}</h3>
              <ul className={s.skillList}>
                {d.skills
                  .filter((k) => k.category === c)
                  .map((k) => (
                    <li key={k.name}>{k.name}</li>
                  ))}
              </ul>
            </div>
          ))}
          <p className={s.hint}>
            {d.skills.length} skills · grouped as the résumé groups them
          </p>
        </section>
      </main>
    </div>
  );
}
