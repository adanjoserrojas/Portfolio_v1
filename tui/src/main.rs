//! An interactive terminal for the portfolio, compiled to WebAssembly.
//!
//! Ratatui draws the frames; Ratzilla swaps the usual crossterm/TTY backend for
//! one that renders into the DOM, so the same widget code that would run in a
//! real terminal runs in the browser instead.
//!
//! ## Adding a program later
//!
//! Everything the shell can do lives in [`COMMANDS`]. To wire in a new program,
//! write a `fn(&mut App, &[&str])` and add one entry to that slice — `help`
//! picks it up automatically, and nothing else needs to change. `args` is the
//! whitespace-split tail of the input line, so `run foo 3` arrives as
//! `["foo", "3"]`.

use std::cell::RefCell;
use std::io;
use std::rc::Rc;

use ratzilla::ratatui::{
    layout::{Constraint, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, BorderType, Paragraph, Wrap},
    Frame, Terminal,
};
use ratzilla::{event::KeyCode, DomBackend, WebRenderer};

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

// Monochrome on black: white through grey, no hue anywhere.
//
// Colour was doing the work of separating headings from labels from errors, so
// with it gone that job falls to brightness and weight. Hence four widely
// spaced steps rather than six close ones — greys that sit near each other read
// as one muddy tone on a real display, especially at this font size.

const WHITE: Color = Color::Rgb(0xff, 0xff, 0xff);
const FG: Color = Color::Rgb(0xd4, 0xd4, 0xd4);
const MUTED: Color = Color::Rgb(0x8a, 0x8a, 0x8a);
const DIM: Color = Color::Rgb(0x55, 0x55, 0x55);

/// Borders, hints, anything that should recede.
fn dim() -> Style {
    Style::default().fg(DIM)
}

/// Ordinary output.
fn body() -> Style {
    Style::default().fg(FG)
}

/// Field labels and command names — visible, but subordinate to body text.
fn label() -> Style {
    Style::default().fg(MUTED)
}

/// Headings, the prompt, the cursor.
fn accent() -> Style {
    Style::default().fg(WHITE).add_modifier(Modifier::BOLD)
}

/// Errors. Inverting is the one loud signal a monochrome palette still has, so
/// nothing else uses REVERSED — that exclusivity is what makes it read as an
/// alarm instead of decoration.
fn error() -> Style {
    Style::default()
        .fg(WHITE)
        .add_modifier(Modifier::BOLD | Modifier::REVERSED)
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------
//
// NOTE: this is a hand-copied subset of `content/*.ts`, restricted to entries
// verified against those files. It is deliberately incomplete rather than
// padded out — content/ forbids inventing detail, and that rule does not stop
// applying because the renderer changed.
//
// The right long-term fix is a small script that emits JSON from content/*.ts
// at build time so there is exactly one truth source. Until then, treat
// content/*.ts as canonical and this as a mirror.

const NAME: &str = "Adan Rojas";
const ROLE: &str =
    "Aspiring Software Engineer with a passion for AI Agents, MCPs, and Full-Stack Development";
const LOCATION: &str = "Oviedo, FL";
// Split the same way content/profile.ts splits it, so the address never sits
// contiguously in the shipped binary either.
const EMAIL_USER: &str = "adan";
const EMAIL_DOMAIN: &str = "4dan.dev";

const BIO: &[&str] = &[
    "I'm passionate about crafting elegant, efficient web solutions that feel as good to use as they are to build.",
    "I enjoy turning complex ideas into clean, intuitive experiences. Alongside web development, I'm actively exploring machine learning and quantitative research.",
    "This minimalist portfolio reflects how I think and work: focused, intentional, and always evolving.",
];

const LINKS: &[(&str, &str)] = &[
    ("GitHub", "https://github.com/adanjoserrojas"),
    ("LinkedIn", "https://www.linkedin.com/in/adan-rojas/"),
];

struct Project {
    name: &'static str,
    date: &'static str,
    summary: &'static str,
    stack: &'static [&'static str],
}

const PROJECTS: &[Project] = &[Project {
    name: "ReCueCareer",
    date: "Jul 2025",
    summary: "AI-powered job search optimizer for students.",
    stack: &[
        "Next.js",
        "TypeScript",
        "Python",
        "Flask",
        "Tailwind CSS",
        "Supabase",
        "Auth0",
    ],
}];

struct Role {
    title: &'static str,
    org: &'static str,
    location: &'static str,
    period: &'static str,
    bullets: &'static [&'static str],
}

const EXPERIENCE: &[Role] = &[Role {
    title: "Student Builder Campus Leader",
    org: "AWS (Amazon Web Services)",
    location: "Orlando, FL",
    period: "Jan 2026 - Present",
    bullets: &[
        "Educated 100+ students on AWS microservices (S3, DynamoDB, Lambda) by designing and hosting 3 hands-on technical workshops, building custom Python seeding scripts to demonstrate live S3 operations and boost interactivity.",
    ],
}];

const LANGUAGES: &[&str] = &[
    "Python",
    "TypeScript",
    "C#",
    "Swift",
    "HTML/CSS",
    "Java/JavaScript",
    "SQL",
];

const BANNER: &[&str] = &[
    "  __ _  ____   __   __ _ ",
    " / _` |/ __ \\ / _` |/ _` |",
    "| (_| | (__| | (_| | | | |",
    " \\__,_|\\____/ \\__,_|_| |_|",
];

// ---------------------------------------------------------------------------
// Application state
// ---------------------------------------------------------------------------

struct App {
    /// Scrollback. Lines are owned so they outlive the frame that drew them.
    lines: Vec<Line<'static>>,
    input: String,
    /// Previously submitted commands, oldest first.
    history: Vec<String>,
    /// Where Up/Down currently sits in `history`; `None` means "at the prompt".
    history_pos: Option<usize>,
    /// How many lines we are scrolled up from the bottom.
    scrollback: usize,
}

impl App {
    fn new() -> Self {
        let mut app = App {
            lines: Vec::new(),
            input: String::new(),
            history: Vec::new(),
            history_pos: None,
            scrollback: 0,
        };
        cmd_banner(&mut app, &[]);
        app.push_styled("Type `help` to see what this thing does.", dim());
        app.blank();
        app
    }

    fn push(&mut self, text: impl Into<String>) {
        self.push_styled(text, body());
    }

    fn push_styled(&mut self, text: impl Into<String>, style: Style) {
        self.lines
            .push(Line::from(Span::styled(text.into(), style)));
    }

    /// A two-tone line: `name` muted, `value` in body text.
    fn push_pair(&mut self, name: &str, value: impl Into<String>) {
        self.lines.push(Line::from(vec![
            Span::styled(format!("{name:<14}"), label()),
            Span::styled(value.into(), body()),
        ]));
    }

    fn blank(&mut self) {
        self.lines.push(Line::from(""));
    }

    /// Run a submitted input line: echo it, dispatch it, then reset the prompt.
    fn submit(&mut self) {
        let raw = self.input.trim().to_string();
        self.input.clear();
        self.history_pos = None;
        self.scrollback = 0;

        self.lines.push(Line::from(vec![
            Span::styled("adan@portfolio", accent()),
            Span::styled(":~$ ", dim()),
            Span::styled(raw.clone(), body()),
        ]));

        if raw.is_empty() {
            return;
        }
        self.history.push(raw.clone());

        let parts: Vec<&str> = raw.split_whitespace().collect();
        let (name, args) = parts.split_first().expect("non-empty checked above");

        match COMMANDS.iter().find(|c| c.name == *name) {
            Some(command) => (command.run)(self, args),
            None => {
                self.push_styled(format!(" command not found: {name} "), error());
                self.push_styled("Try `help`.", dim());
            }
        }
        self.blank();
    }

    fn history_prev(&mut self) {
        if self.history.is_empty() {
            return;
        }
        let next = match self.history_pos {
            None => self.history.len() - 1,
            Some(0) => 0,
            Some(i) => i - 1,
        };
        self.history_pos = Some(next);
        self.input = self.history[next].clone();
    }

    fn history_next(&mut self) {
        match self.history_pos {
            Some(i) if i + 1 < self.history.len() => {
                self.history_pos = Some(i + 1);
                self.input = self.history[i + 1].clone();
            }
            // Walking past the newest entry returns to an empty prompt.
            Some(_) => {
                self.history_pos = None;
                self.input.clear();
            }
            None => {}
        }
    }
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

struct Command {
    name: &'static str,
    help: &'static str,
    run: fn(&mut App, &[&str]),
}

/// The command table. Add an entry here to add a command — see the module docs.
const COMMANDS: &[Command] = &[
    Command {
        name: "help",
        help: "List available commands",
        run: cmd_help,
    },
    Command {
        name: "about",
        help: "Who I am",
        run: cmd_about,
    },
    Command {
        name: "projects",
        help: "Things I've built",
        run: cmd_projects,
    },
    Command {
        name: "experience",
        help: "Where I've worked",
        run: cmd_experience,
    },
    Command {
        name: "skills",
        help: "Languages I work in",
        run: cmd_skills,
    },
    Command {
        name: "links",
        help: "Where to find me",
        run: cmd_links,
    },
    Command {
        name: "echo",
        help: "Print the arguments back",
        run: cmd_echo,
    },
    Command {
        name: "banner",
        help: "Reprint the splash banner",
        run: cmd_banner,
    },
    Command {
        name: "clear",
        help: "Clear the screen",
        run: cmd_clear,
    },
];

fn cmd_help(app: &mut App, _args: &[&str]) {
    app.push_styled("Available commands", accent());
    app.blank();
    for command in COMMANDS {
        app.lines.push(Line::from(vec![
            Span::styled(format!("  {:<12}", command.name), accent()),
            Span::styled(command.help, body()),
        ]));
    }
    app.blank();
    app.push_styled(
        "Up/Down recalls history - PageUp/PageDown scrolls.",
        dim(),
    );
}

fn cmd_about(app: &mut App, _args: &[&str]) {
    app.push_styled(NAME, accent());
    app.push_styled(ROLE, Style::default().fg(AMBER));
    app.blank();
    for paragraph in BIO {
        app.push(*paragraph);
        app.blank();
    }
    app.push_pair("location", LOCATION);
    app.push_pair("email", format!("{EMAIL_USER}@{EMAIL_DOMAIN}"));
}

fn cmd_projects(app: &mut App, _args: &[&str]) {
    for project in PROJECTS {
        app.lines.push(Line::from(vec![
            Span::styled(project.name, accent()),
            Span::styled(format!("  ({})", project.date), dim()),
        ]));
        app.push(project.summary);
        app.push_styled(format!("  {}", project.stack.join(" - ")), dim());
        app.blank();
    }
    app.push_styled(
        "Only entries verified against content/projects.ts are listed here.",
        dim(),
    );
}

fn cmd_experience(app: &mut App, _args: &[&str]) {
    for role in EXPERIENCE {
        app.lines.push(Line::from(vec![
            Span::styled(role.title, accent()),
            Span::styled(format!("  @ {}", role.org), Style::default().fg(CYAN)),
        ]));
        app.push_styled(format!("{}  -  {}", role.location, role.period), dim());
        app.blank();
        for bullet in role.bullets {
            app.push(format!("  - {bullet}"));
        }
        app.blank();
    }
}

fn cmd_skills(app: &mut App, _args: &[&str]) {
    app.push_styled("Languages", accent());
    app.blank();
    for language in LANGUAGES {
        app.push(format!("  - {language}"));
    }
}

fn cmd_links(app: &mut App, _args: &[&str]) {
    for (label, url) in LINKS {
        app.push_pair(label, *url);
    }
}

fn cmd_echo(app: &mut App, args: &[&str]) {
    app.push(args.join(" "));
}

fn cmd_banner(app: &mut App, _args: &[&str]) {
    for row in BANNER {
        app.push_styled(*row, accent());
    }
    app.blank();
    app.push_styled(ROLE, Style::default().fg(AMBER));
}

fn cmd_clear(app: &mut App, _args: &[&str]) {
    app.lines.clear();
    app.scrollback = 0;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

fn render(frame: &mut Frame, app: &App) {
    let shell = Block::bordered()
        .border_type(BorderType::Rounded)
        .border_style(Style::default().fg(DIM))
        .title(Span::styled(" adan@portfolio ", accent()));

    let inner = shell.inner(frame.area());
    frame.render_widget(shell, frame.area());

    let [output_area, prompt_area] =
        Layout::vertical([Constraint::Min(0), Constraint::Length(1)]).areas(inner);

    // Pick the tail of the scrollback that fits, measured in *wrapped* rows.
    //
    // Counting logical lines instead is the obvious mistake and a bad one: a
    // wrapped paragraph occupies more rows than it has lines, the slice then
    // overflows the viewport, and Paragraph fills top-down — so the overflow
    // falls off the bottom, hiding the newest output. A shell that hides the
    // line you just typed is broken, so the arithmetic has to be exact.
    let width = output_area.width.max(1) as usize;
    let height = output_area.height as usize;

    let rows_for = |line: &Line| -> usize {
        let w = line.width();
        if w == 0 {
            1
        } else {
            w.div_ceil(width)
        }
    };

    // Walk back from the newest line, discarding however far the user scrolled.
    let mut end = app.lines.len();
    let mut skipped = 0usize;
    while end > 0 && skipped < app.scrollback {
        end -= 1;
        skipped += rows_for(&app.lines[end]);
    }

    // Then take as many older lines as fit *without* exceeding the viewport.
    let mut start = end;
    let mut used = 0usize;
    while start > 0 {
        let needed = rows_for(&app.lines[start - 1]);
        if used + needed > height {
            break;
        }
        used += needed;
        start -= 1;
    }

    // Paragraph draws from the top, so pad above to pin output to the bottom
    // the way a real terminal does.
    let mut visible: Vec<Line> = vec![Line::from(""); height.saturating_sub(used)];
    visible.extend_from_slice(&app.lines[start..end]);

    frame.render_widget(
        Paragraph::new(visible).wrap(Wrap { trim: false }),
        output_area,
    );

    let prompt = Line::from(vec![
        Span::styled("adan@portfolio", accent()),
        Span::styled(":~$ ", dim()),
        Span::styled(app.input.clone(), body()),
        // A block glyph stands in for a cursor; the DOM backend has no real one.
        Span::styled("\u{2588}", Style::default().fg(ACCENT)),
    ]);
    frame.render_widget(Paragraph::new(prompt), prompt_area);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

fn main() -> io::Result<()> {
    let backend = DomBackend::new()?;
    let mut terminal = Terminal::new(backend)?;

    // Both closures below outlive main, so state lives behind Rc<RefCell<_>>.
    let app = Rc::new(RefCell::new(App::new()));

    terminal.on_key_event({
        let app = app.clone();
        move |key_event| {
            let mut app = app.borrow_mut();
            match key_event.code {
                KeyCode::Char(c) => {
                    app.input.push(c);
                    app.scrollback = 0;
                }
                KeyCode::Backspace => {
                    app.input.pop();
                }
                KeyCode::Enter => app.submit(),
                KeyCode::Up => app.history_prev(),
                KeyCode::Down => app.history_next(),
                KeyCode::PageUp => {
                    app.scrollback = (app.scrollback + 5).min(app.lines.len());
                }
                KeyCode::PageDown => {
                    app.scrollback = app.scrollback.saturating_sub(5);
                }
                KeyCode::Esc => {
                    app.input.clear();
                    app.history_pos = None;
                }
                _ => {}
            }
        }
    })?;

    terminal.draw_web(move |frame| {
        render(frame, &app.borrow());
    });

    Ok(())
}
