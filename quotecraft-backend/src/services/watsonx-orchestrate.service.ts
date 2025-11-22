import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

interface FlowPayload {
  file?: Record<string, any>;
  boqData?: Record<string, any>;
  vendorQuotes?: any[];
  comparison?: Record<string, any>;
  policies?: Record<string, any>;
  approval?: Record<string, any>;
  erp?: Record<string, any>;
}

interface FlowResponse {
  success: boolean;
  flowExecutionId: string;
  status: string;
  message?: string;
  data?: any;
  error?: string;
}

class WatsonxOrchestrateService {
  private client: AxiosInstance;
  private baseURL: string;
  private apiKey: string;
  private agentId: string;

  constructor() {
    // Use IBM_ORCHESTRATE_* env vars (already includes instance ID in URL)
    this.baseURL = process.env.IBM_ORCHESTRATE_URL || '';
    this.apiKey = process.env.IBM_ORCHESTRATE_API_KEY || '';
    this.agentId = process.env.IBM_ORCHESTRATE_AGENT_ID || '';

    if (!this.apiKey || !this.baseURL || !this.agentId) {
      logger.warn('⚠️  watsonx Orchestrate credentials not fully configured');
      logger.warn(`   Base URL: ${this.baseURL ? '✓' : '✗'}`);
      logger.warn(`   API Key: ${this.apiKey ? '✓' : '✗'}`);
      logger.warn(`   Agent ID: ${this.agentId ? '✓' : '✗'}`);
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 60000
    });

    logger.info(`✅ watsonx Orchestrate Service initialized`);
    logger.info(`   Base URL: ${this.baseURL}`);
    logger.info(`   Agent ID: ${this.agentId}`);
  }

  /**
   * Trigger Document Extraction Flow
   * Extracts data from BOQ/Quote documents
   */
  async triggerExtractionFlow(fileData: any): Promise<FlowResponse> {
    try {
      logger.info(`📄 Triggering extraction flow for: ${fileData.name}`);

      const payload: FlowPayload = {
        file: {
          name: fileData.name,
          type: fileData.type, // 'boq' or 'quote'
          mimeType: fileData.mimeType,
          size: fileData.size,
          content: fileData.content // base64 or buffer
        }
      };

      // Correct endpoint: /v1/agents/{agentId}/run
      const url = `/v1/agents/${this.agentId}/run`;
      logger.debug(`POST ${this.baseURL}${url}`);

      const response = await this.client.post(url, {
        input: payload,
        skill: 'document_extraction_flow'
      });

      logger.info(`✅ Extraction flow triggered: ${response.data.id}`);

      return {
        success: true,
        flowExecutionId: response.data.id || response.data.executionId || `exec-${Date.now()}`,
        status: response.data.status || 'RUNNING',
        message: 'Document extraction started',
        data: response.data
      };
    } catch (error: any) {
      logger.error(`❌ Error triggering extraction flow: ${error.message}`);
      logger.error(`   Status: ${error.response?.status}`);
      logger.error(`   Response: ${JSON.stringify(error.response?.data)}`);

      return {
        success: false,
        flowExecutionId: `exec-${Date.now()}`,
        status: 'FAILED',
        error: error.message,
        message: 'Failed to trigger extraction flow'
      };
    }
  }

  /**
   * Trigger Vendor Comparison Flow
   * Compares vendor quotes and scores them
   */
  async triggerComparisonFlow(boqData: any, vendorQuotes: any[]): Promise<FlowResponse> {
    try {
      logger.info(`📊 Triggering comparison flow with ${vendorQuotes.length} quotes`);

      const payload: FlowPayload = {
        boqData: {
          items: boqData.items,
          totalBOQ: boqData.totalBOQ,
          fileId: boqData.fileId
        },
        vendorQuotes: vendorQuotes.map(quote => ({
          vendorId: quote.vendorId,
          vendorName: quote.vendorName,
          items: quote.items,
          totalCost: quote.totalCost,
          leadTime: quote.leadTime || 7,
          complianceScore: quote.complianceScore || 0.95
        }))
      };

      const url = `/v1/agents/${this.agentId}/run`;
      const response = await this.client.post(url, {
        input: payload,
        skill: 'vendor_comparison_flow'
      });

      logger.info(`✅ Comparison flow triggered: ${response.data.id}`);

      return {
        success: true,
        flowExecutionId: response.data.id || `exec-${Date.now()}`,
        status: response.data.status || 'RUNNING',
        message: 'Vendor comparison started',
        data: response.data
      };
    } catch (error: any) {
      logger.error(`❌ Error triggering comparison flow: ${error.message}`);

      return {
        success: false,
        flowExecutionId: `exec-${Date.now()}`,
        status: 'FAILED',
        error: error.message,
        message: 'Failed to trigger comparison flow'
      };
    }
  }

  /**
   * Trigger Policy Routing Flow
   * Routes order for appropriate approval level
   */
  async triggerPolicyRoutingFlow(comparison: any, policies: any): Promise<FlowResponse> {
    try {
      logger.info(`🔀 Triggering policy routing flow`);

      const payload: FlowPayload = {
        comparison: {
          comparisonId: comparison.comparisonId,
          bestVendor: comparison.bestVendor,
          bestVendorName: comparison.bestVendorName,
          costSavings: comparison.costSavings,
          vendors: comparison.vendors
        },
        policies: {
          autoApproveThreshold: policies.autoApproveThreshold || 50000,
          financeThreshold: policies.financeThreshold || 500000,
          preferredVendors: policies.preferredVendors || [],
          complianceRules: policies.complianceRules || {}
        }
      };

      const url = `/v1/agents/${this.agentId}/run`;
      const response = await this.client.post(url, {
        input: payload,
        skill: 'policy_routing_flow'
      });

      logger.info(`✅ Policy routing flow triggered: ${response.data.id}`);

      return {
        success: true,
        flowExecutionId: response.data.id || `exec-${Date.now()}`,
        status: response.data.status || 'RUNNING',
        message: 'Policy routing started',
        data: response.data
      };
    } catch (error: any) {
      logger.error(`❌ Error triggering policy routing flow: ${error.message}`);

      return {
        success: false,
        flowExecutionId: `exec-${Date.now()}`,
        status: 'FAILED',
        error: error.message,
        message: 'Failed to trigger policy routing flow'
      };
    }
  }

  /**
   * Trigger ERP Integration Flow
   * Creates PO in ERP and sends notifications
   */
  async triggerERPIntegrationFlow(
    approval: any,
    comparison: any,
    erpConfig: any
  ): Promise<FlowResponse> {
    try {
      logger.info(`📦 Triggering ERP integration flow - Creating PO`);

      const payload: FlowPayload = {
        approval: {
          comparisonId: approval.comparisonId,
          routingId: approval.routingId,
          approvedVendorId: approval.approvedVendorId,
          approvedVendorName: approval.approvedVendorName,
          approvedBy: approval.approvedBy,
          approvalLevel: approval.approvalLevel,
          timestamp: new Date().toISOString()
        },
        comparison: {
          bestVendor: comparison.bestVendor,
          costSavings: comparison.costSavings,
          vendors: comparison.vendors
        },
        erp: {
          system: erpConfig.system || 'mock',
          baseUrl: erpConfig.baseUrl,
          apiKey: erpConfig.apiKey,
          companyCode: erpConfig.companyCode || 'COMP001',
          purchasingOrgCode: erpConfig.purchasingOrgCode
        }
      };

      const url = `/v1/agents/${this.agentId}/run`;
      const response = await this.client.post(url, {
        input: payload,
        skill: 'erp_integration_flow'
      });

      logger.info(`✅ ERP integration flow triggered: ${response.data.id}`);

      return {
        success: true,
        flowExecutionId: response.data.id || `exec-${Date.now()}`,
        status: response.data.status || 'RUNNING',
        message: 'PO creation started',
        data: response.data
      };
    } catch (error: any) {
      logger.error(`❌ Error triggering ERP integration flow: ${error.message}`);

      return {
        success: false,
        flowExecutionId: `exec-${Date.now()}`,
        status: 'FAILED',
        error: error.message,
        message: 'Failed to trigger ERP integration flow'
      };
    }
  }

  /**
   * Check Flow Execution Status
   */
  async checkFlowStatus(executionId: string): Promise<any> {
    try {
      const url = `/v1/agents/${this.agentId}/runs/${executionId}`;
      const response = await this.client.get(url);

      logger.debug(`Status check: ${executionId} = ${response.data.status}`);

      return {
        success: true,
        executionId,
        status: response.data.status,
        data: response.data
      };
    } catch (error: any) {
      logger.error(`Error checking flow status: ${error.message}`);

      return {
        success: false,
        executionId,
        status: 'UNKNOWN',
        error: error.message
      };
    }
  }

  /**
   * Wait for Flow Completion (with timeout)
   */
  async waitForFlowCompletion(
    executionId: string,
    maxWaitSeconds: number = 300
  ): Promise<any> {
    logger.info(`⏳ Waiting for flow completion: ${executionId} (${maxWaitSeconds}s timeout)`);

    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      const status = await this.checkFlowStatus(executionId);

      if (status.status === 'COMPLETED' || status.status === 'FAILED') {
        logger.info(`✅ Flow completed: ${status.status}`);
        return status;
      }

      logger.debug(`   Still running... (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    logger.warn(`⚠️  Flow timeout after ${maxWaitSeconds}s`);

    return {
      success: false,
      status: 'TIMEOUT',
      error: `Flow did not complete within ${maxWaitSeconds} seconds`
    };
  }

  /**
   * Get Agent Status
   */
  async getAgentStatus(): Promise<any> {
    try {
      const url = `/v1/agents/${this.agentId}`;
      const response = await this.client.get(url);

      logger.info(`✅ Agent status: ${response.data.status}`);

      return {
        success: true,
        agentId: response.data.name,
        status: response.data.status,
        deployed: response.data.status === 'active',
        tools: response.data.tools || []
      };
    } catch (error: any) {
      logger.error(`❌ Agent status error: ${error.message}`);

      return {
        success: false,
        error: error.message,
        status: 'UNKNOWN'
      };
    }
  }

  /**
   * Health Check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getAgentStatus();
      logger.info('✅ watsonx Orchestrate: Connected');
      return true;
    } catch (error) {
      logger.error('❌ watsonx Orchestrate: Disconnected');
      return false;
    }
  }
}

export default new WatsonxOrchestrateService();
