# PHASES.md — modusys Redesign & Rebuild (Phase-Wise Plan)

Scope of this plan: **Dashboard, CRM (Analytics/Pipeline/Tasks), and User Management** — the three sections audited and redesigned so far. Feed these phases into Claude Code **one at a time, in order**. Do not start a phase until the previous one's "Definition of Done" is checked off.

Read `CLAUDE.md` first in every session — it has the full tech stack, design tokens, and working rules.

---

## Phase 0 — Project Setup & Design Foundation

**Goal:** empty but fully configured project — no features yet, just the skeleton everything else builds on.

Tasks:
1. Scaffold Next.js (App Router) + TypeScript project.
2. Install and configure Tailwind CSS + shadcn/ui.
3. Load `Outfit` (headings) and `Montserrat` (body) via `next/font/google`; wire both into `tailwind.config` as `font-heading` / `font-body`.
4. Build the full color token set from `CLAUDE.md` Section 3.2 into `tailwind.config` (or CSS variables in `globals.css` if using shadcn's CSS-variable approach). Visually confirm tokens against `Light_Mode_Mode.png` before moving on.
5. Set up base layout: sidebar (Navigation: Dashboard, CRM, Quotes, Purchase Orders, Customers, Architects; Administration: User Management, Templates, Credits) + top bar (sidebar toggle, breadcrumb, notification bell) + footer (credits balance, user name, sign out). Sidebar nav items can route to placeholder pages for anything outside this plan's scope (Quotes, Purchase Orders, Customers, Architects, Templates, Credits) — just enough to route without 404s.
6. Build shared primitives in `components/shared/`: `KpiCard`, `StatusBadge` (color-driven off the canonical status mapping), `EmptyState` (icon + message + optional CTA button), `ListPageShell` (KPI row + filter bar + content + pagination slot).
7. Build shared chart wrappers in `components/charts/`: `DonutChart`, `DualAxisTrendChart`, `FunnelChart`, `BarChart`.
8. Set up TanStack Query provider, typed API client stub in `lib/api/` (can point at mock data for now if backend isn't ready yet).

**Definition of Done:**
- App boots, sidebar/top bar/footer render with correct fonts and colors.
- A `/dev/components` sandbox route shows all shared primitives and chart wrappers with sample data, confirming fonts/colors are correctly wired before any real page is built.

---

## Phase 1 — Dashboard

**Goal:** fully working Dashboard screen per the redesign spec.

Reference: 4 KPI cards (Total Revenue, Total Quotes, Active Quotes, Completed), Quote Status Distribution donut, Monthly Quote Trends dual-axis chart, Upcoming Tasks panel, Upcoming Birthdays panel.

Tasks:
1. Build `/dashboard` page using `ListPageShell` where applicable (header + KPI row).
2. KPI row: Total Revenue (with vs-last-month delta indicator), Total Quotes, Active Quotes, Completed. Resolve the "Active Quotes duplicates Total Quotes" issue — either give Active a real distinct definition (e.g. exclude cancelled/completed) or relabel/merge, and document the decision in a code comment.
3. Quote Status Distribution donut using `DonutChart`, colors from the canonical status mapping.
4. Monthly Quote Trends using `DualAxisTrendChart` (count axis + ₹ value axis, generalized to any date range).
5. Upcoming Tasks panel and Upcoming Birthdays panel using `EmptyState` when empty, with real populated-content states designed too (don't only build the empty state).
6. Add a date-range control to the page header for consistency with other list pages (can wire to mock data refetch for now).

**Definition of Done:**
- All 4 KPI cards, both charts, and both side panels render with real or mocked data.
- Empty states have a clear next-step CTA (e.g. "Add a task").
- Responsive down to tablet width without broken layout.
- Status colors match the canonical mapping defined in Phase 0.

---

## Phase 2 — CRM: Analytics Tab

**Goal:** first of three CRM tabs.

Tasks:
1. Build `/crm` route with a tab shell (Analytics / Pipeline / Tasks) using shadcn Tabs, persisting the active tab in the URL (e.g. `/crm?tab=analytics`).
2. Header: "CRM · Analytics" + subtitle + "New Customer" primary button + "Settings" button + notification bell (reuse top bar bell, don't rebuild).
3. KPI row: Total Customers, Pipeline Value, Conversion Rate, Avg Lead Score. For any metric currently unwired on the backend (Pipeline Value, Avg Lead Score), render an honest "Not tracked yet" state instead of "₹0" / "0" — do not fake a zero as if it were real data.
4. Conversion Funnel using `FunnelChart` (or `BarChart` in funnel mode).
5. Stage Distribution donut using `DonutChart`.
6. Trend chart with Day/Month/Year toggle.
7. Lead Sources bar chart — if all sources are "Unknown" in the data, still render correctly (single-bar state); treat this as a real state, not an edge case to special-case away.
8. Reconcile the Conversion Funnel's stage list with the full 13-stage list used in Phase 3 (Pipeline) — use one canonical list defined in a shared constants file (`lib/constants/pipelineStages.ts`), imported everywhere stages are referenced.

**Definition of Done:**
- All 4 KPI cards + 4 charts render.
- Unwired metrics show an honest empty/not-tracked state, not a misleading zero.
- Stage list is imported from one shared constant, not hardcoded per chart.

---

## Phase 3 — CRM: Pipeline Tab (Kanban)

**Goal:** the most complex screen in this scope — a 13-stage Kanban with drag-and-drop, built to scale.

Tasks:
1. Header controls: stage filter dropdown ("All Stages"), "Filters" button (opens a filter panel/drawer — scope its contents to at minimum a text search + value range).
2. Repeat the 4 KPI cards from Analytics (shared component, just reused).
3. Build the Kanban board with dnd-kit:
   - All 13 stages as columns, using the shared `pipelineStages` constant from Phase 2.
   - Solve the width problem: implement **grouped/collapsible stage clusters** — group "Onsite Measurements" + "Onsite Marking" under one expandable parent column, and group "Ready To Dispatch" + "Installation" + "Services" under a second expandable parent. Confirm the exact grouping with the user before finalizing if it wasn't already approved.
   - Add a view toggle: Kanban view ⇄ dense filterable table/list view (reuse TanStack Table) for the same data.
4. Cards show: client name, address, and `Final Offer: ₹X.XL` when a quote exists. Style cards using the canonical status color for their stage's accent (left border or badge), not full-card background fill.
5. Sub-sort/filter within an overloaded column (e.g. "Quotation" with 30+ cards): add a per-column sort control (by offer value, days-in-stage, last activity) and/or a search-within-column input.
6. Visually deprioritize terminal/negative stages: apply a muted grey treatment to "Cancel Order," and consider collapsing "Site Completed" + "Cancel Order" into an optional "Closed stages" toggle that's off by default.
7. Empty-column state (0 cards) should render a clean placeholder ("No customers in this stage") rather than a blank void.
8. Drag-and-drop: implement grab handles/cursor affordance, drop-zone highlight on hover, and an optimistic UI update with rollback on API failure.

**Definition of Done:**
- All 13 stages represented (directly or via grouping) with correct counts.
- Kanban ⇄ table view toggle works and shows the same underlying data.
- Drag-and-drop moves a card between stages with a visible drop-zone state.
- "Quotation" (or any large column) has at least one working sort/filter control.
- Cancel Order / closed stages are visually deprioritized per the spec.

---

## Phase 3b — Customer Detail Sidebar

**Goal:** a shared right-side drawer, opened from a Kanban card or List row, that becomes the working surface for a single customer — profile, media, and a chat/activity thread — without leaving the pipeline.

**Depends on:** Phase 3 (needs cards/rows to click on).

Tasks:
1. Shared `CustomerPanel` component (one implementation, two entry points: Kanban card click, List row click) — right-side sliding drawer (~420–460px desktop, full-screen mobile), Esc closes, backdrop click closes, clicking a different card while open swaps contents in place.
2. Header: customer name (click → expand Full Details), stage pill (canonical color), Final Offer (when a quote exists), quick actions (call/email/edit/close).
3. Full Details (expandable, Details/Media tabs): address/city/state/postcode/email/phone with per-field inline edit (pencil → save/cancel), architect cross-reference, associated quotes linking to `/quotes`.
4. Media Gallery (WhatsApp-style): thumbnail grid grouped by date, All/Images/Videos/Documents filter, upload via picker or drag-and-drop with per-file progress, full-screen lightbox with arrow-key/click navigation + download.
5. Activity feed (primary focus, most vertical space): chat bubbles + centered system events (e.g. stage-change, offer-update) in one timeline, @mention autocomplete sourced from the User Management roster, voice notes via `MediaRecorder` (waveform bubble + playback), auto-scroll with a "New messages ↓" pill when scrolled up, retry-on-failure for pending/failed sends.
6. Empty/loading/error states: no-messages and no-media empty states with CTAs, skeleton while the panel data loads, mic-permission-denied message, upload/send failure states.

Backend planning (not built this pass): `CustomerAttachment` and `CustomerMessage`/`CustomerActivity` Prisma tables, `POST /notifications` hook on @mention, real file storage for uploads and voice notes (same bucket as other media).

**Definition of Done:**
- Opens from both Kanban and List entry points using the same component.
- Header, expandable details, media gallery + lightbox, and chat feed all render with real (mock) data.
- A message can be sent, shows a pending state, and reflects sent/failed with retry.
- Mobile: panel is full-screen, not a squeezed drawer.

---

## Phase 4 — CRM: Tasks Tab

**Goal:** smallest tab, but must not be an inert dead-end.

Tasks:
1. Filter pills: Pending / Completed / All, wired to actual state (even against mock data).
2. Build a real "Create Task" flow: a button (always visible, not just in the empty state) opening a form/modal (title, due date, assignee, linked customer optional) using React Hook Form + Zod.
3. Build both the empty state (with the Create Task CTA front and center) and a populated-list state (task rows with checkbox-to-complete, due date, assignee).
4. Wire the Dashboard's "Upcoming Tasks" panel (Phase 1) to read from the same task data source so both surfaces stay in sync.

**Definition of Done:**
- A task can be created, marked complete, and reflected in both the CRM Tasks tab and the Dashboard panel.
- Empty state has a working CTA, not just a message.

---

## Phase 4b — Task Assignment & Notifications

**Goal:** turn Tasks from a personal to-do list into a real assignment system with role-based visibility, depends on the User list (Phase 5) for the assignee picker — built here against `mockUsers` since Phase 5 already exists.

Tasks:
1. Extend `Task` with `description`, `priority` (Low/Normal/High/Urgent), `assigneeId`, `createdById` (real `OrgUser` ids, not free-text names).
2. Role-based visibility, shared by the Tasks tab and Dashboard panel via one `visibleTasks()` helper (not duplicated per surface): Super Admin & Admin see all org tasks by default (My Tasks / All Tasks / Assigned by Me toggle); Staff see only tasks they created or were assigned (no "All Tasks" option), with a My Tasks / Assigned by Me toggle since Staff can assign tasks to other Staff.
3. Searchable assignee picker (`UserPicker`) in the Create Task form, defaulting to "assign to myself."
4. Task rows show priority badge, assignee, and "Assigned by X → Y" when creator ≠ assignee; group-by-assignee view for Super Admin/Admin's "All Tasks" scope.
5. Task detail panel (Sheet, same pattern as the Customer Detail Sidebar), mounted globally so it can be opened from a task row or a notification from any page.
6. Notification store + top-bar bell dropdown: unread badge, mark-as-read on click (navigates to the task panel), "Mark all as read." Events: task assigned to someone else, task completed by assignee, due-soon (scanned client-side on load, approximating a scheduled job).

**Explicitly deferred:** task comment threads with @mentions (spec marked this optional) and real-time push (no WebSocket layer exists yet — notifications are computed on the current client only, same limitation as the rest of the mock-data phases).

**Backend TODO (Phase B3+):** all of the above visibility filtering must move server-side into the NestJS task endpoints — a Staff user's API response should never include other users' tasks in the payload. Notification generation (assigned/completed/due-soon/mentioned) must be triggered server-side on the real domain events, with due-soon as an actual BullMQ cron job instead of a client-side scan.

**Definition of Done:**
- Creating a task assigned to someone else makes it appear in their task list and fires a bell notification (with toast) without a manual refresh.
- A Staff user's task list never includes a task between two other unrelated users.
- Clicking a notification opens that task's detail panel from any page.

---

## Phase 5 — User Management

**Goal:** full User Management screen, redesigned to reduce page length and surface access problems clearly.

Tasks:
1. Build `/users` page: Organization Details card (Org Name, Type, Credits Balance, Total Members) at the top — no tabs needed on this page.
2. Replace the two always-visible stacked mini-forms (Invite New User, Assign Role) with a single **"Add or manage access"** button that opens a modal/drawer containing both flows (tabbed or stepped inside the modal: Invite vs. Assign Role to existing user).
3. Build the Users & Roles table (TanStack Table): Name, Email, Status, Role columns, with:
   - A search input (scales beyond the current 12 users).
   - A visually distinct **warning badge** on any row where Role = "No role" (amber/warning token from the palette), so it's impossible to miss.
   - Optional "last active" column (mock the data if the backend doesn't supply it yet — flag as a backend TODO).
4. Duplicate-account awareness: if two users share an identical display name, surface a subtle inline flag/icon (does not need to auto-merge — just make it visible) so an admin notices without hunting for it.
5. Role Permissions reference: remove the static full-page block; instead add an info icon next to the Role field (in both the invite form and the assign-role form) that opens a tooltip/popover showing that role's permission summary at the point of selection.
6. Confirm "Manufacturing" role exists as a selectable option in both Invite and Assign Role dropdowns even though no current user holds it.

**Definition of Done:**
- Page no longer has two permanently-visible forms above the table — both are behind one "Add or manage access" entry point.
- A user with "No role" is visually flagged in the table without needing to open the row.
- Role permissions are accessible via tooltip/popover at the point of role selection, not as static scrollable text.
- Table has working search.

---

## Phase 5b — Customers CRUD & Permissions

**Goal:** replace the `/customers` placeholder with a real list + full CRUD, gated by the Phase 5 role roster, reusing the Phase 3b Customer Detail Sidebar for View.

Tasks:
1. `CustomersTable` (TanStack Table): search, Name/Address/Stage columns, role-aware actions column (View — all roles; Edit pencil — Super Admin/Admin only; Delete trash — Super Admin only), icon tooltips.
2. `CustomerFormDialog` shared by Add and Edit (title/submit label swap): Name, Mobile, Email, GST, Address, City/State/Postcode, Birthday Month/Day. Inline zod validation (name required, email format, Indian mobile pattern, numeric postcode). Add mode shows an info-toned "10 credits will be charged" banner; Edit mode shows "Last updated [date] by [user]" instead.
3. View reuses the existing `CustomerPanel` (now mounted globally in `AppShell` instead of only inside the CRM Pipeline tab) so Customers table, Kanban card, and List row all open the identical panel. Edit (pencil) and Delete (trash) are now real actions in the panel header, gated the same as the table.
4. `DeleteCustomerDialog`: names cascaded-but-preserved records (quotes/media/activity kept, just unlinked from an active customer — confirmed with the business, no hard cascade), plus an extra error-toned warning banner if the customer has an active order in progress (production/MRS/ready-to-dispatch/installation stages).
5. Soft delete: row disappears immediately; a toast with an "Undo" action stays live for 10s before the delete is final (`customers-store.ts`, `toastStore` extended with an optional action button).
6. New `customers-store.ts` layers created/deleted customers over the seeded mock array; `customer-profile-overrides-store.ts` extended with `name`/`gst`/`birthdayMonth`/`birthdayDay`/`updatedAt`/`updatedById` so Add/Edit writes go through the same override bag the Customer Detail Sidebar already reads from Phase 3b.

**Explicitly deferred:** typed-name delete confirmation (business chose the simpler two-button dialog) and hard cascade delete of quotes/media/chat (business chose preserve-and-unlink).

**Backend TODO (Phase B3+):** move Edit/Delete permission checks into NestJS Customers module guards — the API must reject an unauthorized request even if the UI is bypassed. Decide the real Prisma cascade behavior for quotes/purchase orders/media once those modules have real relations (mock data has no true foreign keys to cascade today).

**Definition of Done:**
- Staff can view every customer but never sees an Edit or Delete icon; Admin sees Edit but not Delete; only Super Admin sees Delete.
- Adding a customer from the Customers table makes it appear in the CRM Pipeline Kanban/List immediately (same store).
- Deleting shows the Undo toast, and clicking Undo restores the row before the window elapses.

---

## Phase 5c — Architects CRUD & Permissions

**Goal:** replace the `/architects` placeholder with full CRUD, mirroring Phase 5b's permission pattern — Architect is a brand-new entity (no prior mock data existed), so this also wires it into Customers' `architectName` field for real cross-referencing instead of a floating string.

Tasks:
1. New `Architect` entity (`lib/mock/architects.ts`, `lib/store/architects-store.ts`): first/last name, repeatable partner names, mobile/office, company, Instagram, address/city/state/postcode, birthday. One unified store (not a base+overrides split like Customers) since there's no pre-existing shape to preserve.
2. `ArchitectFormDialog` shared by Add/Edit: repeatable "Partner Name" rows via `useFieldArray` (add/remove, no cap, scrolls past a handful), Instagram auto-prefixed with `@` on blur, same validation pattern as Customers (name required, phone/postcode format checks). No credits banner on Add (business confirmed: stays free, unlike Customers).
3. `ArchitectsTable`: search matches Name, Company, and Partner Name. Role-aware actions (View all roles, Edit Admin+, Delete Super Admin only) — identical ordering/styling to the Customers table. Duplicate-name detection (warning icon + tooltip) since the seed data intentionally includes a repeated "Ar Swapnil" entry, matching the real data's existing repeats — flagging only, no merge tool (business confirmed flagging is enough for now).
4. `ArchitectPanel`: a lighter dedicated Sheet (not the Customer Detail Sidebar reused verbatim — content differs enough, chat/media doesn't apply here) showing full profile + partners + a **Linked Quotes/Customers** list, this being the architect record's actual business value. Instagram link opens in a new tab, mobile number is a `tel:` link.
5. `DeleteArchitectDialog`: names how many quotes reference this architect and that deleting sets those to "Unassigned" rather than cascading (business confirmed: no denormalized historical name preserved). Soft delete + Undo toast, same as Customers.
6. `getArchitectLinkedQuotes()` in `lib/mock/customer-detail.ts` cross-references by matching `getCustomerProfile(customer).architectName` against the new `Architect` list — replaces the old hardcoded 3-name placeholder array, so the "architect" a customer profile already showed is now a real, clickable entity.

**Explicitly deferred:** a real merge-duplicates flow (flagging only, per business decision) and credits charging on Add (stays free, per business decision).

**Backend TODO (Phase B3+):** move Edit/Delete permission checks into NestJS Architects module guards, same as Customers. Prisma: a proper `ArchitectPartner` one-to-many table instead of a string array, and the Quote→Architect foreign key should be nullable (`ON DELETE SET NULL`) to match the "Unassigned" fallback decided here.

**Definition of Done:**
- Staff can view every architect but never sees Edit or Delete; Admin sees Edit but not Delete; only Super Admin sees Delete.
- A repeated name in the seed data shows the duplicate warning icon in the table.
- Opening an architect's View panel shows every quote/customer that references them, matching what that customer's own profile already showed as their architect.

---

## Phase 5d — Credential Management (Set/Reset Password)

**Goal:** give Super Admin control over user credentials — set at invite time, reset anytime — extending Phase 5's table and modal patterns directly, plus a lightweight audit trail since this is account-takeover-capable functionality.

Tasks:
1. `Invite New User` form extended with Password/Confirm Password (`withPasswordFields` schema helper, shared with Set Password), a "Generate secure password" button, a copy-icon, and the same live strength checklist from Sign Up (`PasswordRequirements`, reused as-is). On submit, the dialog shows a confirmation summary (name/email/role/password) with an explicit "won't be shown again" warning before Super Admin can dismiss it.
2. New `SetPasswordDialog`: a key-icon action added to the Users & Roles table, Super Admin-only (icon fully hidden for other roles, matching the Customers/Architects pattern). Same password fields + checklist, plus an opt-in "Require password change on next login" checkbox (business confirmed: unchecked by default, per-action choice). No current-password confirmation, since this is a direct admin override.
3. Forced-change flow: `mustChangePassword`/`passwordUpdatedAt` fields added to `OrgUser`. Sign In checks the flag (matched by typed email against the org roster — necessarily a simulation, since there's no real per-user password check yet, only the single shared mock dev account) and routes to a new `/change-password` page instead of `/dashboard` when set; that page collects New Password + Confirm New Password only (no temporary-password re-entry, since they're already authenticated) and clears the flag on save.
4. "Forgot your password?" on Sign In now opens a real dialog (email → "Contact your admin to reset your password"). Business confirmed this is the **permanent** design, not a stopgap — no real reset-email infra planned.
5. `securityAuditStore` + `SecurityAuditList` on the Users page: a simple last-20 feed ("Chirag Patel set a new password for Vijay Bhaskar — 2h ago"), logging both invites and password-set actions so this sensitive capability leaves a visible trail.

**Explicitly deferred:** self-service "change my own password while logged in" (a separate, lower-risk flow requiring current-password confirmation — flagged for a future phase, not built here). Admin (non-Super-Admin) password-reset ability for Staff — business confirmed Super Admin only, across the board, matching the existing Customers/Architects delete-permission pattern.

**Backend TODO (Phase B3+):** `PATCH /users/:id/password` as its own tightly-guarded NestJS route (separate from general user-update, so it can carry stricter rate-limiting), verifying Super Admin role server-side on every call — today's gating is UI-only, same caveat as every other permission check in this mock phase. Passwords must be hashed (bcrypt/argon2) before storage; the frontend's plain-text generate/reveal/copy behavior is only for Super Admin's one-time viewing convenience and is never persisted client-side (the mock store doesn't store the password value at all, only that a change occurred). Add a real `SecurityAuditLog` table (actorUserId, targetUserId, action, timestamp) to back the audit list — it's client/localStorage-only today.

**Definition of Done:**
- Only Super Admin sees the key icon in the Users table; Admin and Staff never see it.
- Setting a password via the table shows a toast and a new entry at the top of "Recent security actions."
- Checking "Require password change on next login," then signing in with that user's email, redirects to `/change-password` instead of `/dashboard`; saving there redirects to `/dashboard` and the flag clears.

---

## Phase 6 — Integration Pass (Dashboard + CRM + User Management)

**Goal:** make sure the three sections behave as one coherent product, not three separately-built screens.

Tasks:
1. Confirm the canonical status/stage color mapping (Phase 0/2) is applied identically across: Dashboard donut, CRM Analytics charts, CRM Pipeline Kanban, and anywhere else a stage/status appears.
2. Confirm the shared `ListPageShell`, `KpiCard`, `StatusBadge`, and `EmptyState` components are actually being reused (not re-implemented) across Dashboard, CRM tabs, and User Management.
3. Run a full click-through of all three sections end to end, checking: sidebar active-state highlighting, breadcrumb correctness, notification bell consistency, font application (Outfit on every heading, Montserrat everywhere else — spot check, don't assume).
4. Accessibility pass: keyboard navigation through the Kanban and tables, focus states visible, color contrast check on all badge/text combinations (especially the warning/error transparent backgrounds with their solid-color text).
5. Responsive pass at tablet width for all three sections.

**Definition of Done:**
- A reviewer can move between Dashboard → CRM (all 3 tabs) → User Management and it reads as one consistent app, not three different ones stitched together.
- No hardcoded hex values remain in component code — everything routes through the token system.

---

## Phase 7c — Templates: Material Spec (Specification + Library)

**Goal:** first real sub-tab inside Templates (previously a bare placeholder — Pricing List, Unit Type, Cabinet Type, and Quote Example are still placeholders, sequenced as future Phase 7a/7b/7d/7e once their own requirements are written). Since nothing in Templates existed yet, this phase establishes the list/table/modal/permission pattern the other Templates sub-tabs will follow, rather than reusing an existing one.

Tasks:
1. Templates top-level tab shell (`app/(app)/templates/page.tsx`), URL-persisted via `?tab=`, same pattern as CRM's Tickets/Tasks tabs — Material Spec is the only functional tab, the rest render a "coming in a later phase" empty state.
2. Material Spec's own secondary tab bar — Material Specification | Material Library — URL-persisted via `?view=`, plus a `?category=` param remembering which of the 4/5 categories is selected within that sub-tab.
3. Layout: left category rail + right-side list (settings-page pattern), same shape for both sub-tabs. 4 categories under Specification (Raw Material Description, Handle Type, Hinges Type, Client Responsibility), 5 under Library (Furniture Component, Raw Material Type, Internal Colours, External Colours, Thickness) — all backed by one generic `MaterialItem` shape and one store (`lib/store/material-spec-store.ts`), not 9 bespoke tables, per the functional notes.
4. Add/Edit modal shared across all 9 categories: Name, Description (full textarea for Raw Material Description per its longer spec text, single-line for everything else), Active toggle.
5. Deactivate-first pattern: the status pill in the list toggles Active/Inactive directly (Admin+), permanent Delete is a separate Super-Admin-only action behind a confirmation dialog warning that existing quotes may reference the value. Soft delete + Undo toast, same as Customers/Architects.
6. CSV Import/Export panel, shared above both sub-tabs (one config area, not duplicated per sub-tab): category picker (scopes Template/Export/Import to one category, not a combined export), Import Mode select (Upsert/Insert Only/Update Only) with inline helper text explaining each mode — the gap flagged for Shutters/Hardware to eventually reuse. Mock only: no real CSV parsing yet, confirms via toast.

**Explicitly deferred (per business answers):**
- Raw Material Description is independent free text for now, not composed from Material Library reference-pickers (Raw Material Type / Colour / Thickness) — upgrade to reference-pickers once Material Library holds real (non-mock) data.
- Internal/External Colours are descriptive text only, no swatch/hex picker.
- Thickness is not yet wired as a shared reference used by other areas (Shutters, Cabinet Types) since those don't exist yet either — it's just its own Material Library category for now.

**Backend TODO (Phase B3+):** each of the 9 categories as its own Prisma lookup table sharing a common base shape (id, name, description?, active, createdAt) rather than fully bespoke schemas. Real CSV parsing per category. Enforce Edit = Admin+, permanent Delete = Super Admin only server-side, same as Customers/Architects.

**Definition of Done:**
- Both sub-tabs and the active category survive a page reload via URL params.
- Staff can view every category's list but never sees Edit or Delete; Admin can toggle Active/Inactive and Edit but not permanently Delete; only Super Admin can Delete.
- The CSV panel's Import Mode helper text is visible without opening a tooltip.

---

## Backend Phases (run in parallel with or slightly ahead of the frontend phases above)

### Phase B0 — Backend Setup
- Scaffold NestJS project, connect PostgreSQL, set up Prisma, write initial schema covering: Customer, PipelineStage (or enum), Quote (+ QuoteUnit, QuotePricing), User, Role, Task.
- Seed script with realistic mock data matching the volumes seen in the audit (74 customers across 13 stages, 75 quotes mostly Draft, 12 users across 4 roles) so frontend phases have real data to point at instead of static mocks.

### Phase B1 — Dashboard & CRM Analytics Endpoints
- Endpoints for: revenue/quote KPIs, quote status distribution, monthly trend (raw SQL via `$queryRaw` for the aggregation), CRM KPI cards, conversion funnel, stage distribution, lead sources.
- Return an explicit "not tracked" flag (not a fake 0) for any metric without real underlying data (Pipeline Value, Avg Lead Score, Lead Sources when unknown).

### Phase B2 — CRM Pipeline & Tasks Endpoints
- Endpoints: list customers by stage (paginated per column), update customer stage (drag-and-drop target), task CRUD, task completion toggle.
- Enforce the canonical stage list server-side (enum or lookup table) so frontend and backend can never drift.

### Phase B3 — Users & Roles Endpoints
- Endpoints: list users, invite user (send email), assign/change role, role permissions lookup.
- RBAC guard layer enforcing: Super Admin (full + delete), Admin (manage, no role/delete mgmt), Sales (own quotes only), Manufacturing (view-only, no pricing fields returned at the API level — not just hidden in the UI).

**Definition of Done (backend):**
- Every frontend phase above can be pointed at a real endpoint instead of mock data by the time its corresponding frontend phase starts integration testing.
- Manufacturing-role API responses genuinely omit pricing fields server-side (verified by a real request, not just a UI check).

---

## How to Use This With Claude Code

1. Start a session with `CLAUDE.md` in the repo root so Claude Code reads it automatically (or reference it explicitly in your first message).
2. Paste one phase at a time as the task ("Implement Phase 1 from PHASES.md").
3. After Claude Code reports completion, manually check that phase's Definition of Done before moving to the next phase.
4. If a phase's scope turns out too large for one session, split it further (e.g. Phase 3 into "3a: static Kanban layout" then "3b: drag-and-drop + grouping") — just keep the Definition of Done as the finish line.
