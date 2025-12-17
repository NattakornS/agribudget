Architecture Design Overview
Here's a comprehensive architecture that keeps your existing stack while adding Telegram and Gemini capabilities:
High-Level Architecture
```
User (Telegram) → Telegram Bot API → Vercel (Webhook Handler) 
                                            ↓
                                    Next.js API Routes
                                            ↓
                              ┌─────────────┴─────────────┐
                              ↓                           ↓
                         Gemini API                  Supabase
                    (AI Processing)              (Data Storage)
```
Detailed Component Breakdown
1. Telegram Integration Layer  
Webhook Endpoint: /api/telegram/webhook - Receives messages from Telegram  
Bot Service: Handles Telegram Bot API calls (send messages, handle commands)  
Message Parser: Extracts user intent and formats data  

2. Core Application (Next.js on Vercel)

- API Routes:  
/api/telegram/webhook - Main entry point for Telegram messages  
/api/ai/process - Gemini AI processing endpoint  
/api/user/session - User session management  


- Services Layer:
telegramService.ts - Telegram Bot API wrapper  
geminiService.ts - Gemini API integration  
supabaseService.ts - Database operations  

3. Data Layer (Supabase)  
- Tables:


1. AI Processing Layer (Gemini)  
   - Request rate limiting
   - Token tracking
   - Context management from conversation history

### **Recommended Architecture Pattern**

Since you're on Vercel (serverless), I recommend:

**Pattern: Simple Webhook → Process → Respond** (Best for most use cases)
```
Telegram → Vercel Webhook → Process with Gemini → Save to Supabase → Reply
(Synchronous, good for < 10s processing time)
```



# Bot Feature Requirement (Expanded)

This document expands the BotFeatureRequirement.md with detailed architecture, flows, data model changes, API spec, pairing mechanism, privacy & disconnect flows, package enforcement, and implementation notes for Line/Telegram chatbot integration + Gemini/ChatGPT processing.

---

## Goals (summary)
- Add chatbot input channels: Telegram and LINE (text + optional photo support).
- Allow users to register in the web app, then pair their chat account to webapp account.
- Chatbot receives messages (text/photo), routes to configured LLM (Gemini or ChatGPT), extracts parameters and maps them to Income/Expense records.
- If crop cannot be inferred, bot asks user to provide crop name (interactive).
- After saving, bot returns a confirmation card with saved record details and actions (edit, confirm, discard).
- User can disconnect a chat platform pairing at any time.
- Subscription packages control feature availability:
  - Basic: full webapp minus FertilizerPlanner & FertilizerUsageTable; no chat integrations.
  - Pro: all webapp features; Line/Telegram text chat only.
  - Premium: Pro + photo support in chat.

---

## High-level architecture
```
Chat Platform (Telegram|LINE)
        ↓ (webhook)
Vercel / Serverless endpoint (/api/webhook/telegram, /api/webhook/line)
        ↓
Webhook handler → Auth check & chat routing → Bot Service
        ↓                                     ↘
  Message Processor (NLP) ──> LLM Service (Gemini|OpenAI)
        ↓                                     ↘
  Intent/entity extraction / OCR (if photo)  → DB Service (Supabase)
        ↓
  Confirmation Renderer → Bot Service → Reply (rich card or message)
```

Components:
- Webhook handlers (serverless functions).
- Bot Service: orchestrates parsing, LLM calls, DB writes, confirmation messages.
- LLM Adapter: switchable provider (Gemini or ChatGPT).
- OCR service (for photo): Tesseract or cloud OCR (if photo support).
- Mapping & Validation layer: maps extracted entities to DB columns.
- Pairing service: handles secure linking of chatId ↔ webapp user.
- Subscription enforcement module.

---

## Database additions / changes

Add tables:

1. chat_providers
- id, name ('telegram'|'line'), config json

2. user_chat_accounts
- id uuid
- user_id uuid (references users)
- provider varchar
- chat_user_id varchar (chat platform user id)
- chat_username varchar
- display_name varchar
- is_active boolean
- created_at, updated_at

3. chat_messages (logging)
- id, user_chat_account_id, direction ('in'|'out'), content json, attachments json, llm_response json, status

4. user_packages (if not present)
- user_id, plan ('basic'|'pro'|'premium'), started_at, expires_at

Indexes: user_chat_accounts (user_id, provider), unique(provider, chat_user_id)

---

## Pairing / linking flow

Two safe options (choose one or support both):

A) In-app pairing (recommended):
1. User logs into web app.
2. In Settings → Integrations → Telegram/LINE → Click "Pair".
3. App shows a short time-limited pairing code or deep-link:
   - Pair code: 6–8 chars (e.g., ABC123). Save transiently in DB with user_id, expires_at.
   - Alternatively, provide a deep-link URL to bot: `https://t.me/YourBot?start=pair-<code>` or LINE link.
4. User opens bot and sends the pairing command (or clicks deep link).
5. Bot webhook receives the pair code, verifies it with the server, and associates chat_user_id with user_id. Bot replies confirmation.

B) Chat-initiated OAuth-like flow:
1. User starts bot; bot responds with a link to webapp login (includes chat_user_id token).
2. User logs into webapp; the server validates the token and links accounts.

Unlink/disconnect:
- Web app Settings shows linked chat accounts with "Disconnect" button.
- Clicking removes user_chat_accounts entry (or sets is_active=false) and revokes pairing.
- Bot respects disconnect and will refuse messages unless re-paired.

Security:
- Pair codes expire (e.g., 10 minutes).
- Validate ownership by checking both web session and chat message.
- Rate-limit pairing attempts.

---

## Message handling flow

1. Webhook receives message → normalize payload (text, photo, metadata).
2. Identify chat_user_account by provider + chat_user_id.
   - If not linked: respond with pairing instructions (return short pairing deep link or pairing code flow).
3. Check user subscription plan:
   - If not allowed (basic or expired), reply with subscription required message and CTA.
4. Preprocess:
   - If photo and plan allows: run OCR to extract text; also forward image to LLM if needed.
   - If text: forward text to LLM adapter (Gemini or ChatGPT) for entity extraction.
5. LLM processing / parsing:
   - Use a prompt template focused on structured extraction (date, amount, cost, category, crop, unit, detail, type: income/expense).
   - Also ask LLM to respond in JSON with fields and confidence scores.
6. Validate extracted entities:
   - Ensure date, amount formats. If missing critical fields (crop, amount, date), handler triggers follow-up questions.
7. If crop missing/unreliable:
   - Bot asks: "Which crop is this for? Choose from: [Crop A], [Crop B], or type new crop name." Provide quick reply buttons.
8. On finalize:
   - Map fields to DB (income or expense) and write via service functions.
   - If record includes related link (income has linked expenses), attach relation.
9. Send confirmation card:
   - Show parsed record summary, confidence, thumbnail (if photo), and action buttons: Confirm / Edit / Discard.
   - Confirm saves permanently (if not already saved); Edit opens an interactive flow to change fields; Discard cancels the draft.
10. Logging: store original message, LLM output, decisions, DB id.

---

## LLM prompt & parsing rules (example)
- Use explicit JSON schema output in LLM prompt:
  {
    "type": "expense" | "income",
    "crop_name": "string | null",
    "category_name": "string | null",
    "amount": number,
    "unit": "kg|ltr|...|null",
    "cost": number | null,   // unit cost if applicable
    "total": number | null,
    "date": "YYYY-MM-DD",
    "detail": "string | null"
  }
- Also ask for `confidence` per field (0-1).
- If photo: include OCR text and mention "image contains receipt" and instruct LLM to parse amounts.

---

## Confirmation card design (chat message)
- Title: Saved Income / Expense (or Draft)
- Fields: Type, Crop, Category, Amount, Unit, Cost, Total, Date, Detail, Confidence
- Buttons:
  - Confirm (postback → commit if draft)
  - Edit (quick replies to adjust fields)
  - Discard

For Telegram, use InlineKeyboardButtons with callback_data. For LINE, use Flex Message with postback actions.

---

## Subscription rules & enforcement
- Basic: no chat integration. Bot returns "Upgrade to Pro to use chat features" when linked.
- Pro: Text only on Telegram & LINE. If user tries to send photo, bot replies "Upgrade to Premium for photo".
- Premium: Text + photo.

Enforce both at webhook time and in pairing flow.

---

## APIs (server endpoints)

1. Webhook endpoints (public, authenticated by platform signature/token)
- POST /api/webhook/telegram
- POST /api/webhook/line

2. Pairing endpoints
- POST /api/chat/pair/generate   { provider } → { pair_code, expires_at }
- POST /api/chat/pair/confirm    { provider, pair_code, chat_user_id } → links account
- POST /api/chat/unlink          { provider, chat_user_id } (auth required)

3. Bot orchestration
- POST /api/chat/process         Internal endpoint that accepts normalized message and runs LLM/OCR + DB mapping (used by webhook handlers)
- POST /api/chat/confirm         Action endpoint for confirm/edit/discard callback (from chat buttons)

4. Admin / user
- GET /api/user/packages
- POST /api/user/packages/upgrade

API security:
- Webhook verification (Telegram secret token or LINE signature).
- Rate-limit webhooks and per-user usage.

---

## Implementation notes

Packages & libs:
- Telegram: node-telegram-bot-api (webhooks) or raw Express handlers.
- LINE: @line/bot-sdk
- OCR: tesseract.js (serverless cpu heavy), or cloud OCR (Google Vision / AWS Textract) recommended for reliability.
- LLM: Gemini via Google Cloud or OpenAI ChatGPT.
- DnD: None needed here.
- DB: Supabase (use server-side service key for writes from server).
- Server: Vercel or Cloud Run (webhooks must be reachable).
- DND (drag-n-drop) unrelated.

Message parsing reliability:
- Use verification step (confirmation card) — never rely solely on LLM parsed data.
- Keep a 'draft' before final commit.

Rate limiting:
- Per-user and per-bot global limits (100 req/min default).
- LLM usage quotas and caching for repeated similar inputs.

Logging & Monitoring:
- Store message logs + LLM outputs for review and debugging.
- Expose admin UI to inspect ambiguous/parsing-failed messages.

Privacy & Data retention:
- Allow users to delete chat logs and unlink accounts.
- Store minimal PII; if storing images, encrypt or set retention time.
- Provide endpoints to purge linked chat data on unlink.

---

## Sample sequence: user sends expense via Telegram
1. User sends photo of receipt to bot.
2. Webhook receives → identifies provider & chat_user_id → find user mapping.
3. Check subscription (must be premium). If not, respond "Upgrade required".
4. Run OCR → get text → pass OCR text + prompt to LLM asking JSON output.
5. LLM returns parsed JSON (amounts, date, category unknown, crop missing).
6. Bot drafts expense and asks: "Which crop is this for?" with buttons from user's crops.
7. User selects crop → bot updates draft, saves a new expense record as draft (or directly with status=user_confirmed=false).
8. Bot sends confirmation card via InlineKeyboard: Confirm / Edit / Discard.
9. User confirms → server marks record final and notifies user.

---

## Developer tasks checklist

1. Add DB tables (user_chat_accounts, chat_messages, chat_providers, user_packages).
2. Implement webhook handlers for Telegram & LINE with signature verification.
3. Implement pairing endpoints & flows (pair code generation + verification).
4. Build Bot Service:
   - Normalizer (convert incoming to common shape)
   - LLM Adapter & prompt templates
   - OCR pipeline (photo handling)
   - Mapping & Validation
   - Draft and Confirm flows
5. Confirmation UI for chat (Inline keyboards / Flex messages).
6. Subscription enforcement module.
7. Logging, retry, and monitoring.
8. Unit & integration tests (webhook parsing, LLM parse validation).
9. Documentation for support & troubleshooting.

---

## Example: Pairing API example

POST /api/chat/pair/generate
Request:
{ "provider": "telegram" }
Response:
{ "pair_code": "ABC123", "expires_at": "2025-12-31T12:00:00Z" }

User opens bot and sends: `/start pair-ABC123`
Bot webhook calls:
POST /api/chat/pair/confirm
{ "provider":"telegram", "pair_code":"ABC123", "chat_user_id":"123456", "chat_username":"farmerjoe" }
Server links chat_user_id → user_id and returns success.

---

## Notes & tradeoffs
- Photo OCR in serverless can be CPU heavy; prefer cloud OCR for production.
- LLM parsing must be follow-up validated by user to avoid incorrect financial records.
- Use short-lived pair codes & require stateful verification to prevent hijacking.
- Start with Telegram only (lower integration complexity), then add LINE.

---

If you want, I can:
- Produce example serverless webhook handler for Telegram and LINE.
- Provide prompt templates for Gemini/OpenAI for structured JSON extraction.
- Scaffold DB migration SQL for new tables.
- Scaffold pairing flow UI for the web app.
