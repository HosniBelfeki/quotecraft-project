# QuoteCraft - watsonx Orchestrate Artifacts

This directory contains IBM watsonx Orchestrate flow definitions, skill configurations, and agent setup for the QuoteCraft procurement automation system.

## Overview

QuoteCraft uses watsonx Orchestrate to orchestrate complex procurement workflows through deterministic flows and intelligent agents.

## Directory Structure

```
watsonx/
├── agents/
│   └── procurement-agent.json          # Main procurement agent configuration
├── flows/
│   ├── document-extraction-flow.json   # Document parsing flow
│   ├── vendor-comparison-flow.json     # Vendor comparison flow
│   ├── policy-routing-flow.json        # Policy-based routing flow
│   └── erp-integration-flow.json       # ERP integration flow
├── skills/
│   ├── document-parser-skill.json      # Document extraction skill
│   ├── vendor-matcher-skill.json       # Vendor matching skill
│   ├── policy-engine-skill.json        # Policy evaluation skill
│   ├── erp-connector-skill.json        # ERP integration skill
│   └── notification-skill.json         # Notification skill
└── README.md                            # This file
```

## Agents

### Procurement Agent
- **Name**: QuoteCraft Procurement Assistant
- **Description**: Automates BOQ and vendor quote processing with compliance checking
- **Model**: IBM Granite
- **Capabilities**:
  - Document upload and validation
  - Automated vendor comparison
  - Policy-based routing
  - Multi-level approval orchestration

## Flows

### 1. Document Extraction Flow
**Purpose**: Extract structured data from uploaded BOQ and vendor quotes

**Steps**:
1. Validate file format (JSON, PDF, Excel)
2. Extract text content
3. Parse structured data
4. Validate data completeness
5. Store in cloud storage
6. Return structured JSON

**Inputs**: File upload (multipart/form-data)  
**Outputs**: Structured BOQ/Quote JSON

### 2. Vendor Comparison Flow
**Purpose**: Compare vendor quotes and generate recommendations

**Steps**:
1. Normalize SKUs across vendors
2. Calculate price variance per item
3. Calculate total costs (including tax, shipping)
4. Score vendors based on multiple criteria
5. Flag outliers (>30% variance)
6. Generate best vendor recommendation

**Inputs**: BOQ + Vendor Quotes  
**Outputs**: Comparison result with scores

### 3. Policy Routing Flow
**Purpose**: Route comparisons for approval based on business rules

**Steps**:
1. Evaluate total cost threshold
2. Check preferred vendor list
3. Verify spec compliance
4. Determine approval route:
   - < $50k → Procurement Manager
   - $50k-$500k → Finance
   - > $500k → Executive
5. Trigger notification to approver

**Inputs**: Comparison result  
**Outputs**: Approval routing decision

### 4. ERP Integration Flow
**Purpose**: Create purchase orders in ERP system

**Steps**:
1. Validate approval status
2. Format PO data for ERP
3. Call ERP API (SAP/Oracle)
4. Attach comparison document
5. Send confirmation notification
6. Update audit log

**Inputs**: Approved comparison  
**Outputs**: PO number + confirmation

## Skills

### Document Parser Skill
- **Type**: Custom API Skill
- **Endpoint**: `POST /api/upload`
- **Function**: Extracts structured data from documents
- **Technologies**: Multer, PDF parsing, Excel parsing

### Vendor Matcher Skill
- **Type**: Custom Logic Skill
- **Function**: Matches BOQ items with vendor quotes
- **Algorithm**: SKU-based exact matching with fuzzy fallback

### Policy Engine Skill
- **Type**: Rule-Based Skill
- **Function**: Evaluates business rules and policies
- **Rules**:
  - Three-quote rule (>$10k)
  - Preferred vendor bonus
  - Spec compliance check
  - Cost variance warnings

### ERP Connector Skill
- **Type**: Integration Skill
- **Function**: Creates POs in ERP systems
- **Supported ERPs**: SAP, Oracle (via OpenAPI)
- **Mock Mode**: Available for testing

### Notification Skill
- **Type**: Integration Skill
- **Function**: Sends notifications to approvers
- **Channels**: Slack, Email, Microsoft Teams

## Setup Instructions

### 1. Import Agents

1. Log into IBM watsonx Orchestrate
2. Navigate to Agents section
3. Click "Import Agent"
4. Upload `agents/procurement-agent.json`
5. Configure API credentials

### 2. Import Flows

1. Navigate to Flows section
2. Click "Import Flow"
3. Upload each flow JSON file
4. Configure flow connections
5. Test each flow individually

### 3. Import Skills

1. Navigate to Skills section
2. Click "Import Skill"
3. Upload each skill JSON file
4. Configure skill endpoints
5. Test skill execution

### 4. Configure Integrations

#### Cloud Storage (IBM Cloud Object Storage)
- Bucket name: `quotecraft-documents`
- Region: `us-south`
- Access key: Set in environment

#### Email (SMTP)
- Server: `smtp.gmail.com`
- Port: 587
- Credentials: Set in environment

#### Slack
- Webhook URL: Set in environment
- Channel: `#procurement-approvals`

#### ERP (SAP/Oracle)
- API Endpoint: Set in environment
- API Key: Set in environment
- Mock Mode: Enable for testing

## Testing

### Test Document Extraction Flow

```bash
curl -X POST https://orchestrate.watsonx.ibm.com/api/flows/document-extraction \
  -H "Authorization: Bearer $API_KEY" \
  -F "file=@sample-boq.json" \
  -F "fileType=boq"
```

### Test Vendor Comparison Flow

```bash
curl -X POST https://orchestrate.watsonx.ibm.com/api/flows/vendor-comparison \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d @comparison-request.json
```

### Test Policy Routing Flow

```bash
curl -X POST https://orchestrate.watsonx.ibm.com/api/flows/policy-routing \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d @routing-request.json
```

## Environment Variables

```env
# watsonx Orchestrate
IBM_ORCHESTRATE_URL=https://api.watsonx.ibm.com
IBM_ORCHESTRATE_API_KEY=your_api_key_here
IBM_ORCHESTRATE_AGENT_ID=your_agent_id_here

# Cloud Storage
IBM_COS_ENDPOINT=https://s3.us-south.cloud-object-storage.appdomain.cloud
IBM_COS_API_KEY=your_cos_api_key
IBM_COS_BUCKET=quotecraft-documents

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# ERP
ERP_API_ENDPOINT=https://your-erp-system.com/api
ERP_API_KEY=your_erp_api_key
MOCK_ERP_ENABLED=true
```

## Monitoring

### Flow Execution Logs
- View in watsonx Orchestrate dashboard
- Filter by flow name, status, date
- Export logs for analysis

### Performance Metrics
- Average execution time per flow
- Success/failure rates
- Error patterns

### Audit Trail
- All flow executions logged
- User actions tracked
- Compliance reporting available

## Troubleshooting

### Flow Execution Fails

**Issue**: Flow returns error status

**Solutions**:
1. Check API credentials
2. Verify endpoint URLs
3. Review input data format
4. Check watsonx Orchestrate logs

### Skill Not Found

**Issue**: Skill reference not resolved

**Solutions**:
1. Verify skill is imported
2. Check skill name matches flow reference
3. Ensure skill is published

### Integration Connection Failed

**Issue**: External service not reachable

**Solutions**:
1. Verify network connectivity
2. Check API credentials
3. Test endpoint manually
4. Review firewall rules

## Best Practices

1. **Test Flows Individually**: Before connecting flows, test each one separately
2. **Use Mock Mode**: Enable mock integrations for development
3. **Version Control**: Export flows regularly and commit to Git
4. **Monitor Performance**: Track execution times and optimize slow flows
5. **Error Handling**: Implement retry logic and fallback mechanisms
6. **Security**: Never commit API keys; use environment variables

## Support

For watsonx Orchestrate support:
- [Documentation](https://www.ibm.com/docs/en/orchestrate)
- [Community Forum](https://community.ibm.com/watsonx)
- [Support Portal](https://www.ibm.com/support)

---

**Version**: 1.0.0  
**Last Updated**: November 20, 2025  
**Team**: QuoteCraft
