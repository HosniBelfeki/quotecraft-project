import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BOQItem, MatchView, Selection } from '@/lib/types';
import { api } from '@/lib/api';
import { RefreshCw, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardKPIProps {
  boqItems: BOQItem[];
  matches: MatchView[];
  selections: Selection[];
}

export default function DashboardKPI({ boqItems, matches, selections }: DashboardKPIProps) {
  const [backendKPI, setBackendKPI] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Total vendors derived from matches
  const vendors = Array.from(new Set(matches.map((m) => m.quote.vendor)));

  // Coverage: how many BOQ items have at least one matched quote
  const matchedBoqIds = new Set(matches.filter((m) => m.matchedBoqId).map((m) => m.matchedBoqId as string));
  const coveredCount = boqItems.filter((b) => matchedBoqIds.has(b.id)).length;
  const coveragePct = boqItems.length > 0 ? Math.round((coveredCount / boqItems.length) * 100) : 0;

  // Totals and savings based on selections vs baseRate
  const projectTotal = selections.reduce((acc, sel) => {
    const item = boqItems.find((b) => b.id === sel.boqItemId);
    if (!item) return acc;
    return acc + item.quantity * sel.finalRate;
  }, 0);

  const baseTotal = boqItems.reduce((acc, item) => acc + (item.baseRate ? item.baseRate * item.quantity : 0), 0);
  const savings = baseTotal > 0 ? baseTotal - projectTotal : 0;

  const fetchBackendKPI = async () => {
    setIsLoading(true);
    try {
      const response = await api.getKPI();
      if (response.success && response.data) {
        setBackendKPI(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch KPI:', error);
      toast.error('Failed to load backend KPIs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendKPI();
  }, []);

  const localKPI = [
    { label: 'BOQ Items', value: boqItems.length.toString(), icon: Activity },
    { label: 'Vendors', value: vendors.length.toString(), icon: Activity },
    { label: 'Coverage', value: `${coveragePct}%`, icon: Activity },
    { label: 'Project Total', value: `₹${projectTotal.toFixed(2)}`, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Local KPIs */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Current Session</h2>
            <p className="text-sm text-muted-foreground">Metrics for your current comparison</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {localKPI.map((m) => (
            <div key={m.label} className="rounded-lg border border-border p-4 bg-card">
              <div className="text-sm text-muted-foreground">{m.label}</div>
              <div className="mt-1 text-2xl font-bold text-foreground">{m.value}</div>
            </div>
          ))}
        </div>
        {baseTotal > 0 && (
          <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-success" />
              <div>
                <div className="text-sm text-muted-foreground">Savings vs. Base</div>
                <div className="mt-1 text-xl font-semibold text-success">₹{savings.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Backend KPIs */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">System Performance</h2>
            <p className="text-sm text-muted-foreground">Overall platform metrics</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBackendKPI}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {backendKPI ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border p-4 bg-card">
              <div className="text-sm text-muted-foreground">Total Processed</div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {backendKPI.totalProcessed}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 bg-card">
              <div className="text-sm text-muted-foreground">Avg Processing Time</div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {backendKPI.avgProcessingTime}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 bg-card">
              <div className="text-sm text-muted-foreground">STP Rate</div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {backendKPI.stpRate}%
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 bg-card">
              <div className="text-sm text-muted-foreground">Error Rate</div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {backendKPI.errorRate}%
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 bg-card">
              <div className="text-sm text-muted-foreground">Auto Approved</div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {backendKPI.autoApprovedCount}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 bg-card">
              <div className="text-sm text-muted-foreground">Escalated</div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {backendKPI.escalatedCount}
              </div>
            </div>

            <div className="rounded-lg border border-success/30 bg-success/5 p-4 col-span-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <div>
                  <div className="text-sm text-muted-foreground">Total Cost Savings</div>
                  <div className="mt-1 text-2xl font-bold text-success">
                    ₹{backendKPI.totalCostSavings.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {isLoading ? 'Loading system metrics...' : 'No system metrics available'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
