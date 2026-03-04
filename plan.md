# Smart Defect Management — Revision Plan

## Current State Summary

A full-stack Vue 3 + Fastify defect management platform with:
- Defect CRUD with soft deletes, filtering (10+ fields), sorting, pagination
- Dashboard with stats and bar charts
- Webhook system (config, scheduling, test, history, payload preview)
- DingTalk integration with markdown message formatting
- i18n (English / Chinese), dark/light theme, keyboard shortcuts
- SQLite (libsql) database, Drizzle ORM schema (mostly raw SQL queries)

---

## Completed Work

### Features Added

| # | Feature | Description | Date |
|---|---------|-------------|------|
| F1 | Payload preview panel | Side-by-side layout in Settings: "Webhook Automation" (left) + "View SendPayload" (right) with Refresh button and JSON preview | 2026-03-04 |
| F2 | Instant Send button | Send webhook immediately from the preview panel using current form values (no save required) | 2026-03-04 |
| F3 | Platform selector | Dropdown to choose webhook platform: DingTalk / WeChat Work / Feishu / Custom JSON | 2026-03-04 |
| F4 | DingTalk message format | Webhook payload formatted as DingTalk markdown (`msgtype: markdown`) with severity icons, stats, and defect lists | 2026-03-04 |
| F5 | Preview with live filters | Payload preview uses current form filter values (severity, status, priority, vehicle, product, dateRange, keywords) | 2026-03-04 |
| F6 | `POST /webhook/preview` endpoint | Backend endpoint to generate preview payload without sending | 2026-03-04 |
| F7 | `WebhookPreviewInput` type | Dedicated TypeScript type for preview requests (shared between client and server) | 2026-03-04 |
| F8 | `platform` field in webhook config | Stored in DB, used to determine message format (DingTalk vs raw JSON) | 2026-03-04 |
| F9 | Editable payload preview | Payload preview is now an editable textarea; user can customize the exact JSON/markdown before sending | 2026-03-04 |
| F10 | `POST /webhook/send-raw` endpoint | Backend endpoint to send an arbitrary user-edited payload directly to the webhook URL | 2026-03-04 |
| F11 | Filter clear buttons | Each defect filter has a `×` clear button to deselect; "Reset All" button clears all filters at once | 2026-03-04 |
| F12 | Edited payload indicator | Blue "Edited" hint shown when user has modified the generated payload before sending | 2026-03-04 |
| F13 | JSON validation on send | Validates edited payload is valid JSON before sending; shows error toast if invalid | 2026-03-04 |

### Bugs Fixed

| # | Bug | Root Cause | Fix | Date |
|---|-----|-----------|-----|------|
| B1 | DingTalk returns `errcode: 300001` "msgtype is null" | Webhook sent raw JSON instead of DingTalk `{"msgtype":"markdown",...}` format | Added `buildDingTalkMarkdown()` formatter | 2026-03-04 |
| B2 | DingTalk returns `errcode: 310000` "关键词不匹配" | Custom keywords not placed in DingTalk `title` field; DingTalk keyword security check failed | Put keywords in `markdown.title` field: `"IDC_PDVV Defect Report"` | 2026-03-04 |
| B3 | Webhook shows "Success" when DingTalk rejects message | Code only checked HTTP status (200 = success), but DingTalk returns 200 with error body | Now parses response JSON and checks `errcode === 0` | 2026-03-04 |
| B4 | Test/Instant Send used saved config, not form values | "Instant Send" and "Test Webhook" called saved config, ignoring unsaved form changes (empty keywords, wrong filters) | Both buttons now send current form values via POST body | 2026-03-04 |
| B5 | Preview returned 0 defects | Preview endpoint used saved config filters (too restrictive); also `WebhookConfigInput` type required `url`/`schedule` causing issues | Created `WebhookPreviewInput` type; preview uses form body values | 2026-03-04 |
| B6 | Hardcoded "Webhook test sent" string | Not using i18n | Replaced with `t('settings.sendSuccess')` | 2026-03-04 |

---

## Revision Items

### Phase 1 — UI/UX Polish & Completeness

| # | Item | Description | Status |
|---|------|-------------|--------|
| 1.1 | Mobile responsiveness | Add proper breakpoints to FilterBar, DefectTable, DefectForm, SettingsView; ensure sidebar collapses on small screens | TODO |
| 1.2 | Form validation | Real-time field validation with inline error messages (not just on submit) | TODO |
| 1.3 | Loading states | Add skeleton/spinner states during async operations (view transitions, form save, filter changes) | TODO |
| 1.4 | Empty states | Improve empty state visuals for defect list (with CTA), dashboard (no data), webhook history | TODO |
| 1.5 | Toast improvements | Ensure all success/error paths show toast feedback consistently | PARTIAL |
| 1.6 | Filter UX | Add "clear all" button; show active filter count badge on sidebar; debounce search input | TODO |
| 1.7 | Table UX | Add row hover highlight, clickable rows to open detail, column resize hints | TODO |
| 1.8 | Hardcoded strings | Move remaining hardcoded UI strings into i18n | PARTIAL |

### Phase 2 — Core Feature Enhancements

| # | Item | Description | Status |
|---|------|-------------|--------|
| 2.1 | Comments / activity log | Add per-defect comment thread and change history trail | TODO |
| 2.2 | Attachments | File/image upload on defects (store in local filesystem or blob) | TODO |
| 2.3 | Bulk operations | Multi-select defects for bulk status change, bulk delete, bulk assign | TODO |
| 2.4 | Export | Export filtered defect list to CSV/Excel | TODO |
| 2.5 | Defect cloning | "Duplicate" action to create a new defect from an existing one | TODO |
| 2.6 | Saved filters | Save and name filter presets for quick reuse | TODO |
| 2.7 | Search highlighting | Highlight matched text in search results | TODO |
| 2.8 | Webhook payload preview | Side-by-side preview with live filter support and instant send | DONE |
| 2.9 | DingTalk integration | Platform-aware webhook formatting with keyword security support | DONE |

### Phase 3 — Backend & Data Integrity

| # | Item | Description | Status |
|---|------|-------------|--------|
| 3.1 | Input validation | Add server-side validation with proper error responses (400 with field errors) | TODO |
| 3.2 | Consistent DB layer | Migrate all raw SQL to Drizzle ORM or commit fully to raw SQL; unify approach | TODO |
| 3.3 | Database migrations | Add a migration system (drizzle-kit or manual versioned SQL) | TODO |
| 3.4 | Webhook retry | Add retry logic (3 attempts with exponential backoff) for failed webhook deliveries | TODO |
| 3.5 | Webhook auth | Support HMAC signature header for webhook payload verification | TODO |
| 3.6 | Error handling | Structured error responses with error codes; centralized error handler in Fastify | TODO |
| 3.7 | Logging | Add a logging framework (pino via Fastify) with log levels | TODO |
| 3.8 | Rate limiting | Add basic rate limiting on API endpoints | TODO |
| 3.9 | DingTalk errcode handling | Parse DingTalk response body to detect errors (HTTP 200 with errcode != 0) | DONE |

### Phase 4 — Code Quality & Testing

| # | Item | Description | Status |
|---|------|-------------|--------|
| 4.1 | Unit tests | Write tests for composables, utility functions, and backend routes | TODO |
| 4.2 | Component tests | Test key Vue components with @vue/test-utils | TODO |
| 4.3 | Type safety | Remove `as any` casts; add strict null checks; improve generic types | TODO |
| 4.4 | API documentation | Add Swagger/OpenAPI spec for all endpoints | TODO |
| 4.5 | README | Create README with setup instructions, architecture overview, screenshots | TODO |

### Phase 5 — Advanced Features (Nice-to-Have)

| # | Item | Description | Status |
|---|------|-------------|--------|
| 5.1 | Authentication | User login/registration with role-based access control | TODO |
| 5.2 | Notifications | In-app notification center for defect assignments and status changes | TODO |
| 5.3 | Analytics dashboard | Trend charts (line/area), SLA tracking, resolution time metrics | TODO |
| 5.4 | Defect templates | Pre-defined templates for common defect types | TODO |
| 5.5 | External integrations | Jira/Azure DevOps sync, email notifications | TODO |
| 5.6 | WeChat Work / Feishu formatters | Add platform-specific message formatters (currently only DingTalk implemented) | TODO |

---

## Known Issues

| Issue | Location | Severity |
|-------|----------|----------|
| `as any` type cast on filter params | src/App.vue:141 | Low |
| Mixed Drizzle ORM + raw SQL | server/db/, server/routes/ | Medium |
| CORS wide open (`origin: true`) | server/index.ts | Medium |
| No input sanitization on server | server/routes/defects.ts | Medium |
| Webhook tables created via raw SQL, not in schema.ts | server/db/connection.ts | Low |
| `index.html` lang hardcoded to `zh-CN` | index.html | Low |
| No responsive breakpoints in several components | Multiple | Medium |
| WeChat Work and Feishu formatters not yet implemented | server/webhook/sender.ts | Low |

---

## Notes

- Project uses a single git commit so far (`e68cddf`)
- Vitest is configured but no tests exist yet
- Team members are hardcoded in `src/config/projects.ts` (70+ people, 4 departments)
- Vehicle/product/layer options are hardcoded in `src/config/constants.ts`
- DingTalk robot security: keywords must appear in markdown `title` field
- DingTalk returns HTTP 200 even on errors — always check `errcode` in response body
- DB migrations use `ALTER TABLE ADD COLUMN` with try/catch in `connection.ts`
