import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import UploadBOQ from '@/components/UploadBOQ';
import UploadQuotes from '@/components/UploadQuotes';
import AutoMatch from '@/components/AutoMatch';
import ComparisonTable from '@/components/ComparisonTable';
import ExportButton from '@/components/ExportButton';
import DashboardKPI from '@/components/DashboardKPI';
import POManagement from '@/components/POManagement';
import { BOQItem, QuotationItem, MatchView, Selection } from '@/lib/types';
import HealthStatus from '@/components/HealthStatus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ApproveButton from '@/components/ApproveButton';

interface VendorQuote {
  vendor: string;
  items: QuotationItem[];
  fileName: string;
}

const Index = () => {
  const [boqData, setBoqData] = useState<BOQItem[] | null>(null);
  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([]);
  const [matches, setMatches] = useState<MatchView[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);

  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    boq: true,
    quotes: true,
    match: true,
    dashboard: true,
    comparison: true,
    approval: true,
    po: true,
    export: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SectionHeader = ({
    title,
    section,
    stepNumber,
  }: {
    title: string;
    section: string;
    stepNumber: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          {stepNumber}
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Professional Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl shadow-md">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with Title */}
            <div className="flex items-center gap-3 md:gap-4 animate-fade-in">
              <img 
                src="/QuoteCraft-logo-edited.png" 
                alt="QuoteCraft Logo" 
                className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground leading-tight">
                  AI-Powered Procurement Intelligence
                </h1>
              </div>
            </div>
            
            {/* Right Side Info */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="text-right space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Powered by</div>
                <div className="text-sm md:text-base font-bold text-primary flex items-center gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                  IBM watsonx
                </div>
              </div>
              <div className="h-12 w-px bg-border hidden md:block"></div>
              <HealthStatus />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Project Description */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 lg:px-6 py-12 md:py-16">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Revolutionize Your <span className="text-primary">Procurement Process</span>
            </h1>
            
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Complete, production-ready intelligent procurement automation system that revolutionizes Bill of Quantities (BOQ) and vendor quote processing. Built with <span className="font-semibold text-foreground">IBM watsonx Orchestrate</span>, automating document extraction, vendor comparison, policy-based routing, and ERP integration.
            </p>
            
            {/* Key Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-6">
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm md:text-base font-semibold text-foreground mb-1">Time Reduction</div>
                <div className="text-xs md:text-sm text-muted-foreground">From 4-8 hours to 2.5 seconds</div>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-2">$348K</div>
                <div className="text-sm md:text-base font-semibold text-foreground mb-1">Annual Savings</div>
                <div className="text-xs md:text-sm text-muted-foreground">Through intelligent vendor selection</div>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm md:text-base font-semibold text-foreground mb-1">Compliance</div>
                <div className="text-xs md:text-sm text-muted-foreground">Complete audit trail for all actions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
        {/* Step 1: Upload BOQ */}
        <Card>
          <SectionHeader title="Upload BOQ" section="boq" stepNumber={1} />
          {expandedSections.boq && (
            <div className="p-6 pt-0">
              <UploadBOQ onDataLoaded={setBoqData} boqData={boqData} />
            </div>
          )}
        </Card>

        {/* Step 2: Upload Quotes */}
        <Card>
          <SectionHeader
            title="Upload Vendor Quotes"
            section="quotes"
            stepNumber={2}
          />
          {expandedSections.quotes && (
            <div className="p-6 pt-0">
              <UploadQuotes
                onQuotesLoaded={setQuoteItems}
                quotes={quotes}
                setQuotes={setQuotes}
              />
            </div>
          )}
        </Card>

        {/* Step 3: Auto-Match */}
        <Card>
          <SectionHeader
            title="Auto-Match (AI Staged)"
            section="match"
            stepNumber={3}
          />
          {expandedSections.match && (
            <div className="p-6 pt-0">
              <AutoMatch
                boqItems={boqData || []}
                quoteItems={quoteItems}
                onMatchesChange={setMatches}
              />
            </div>
          )}
        </Card>

        {/* Step 4: Dashboard */}
        <Card>
          <SectionHeader
            title="Dashboard"
            section="dashboard"
            stepNumber={4}
          />
          {expandedSections.dashboard && (
            <div className="p-6 pt-0">
              <DashboardKPI boqItems={boqData || []} matches={matches} selections={selections} />
            </div>
          )}
        </Card>

        {/* Step 5: Comparison Table */}
        <Card>
          <SectionHeader
            title="Comparison Table"
            section="comparison"
            stepNumber={5}
          />
          {expandedSections.comparison && (
            <div className="p-6 pt-0">
              <ComparisonTable
                boqItems={boqData || []}
                matches={matches}
                onSelectionsChange={setSelections}
              />
            </div>
          )}
        </Card>

        {/* Step 6: Approval */}
        <Card>
          <SectionHeader title="Approval" section="approval" stepNumber={6} />
          {expandedSections.approval && (
            <div className="p-6 pt-0">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Approve your selections to finalize the comparison and generate a summary file.</p>
                <ApproveButton
                  boqItems={boqData || []}
                  selections={selections}
                  disabled={!boqData || quotes.length === 0 || matches.length === 0}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Step 7: PO Management */}
        <Card>
          <SectionHeader title="Purchase Order Management" section="po" stepNumber={7} />
          {expandedSections.po && (
            <div className="p-6 pt-0">
              <POManagement />
            </div>
          )}
        </Card>

        {/* Step 8: Export */}
        <Card>
          <SectionHeader title="Export" section="export" stepNumber={8} />
          {expandedSections.export && (
            <div className="p-6 pt-0">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Export the updated BOQ with selected vendor rates
                </p>
                <ExportButton
                  boqItems={boqData || []}
                  selections={selections}
                  disabled={
                    !boqData || quotes.length === 0 || matches.length === 0
                  }
                />
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Index;
