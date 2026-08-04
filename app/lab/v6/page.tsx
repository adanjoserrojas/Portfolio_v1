import { labData } from "../data";
import { dmSans, dmMono } from "../fonts";
import Retrieve from "./Retrieve";
import s from "./v6.module.css";

export const dynamic = "force-static";
export const metadata = { title: "v6 — Retrieval" };

export default function V6() {
  const d = labData();

  return (
    <div className={`proto ${s.proto} ${dmSans.variable} ${dmMono.variable}`}>
      <main className={s.wrap}>
        <header className={s.head}>
          <h1 className={s.h1}>{d.name}</h1>
          <p className={s.role}>{d.roleLine}</p>
        </header>
        <Retrieve data={d} />
      </main>
    </div>
  );
}
