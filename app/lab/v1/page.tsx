import { labData } from "../data";
import { jetbrainsMono, publicSans } from "../fonts";
import Shell from "./Shell";
import s from "./v1.module.css";

export const dynamic = "force-static";
export const metadata = { title: "v1 — ~/adan" };

export default function V1() {
  return (
    <div className={`proto ${s.proto} ${jetbrainsMono.variable} ${publicSans.variable}`}>
      <Shell data={labData()} />
    </div>
  );
}
