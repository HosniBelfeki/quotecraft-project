import axios from 'axios';
import { logger } from '../utils/logger';

class NotificationService {
  async sendSlackNotification(
    comparisonData: any,
    approverEmail: string
  ): Promise<{ success: boolean; channel: string }> {
    try {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;

      if (!webhookUrl) {
        logger.warn('Slack webhook URL not configured, skipping notification');
        return { success: true, channel: 'slack-mock' };
      }

      let message: any;

      // Check if this is an approval notification or a new comparison notification
      if (comparisonData.decision === 'APPROVED') {
        // Approval notification
        message = {
          text: '✅ Purchase Order Approved',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '✅ Purchase Order Approved',
                emoji: true
              }
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Comparison ID:*\n${comparisonData.id}`
                },
                {
                  type: 'mrkdwn',
                  text: `*PO Number:*\n${comparisonData.poNumber || 'N/A'}`
                },
                {
                  type: 'mrkdwn',
                  text: `*PO Status:*\n${comparisonData.poStatus || 'CREATED'}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Approved By:*\n${comparisonData.approver || approverEmail}`
                }
              ]
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `✅ *Status:* Purchase order has been created and sent to vendor.\n⏰ *Time:* ${new Date().toLocaleString()}`
              }
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: '🤖 Automated by QuoteCraft | Powered by IBM watsonx Orchestrate'
                }
              ]
            }
          ]
        };
      } else {
        // New comparison notification (approval request)
        message = {
          text: '📊 New Purchase Approval Required',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🛒 Purchase Approval Request',
                emoji: true
              }
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Comparison ID:*\n${comparisonData.id}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Total Cost:*\n$${comparisonData.totalCost?.toFixed(2) || 'N/A'}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Best Vendor:*\n${comparisonData.bestVendor || 'TBD'}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Cost Savings:*\n$${comparisonData.costSavings?.toFixed(2) || '0.00'}`
                }
              ]
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Status:* Pending Approval\n*Approval Route:* ${comparisonData.approvalRoute || 'PROCUREMENT_MANAGER'}`
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '✅ Approve',
                    emoji: true
                  },
                  value: comparisonData.id,
                  action_id: 'approve_button',
                  style: 'primary'
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '❌ Reject',
                    emoji: true
                  },
                  value: comparisonData.id,
                  action_id: 'reject_button',
                  style: 'danger'
                }
              ]
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `🤖 Sent by QuoteCraft | ${new Date().toLocaleString()}`
                }
              ]
            }
          ]
        };
      }

      await axios.post(webhookUrl, message);
      logger.info(`Slack notification sent for comparison: ${comparisonData.id}`);
      return { success: true, channel: 'slack' };
    } catch (error) {
      logger.error(`Error sending Slack notification: ${error}`);
      return { success: false, channel: 'slack' };
    }
  }

  async sendEmailNotification(
    toEmail: string,
    subject: string,
    htmlContent: string
  ): Promise<{ success: boolean; channel: string; recipient: string }> {
    try {
      logger.info(`Email would be sent to: ${toEmail}`);
      return { success: true, channel: 'email', recipient: toEmail };
    } catch (error) {
      logger.error(`Error sending email: ${error}`);
      return { success: false, channel: 'email', recipient: toEmail };
    }
  }
}

export default new NotificationService();
