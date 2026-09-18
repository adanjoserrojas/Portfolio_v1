import type { Metadata } from "next";
import Workspace from "@/components/rind/Workspace";

export const metadata: Metadata = {
  title: "RIND — Agent workspace",
  description: "Explore RIND, an agent workspace for tasks, tool activity, and results. Interactive UI preview.",
  alternates: { canonical: "/RIND" },
};

export default function RindPage() {
  return <Workspace />;
}
