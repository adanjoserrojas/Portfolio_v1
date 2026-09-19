Create a skill called frontend-ui-reviewer.
Use it whenever I ask you to build, review, or improve frontend UI.
The skill should:
- inspect the existing design system first
- use any available Figma, 21st, shadcn, and context7 MCP tools when appropriate
- preserve existing component patterns
- check responsive behavior
- check spacing, typography, accessibility, and consistency
- avoid redesigning things unnecessarily
- Use best web dev practice for frontEnd scalability, accessibility, and security

The available tools that are described could be used in this order suggested:

- Design truth: Figma
- Context7: Fresh Docs
- 21st.dev: Aesthetic Reference
- Shadcn: Components
- Playwright: test/inspect

                    ┌──────────────┐
                    │    Figma     │
                    │ Design truth │
                    └──────┬───────┘
                           │
                   design context
                           ↓
┌───────────┐       ┌──────────────┐       ┌────────────┐
│ 21st.dev  │ ───→  │    CODEX     │ ←───  │ Context7   │
│ aesthetic │       │              │       │ fresh docs │
│ reference │       └──────┬───────┘       └────────────┘
└───────────┘              │
                           ↓
                    ┌──────────────┐
                    │   shadcn     │
                    │ components   │
                    └──────┬───────┘
                           │
                           ↓
                       Your app
                           │
                           ↓
                    ┌──────────────┐
                    │ Playwright   │
                    │ test/inspect │
                    └──────────────┘