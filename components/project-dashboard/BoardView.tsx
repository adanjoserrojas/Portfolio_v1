"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Trash2,
  Plus,
  Search,
  LayoutGrid,
  List,
  Archive,
  FolderKanban,
  ChevronRight,
  MoreHorizontal,
  X,
  LockKeyhole,
  Globe,
  Check,
  Clock3,
  SlidersHorizontal,
  LogOut,
  PanelLeftClose,
  Sun,
  Moon,
} from "lucide-react";
import {
  labels,
  statuses,
  type Project,
  type PublicProject,
  projectInput,
} from "@/lib/project-dashboard/model";
type Card = PublicProject | Project;
const empty = {
  title: "",
  description: "",
  status: "not_started" as const,
  tags: [],
  demoUrl: "",
  repoUrl: "",
  visible: false,
  archived: false,
  privateNotes: "",
  position: 0,
};
export default function BoardView({
  initial,
  revision: initialRevision,
  updatedAt,
  admin = false,
}: {
  initial: Card[];
  revision: number;
  updatedAt?: string;
  admin?: boolean;
}) {
  const [projects, setProjects] = useState(initial),
    [revision, setRevision] = useState(initialRevision),
    [query, setQuery] = useState(""),
    [view, setView] = useState<"board" | "list">("board"),
    [archive, setArchive] = useState(false),
    [mobileStatus, setMobileStatus] = useState<string>("all"),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState<Card | null>(null),
    [isNew, setIsNew] = useState(false),
    [dark, setDark] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [confirmDelete, setConfirmDelete] = useState(false),
    [formVersion, setFormVersion] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const requestKey = useRef("");
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);
  useEffect(() => {
    setProjects(initial);
    setRevision(initialRevision);
  }, [initial, initialRevision]);
  function theme() {
    setDark(!dark);
    try {
      localStorage.setItem("theme", dark ? "light" : "dark");
    } catch {}
    document.documentElement.dataset.theme = dark ? "light" : "dark";
  }
  function open(project: Card | null) {
    lastFocus.current = document.activeElement as HTMLElement;
    setEditing(project);
    setIsNew(!project);
    setConfirmDelete(false);
    setNotice("");
    setFormVersion((v) => v + 1);
    requestKey.current = crypto.randomUUID();
    dialog.current?.showModal();
  }
  function close() {
    if (busy) return;
    dialog.current?.close();
    lastFocus.current?.focus();
  }
  async function save(
    project: Omit<Project, "id" | "version" | "updatedAt">,
    id?: string,
    version?: number,
  ) {
    setBusy(true);
    setNotice("Saving changes…");
    try {
      const data = projectInput.strip().parse(project);
      const res = await fetch("/api/admin/projects", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id,
          version,
          idempotencyKey: requestKey.current || crypto.randomUUID(),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Unable to save");
      setRevision(result.revision);
      setProjects((prev) => [
        ...prev.filter((p) => p.id !== result.project.id),
        result.project,
      ]);
      setNotice(
        result.warning || "Changes saved. The public board is up to date.",
      );
      close();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!admin || !editing || busy) return;
    setBusy(true);
    setNotice("Deleting project…");
    try {
      const res = await fetch(
        "/api/admin/projects/" + encodeURIComponent(editing.id),
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            version: editing.version,
            idempotencyKey: requestKey.current,
          }),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Unable to delete");
      setRevision(result.revision);
      setProjects((prev) => prev.filter((p) => p.id !== result.deletedId));
      setNotice(
        result.warning || "Project deleted. The public board is up to date.",
      );
      close();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to delete");
    } finally {
      setBusy(false);
    }
  }
  async function move(id: string, status: string) {
    const project = projects.find((p) => p.id === id);
    if (!project || !admin || busy) return;
    requestKey.current = crypto.randomUUID();
    await save(
      { ...empty, ...project, status: status as Project["status"] },
      id,
      project.version,
    );
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    save(
      {
        title: String(data.get("title")),
        description: String(data.get("description")),
        status: String(data.get("status")) as Project["status"],
        tags: String(data.get("tags"))
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        demoUrl: String(data.get("demoUrl")),
        repoUrl: String(data.get("repoUrl")),
        privateNotes: String(data.get("privateNotes")),
        visible: data.get("visible") === "on",
        archived: data.get("archived") === "on",
        position: Number(data.get("position")),
      },
      editing?.id,
      editing?.version,
    );
  }
  const filtered = projects
    .filter(
      (p) =>
        (!admin || Boolean((p as Project).archived) === archive) &&
        `${p.title} ${p.description} ${p.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (mobileStatus === "all" || p.status === mobileStatus),
    )
    .sort((a, b) => a.position - b.position);
  const active = projects.filter((p) => !(p as Project).archived);
  function card(p: Card) {
    return (
      <article
        className="project-card"
        key={p.id}
        draggable={admin && !busy}
        onDragStart={(e) => e.dataTransfer.setData("text/plain", p.id)}
      >
        <div className="card-top">
          <span className="card-id">BL-{p.id.slice(0, 4).toUpperCase()}</span>
          {admin && !(p as Project).visible ? (
            <span className="draft">
              <LockKeyhole size={11} /> Draft
            </span>
          ) : (
            <span className="tiny-dot" />
          )}
        </div>
        <button className="card-title" onClick={() => open(p)}>
          {p.title}
        </button>
        <p className="description">{p.description}</p>
        <div className="tags">
          {p.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="card-footer">
          <span>
            <Clock3 size={12} />
            {p.updatedAt
              ? new Date(p.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Just added"}
          </span>
          {admin ? (
            <button
              aria-label={`Edit ${p.title}`}
              className="icon-btn"
              onClick={() => open(p)}
            >
              <MoreHorizontal size={17} />
            </button>
          ) : p.demoUrl ? (
            <a href={p.demoUrl} target="_blank" rel="noreferrer">
              Try it <ArrowUpRight size={13} />
            </a>
          ) : (
            <button className="text-btn" onClick={() => open(p)}>
              Details <ArrowUpRight size={13} />
            </button>
          )}
        </div>
      </article>
    );
  }
  return (
    <div
      className={`app-shell ${admin ? "admin-shell" : ""} ${collapsed ? "collapsed" : ""}`}
    >
      {admin && (
        <aside className="sidebar">
          <Link className="workspace-brand" href="/admin">
            <span className="brand">
              b<span>↗</span>
            </span>
            <strong>
              Buildlog<small>ADAN’S WORKSPACE</small>
            </strong>
          </Link>
          <div className="side-label">WORKSPACE</div>
          <button
            className={!archive ? "nav-item active" : "nav-item"}
            onClick={() => {
              setArchive(false);
              setView("board");
            }}
          >
            <FolderKanban size={17} /> Board <span>{active.length}</span>
          </button>
          <button
            className="nav-item"
            onClick={() => {
              setArchive(false);
              setView("list");
            }}
          >
            <List size={17} /> Projects
          </button>
          <button
            className={archive ? "nav-item active" : "nav-item"}
            onClick={() => setArchive(true)}
          >
            <Archive size={17} /> Archived
          </button>
          <div className="sidebar-note">
            <span className="status-dot" /> Build in the open.
            <p>
              Small steps.
              <br />
              Real progress.
            </p>
            <Link href="/board">
              View public board <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="user-block">
            <span className="avatar">AR</span>
            <div>
              <strong>Adan Rojas</strong>
              <small>Workspace owner</small>
            </div>
            <form action="/auth/logout" method="post">
              <button
                className="icon-btn"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </aside>
      )}
      <div className="main-shell">
        <header className="topbar">
          {admin ? (
            <div className="breadcrumb">
              <button
                className="icon-btn"
                aria-label="Toggle sidebar"
                onClick={() => setCollapsed(!collapsed)}
              >
                <PanelLeftClose size={17} />
              </button>
              <span>Workspace</span>
              <ChevronRight size={13} />
              <strong>{archive ? "Archived" : "Project board"}</strong>
            </div>
          ) : (
            <>
              <Link className="portfolio-brand" href="/">
                Adan Rojas<span> / Buildlog</span>
              </Link>
              <nav>
                <Link href="/">
                  Portfolio <ArrowUpRight size={13} />
                </Link>
                <Link href="/login" aria-label="Admin sign in">
                  <LockKeyhole size={16} />
                </Link>
              </nav>
            </>
          )}
          <button
            className="icon-btn theme-btn"
            onClick={theme}
            aria-label="Toggle color theme"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </header>
        {admin && (
          <nav className="mobile-admin-nav" aria-label="Workspace navigation">
            <button
              onClick={() => setArchive(false)}
              className={!archive ? "selected" : ""}
            >
              Active
            </button>
            <button
              onClick={() => setArchive(true)}
              className={archive ? "selected" : ""}
            >
              Archived
            </button>
            <Link href="/board">Public board</Link>
            <form action="/auth/logout" method="post">
              <button>Sign out</button>
            </form>
          </nav>
        )}
        <main id="main" className="board-main">
          <div className="intro">
            <div>
              <h1>
                {archive
                  ? "Archive"
                  : admin
                    ? "Project board."
                    : "This is my personal J*ra."}
              </h1>
              <p className="subtitle">
                {admin
                  ? "A home for what’s next... To keep my projects moving."
                  : "Explore my projects! This dashboard is build with React/Next.js, and backend Ruby on Rails and AWS services."}
              </p>
            </div>
            {admin ? (
              <button className="primary" onClick={() => open(null)}>
                <Plus size={17} /> New project
              </button>
            ) : (
              <div className="public-pill">
                <Globe size={14} /> Open to explore
              </div>
            )}
          </div>
          <div className="overview">
            <div>
              <span className="overview-number">
                {active.length.toString().padStart(2, "0")}
              </span>
              <span>
                projects
                <br />
                <strong>in the notebook</strong>
              </span>
            </div>
            <div>
              <span className="overview-number amber">
                {active
                  .filter((p) => p.status === "in_progress")
                  .length.toString()
                  .padStart(2, "0")}
              </span>
              <span>
                in progress
                <br />
                <strong>taking shape</strong>
              </span>
            </div>
            <div>
              <span className="overview-number green">
                {active
                  .filter((p) => p.status === "finished")
                  .length.toString()
                  .padStart(2, "0")}
              </span>
              <span>
                finished
                <br />
                <strong>out in the world</strong>
              </span>
            </div>
            <div className="overview-end">
              <span className="mini-line" />
              <span>
                Ideas =
                <br />
                Progress
              </span>
            </div>
          </div>
          <div className="board-toolbar">
            <div className="view-tabs">
              <button
                className={view === "board" ? "selected" : ""}
                onClick={() => setView("board")}
              >
                <LayoutGrid size={15} /> Board
              </button>
              <button
                className={view === "list" ? "selected" : ""}
                onClick={() => setView("list")}
              >
                <List size={15} /> List
              </button>
            </div>
            <div className="toolbar-right">
              <label className="search">
                <Search size={15} />
                <input
                  aria-label="Search projects"
                  placeholder="Search projects…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label className="status-filter">
                <SlidersHorizontal size={14} />
                <select
                  aria-label="Filter by status"
                  value={mobileStatus}
                  onChange={(e) => setMobileStatus(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {labels[s]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div role="status" className={notice ? "notice" : "sr-only"}>
            {notice}
          </div>
          {view === "board" ? (
            <div className="kanban">
              {statuses
                .filter((s) => mobileStatus === "all" || s === mobileStatus)
                .map((s) => (
                  <section
                    key={s}
                    className={`column ${s}`}
                    onDragOver={(e) => {
                      if (admin) e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      move(e.dataTransfer.getData("text/plain"), s);
                    }}
                  >
                    <div className="column-head">
                      <div>
                        <span className={`column-dot ${s}`} />
                        <h2>{labels[s]}</h2>
                        <span className="count">
                          {filtered.filter((p) => p.status === s).length}
                        </span>
                      </div>
                      {admin && (
                        <button
                          className="icon-btn"
                          aria-label={`Add project to ${labels[s]}`}
                          onClick={() => {
                            open(null);
                            setTimeout(() => {
                              const select = form.current?.elements.namedItem(
                                "status",
                              ) as HTMLSelectElement;
                              if (select) select.value = s;
                            }, 0);
                          }}
                        >
                          <Plus size={15} />
                        </button>
                      )}
                    </div>
                    <div className="column-cards">
                      {filtered.filter((p) => p.status === s).map(card)}
                      {!filtered.some((p) => p.status === s) && (
                        <div className="column-empty">
                          A little room for what’s next.
                        </div>
                      )}
                    </div>
                    {admin && (
                      <button
                        className="add-project"
                        onClick={() => open(null)}
                      >
                        <Plus size={14} /> Add project
                      </button>
                    )}
                  </section>
                ))}
            </div>
          ) : (
            <div className="list-view">
              {filtered.map((p) => (
                <button key={p.id} onClick={() => open(p)}>
                  <span className={`column-dot ${p.status}`} />
                  <strong>{p.title}</strong>
                  <span>{labels[p.status]}</span>
                  <ArrowUpRight size={16} />
                </button>
              ))}
              {!filtered.length && (
                <p className="column-empty">No projects match your search.</p>
              )}
            </div>
          )}
          <footer className="board-footer">
            <span>
              <span className="status-dot" />
              {admin
                ? "Your workspace, your pace."
                : "Built in the open. Updated as things move."}
            </span>
            <span>
              {updatedAt
                ? `Updated ${new Date(updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : `Revision ${revision}`}
              <span className="footer-mark">b↗</span>
            </span>
          </footer>
        </main>
      </div>
      <dialog
        ref={dialog}
        className="project-dialog"
        onCancel={(e) => {
          if (busy) e.preventDefault();
        }}
        aria-label={admin ? "Edit project" : "Project details"}
        onClose={() => lastFocus.current?.focus()}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div className="dialog-content">
          <div className="dialog-head">
            <span className="eyebrow">
              {admin
                ? isNew
                  ? "MAKE ROOM FOR AN IDEA"
                  : "PROJECT DETAILS"
                : "BEHIND THE PROJECT"}
            </span>
            <button
              className="icon-btn"
              onClick={close}
              aria-label="Close project"
            >
              <X size={20} />
            </button>
          </div>
          {admin ? (
            <form key={formVersion} ref={form} onSubmit={submit}>
              <h2>{isNew ? "Something new." : "Keep it moving."}</h2>
              <label>
                Project name
                <input
                  name="title"
                  required
                  maxLength={100}
                  defaultValue={editing?.title}
                  placeholder="What are you building?"
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  maxLength={1500}
                  rows={3}
                  defaultValue={editing?.description}
                  placeholder="A short introduction to the project."
                />
              </label>
              <div className="form-row">
                <label>
                  Status
                  <select
                    name="status"
                    defaultValue={editing?.status || "not_started"}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {labels[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Order
                  <input
                    name="position"
                    type="number"
                    min={0}
                    max={9999}
                    defaultValue={editing?.position ?? projects.length}
                  />
                </label>
              </div>
              <label>
                Technologies <span className="optional">comma separated</span>
                <input
                  name="tags"
                  defaultValue={editing?.tags.join(", ")}
                  placeholder="Rails, AWS, Next.js"
                />
              </label>
              <div className="form-row">
                <label>
                  Demo URL
                  <input
                    name="demoUrl"
                    type="url"
                    defaultValue={editing?.demoUrl}
                    placeholder="https://"
                  />
                </label>
                <label>
                  Repository URL
                  <input
                    name="repoUrl"
                    type="url"
                    defaultValue={editing?.repoUrl}
                    placeholder="https://"
                  />
                </label>
              </div>
              <label>
                Private notes <LockKeyhole size={12} />
                <textarea
                  name="privateNotes"
                  maxLength={3000}
                  rows={2}
                  defaultValue={(editing as Project)?.privateNotes}
                  placeholder="Only visible to you."
                />
              </label>
              <div className="checks">
                <label>
                  <input
                    name="visible"
                    type="checkbox"
                    defaultChecked={(editing as Project)?.visible ?? false}
                  />{" "}
                  Show on public board
                </label>
                <label>
                  <input
                    name="archived"
                    type="checkbox"
                    defaultChecked={(editing as Project)?.archived ?? false}
                  />{" "}
                  Archive project
                </label>
              </div>
              <p role="status" className="dialog-notice">
                {notice}
              </p>
              {confirmDelete ? (
                <div
                  className="delete-confirmation"
                  role="group"
                  aria-labelledby="delete-heading"
                >
                  <h3 id="delete-heading">Delete this project?</h3>
                  <p>
                    “{editing?.title}” will be removed from your workspace and
                    public board. This cannot be undone in the dashboard.
                  </p>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary"
                      disabled={busy}
                      onClick={() => {
                        setConfirmDelete(false);
                        requestKey.current = crypto.randomUUID();
                      }}
                    >
                      Keep project
                    </button>
                    <button
                      type="button"
                      className="danger"
                      disabled={busy}
                      onClick={remove}
                    >
                      {busy ? "Deleting…" : "Delete permanently"}
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="form-actions">
                  {!isNew && (
                    <button
                      type="button"
                      className="delete-trigger"
                      disabled={busy}
                      onClick={() => {
                        setConfirmDelete(true);
                        setNotice("");
                        requestKey.current = crypto.randomUUID();
                      }}
                    >
                      <Trash2 size={15} />
                      Delete project
                    </button>
                  )}
                  <button
                    type="button"
                    className="secondary"
                    disabled={busy}
                    onClick={close}
                  >
                    Cancel
                  </button>
                  <button className="primary" disabled={busy}>
                    {busy
                      ? "Saving…"
                      : isNew
                        ? "Create project"
                        : "Save changes"}
                    <Check size={15} />
                  </button>
                </div>
              )}
            </form>
          ) : (
            <>
              <h2>{editing?.title}</h2>
              <span className="detail-status">
                {editing && labels[editing.status]}
              </span>
              <p className="detail-description">{editing?.description}</p>
              <div className="tags">
                {editing?.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="detail-links">
                {editing?.demoUrl && (
                  <a
                    className="primary"
                    href={editing.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Try the project <ArrowUpRight size={16} />
                  </a>
                )}
                {editing?.repoUrl && (
                  <a
                    className="secondary"
                    href={editing.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Source code <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
