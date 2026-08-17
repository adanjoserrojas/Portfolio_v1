# portfolio-tui

An interactive terminal UI written in Rust with [Ratatui], compiled to
WebAssembly by [Ratzilla], and embedded in the `/RIND` page on the Next.js site
(`app/RIND/page.tsx`).

[Ratatui]: https://ratatui.rs
[Ratzilla]: https://github.com/orhun/ratzilla

## Rebuild

The Next.js build does **not** compile this crate — Vercel has no Rust
toolchain. The compiled output in `public/tui/` is committed, so after changing
anything under `tui/` you must rebuild and commit the result:

```bash
cd tui
trunk build --release --dist ../public/tui --public-url /tui/
```

Then commit both `tui/` and `public/tui/` together. Forgetting the second half
is the one failure mode here: the site keeps serving the previous WASM and the
change silently does nothing.

## Develop

For a fast loop with auto-reload, skip Next.js entirely and let trunk serve it
at <http://localhost:8080>:

```bash
cd tui
trunk serve
```

## Toolchain

One-time setup. The `gnu` host matters on Windows: the default `msvc` host
needs Visual Studio Build Tools, `gnu` bundles its own linker.

```bash
rustup default stable-x86_64-pc-windows-gnu   # Windows only
rustup target add wasm32-unknown-unknown
```

Plus `trunk` on PATH — grab the prebuilt binary from
[trunk-rs/trunk releases](https://github.com/trunk-rs/trunk/releases) rather
than `cargo install`, which compiles ~500 crates.

## Adding a command

Everything the shell can do lives in the `COMMANDS` table in
[`src/main.rs`](src/main.rs). Write a `fn(&mut App, &[&str])` and add one entry:

```rust
Command {
    name: "resume",
    help: "Print the resume",
    run: cmd_resume,
},
```

`help` picks it up automatically. `args` is the whitespace-split tail of the
input line, so `resume --short` arrives as `["--short"]`. Write output with
`app.push`, `app.push_styled`, `app.push_pair`, and `app.blank`.

## Two things that will bite you

Both are already handled in this repo, documented here so a future change
doesn't quietly undo them:

- **`critical-section`** is a direct dependency in `Cargo.toml` even though no
  code imports it. Ratatui 0.30's layout cache needs an implementation
  selected; without it the release link fails with
  `undefined symbol: _critical_section_1_0_acquire`.
- **`data-wasm-opt-params`** in `index.html` re-enables the WASM features rustc
  emits by default. Without those flags `wasm-opt` rejects the binary with
  `memory.copy operations require bulk memory operations`.

## Content

The data in `src/main.rs` is a hand-copied subset of `content/*.ts`, limited to
entries verified against those files. `content/*.ts` stays canonical — if the
two disagree, it wins. Generating this from `content/` at build time would
remove the duplication and is the obvious next step.
