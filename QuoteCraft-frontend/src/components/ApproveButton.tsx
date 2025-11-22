import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Download } from 'lucide-react';
import { BOQItem, Selection } from '@/lib/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ApproveButtonProps {
  boqItems: BOQItem[];
  selections: Selection[];
  disabled?: boolean;
  comparisonId?: string;
}

export default function ApproveButton({ boqItems, selections, disabled, comparisonId }: ApproveButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approverEmail, setApproverEmail] = useState('');
  const [approverRole, setApproverRole] = useState('PROCUREMENT_MANAGER');
  const [comment, setComment] = useState('');
  const [approvalResult, setApprovalResult] = useState<any>(null);

  const handleApprove = () => {
    if (selections.length === 0) {
      toast.error('No selections to approve.');
      return;
    }
    setShowDialog(true);
  };

  const handleSubmitApproval = async () => {
    if (!approverEmail.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // If we have a comparisonId from backend, use it
      // Otherwise, create a comparison first
      let finalComparisonId = comparisonId;

      if (!finalComparisonId) {
        // Create comparison payload
        const comparisonPayload = {
          boqData: {
            id: `boq-${Date.now()}`,
            version: '1.0',
            dateCreated: new Date().toISOString(),
            currency: 'INR',
            items: boqItems.map((item, idx) => ({
              lineNo: idx + 1,
              sku: item.itemNumber,
              description: item.description,
              spec: item.section || '',
              qty: item.quantity,
              uom: item.unit,
              estimatedPrice: item.baseRate || 0,
              totalEstimate: (item.baseRate || 0) * item.quantity,
            })),
            totalBOQ: boqItems.reduce((sum, item) => sum + (item.baseRate || 0) * item.quantity, 0),
          },
          quotes: selections.map((sel, idx) => {
            const item = boqItems.find((b) => b.id === sel.boqItemId);
            return {
              id: `quote-${idx + 1}`,
              vendorId: `vendor-${idx + 1}`,
              vendorName: sel.selectedVendor,
              dateReceived: new Date().toISOString(),
              currency: 'INR',
              items: [{
                boqLineNo: boqItems.findIndex((b) => b.id === sel.boqItemId) + 1,
                sku: item?.itemNumber || '',
                unitPrice: sel.finalRate,
                qty: item?.quantity || 0,
                minQty: 1,
                leadTime: 14,
                tax: 0.18,
                lineTotal: sel.finalRate * (item?.quantity || 0),
              }],
              shippingCost: 0,
              discountPercent: 0,
              totalCost: sel.finalRate * (item?.quantity || 0),
              paymentTerms: 'Net 30',
              warranty: '12 months',
            };
          }),
        };

        const comparisonResponse = await api.createComparison(comparisonPayload);
        if (comparisonResponse.success && comparisonResponse.data) {
          finalComparisonId = comparisonResponse.data.id;
          toast.success('Comparison created successfully.');
        } else {
          throw new Error('Failed to create comparison');
        }
      }

      // Submit approval
      const approvalPayload = {
        comparisonId: finalComparisonId!,
        decision: 'APPROVED' as const,
        approverRole,
        approverEmail: approverEmail.trim(),
        comment: comment.trim() || undefined,
      };

      const response = await api.submitApproval(approvalPayload);

      if (response.success) {
        setApprovalResult(response.data);
        toast.success(response.message || 'Approval submitted successfully!');
        
        // If PO was created, show details
        if (response.data?.poDetails) {
          toast.success(`PO Created: ${response.data.poDetails.poNumber}`);
        }
      } else {
        throw new Error('Approval failed');
      }
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.message || 'Failed to submit approval. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadSummary = () => {
    const summary = selections.map((s) => {
      const item = boqItems.find((b) => b.id === s.boqItemId);
      return {
        itemNumber: item?.itemNumber ?? '',
        description: item?.description ?? '',
        unit: item?.unit ?? '',
        quantity: item?.quantity ?? 0,
        selectedVendor: s.selectedVendor,
        finalRate: s.finalRate,
        total: item ? item.quantity * s.finalRate : 0,
      };
    });

    const fullSummary = {
      approvedAt: new Date().toISOString(),
      approverEmail,
      approverRole,
      comment,
      comparisonId,
      approvalResult,
      items: summary,
      totalAmount: summary.reduce((sum, item) => sum + item.total, 0),
    };

    const blob = new Blob([JSON.stringify(fullSummary, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `approval-summary-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Summary downloaded.');
  };

  const handleClose = () => {
    setShowDialog(false);
    setApproverEmail('');
    setApproverRole('PROCUREMENT_MANAGER');
    setComment('');
    setApprovalResult(null);
  };

  return (
    <>
      <Button onClick={handleApprove} disabled={disabled} size="lg" className="w-full md:w-auto">
        <CheckCircle className="mr-2 h-5 w-5" />
        Approve Selections
      </Button>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalResult ? 'Approval Successful' : 'Submit Approval'}
            </DialogTitle>
            <DialogDescription>
              {approvalResult
                ? 'Your approval has been submitted successfully.'
                : 'Please provide your details to approve the selected vendors.'}
            </DialogDescription>
          </DialogHeader>

          {!approvalResult ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={approverRole}
                  onChange={(e) => setApproverRole(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Add any comments or notes..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Summary:</p>
                <p className="text-muted-foreground">
                  {selections.length} item(s) selected
                </p>
                <p className="text-muted-foreground">
                  Total: ₹
                  {selections
                    .reduce((sum, sel) => {
                      const item = boqItems.find((b) => b.id === sel.boqItemId);
                      return sum + (item ? item.quantity * sel.finalRate : 0);
                    }, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-success/10 border border-success/30 p-4">
                <p className="font-medium text-success mb-2">✓ Approval Submitted</p>
                <div className="text-sm space-y-1">
                  <p>Approval ID: {approvalResult.approvalId || approvalResult.id}</p>
                  {approvalResult.poDetails && (
                    <>
                      <p className="font-medium mt-2">Purchase Order Created:</p>
                      <p>PO Number: {approvalResult.poDetails.poNumber}</p>
                      <p>Status: {approvalResult.poDetails.status}</p>
                      <p>
                        Vendor Notified:{' '}
                        {approvalResult.poDetails.vendorNotificationSent ? 'Yes' : 'No'}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <Button onClick={handleDownloadSummary} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Summary
              </Button>
            </div>
          )}

          <DialogFooter>
            {!approvalResult ? (
              <>
                <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitApproval} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit Approval
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
