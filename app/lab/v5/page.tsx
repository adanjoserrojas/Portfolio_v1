import { labData } from "../data";
import { archivo, plexMono } from "../fonts";
import Inspector from "./Inspector";
import s from "./v5.module.css";

export const dynamic = "force-static";
export const metadata = { title: "v5 — Inspector" };

export default function V5() {
  return (
    <div className={`proto ${s.proto} ${archivo.variable} ${plexMono.variable}`}>
      <Inspector data={labData()} />
    </div>
  );
}
