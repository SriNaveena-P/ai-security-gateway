import axios from 'axios';
import { Settings } from '../models/Settings';
import { Agent } from '../models/Agent';

export const sendWebhookAlert = async (alertData: {
  severity: string;
  description: string;
  agentId: string;
  actionType: string;
  resource: string;
  riskScore: number;
}) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) return;

    const agent = await Agent.findById(alertData.agentId);
    const agentName = agent ? agent.name : 'Unknown Agent';

    // 1. Send Discord Webhook
    if (settings.discordWebhookUrl) {
      const discordPayload = {
        embeds: [{
          title: `🚨 AI Security Gateway Alert - ${alertData.severity} Severity`,
          description: alertData.description,
          color: alertData.severity === 'CRITICAL' ? 15158332 : 15105536, // Red vs Orange
          fields: [
            { name: 'Agent', value: agentName, inline: true },
            { name: 'Action', value: alertData.actionType, inline: true },
            { name: 'Resource', value: alertData.resource, inline: true },
            { name: 'Risk Score', value: `${alertData.riskScore}/100`, inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      };
      await axios.post(settings.discordWebhookUrl, discordPayload).catch(err => {
        console.error('Discord webhook failed:', err.message);
      });
    }

    // 2. Send Slack Webhook
    if (settings.slackWebhookUrl) {
      const slackPayload = {
        text: `🚨 *AI Security Gateway Threat Flagged* 🚨\n*Severity:* ${alertData.severity}\n*Agent:* ${agentName}\n*Action:* ${alertData.actionType}\n*Resource:* ${alertData.resource}\n*Details:* ${alertData.description}\n*Risk Score:* ${alertData.riskScore}/100`
      };
      await axios.post(settings.slackWebhookUrl, slackPayload).catch(err => {
        console.error('Slack webhook failed:', err.message);
      });
    }
  } catch (error: any) {
    console.error('Webhook notification dispatch failed:', error.message);
  }
};
