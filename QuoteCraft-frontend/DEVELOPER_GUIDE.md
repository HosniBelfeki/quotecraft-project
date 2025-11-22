# QuoteCraft Frontend Developer Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend running on http://localhost:3001

### Installation
```bash
cd QuoteCraft-frontend
npm install
```

### Environment Setup
Create `.env` file:
```env
VITE_BACKEND_URL=http://localhost:3001
```

### Development
```bash
npm run dev
```
Frontend will run on http://localhost:5173

---

## Project Structure

```
QuoteCraft-frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── ApproveButton.tsx
│   │   ├── AutoMatch.tsx
│   │   ├── ComparisonTable.tsx
│   │   ├── DashboardKPI.tsx
│   │   ├── ExportButton.tsx
│   │   ├── HealthStatus.tsx
│   │   ├── NavLink.tsx
│   │   ├── POManagement.tsx    # NEW
│   │   ├── UploadBOQ.tsx
│   │   └── UploadQuotes.tsx
│   ├── lib/
│   │   ├── api.ts          # API client (UPDATED)
│   │   ├── matching.ts     # Matching logic
│   │   ├── types.ts        # TypeScript types
│   │   └── utils.ts        # Utilities
│   ├── pages/
│   │   ├── Index.tsx       # Main page (UPDATED)
│   │   └── NotFound.tsx
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
└── package.json
```

---

## API Integration

### API Client (`src/lib/api.ts`)

All backend calls go through the centralized API client:

```typescript
import { api } from '@/lib/api';

// Health check
const health = await api.health();

// Upload file
const result = await api.uploadFile(file, { 
  fileType: 'boq',
  vendorName: 'Vendor A' 
});

// Create comparison
const comparison = await api.createComparison(payload);

// Submit approval
const approval = await api.submitApproval({
  comparisonId: 'comp-123',
  decision: 'APPROVED',
  approverRole: 'MANAGER',
  approverEmail: 'user@example.com',
  comment: 'Looks good'
});

// Get KPIs
const kpis = await api.getKPI();

// Create PO
const po = await api.createPO({ vendorId: 'v1', totalAmount: 50000 });

// Get PO status
const status = await api.getPOStatus('PO-123');
```

### Error Handling

All API calls should be wrapped in try-catch:

```typescript
try {
  const result = await api.uploadFile(file, params);
  if (result.success) {
    toast.success('Upload successful!');
  }
} catch (error: any) {
  console.error('Upload failed:', error);
  toast.error(error.message || 'Upload failed');
}
```

---

## Component Usage

### ApproveButton

```tsx
<ApproveButton
  boqItems={boqData}
  selections={selections}
  disabled={!boqData || selections.length === 0}
  comparisonId={comparisonId} // Optional
/>
```

**Features**:
- Opens approval dialog
- Creates comparison if needed
- Submits to backend
- Shows PO details
- Downloads summary

### DashboardKPI

```tsx
<DashboardKPI
  boqItems={boqData}
  matches={matches}
  selections={selections}
/>
```

**Features**:
- Shows local session metrics
- Fetches backend system metrics
- Displays cost savings
- Refresh button for real-time data

### POManagement

```tsx
<POManagement />
```

**Features**:
- Search PO by number
- Create test PO
- Display PO status
- Color-coded status indicators

### UploadBOQ

```tsx
<UploadBOQ
  onDataLoaded={setBoqData}
  boqData={boqData}
/>
```

**Features**:
- Drag & drop file upload
- Auto-detect columns
- Manual column mapping
- Sends to backend
- Displays parsed data

### UploadQuotes

```tsx
<UploadQuotes
  onQuotesLoaded={setQuoteItems}
  quotes={quotes}
  setQuotes={setQuotes}
/>
```

**Features**:
- Multiple vendor uploads
- Auto-detect columns
- Sends to backend
- Displays all quotes

---

## State Management

### Main State (Index.tsx)

```typescript
const [boqData, setBoqData] = useState<BOQItem[] | null>(null);
const [quotes, setQuotes] = useState<VendorQuote[]>([]);
const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([]);
const [matches, setMatches] = useState<MatchView[]>([]);
const [selections, setSelections] = useState<Selection[]>([]);
const [expandedSections, setExpandedSections] = useState({...});
```

### Data Flow

```
Upload BOQ → setBoqData
Upload Quotes → setQuotes, setQuoteItems
Auto Match → setMatches
User Selection → setSelections
Approval → Backend API
```

---

## TypeScript Types

### Key Interfaces

```typescript
interface BOQItem {
  id: string;
  itemNumber: string;
  description: string;
  unit: string;
  quantity: number;
  baseRate?: number;
  section?: string;
}

interface QuotationItem {
  vendor: string;
  description: string;
  unit: string;
  rate: number;
}

interface MatchView {
  matchedBoqId: string | null;
  quote: QuotationItem;
  similarity: number;
}

interface Selection {
  boqItemId: string;
  selectedVendor: string;
  finalRate: number;
}
```

---

## Styling

### Tailwind CSS

Uses Tailwind CSS with custom theme:

```tsx
// Primary colors
className="bg-primary text-primary-foreground"

// Success
className="bg-success text-success"

// Muted
className="text-muted-foreground"

// Border
className="border border-border"
```

### Shadcn Components

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  const result = await api.someEndpoint();
  // Handle success
} catch (error: any) {
  console.error('Error:', error);
  toast.error(error.message);
}
```

### 2. Show Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await api.someEndpoint();
  } finally {
    setIsLoading(false);
  }
};

<Button disabled={isLoading}>
  {isLoading ? <Loader2 className="animate-spin" /> : 'Submit'}
</Button>
```

### 3. Validate User Input

```typescript
if (!email.trim()) {
  toast.error('Email is required');
  return;
}

if (selections.length === 0) {
  toast.error('No selections made');
  return;
}
```

### 4. Use Toast Notifications

```typescript
import { toast } from 'sonner';

toast.success('Operation successful!');
toast.error('Operation failed!');
toast.info('Processing...');
```

---

## Testing

### Manual Testing Workflow

1. **Upload BOQ**
   - Test valid file upload
   - Test invalid file format
   - Test large files
   - Verify column mapping

2. **Upload Quotes**
   - Add multiple vendors
   - Remove vendors
   - Verify data display

3. **Auto Match**
   - Verify matching algorithm
   - Check similarity scores

4. **Dashboard**
   - Check local metrics
   - Refresh backend metrics
   - Verify calculations

5. **Comparison**
   - Select vendors
   - Verify totals

6. **Approval**
   - Submit with valid data
   - Check PO creation
   - Download summary

7. **PO Management**
   - Search existing PO
   - Create test PO
   - Verify status display

---

## Common Issues

### CORS Errors

**Problem**: API calls fail with CORS error

**Solution**: 
1. Check backend CORS configuration
2. Verify FRONTEND_URL in backend .env
3. Ensure backend is running

### File Upload Fails

**Problem**: File upload returns error

**Solution**:
1. Check file size (max 50MB)
2. Verify file format (.xlsx, .xls, .csv)
3. Check backend upload endpoint

### API Returns 404

**Problem**: Endpoint not found

**Solution**:
1. Verify backend is running
2. Check API_BASE URL in frontend
3. Verify endpoint path in api.ts

---

## Adding New Features

### 1. Add New API Endpoint

```typescript
// In src/lib/api.ts
export const api = {
  // ... existing endpoints
  
  newEndpoint: (params: any) => 
    request<ResponseType>(`/api/new-endpoint`, {
      method: 'POST',
      body: JSON.stringify(params)
    }),
};
```

### 2. Create New Component

```tsx
// src/components/NewComponent.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function NewComponent() {
  const [data, setData] = useState(null);
  
  const handleAction = async () => {
    try {
      const result = await api.newEndpoint({});
      setData(result.data);
      toast.success('Success!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  return (
    <div>
      <Button onClick={handleAction}>Action</Button>
    </div>
  );
}
```

### 3. Add to Main Page

```tsx
// In src/pages/Index.tsx
import NewComponent from '@/components/NewComponent';

// Add to expandedSections
const [expandedSections, setExpandedSections] = useState({
  // ... existing
  newSection: true,
});

// Add to JSX
<Card>
  <SectionHeader title="New Section" section="newSection" stepNumber={9} />
  {expandedSections.newSection && (
    <div className="p-6 pt-0">
      <NewComponent />
    </div>
  )}
</Card>
```

---

## Performance Tips

1. **Lazy Load Components**
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

2. **Memoize Expensive Calculations**
```typescript
const expensiveValue = useMemo(() => {
  return calculateSomething(data);
}, [data]);
```

3. **Debounce Search Inputs**
```typescript
const debouncedSearch = useMemo(
  () => debounce((value) => search(value), 300),
  []
);
```

---

## Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` folder

### Environment Variables

Production `.env`:
```env
VITE_BACKEND_URL=https://api.quotecraft.com
```

### Deploy to Vercel/Netlify

1. Connect repository
2. Set environment variables
3. Deploy

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [Vite](https://vitejs.dev)

---

## Support

For issues or questions:
1. Check this guide
2. Review API documentation
3. Check backend logs
4. Review browser console

---

**Last Updated**: 2025-11-21
**Version**: 1.0.0
