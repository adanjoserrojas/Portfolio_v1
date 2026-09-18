"use client";

import { useEffect, useRef, useState } from "react";
import { createSession, examples, fixtures, sampleDiff, statusLabels, type Scenario, type Session, type ToolEvent } from "./model";
import s from "./Workspace.module.css";

type InspectorTab = "Overview" | "Tool details" | "Changes" | "Usage";
const tabs: InspectorTab[] = ["Overview", "Tool details", "Changes", "Usage"];

function Glyph({ kind }: { kind: "mark" | "arrow" | "panel" | "expand" | "plus" }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{
    kind === "mark" ? <><path d="M5 20V4h8a5 5 0 0 1 0 10H5m7 0 7 6" /><path d="M9 4v10" /></> :
    kind === "arrow" ? <path d="M12 19V5m-6 6 6-6 6 6" /> :
    kind === "panel" ? <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></> :
    kind === "expand" ? <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /> : <path d="M12 5v14M5 12h14" />
  }</svg>;
}

export default function Workspace() {
  const [sessions, setSessions] = useState<Session[]>([createSession("initial")]);
  const [activeId, setActiveId] = useState("initial");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sidebar, setSidebar] = useState(false);
  const [inspector, setInspector] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<InspectorTab>("Overview");
  const [selected, setSelected] = useState<ToolEvent | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newActivity, setNewActivity] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [compact, setCompact] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const follow = useRef(true);
  const session = sessions.find(item => item.id === activeId)!;
  const draft = drafts[activeId] || "";
  const running = session.status === "running";
  const busy = running || session.status === "needs-input";
  const hasRunning = sessions.some(item => item.status === "running");

  useEffect(() => {
    const resize = () => { setNarrow(window.innerWidth <= 760); setCompact(window.innerWidth <= 1100); };
    resize();
    setSidebar(window.innerWidth > 760);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const panel = inspector && compact ? "Run inspector" : sidebar && narrow ? "Sessions" : null;
    if (panel) document.querySelector<HTMLElement>(`[aria-label="${panel}"] button`)?.focus();
  }, [inspector, sidebar, narrow, compact]);

  // A deterministic preview runner. This never invokes an agent or a network API.
  useEffect(() => {
    if (!hasRunning) return;
    const timer = window.setInterval(() => setSessions(items => items.map(item => {
      if (item.status !== "running") return item;
      const elapsed = item.elapsed + 1;
      if (elapsed % 2) return { ...item, elapsed };
      const event = fixtures[item.scenario][item.step];
      if (!event) return { ...item, elapsed, status: "completed", messages: [...item.messages, { id: `${item.id}-${elapsed}-result`, role: "agent", text: item.scenario === "navigation" ? "The sample navigation proposal is ready. It adds an active-page indicator while preserving keyboard focus. Open Changes to inspect the illustrative diff. No project files were modified." : item.scenario === "review" ? "The sample review is complete. Add a semantic active-page indicator and preserve a visible focus style. A real audit should also cover keyboard navigation and assistive technology." : "The sample investigation recovered successfully. A real investigation would measure font loading, image sizing, and client-side JavaScript before proposing changes." }] };
      const next = { ...item, elapsed, step: item.step + 1, events: [...item.events, event] };
      if (item.scenario === "review" && item.step === 0) return { ...next, status: "needs-input" as const };
      if (item.scenario === "research" && item.step === 1) return { ...next, status: "failed" as const };
      return next;
    })), 1000);
    return () => window.clearInterval(timer);
  }, [hasRunning]);

  useEffect(() => {
    if (feed.current && session.messages.length === 0) feed.current.scrollTop = 0;
    else if (follow.current && feed.current) feed.current.scrollTop = feed.current.scrollHeight;
    else setNewActivity(true);
  }, [activeId, session.messages.length, session.events.length, session.status]);

  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Keep portfolio controls out of the focus order while the workspace covers them.
    const shell = document.getElementById("rind-workspace")!;
    const siblings = [...document.body.children].filter(el => !el.contains(shell) && el instanceof HTMLElement) as HTMLElement[];
    const prior = siblings.map(el => el.inert);
    siblings.forEach(el => { el.inert = true; });
    return () => { document.body.style.overflow = previous; siblings.forEach((el, i) => { el.inert = prior[i]; }); };
  }, [expanded]);

  function update(change: Partial<Session>) {
    setSessions(items => items.map(item => item.id === activeId ? { ...item, ...change } : item));
  }
  function choose(id: string) {
    setActiveId(id); setSelected(null); setRenaming(false); setSidebar(window.matchMedia("(min-width: 761px)").matches); setNewActivity(false); follow.current = true;
  }
  function newSession() {
    const next = createSession(crypto.randomUUID());
    setSessions(items => [next, ...items]); choose(next.id);
    window.setTimeout(() => input.current?.focus(), 0);
  }
  function start(text: string, scenario: Scenario = "navigation") {
    if (!text.trim() || busy) return;
    const id = crypto.randomUUID();
    const previous = [...session.messages];
    if (session.events.length) {
      const history = { id: `${id}-history`, role: "agent" as const, text: "Previous sample run activity", events: session.events };
      previous.splice(session.status === "completed" ? previous.length - 1 : previous.length, 0, history);
    }
    update({ title: session.messages.length ? session.title : text.trim().slice(0, 65), status: "running", scenario, step: 0, elapsed: 0, events: [], messages: [...previous, { id, role: "user", text: text.trim() }, { id: `${id}-agent`, role: "agent", text: "I’ll walk through a scripted example so you can explore the workspace. The tool activity and result below are sample data, not an execution of your request." }] });
    setDrafts(items => ({ ...items, [activeId]: "" })); setSelected(null); follow.current = true; setNewActivity(false);
  }
  function inspect(event: ToolEvent) { setSelected(event); setTab("Tool details"); setInspector(true); if (compact) setSidebar(false); }
  function showChanges() { setTab("Changes"); setInspector(true); if (compact) setSidebar(false); }

  return <section id="rind-workspace" className={`${s.workspace} ${expanded ? s.expanded : ""}`} aria-label="RIND agent workspace" onKeyDown={event => {
    if (event.key === "Escape") { setSidebar(false); setInspector(false); setExpanded(false); }
  }}>
    <header className={s.topbar}>
      <div className={s.brand}><span className={s.logo}><Glyph kind="mark" /></span><h1>RIND</h1><span className={s.alpha}>PRE-ALPHA</span><span className={s.divider} /><span className={s.subtitle}>Agent workspace</span></div>
      <div className={s.topActions}><span className={s.demo}><span /> UI preview</span><button className={s.iconButton} aria-label={expanded ? "Exit expanded workspace" : "Expand workspace"} aria-pressed={expanded} onClick={() => setExpanded(!expanded)}><Glyph kind="expand" /></button></div>
    </header>
    <div className={`${s.body} ${sidebar ? s.showSidebar : ""} ${inspector ? s.showInspector : ""}`}>
      <aside className={s.sidebar} aria-label="Sessions" inert={!sidebar ? true : undefined}>
        <div className={s.panelHeading}><span>WORKSPACE</span><button className={s.textButton} onClick={() => setSidebar(false)} aria-label="Close sessions">Close</button></div>
        <button className={s.newSession} onClick={newSession}><Glyph kind="plus" /> New session <span>↗</span></button>
        <div className={s.sectionLabel}>THIS VISIT <span>{sessions.length.toString().padStart(2, "0")}</span></div>
        <div className={s.sessionList}>{sessions.map(item => <button key={item.id} className={`${s.session} ${item.id === activeId ? s.activeSession : ""}`} aria-current={item.id === activeId ? "true" : undefined} onClick={() => choose(item.id)}><span className={s.sessionTitle}>{item.title}</span><span className={s.sessionMeta}><span className={`${s.dot} ${item.status === "running" ? s.pulse : ""}`} />{statusLabels[item.status]}</span></button>)}</div>
        <div className={s.sidebarFooter}><span className={s.miniMark}><Glyph kind="mark" /></span><strong>A space for focused work.</strong><p>Sessions stay here until you refresh. No account required.</p><span className={s.localBadge}>○ &nbsp; In this browser tab</span></div>
      </aside>
      <div className={s.center} inert={(narrow && sidebar) || (compact && inspector) ? true : undefined}>
        <div className={s.taskbar}>
          <button className={s.iconButton} aria-label="Toggle sessions" aria-expanded={sidebar} onClick={() => { setSidebar(!sidebar); setInspector(false); }}><Glyph kind="panel" /></button>
          {renaming ? <form className={s.renameForm} onSubmit={event => { event.preventDefault(); if (newTitle.trim()) update({ title: newTitle.trim() }); setRenaming(false); }}><input aria-label="Session name" autoFocus value={newTitle} maxLength={65} onChange={event => setNewTitle(event.target.value)} /><button className={s.textButton}>Save</button><button type="button" className={s.textButton} onClick={() => setRenaming(false)}>Cancel</button></form> : <button className={s.taskTitle} title="Rename session" onClick={() => { setNewTitle(session.title); setRenaming(true); }}>{session.title}<span>⌄</span></button>}
          <button className={`${s.textButton} ${s.inspectToggle}`} aria-expanded={inspector} onClick={() => { setInspector(!inspector); if (compact) setSidebar(false); }}>Inspector <Glyph kind="panel" /></button>
        </div>
        <div className={s.previewNotice}><span aria-hidden="true">◇</span> Interactive preview <span className={s.noticeDetail}>— sample runs, no tools executed or costs incurred.</span></div>
        <div className={s.feed} ref={feed} onScroll={() => { const el = feed.current!; follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; if (follow.current) setNewActivity(false); }}>
          {session.messages.length === 0 ? <div className={s.welcome}>
            <div className={s.welcomeMark}><Glyph kind="mark" /></div>
            <p className={s.eyebrow}>FROM INTENT TO OUTCOME</p>
            <h2>Good work starts<br />with a clear task.</h2>
            <p className={s.intro}>A workspace to give your agent direction,<br className={s.desktopBreak} /> follow its progress, and review what comes next.</p>
            <div className={s.examples}>{examples.map(example => <button key={example.scenario} onClick={() => start(example.prompt, example.scenario)}><span className={s.exampleNumber}>{example.number}<span>↗</span></span><strong>{example.title}</strong><span>{example.description}</span></button>)}</div>
            <p className={s.sampleHint}>Choose a sample above or describe a task below.</p>
          </div> : <div className={s.conversation}>
            {session.messages.filter(message => !(session.status === "completed" && message === session.messages.at(-1))).map(message => message.events ? <details className={s.execution} key={message.id}><summary className={s.executionHeading}>{message.text} · {message.events.length} events</summary>{message.events.map(event => <button key={event.id} className={s.toolRow} onClick={() => inspect(event)}>{event.name}<span className={s.duration}>{event.duration} ↗</span></button>)}</details> : <article key={message.id} className={message.role === "user" ? s.userMessage : s.agentMessage}><div className={s.messageLabel}>{message.role === "user" ? <><span className={s.avatar}>Y</span> YOU</> : <><span className={s.agentAvatar}><Glyph kind="mark" /></span> RIND <span className={s.sampleTag}>SAMPLE</span></>}</div><p>{message.text}</p></article>)}
            <div className={s.execution}><div className={s.executionHeading}><span>TOOL ACTIVITY</span><span>Sample run · {session.elapsed}s</span></div>
              {session.events.map((event, index) => <button className={s.toolRow} key={event.id} onClick={() => inspect(event)}><span className={s.toolSymbol}>{session.status === "failed" && index === session.events.length - 1 ? "!" : "✓"}</span><span><strong>{event.name}</strong><small>{event.description}</small></span><span className={s.duration}>{event.duration} <span>↗</span></span></button>)}
              {running && <div className={s.runningRow}><span className={`${s.dot} ${s.pulse}`} />{fixtures[session.scenario][session.step]?.name || "Preparing the result"}<span>Running</span></div>}
            </div>
            {session.status === "needs-input" && <div className={s.stateCard}><span className={s.eyebrow}>YOUR INPUT NEEDED</span><h3>Focus on keyboard accessibility?</h3><p>This sample pauses for a scope decision. Continue to review focus order and active-page semantics.</p><button className={s.primary} onClick={() => update({ status: "running", messages: [...session.messages, { id: crypto.randomUUID(), role: "user", text: "Yes, focus on keyboard accessibility." }] })}>Continue review →</button><button className={s.textButton} onClick={() => update({ status: "stopped" })}>Stop sample</button></div>}
            {session.status === "failed" && <div className={s.stateCard}><span className={s.eyebrow}>SAMPLE RUN INTERRUPTED</span><h3>The measurement service is unavailable.</h3><p>Your progress is preserved. Retry to see the simulated recovery path.</p><button className={s.primary} onClick={() => update({ status: "running", events: session.events.map(event => event.id === "request" ? { ...event, output: "Sample retry: measurement service reconnected. A sample trace is available for the report." } : event) })}>Retry sample →</button></div>}
            {session.status === "stopped" && <div className={s.stateCard}><h3>Run stopped</h3><p>Partial activity is preserved. Send a follow-up to start another sample run.</p></div>}
            {session.status === "completed" && <div className={s.resultCard}><div><span className={s.toolSymbol}>✓</span><strong>Sample run complete</strong></div><p>{session.messages.at(-1)?.text}</p>{session.scenario === "navigation" && <button className={s.textButton} onClick={showChanges}>Review proposed change ↗</button>}</div>}
          </div>}
        </div>
        {newActivity && <button className={s.newActivity} onClick={() => { follow.current = true; feed.current?.scrollTo({ top: feed.current.scrollHeight }); setNewActivity(false); }}>New activity ↓</button>}
        <form className={s.composer} onSubmit={event => { event.preventDefault(); start(draft); }}>
          <label className="sr-only" htmlFor="rind-task">Describe a task</label>
          <textarea ref={input} id="rind-task" placeholder="What would you like to work on?" value={draft} maxLength={6000} disabled={busy} rows={2} onChange={event => setDrafts(items => ({ ...items, [activeId]: event.target.value }))} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); start(draft); } }} />
          <div className={s.composerBottom}><span role="status"><span className={s.dot} />{statusLabels[session.status]}<span className={s.composerHint}> · {session.status === "needs-input" ? "Choose an action above" : "Scripted demo"}</span></span>{running ? <button type="button" className={s.send} onClick={() => update({ status: "stopped" })}>■ <span>Stop</span></button> : <button type="submit" className={s.send} disabled={!draft.trim() || busy}><span>Send</span><Glyph kind="arrow" /></button>}</div>
        </form>
        <div className={s.composerFootnote}><span>UI preview · No live agent connected</span><span>Enter to send <span aria-hidden="true">·</span> Shift + Enter for a new line</span></div>
      </div>
      <aside className={s.inspector} aria-label="Run inspector" inert={!inspector ? true : undefined}>
        <div className={s.panelHeading}><span>INSPECTOR</span><button className={s.textButton} aria-label="Close inspector" onClick={() => { setInspector(false); window.setTimeout(() => input.current?.focus(), 0); }}>Close</button></div>
        <div className={s.tabs} role="group" aria-label="Inspector views">{tabs.map(item => <button key={item} aria-pressed={tab === item} className={tab === item ? s.activeTab : ""} onClick={() => setTab(item)}>{item}</button>)}</div>
        <div className={s.inspectorContent}>
          {tab === "Overview" && <><span className={s.eyebrow}>CURRENT SESSION</span><h2>{session.title}</h2><dl className={s.metrics}><div><dt>Status</dt><dd>{statusLabels[session.status]}</dd></div><div><dt>Elapsed</dt><dd>{session.elapsed}s</dd></div><div><dt>Tool events</dt><dd>{session.events.length}</dd></div><div><dt>Environment</dt><dd>UI preview</dd></div></dl><div className={s.inspectorNote}><strong>See the work as it happens.</strong><p>Select a tool event to inspect its input and output. Sample data is used throughout this preview.</p></div></>}
          {tab === "Tool details" && (selected ? <><span className={s.eyebrow}>SAMPLE TOOL EVENT</span><h2>{selected.name}</h2><p>{selected.description}</p><h3>Input</h3><pre>{selected.input}</pre><h3>Output</h3><pre>{selected.output}</pre><p className={s.muted}>Sample duration: {selected.duration}</p></> : <div className={s.inspectorEmpty}><Glyph kind="panel" /><h2>A closer look</h2><p>Select an event in the activity feed to inspect its input and output.</p></div>)}
          {tab === "Changes" && (session.scenario === "navigation" && session.status === "completed" ? <><span className={s.eyebrow}>ILLUSTRATIVE DIFF</span><h2>Navigation active state</h2><p>1 sample file · no files modified</p><div className={s.fileLabel}>components/site/Header.tsx</div><pre className={s.diff}>{sampleDiff.split("\n").map((line, index) => <span key={index} className={line.startsWith("+") ? s.added : line.startsWith("-") ? s.removed : ""}>{line}{"\n"}</span>)}</pre><p className={s.muted}>This snippet demonstrates the review UI. It is not an applied or executable patch.</p></> : <div className={s.inspectorEmpty}><Glyph kind="plus" /><h2>No changes to review</h2><p>Complete the “Build something” sample to explore an illustrative diff.</p></div>)}
          {tab === "Usage" && <><span className={s.eyebrow}>USAGE & COST</span><h2>Nothing spent.</h2><p>This preview does not contact a model or execute tools.</p><dl className={s.metrics}><div><dt>Actual cost</dt><dd>$0.00</dd></div><div><dt>Input tokens</dt><dd>Not available</dd></div><div><dt>Output tokens</dt><dd>Not available</dd></div><div><dt>Budget</dt><dd>Not connected</dd></div></dl><div className={s.inspectorNote}>Live usage will appear here when an agent service is connected.</div></>}
        </div>
        <div className={s.inspectorFooter}>RIND / WORKSPACE PREVIEW</div>
      </aside>
    </div>
  </section>;
}
