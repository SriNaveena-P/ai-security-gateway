import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  discordWebhookUrl: string;
  slackWebhookUrl: string;
}

const settingsSchema = new Schema<ISettings>({
  discordWebhookUrl: { type: String, default: '' },
  slackWebhookUrl: { type: String, default: '' }
});

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
