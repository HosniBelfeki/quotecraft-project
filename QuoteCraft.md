# QuoteCraft MVP
## Agentic AI Hackathon with IBM watsonx Orchestrate

**Automated BOQ & Vendor Quote Comparison Agent for Procurement**

> **Event**: Agentic AI Hackathon with IBM watsonx Orchestrate  
> **Duration**: November 21-23, 2025 (48 hours)  
> **Prize Pool**: $10,000  
> **Platform**: IBM Cloud + watsonx Orchestrate + watsonx.ai  

---

## Executive Summary

**QuoteCraft** is a no-code/low-code agentic AI solution built on **IBM watsonx Orchestrate** that revolutionizes procurement by automating BOQ (Bill of Quantities) and vendor quote management. The system intelligently extracts data from uploaded documents, performs normalized vendor comparisons, applies policy-based routing logic, and integrates with ERP systems—all orchestrated through intelligent agents and deterministic flows.

**Key Innovation**: Using watsonx Orchestrate's **Flows** feature to ensure deterministic execution of complex procurement workflows while leveraging **collaborative agents** for multi-stakeholder approval processes.

---

## Problem Statement & Hackathon Alignment

### Current Pain Points
- **Manual Data Entry**: Procurement teams manually extract BOQ items and vendor quotes from PDFs/Excel, introducing errors
- **Slow Processing**: Tender processing takes days; human comparison is error-prone
- **Siloed Systems**: Data scattered across email, storage, and disconnected ERP systems
- **Compliance Risk**: No audit trail; difficult to prove policy adherence
- **High Cost**: Personnel hours wasted on routine data entry and comparison

### Hackathon Objectives
✅ **Automate repetitive tasks** → Document extraction, quote comparison, policy routing  
✅ **Orchestrate workflows** → Coordinate multiple agents/skills for end-to-end procurement  
✅ **Empower humans** → Focus on strategic decisions; let agents handle routine work  
✅ **Demonstrate watsonx Orchestrate capabilities** → Build with Flows, multi-agent orchestration, integrations  

---

## Solution Overview

### High-Level Architecture

```
User/Email Upload → watsonx Orchestrate Agent (Orchestration Hub)
                         ↓
                   ┌─────────────────────┐
                   │  Main Procurement   │
                   │      Agent          │
                   └─────────────────────┘
                         ↓
            ┌────────────────────────────┐
            │   Deterministic Flow       │
            │  (Extraction → Comparison  │
            │   → Routing → ERP Update)  │
            └────────────────────────────┘
                    ↓
        ┌──────────────────────────────────────┐
        │  Specialized Skills/Sub-Agents:      │
        │  • Document Extraction Skill         │
        │  • Vendor Comparison Skill           │
        │  • Policy Router Skill               │
        │  • ERP Integration Skill             │
        │  • Notification Skill                │
        └──────────────────────────────────────┘
                    ↓
        ┌──────────────────────────────────────┐
        │  External Integrations:              │
        │  • Cloud Storage (S3/Box)            │
        │  • Email (Outlook/Gmail)             │
        │  • ERP Systems (SAP/Oracle OpenAPI)  │
        │  • Slack/Teams Notifications         │
        └──────────────────────────────────────┘
```

### Core Components

#### 1. **Orchestration Agent** (Main Entry Point)
- Receives BOQ/quote upload triggers from UI, email, or cloud storage
- Interprets user intent and routes to appropriate flows/skills
- Maintains conversation context for multi-turn interactions
- Escalates edge cases to human review

#### 2. **Deterministic Flows** (Reliable Execution Backbone)
- **Intake Flow**: Validates file format, triggers extraction
- **Comparison Flow**: Normalizes data, calculates scoring, flags outliers
- **Approval Flow**: Routes based on policy, manages multi-level approvals
- **ERP Integration Flow**: Creates/updates PR/PO, sends confirmation notifications

#### 3. **Specialized Skills** (Business Logic Units)
- **Document Parser Skill**: Extracts structured data from PDFs/Excel (via API or custom logic)
- **Vendor Matcher Skill**: Aligns quote line items to BOQ using NLP/fuzzy matching
- **Policy Engine Skill**: Evaluates business rules (thresholds, preferred vendors, compliance)
- **Notification Skill**: Sends Slack/email alerts to approvers
- **ERP Connector Skill**: Creates PO entries via OpenAPI

#### 4. **Frontend (Next.js/React)**
- File upload UI with drag-and-drop
- Real-time comparison dashboard
- Approval workflow interface
- KPI and audit trail dashboard

#### 5. **Backend (Node.js/Express)**
- Express server to handle API calls
- S3/Cloud Storage integration for file persistence
- Session and webhook management
- Forwards complex logic to watsonx Orchestrate

---

## Tech Stack

### **Mandated (Hackathon)**
- **IBM watsonx Orchestrate**: No-code/low-code orchestration platform
- **IBM watsonx.ai**: Optional—Granite models for NLP/extraction refinement
- **IBM Cloud**: Hosting & managed services

### **Frontend**
- Next.js 14+ with TypeScript
- React Query for state management
- Tailwind CSS for styling
- Shadcn/ui for component library

### **Backend**
- Node.js 18+ with Express.js
- Axios for API calls
- dotenv for config management
- Multer for file uploads

### **Integrations** (Included in watsonx Orchestrate Catalog)
- **Cloud Storage**: IBM Cloud Object Storage (S3-compatible)
- **Email**: Outlook/Gmail IMAP/SMTP connectors
- **ERP**: SAP/Oracle (via OpenAPI skills)
- **Notifications**: Slack, Microsoft Teams
- **Databases**: IBM DB2, MongoDB (optional for audit logs)

### **Optional Enhancements**
- **LLM for NLP**: watsonx.ai + Granite models for intelligent extraction
- **Advanced Matching**: Fuzzy matching library (e.g., `fuzzywuzzy`)
- **Visualization**: Chart.js for KPI dashboards

---

## MVP Implementation Roadmap (48 Hours)

### **Phase 1: Setup & Planning (Hours 1-4)**
**Goal**: Establish watsonx Orchestrate workspace and define data contracts

**Tasks**:
- [ ] Create IBM Cloud account & access watsonx Orchestrate (if not done)
- [ ] Define BOQ/Quote JSON schema
- [ ] Create sample BOQ and vendor quote files (Excel/PDF)
- [ ] Set up cloud storage bucket for file persistence
- [ ] Define policy rules (e.g., "threshold > $50k requires 3 quotes")
- [ ] Plan agent conversation design (welcome messages, prompts)

**Deliverables**:
- JSON schema documentation
- 3-5 sample BOQ/quote files
- Policy ruleset spreadsheet

---

### **Phase 2: Build Core Agent & Flows (Hours 5-20)**
**Goal**: Create main procurement agent with deterministic flows

**Sub-Phase 2A: Main Agent Creation (Hours 5-8)**
- [ ] Create **Procurement Agent** in watsonx Orchestrate
  - Name: "Procurement Assistant"
  - Description: "I automate Bill of Quantities and vendor quote processing with compliance checking"
  - Model: Granite (or default foundation model)
  - Welcome message: "Upload a BOQ and vendor quotes to begin automated procurement"
- [ ] Add **collaborator agents** (optional): "Policy Reviewer Agent", "Finance Approver Agent"
- [ ] Configure **instructions**:
  - "Always validate file format before processing"
  - "Flag items with >20% price variance"
  - "Require 3-level approval for orders >$100k"

**Sub-Phase 2B: Extraction Flow (Hours 9-12)**
- [ ] Create **Skill or Skill Flow**: "Parse BOQ and Quotes"
  - Input: File upload (PDF/Excel)
  - Process:
    1. Validate file format (check MIME type, size <50MB)
    2. Call document parsing API (build simple Node.js endpoint or use third-party API)
    3. Extract structured JSON: `{ items: [{ sku, description, spec, qty, uom, unitPrice }] }`
    4. Store in cloud storage with unique ID
  - Output: Structured JSON + S3 reference
- [ ] Test with sample files; capture any errors for debugging

**Sub-Phase 2C: Comparison Flow (Hours 13-16)**
- [ ] Create **Skill/Flow**: "Compare Vendor Quotes"
  - Input: Extracted BOQ + Extracted Quotes
  - Logic:
    1. Normalize SKUs (fuzzy match or exact match)
    2. Calculate per-item variance: `(vendorPrice - boqPrice) / boqPrice * 100`
    3. Calculate total cost: `sum(qty * vendorPrice) + tax + shipping`
    4. Score vendors: `score = (100 - variance%) * (1 - leadTime/maxLeadTime) * complianceBonus`
    5. Flag outliers (variance > ±30%)
  - Output: Comparison matrix with scores and recommendations
- [ ] Create sample comparison result; validate scoring logic

**Sub-Phase 2D: Policy Routing Flow (Hours 17-20)**
- [ ] Create **Skill/Flow**: "Route for Approval"
  - Input: Comparison result + policy rules
  - Logic:
    1. Check: Is total cost > threshold? → Escalate
    2. Check: Is vendor on preferred list? → Auto-approve (if cost reasonable)
    3. Check: Are all items in spec? → Flag compliance issues
    4. Route to: Procurement Manager (if < $50k) → Finance (if $50-500k) → Executive (if > $500k)
  - Output: Approval routing decision + notification trigger
- [ ] Define approval chain as a **Skill Flow**; configure multi-user orchestration (pause for human input)

---

### **Phase 3: Frontend & Integration (Hours 21-36)**
**Goal**: Build user-facing interfaces and connect to watsonx Orchestrate

**Sub-Phase 3A: Upload & Dashboard UI (Hours 21-24)**
- [ ] Next.js pages:
  - `/upload` - File upload (drag-drop, multiple files)
  - `/comparison` - Side-by-side vendor comparison table
  - `/approvals` - Approval workflow status
  - `/kpis` - Dashboard (processing time, STP rate, cost savings)
- [ ] Call watsonx Orchestrate API via Express backend to submit flows
- [ ] Display real-time agent responses (status updates, warnings, recommendations)

**Sub-Phase 3B: Backend API Endpoints (Hours 25-28)**
- [ ] `POST /api/upload` - Accept file, store in S3, trigger orchestrate flow
- [ ] `GET /api/comparison/:id` - Retrieve comparison results
- [ ] `POST /api/approve` - Submit approval decision (back to watsonx)
- [ ] `GET /api/audit-log` - Retrieve audit trail
- [ ] `GET /api/kpis` - Aggregate metrics (avg processing time, cost variance, STP rate)

**Sub-Phase 3C: Slack/Email Notifications (Hours 29-32)**
- [ ] Set up **Notification Skill** in watsonx Orchestrate
  - Trigger: When approval needed
  - Action: Send Slack message or email to approver with summary + approval link
  - CTA: Approve/Reject with comment
- [ ] Implement **webhook** to receive approval feedback and update flow status

**Sub-Phase 3D: ERP Integration (Hours 33-36)**
- [ ] Create **Skill**: "Create Purchase Order in ERP"
  - Input: Approved vendor selection + quote details
  - Process:
    1. Call ERP OpenAPI (e.g., SAP Fiori) with PO data
    2. Attach comparison document to PO record
    3. Send confirmation email
  - Output: PO number + creation timestamp
- [ ] Mock ERP endpoint for testing (if real ERP unavailable)

---

### **Phase 4: End-to-End Testing & Demo (Hours 37-48)**
**Goal**: Validate full workflow and prepare presentation

**Sub-Phase 4A: E2E Testing (Hours 37-42)**
- [ ] Test scenario 1: Upload BOQ + 3 vendor quotes → Auto-compare → Route for approval → Create PO
- [ ] Test scenario 2: Upload with policy violation (e.g., preferred vendor missing) → Flag & escalate
- [ ] Test scenario 3: Simulate approval workflow (manager approves, finance escalates) → Track audit log
- [ ] Validate KPI dashboard (time to approve, cost variance, STP rate)
- [ ] Error handling: Test malformed files, network failures, missing data

**Sub-Phase 4B: Demo Preparation (Hours 43-46)**
- [ ] Create 3-minute video walkthrough (or live demo script)
  - Show: Upload → Auto-extraction → Comparison → Approval notification → PO creation
  - Highlight: watsonx Orchestrate flow architecture, policy automation, audit trail
- [ ] Write 1-page summary: Problem, solution, impact (cost savings, time reduction, error elimination)
- [ ] Prepare 3-5 architecture/flow diagrams (for presentation slides)

**Sub-Phase 4C: Polish & Submit (Hours 47-48)**
- [ ] Clean up code (remove TODOs, add comments)
- [ ] Update README with setup instructions & demo links
- [ ] Create GitHub repo with full source code
- [ ] Prepare final submission (video + documentation + GitHub link)

---

## Data Model

### **BOQ (Bill of Quantities)**
```json
{
  "id": "boq-001",
  "version": "1.0",
  "dateCreated": "2025-11-21T10:00:00Z",
  "currency": "USD",
  "items": [
    {
      "lineNo": 1,
      "sku": "WIDGET-100",
      "description": "Premium Widget",
      "spec": "Aluminum, 10cm, Grade A",
      "qty": 500,
      "uom": "UNIT",
      "estimatedPrice": 45.00,
      "totalEstimate": 22500.00
    }
  ],
  "totalBOQ": 67500.00
}
```

### **Vendor Quote**
```json
{
  "id": "quote-001",
  "vendorId": "vendor-123",
  "vendorName": "Best Supply Co.",
  "dateReceived": "2025-11-21T09:30:00Z",
  "currency": "USD",
  "items": [
    {
      "boqLineNo": 1,
      "sku": "WIDGET-100",
      "unitPrice": 42.50,
      "qty": 500,
      "minQty": 100,
      "leadTime": 14,
      "tax": 0.08,
      "lineTotal": 22950.00
    }
  ],
  "shippingCost": 500.00,
  "discountPercent": 5,
  "totalCost": 21903.00,
  "paymentTerms": "Net 30",
  "warranty": "12 months"
}
```

### **Comparison Result**
```json
{
  "id": "comparison-001",
  "boqId": "boq-001",
  "quotes": [
    {
      "vendorId": "vendor-123",
      "vendorName": "Best Supply Co.",
      "totalCost": 21903.00,
      "variance": -4.5,
      "complianceScore": 95,
      "deliveryDays": 14,
      "score": 92.3,
      "recommendation": "RECOMMENDED"
    }
  ],
  "bestVendor": "vendor-123",
  "costSavings": 3597.00,
  "approvalRoute": "PROCUREMENT_MANAGER",
  "auditLog": [
    { "timestamp": "...", "action": "EXTRACTED", "details": "..." }
  ]
}
```

### **Policy Rules**
```json
{
  "policies": [
    {
      "id": "policy-001",
      "name": "Three-Quote Rule",
      "trigger": "totalCost > 10000",
      "rule": "At least 3 quotes required",
      "action": "VALIDATE_AND_ESCALATE"
    },
    {
      "id": "policy-002",
      "name": "Preferred Vendor",
      "trigger": "vendor in preferredVendorList",
      "rule": "Cost must be within 10% of best price",
      "action": "AUTO_APPROVE"
    }
  ]
}
```

---

## Hackathon-Specific Features & Judging Criteria

### **Innovation & Agentic AI Use**
✅ **Multi-Agent Orchestration**: Main agent delegates to specialized sub-agents (extraction, comparison, approval)  
✅ **Flows for Determinism**: Ensures procurement process runs consistently & reliably  
✅ **Policy-Based Automation**: Agents make routing decisions based on business rules  
✅ **Human-in-the-Loop**: Collaborative agents manage multi-level approvals  

### **Completeness & Polish**
✅ End-to-end workflow (upload → extraction → comparison → approval → ERP)  
✅ Working frontend (Next.js UI with real data)  
✅ Functional watsonx Orchestrate flows & skills  
✅ Error handling & edge cases (malformed files, policy violations)  

### **Business Impact & Scalability**
✅ **Measurable Savings**: Track cost variance, STP rate, processing time  
✅ **Audit Trail**: Full transparency for compliance  
✅ **Real System Integration**: Mock or real ERP/email/Slack connections  
✅ **Extensibility**: Easy to add new rules, vendors, approval chains  

### **Presentation & Demo**
✅ Clear problem statement & solution overview  
✅ Live or video demo showing end-to-end flow  
✅ Explanation of watsonx Orchestrate architecture choices  
✅ Slides highlighting innovation & business value  

---

## Deliverables Checklist

### **Code & Documentation**
- [ ] **GitHub Repository**
  - `/frontend` - Next.js app with upload, comparison, approval UIs
  - `/backend` - Express server with API endpoints
  - `/watsonx` - Flow definitions, skill configurations (exported from UI or JSON)
  - `/sample-data` - Example BOQ and vendor quote files
  - `README.md` - Setup instructions, architecture overview, demo walkthrough
  - `.env.example` - Environment variables template

### **watsonx Orchestrate Artifacts**
- [ ] **Main Procurement Agent** (configured & tested)
- [ ] **4+ Skills/Flows**:
  1. Document Extraction & Validation
  2. Vendor Comparison & Scoring
  3. Policy Router & Escalation
  4. ERP Integration & Notifications
- [ ] **Multi-User Approval Flow** (if using collaborative agents)
- [ ] **Integrations Setup** (Cloud Storage, Email, Slack/Teams, ERP connector)

### **Demo & Presentation**
- [ ] **Demo Video** (3-5 min) OR **Live Demo Script**
  - Shows: Upload → Extract → Compare → Approve → PO creation
  - Highlights watsonx Orchestrate flows & policy automation
- [ ] **Presentation Slides** (5-10 slides):
  1. Problem & motivation
  2. Solution architecture (diagram)
  3. watsonx Orchestrate key features (flows, multi-agent orchestration)
  4. Frontend/UX walkthrough
  5. Business impact & KPIs
  6. Roadmap & extensions
- [ ] **1-Page Executive Summary** (problem, solution, impact)

### **Testing & Validation**
- [ ] End-to-end test scenarios (documented)
- [ ] Edge case handling (malformed files, policy violations)
- [ ] Performance metrics (extraction time, comparison time, total turnaround)
- [ ] Audit log verification (all actions logged)

---

## Submission Guidelines (IBM Hackathon)

### **How to Submit**
1. **GitHub Repository**: Public repo with all code, docs, sample data
2. **Video/Demo**: 3-5 min video (YouTube link or uploaded) showing live workflow
3. **Presentation**: Slide deck (PDF or PowerPoint) with architecture & business case
4. **watsonx Artifacts**: Export flow definitions from UI (JSON or YAML)
5. **Setup Guide**: Clear instructions to run locally or on IBM Cloud

### **Judging Criteria** (Expected)
- **Innovation**: Use of watsonx Orchestrate flows, multi-agent orchestration
- **Completeness**: E2E functionality, no critical gaps
- **Business Value**: Clear ROI, measurable KPIs
- **Code Quality**: Clean, documented, testable
- **Presentation**: Clear storytelling, compelling demo

---

## Quick Setup & Getting Started

### **1. Prepare Environment**
```bash
# Clone QuoteCraft repo
git clone https://github.com/youruser/quotecraft.git
cd quotecraft

# Backend setup
cd backend
npm install
cp .env.example .env
# Fill in: IBM_ORCHESTRATE_API_KEY, AWS_S3_BUCKET, etc.

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
# Fill in: NEXT_PUBLIC_API_URL

# Start both
npm run dev  # backend on 3001
npm run dev  # frontend on 3000 (in separate terminal)
```

### **2. Configure watsonx Orchestrate**
- Log into IBM Cloud + watsonx Orchestrate
- Import/create flows using Skill Studio
- Configure integrations (Cloud Storage, Email, ERP)
- Test agent responses in playground

### **3. Run End-to-End Test**
- Upload sample BOQ + 3 vendor quotes
- Verify extraction accuracy
- Check comparison scoring
- Approve/reject in UI
- Confirm PO creation (mock or real)

### **4. Generate KPI Report**
- Processing time: avg, min, max
- STP (Straight-Through Processing) rate: % auto-approved vs. escalated
- Cost variance: % savings vs. BOQ estimate
- Accuracy: % correctly matched items

---

## Advanced Features (If Time Permits)

### **Extension 1: LLM-Powered Extraction**
- Use watsonx.ai + Granite model to extract text from scanned PDFs
- Fine-tune model on procurement-specific terminology
- Reduce manual cleanup of extraction errors

### **Extension 2: Advanced Matching**
- Implement fuzzy matching for SKU normalization
- Use NLP to detect semantic similarities (e.g., "premium widget" vs. "deluxe widget")
- Build item master database for smarter matching

### **Extension 3: Real-Time Analytics**
- Stream comparison results to dashboard
- Show live vendor performance trends (on-time delivery, price consistency)
- Generate dynamic scorecards

### **Extension 4: Mobile-Friendly UI**
- Responsive design for mobile approvals
- Push notifications for time-sensitive approvals
- Mobile-first approval workflow

### **Extension 5: AI-Assisted Negotiation**
- Agent suggests negotiation tactics based on vendor history
- Auto-generate counter-offer emails
- Track negotiation outcomes

---

## Key Success Factors

1. **Clear Scope**: Focus on MVP (extraction → comparison → approval → ERP); don't overdo extras
2. **Mock When Needed**: Use mock ERP/email APIs if real integrations unavailable; substitute with logs
3. **Leverage Orchestrate**: Showcase Flows for deterministic execution & multi-agent coordination
4. **Demo Polish**: 3-5 min demo is golden; show real data flows through the system
5. **Document Decisions**: Explain why you chose flows over free-form agents, why policy-based routing, etc.
6. **Audit Trail**: Always log all actions; judges love transparency & compliance
7. **Test Edge Cases**: Malformed files, policy violations, multi-level approvals—show you handle it

---

## Resources & Documentation

### **IBM watsonx Orchestrate**
- [Product Overview](https://www.ibm.com/products/watsonx-orchestrate)
- [Official Docs](https://www.ibm.com/docs/en/orchestrate)
- [Skill Studio Guide](https://www.ibm.com/products/watsonx-orchestrate/features)
- [Integrations & Connectors](https://www.ibm.com/products/watsonx-orchestrate/integrations)
- [Agent Development Kit (ADK)](https://www.ibm.com/products/watsonx-orchestrate/adks)

### **watsonx.ai (Optional for NLP)**
- [watsonx.ai Overview](https://www.ibm.com/products/watsonx-ai)
- [Granite Model Docs](https://www.ibm.com/granite)
- [Prompt Lab Guide](https://www.ibm.com/docs/en/watsonx-ai)

### **Hackathon Resources**
- [Agentic AI Hackathon Guide (Official PDF)](https://watsonx-challenge-2025.s3.us.cloud-object-storage.appdomain.cloud/Lablab_wxo-agentic-ai-hackathon-guide-nov-2025.pdf)
- [lablab.ai Event Page](https://lablab.ai/event/agentic-ai-hackathon-ibm-watsonx-orchestrate)
- [IBM TechXchange Hackathons](https://www.ibm.com/community/techxchange-hackathons/)

### **Community & Support**
- IBM Cloud Support (chat/ticket)
- lablab.ai Discord/Community
- watsonx Orchestrate user forums

---

## Timeline at a Glance

| Phase | Hours | Focus | Deliverable |
|-------|-------|-------|-------------|
| **Setup & Planning** | 1-4 | Define data schema, sample files, policy rules | Schema + sample data |
| **Core Agent & Flows** | 5-20 | Build extraction, comparison, routing flows | 4+ working skills/flows |
| **Frontend & Integration** | 21-36 | UI, APIs, notifications, ERP integration | Next.js app + Express backend |
| **Testing & Demo Prep** | 37-48 | E2E testing, video/presentation, GitHub upload | Demo video + slides + repo |

---

## Final Thoughts

**QuoteCraft** exemplifies how **IBM watsonx Orchestrate** transforms procurement from a manual, error-prone process into an intelligent, auditable, scalable automation engine. By combining deterministic flows for reliability with agentic decision-making for adaptability, QuoteCraft demonstrates the future of enterprise automation.

**Your competitive edge**:
- ✅ Multi-agent orchestration (rare in hackathon submissions)
- ✅ Flows for determinism (shows understanding of Orchestrate's architecture)
- ✅ Real-world problem (procurement is an $X trillion pain point)
- ✅ Measurable impact (cost savings, time reduction, error elimination)
- ✅ Scalable design (easy to add rules, vendors, approval chains)

**Go build something amazing!** 🚀

---

## Glossary

- **BOQ** (Bill of Quantities): Detailed list of items, quantities, and specifications to be procured
- **ERP** (Enterprise Resource Planning): System (SAP, Oracle, etc.) managing business operations
- **PO** (Purchase Order): Official request to buy goods/services
- **STP** (Straight-Through Processing): Percentage of transactions requiring no manual intervention
- **SKU** (Stock Keeping Unit): Unique identifier for an item
- **Orchestrate**: IBM's no-code/low-code platform for building AI agents
- **Flow**: Deterministic, structured workflow in watsonx Orchestrate
- **Skill**: Reusable unit of work (action/integration) within Orchestrate
- **Fuzzy Matching**: Approximate string matching (handles typos, variations)
- **Audit Trail**: Complete log of all actions taken by the system

---

**Project Version**: 2.0 (Updated for IBM watsonx Orchestrate Agentic AI Hackathon Nov 2025)  
**Last Updated**: November 20, 2025  
**Team**: QuoteCraft  
