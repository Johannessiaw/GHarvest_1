# Comprehensive Codebase Audit: Kofi — GHarvest Conversational AI

**Project**: Kofi — AI Voice Assistant for GHarvest  
**Repository Reference**: https://github.com/Johannessiaw/kofi-my  
**Audit Date**: September 2026  
**Auditor**: Senior Full-Stack AI Engineer & Lead Software Architect  

---

## Executive Summary

The initial implementation of Kofi established a voice visualizer orb, basic GhanaNLP ASR normalization dictionaries, and initial UI screens for GHarvest. However, the system exhibited several architectural, conversational, and functional limitations:
1. **Monolithic Architecture**: The backend (`server.ts`) combined HTTP routing, Gemini AI configuration, hardcoded in-memory arrays, rigid fallback regexes, and mock responses into a single file.
2. **Brittle Fallback Engine & Hallucinations**: When offline or facing API quotas, the system could only handle tomatoes and maize with hardcoded responses. If speech transcription failed, it hallucinated orders for 50 crates of tomatoes. Non-agricultural prompts (e.g., general knowledge, math, drafting messages) were improperly constrained.
3. **Simulated vs. Real Tool Calling**: Gemini was invoked as a plain text generator without real Function Calling / Tool Execution. Action cards were retroactively inferred through regex rather than returned via schema-validated tool invocations.
4. **Shallow Conversational Memory**: The backend received only single-turn user prompts rather than structured multi-turn conversation arrays (`user` and `model` message turns), preventing natural multi-step dialogues and follow-up reasoning.
5. **Client-Server Data Disconnect**: Orders and harvests were saved only to `localStorage` in the browser, meaning multi-user synchronization (buyer, farmer, logistics) was disconnected from the server.
6. **Missing URL Inspection & Web Grounding in Core Voice Loop**: External research and URL inspection were isolated to manual modal triggers rather than available tools within Kofi's conversational engine.
7. **Missing Ga and Ewe Linguistic Pipelines**: While Twi and Ghanaian English had initial vocabularies, Ga and Ewe language patterns were missing.

---

## Detailed Findings

### 1. Monolithic Backend Server Architecture
* **File**: `/server.ts`
* **Function/Component**: Entire file (lines 1–515)
* **Evidence**: Express setup, AI client initialization, `MARKET_PRICES`, `VERIFIED_FARMERS`, `DISTANCE_MATRIX`, `getFallbackKofiResponse`, and 5 separate API endpoints exist within a single file.
* **Severity**: HIGH
* **Why it matters**: Violates clean modular architecture. Prevents separation of concerns, makes automated unit testing cumbersome, and hinders adding modular tool registries.
* **Recommended Solution**: Decompose into a structured `server/` directory:
  - `server/routes/`: Express routers for `/chat`, `/voice`, `/market`, `/orders`, `/logistics`, `/tools`.
  - `server/services/`: Modular services for `GeminiService`, `AgriculturalDataService`, `LogisticsService`, `EscrowService`, and `WebSearchService`.
  - `server/tools/`: Tool definitions and schema declarations for Gemini function calling.
  - `server/db/`: In-memory and persistent storage repository with complete CRUD for harvests, orders, and market prices.
* **Dependencies Required**: None (uses existing Express and Node standard libraries).
* **Test Required**: Verify all routes respond with status 200/201 and modular exports compile cleanly.

---

### 2. Hallucinated Fallbacks & Narrow Crop Support
* **File**: `/server.ts`
* **Function/Component**: `getFallbackKofiResponse()` & `/api/gemini/transcribe`
* **Evidence**:
  - In `/api/gemini/transcribe`: If transcription fails, the route responded with:
    `transcript: 'I need 50 crates of tomatoes from Techiman delivered to Kumasi.'`
  - In `getFallbackKofiResponse`: Any input that does not mention 'tomato' or 'maize' falls through to a generic greeting, failing on yam, cassava, pepper, cocoa, plantain, cashew, or general conversational questions.
* **Severity**: CRITICAL
* **Why it matters**: Fabricates user orders when audio fails; breaks user trust by claiming the user ordered produce they never spoke. Fails on legitimate agricultural questions for any crop besides tomatoes and maize.
* **Recommended Solution**:
  - Replace fake transcription fallback with an honest error status: `{ error: 'Transcription unavailable. Please repeat or type your message.' }`.
  - Implement a comprehensive Ghanaian agricultural intelligence database covering 20+ crops across all 16 Ghanaian regions.
  - Equip the fallback engine with a general conversational handler that answers math, general questions, and agriculture seamlessly.
* **Dependencies Required**: None.
* **Test Required**: Test transcription failure handling and verify fallback handles varied inputs ("Who was Kwame Nkrumah?", "Calculate 50 * 24", "Price of Yam in Kejetia").

---

### 3. Lack of Real Gemini Function Calling (Autonomous Tool Calling)
* **File**: `/server.ts`
* **Function/Component**: `/api/gemini/chat`
* **Evidence**: Gemini `generateContent` was invoked with only raw text without `tools: [{ functionDeclarations: [...] }]`. Action cards were appended through regular-expression pattern matching on the server after the fact.
* **Severity**: HIGH
* **Why it matters**: The model cannot autonomously choose to query current market prices, calculate route logistics, look up verified farmers, create an escrow order, or search the web.
* **Recommended Solution**:
  - Declare standard Gemini Function Calling tools:
    - `getMarketPrice(crop, market, region)`
    - `calculateTransportFreight(origin, destination, quantity)`
    - `searchHarvestInventory(crop, region, maxPrice)`
    - `createEscrowOrder(crop, quantity, unit, pickupTown, deliveryTown, farmerPhone, buyerPhone)`
    - `searchWebKnowledge(query)`
    - `inspectWebUrl(url)`
    - `calculateMath(expression)`
    - `getAgriWeather(town, region)`
  - Run the multi-step tool execution loop: if the model returns `functionCalls`, invoke the backend service, return `functionResponse` parts to the model, and allow the model to summarize the real data.
* **Dependencies Required**: `@google/genai` TypeScript SDK.
* **Test Required**: Verify tool invocation via automated chat queries requiring live calculations and inventory lookups.

---

### 4. Single-Turn Conversation Memory vs. True Multi-Turn History
* **File**: `/src/App.tsx` & `/server.ts`
* **Function/Component**: `handleUserQuery()` in `App.tsx` and `/api/gemini/chat` in `server.ts`
* **Evidence**: Only the latest `message` string and a small flat `memory` object were sent to the server. The multi-turn chat message array was omitted from the Gemini API call payload.
* **Severity**: HIGH
* **Why it matters**: Kofi cannot understand pronouns ("How much did you say *they* were?", "What about the *first* one?"), handle multi-step negotiations, or remember previous instructions within a session.
* **Recommended Solution**:
  - Pass the structured message history array `contents: [{ role: 'user' | 'model', parts: [{ text: ... }] }]` to the Gemini chat endpoint.
  - Implement session-aware sliding-window memory on both frontend and backend.
* **Dependencies Required**: None.
* **Test Required**: Test multi-turn conversations: Turn 1: "I need 50 bags of maize in Ejura." Turn 2: "Actually make that 80 bags and deliver to Kumasi." Turn 3: "What will the transport cost be for that?" Verify context is retained across all turns.

---

### 5. Purely Client-Side Storage & Data Fragmentation
* **File**: `/src/services/gharvestData.ts` & `/src/App.tsx`
* **Function/Component**: `GHarvestDataManager`
* **Evidence**: Orders and harvest listings were only stored in browser `localStorage`. No REST endpoints existed for `/api/orders` or `/api/harvests`.
* **Severity**: HIGH
* **Why it matters**: A farmer adding a harvest on their device cannot have it seen by a buyer on another device. Orders created by Kofi do not persist on the backend.
* **Recommended Solution**:
  - Implement a centralized in-memory backend database (`server/db/store.ts`) seeded with realistic verified Ghanaian smallholders and listings.
  - Provide complete REST endpoints:
    - `GET /api/harvests`, `POST /api/harvests`
    - `GET /api/orders`, `POST /api/orders`, `PATCH /api/orders/:id/status`
    - `GET /api/market-prices`
  - Update frontend to synchronize with backend APIs while retaining local caching for offline resilience.
* **Dependencies Required**: Express JSON routes.
* **Test Required**: Verify creating an order via API or voice updates the backend store and is reflected across views.

---

### 6. Voice Engine Speech Recognition Limitations on Non-Chrome Browsers
* **File**: `/src/services/voiceEngine.ts`
* **Function/Component**: `JarvisVoiceEngine.initRecognition()`
* **Evidence**: Replaced only with console warning if `window.SpeechRecognition` is absent:
  `console.warn('SpeechRecognition API not available in this browser. Fallback typing supported.');`
  No audio recording fallback using standard `navigator.mediaDevices.getUserMedia` + `MediaRecorder` existed to capture audio base64 and transcribe via `/api/gemini/transcribe`.
* **Severity**: MEDIUM-HIGH
* **Why it matters**: Firefox, mobile Safari, and certain Android WebView browsers do not support `webkitSpeechRecognition`, disabling voice input entirely.
* **Recommended Solution**:
  - Implement a dual-mode voice input system:
    1. Primary: Native `webkitSpeechRecognition` for instant streaming text.
    2. Fallback: Standard `MediaRecorder` audio capture that automatically uploads audio to `/api/gemini/transcribe` with `gemini-3.5-transcribe` / audio processing.
* **Dependencies Required**: Web MediaRecorder API.
* **Test Required**: Test speech input fallback when `SpeechRecognition` is null or simulated unavailable.

---

### 7. Missing Ga and Ewe Language & Accent Support
* **File**: `/src/services/ghanaNlp.ts` & `/src/services/ghanaNlpData.ts`
* **Function/Component**: `normalizeGhanaianSpeech()`
* **Evidence**: Markers, tokenizers, and normalization dictionaries contained only Twi, Akan, and Ghanaian Pidgin. Ga (Greater Accra agricultural hub) and Ewe (Volta agricultural corridor) were not represented.
* **Severity**: MEDIUM
* **Why it matters**: Farmers and market traders in Agbogbloshie, Dodowa, Ada, Ho, Keta, and Aflao communicate in Ga and Ewe.
* **Recommended Solution**:
  - Add Ga vocabulary: Greetings (`Ojekoo`, `Te oyoo tɛŋŋ`), numbers (`ekome`, `enyɔ`, `etɛ`, `nyɔŋma`), crops (`Amɛ̃`, `Ablẽ`, `Yele`).
  - Add Ewe vocabulary: Greetings (`Ndi na mi`, `Foɛ nyuie?`), numbers (`ɖeka`, `eve`, `etɔ̃`, `blawa`), crops (`Agbleli`, `Teli`, `Bli`).
  - Add phonetics and TTS pronunciation mappings for Ga and Ewe terms.
* **Dependencies Required**: None.
* **Test Required**: Run Ga and Ewe inputs through `normalizeGhanaianSpeech()` and verify language classification and entity extraction.

---

### 8. Web Browsing & URL Inspection Absent from Voice Flow
* **File**: `/server.ts` & `/src/App.tsx`
* **Function/Component**: `/api/gemini/search`
* **Evidence**: Google Search Grounding was wired only to a manual modal button in `QuickPrompts.tsx` and had no URL inspection tool (`/api/tools/inspect-url`).
* **Severity**: MEDIUM-HIGH
* **Why it matters**: The user specifically requested that Kofi be able to "search the web when necessary" and "inspect URLs when asked" during normal conversation.
* **Recommended Solution**:
  - Register `searchWebKnowledge` and `inspectWebUrl` as first-class Gemini Function Calling tools.
  - Add server endpoint `/api/tools/inspect-url` that safely fetches web pages, sanitizes HTML to text, and summarizes content for Kofi.
* **Dependencies Required**: Node `fetch` / HTML text extraction.
* **Test Required**: Ask Kofi: "Search the web for current cocoa producer prices in Ghana" or "Inspect this URL https://mofa.gov.gh".

---

### 9. Mobile Money Escrow Lifecycle & Auditability
* **File**: `/src/components/OrderModal.tsx` & `/src/components/LogisticsTrackerView.tsx`
* **Function/Component**: `handleConfirmPayment()`
* **Evidence**: Escrow simulation was purely client-side with a simple timeout. No dispute flow, inspection verification code, or step-by-step transaction state machine existed.
* **Severity**: MEDIUM
* **Why it matters**: Agricultural commerce requires high trust. A complete escrow flow (Deposit -> Confirmation SMS -> Dispatch Hold -> Quality Inspection -> Release/Dispute) must be clearly demonstrated.
* **Recommended Solution**:
  - Implement full escrow state machine in backend and UI:
    - `escrow_funded`: Funds held securely.
    - `transport_dispatched`: Driver assigned with vehicle registration.
    - `in_transit`: Live GPS/milestone checkpoints (e.g., Techiman -> Ejura Junction -> Kumasi Suame).
    - `delivered_pending_inspection`: Buyer inspects produce.
    - `completed_released`: Escrow paid out to farmer's mobile money wallet.
    - `disputed`: Produce rejected due to spoilage, dispute mediation triggered.
* **Dependencies Required**: None.
* **Test Required**: Complete order lifecycle from creation through inspection and escrow release.

---

## Remediation Roadmap

1. **Phase 1: Backend Architecture Modularization**
   - Create `server/` with modular routers, services, database store, and Gemini tool registry.
   - Implement true multi-turn chat with autonomous Gemini Function Calling.
   - Add URL inspection and web search capabilities.
2. **Phase 2: Database & RESTful APIs**
   - Build comprehensive in-memory store for harvests, orders, market prices, and farmers.
   - Expose REST endpoints for marketplace, logistics, and escrow lifecycle.
3. **Phase 3: Expanded Multilingual Pipeline (GhanaNLP)**
   - Expand `ghanaNlp.ts` and `ghanaNlpData.ts` to include Ga and Ewe alongside Twi, Akan, and Ghanaian Pidgin.
   - Enhance TTS pronunciation dictionaries for all Ghanaian regions.
4. **Phase 4: Jarvis Voice Engine Resilience**
   - Add MediaRecorder audio recording fallback for non-WebKit browsers.
   - Polish barge-in interruption and Web Audio API visualizer.
5. **Phase 5: Frontend Integration & General-Purpose Conversational Testing**
   - Connect frontend components to backend services.
   - Test general conversation (Nkrumah, science, math, messaging) alongside agricultural queries.
