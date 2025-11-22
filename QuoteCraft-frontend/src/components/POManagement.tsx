import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Search, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function POManagement() {
  const [poNumber, setPONumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [poStatus, setPOStatus] = useState<any>(null);
  const [createdPO, setCreatedPO] = useState<any>(null);

  const handleSearchPO = async () => {
    if (!poNumber.trim()) {
      toast.error('Please enter a PO number.');
      return;
    }

    setIsSearching(true);
    setPOStatus(null);

    try {
      const response = await api.getPOStatus(poNumber.trim());
      if (response.success && response.data) {
        setPOStatus(response.data);
        toast.success('PO status retrieved successfully.');
      } else {
        throw new Error('PO not found');
      }
    } catch (error: any) {
      console.error('PO search error:', error);
      toast.error(error.message || 'Failed to retrieve PO status.');
      setPOStatus(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateTestPO = async () => {
    setIsCreating(true);
    setCreatedPO(null);

    try {
      const response = await api.createPO({
        vendorId: 'test-vendor-001',
        totalAmount: 50000,
        items: [
          {
            sku: 'TEST-ITEM-001',
            description: 'Test Item',
            quantity: 100,
            unitPrice: 500,
          },
        ],
      });

      if (response.success && response.data) {
        setCreatedPO(response.data);
        toast.success(`PO created: ${response.data.poNumber}`);
      } else {
        throw new Error('Failed to create PO');
      }
    } catch (error: any) {
      console.error('PO creation error:', error);
      toast.error(error.message || 'Failed to create PO.');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CREATED':
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CREATED':
      case 'APPROVED':
        return 'bg-success/10 border-success/30 text-success';
      case 'PENDING':
        return 'bg-warning/10 border-warning/30 text-warning';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Purchase Order Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Create and track purchase orders
        </p>
      </div>

      <div className="space-y-6">
        {/* Search PO Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Search PO Status</h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter PO Number (e.g., PO-TEST-1234567890)"
                value={poNumber}
                onChange={(e) => setPONumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchPO()}
              />
            </div>
            <Button onClick={handleSearchPO} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {poStatus && (
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(poStatus.status)}
                  <span className="font-medium">{poStatus.poNumber}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    poStatus.status
                  )}`}
                >
                  {poStatus.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(poStatus.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(poStatus.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                {poStatus.vendor && (
                  <div>
                    <p className="text-muted-foreground">Vendor</p>
                    <p className="font-medium">{poStatus.vendor}</p>
                  </div>
                )}
                {poStatus.totalAmount && (
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-medium">₹{poStatus.totalAmount.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Create Test PO Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Create Test PO</h3>
          <p className="text-sm text-muted-foreground">
            Create a test purchase order to verify ERP integration
          </p>
          <Button onClick={handleCreateTestPO} disabled={isCreating} className="w-full">
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating PO...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Create Test PO
              </>
            )}
          </Button>

          {createdPO && (
            <div className="rounded-lg bg-success/10 border border-success/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">PO Created Successfully</span>
              </div>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">PO Number:</span>{' '}
                  <span className="font-medium">{createdPO.poNumber}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">PO ID:</span>{' '}
                  <span className="font-medium">{createdPO.poId}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <span className="font-medium">{createdPO.status}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Vendor Notified:</span>{' '}
                  <span className="font-medium">
                    {createdPO.vendorNotificationSent ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
