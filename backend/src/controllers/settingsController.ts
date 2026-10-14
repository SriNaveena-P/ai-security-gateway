import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Settings } from '../models/Settings';
import { UserRole } from '../models/User';

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if they don't exist yet
      settings = await Settings.create({
        discordWebhookUrl: '',
        slackWebhookUrl: ''
      });
    }
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can update system settings' });
    }

    const { discordWebhookUrl, slackWebhookUrl } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.discordWebhookUrl = discordWebhookUrl ?? settings.discordWebhookUrl;
    settings.slackWebhookUrl = slackWebhookUrl ?? settings.slackWebhookUrl;

    await settings.save();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
