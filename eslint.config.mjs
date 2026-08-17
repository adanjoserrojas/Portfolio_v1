import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // wasm-bindgen glue for the Rust TUI (see tui/README.md). Generated
      // output, rewritten on every `trunk build` — linting it only ever
      // reports bugs in a generator we don't control.
      "public/tui/**",
      "tui/**",
    ],
  },
];

export default eslintConfig;
