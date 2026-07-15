import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface QuickReply {
  content_type: 'text';
  title: string;
  payload: string;
}

interface Button {
  type: 'postback';
  title: string;
  payload: string;
}

@Injectable()
export class MessengerService {
  private readonly logger = new Logger(MessengerService.name);
  private readonly pageAccessToken: string;
  private readonly apiVersion = 'v18.0';

  constructor(private configService: ConfigService) {
    this.pageAccessToken = this.configService.get<string>('META_PAGE_ACCESS_TOKEN') || '';
  }

  async sendTextMessage(recipientId: string, text: string, quickReplies?: QuickReply[]) {
    const message: any = { text };
    
    if (quickReplies && quickReplies.length > 0) {
      message.quick_replies = quickReplies;
    }

    return this.callSendAPI(recipientId, message);
  }

  async sendButtonTemplate(recipientId: string, text: string, buttons: Button[]) {
    const message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text,
          buttons,
        },
      },
    };

    return this.callSendAPI(recipientId, message);
  }

  async sendGenericTemplate(recipientId: string, elements: any[]) {
    const message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements,
        },
      },
    };

    return this.callSendAPI(recipientId, message);
  }

  async sendListTemplate(recipientId: string, elements: any[], buttons?: Button[]) {
    const message = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'list',
          top_element_style: 'compact',
          elements,
          buttons,
        },
      },
    };

    return this.callSendAPI(recipientId, message);
  }

  async setPersistentMenu() {
    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/me/messenger_profile`;
      
      const response = await axios.post(
        url,
        {
          persistent_menu: [
            {
              locale: 'default',
              composer_input_disabled: false,
              call_to_actions: [
                {
                  type: 'postback',
                  title: '📝 Request Document',
                  payload: 'REQUEST_DOCUMENT',
                },
                {
                  type: 'postback',
                  title: '📦 Track Request',
                  payload: 'TRACK_REQUEST',
                },
                {
                  type: 'postback',
                  title: '📢 Announcements',
                  payload: 'VIEW_ANNOUNCEMENTS',
                },
                {
                  type: 'postback',
                  title: 'ℹ️ Information',
                  payload: 'INFORMATION',
                },
              ],
            },
          ],
        },
        {
          params: { access_token: this.pageAccessToken },
        }
      );

      this.logger.log('Persistent menu set successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Error setting persistent menu:', error.response?.data || error.message);
      throw error;
    }
  }

  async setGetStartedButton() {
    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/me/messenger_profile`;
      
      const response = await axios.post(
        url,
        {
          get_started: {
            payload: 'GET_STARTED',
          },
        },
        {
          params: { access_token: this.pageAccessToken },
        }
      );

      this.logger.log('Get Started button set successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Error setting get started button:', error.response?.data || error.message);
      throw error;
    }
  }

  async setGreeting() {
    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/me/messenger_profile`;
      
      const response = await axios.post(
        url,
        {
          greeting: [
            {
              locale: 'default',
              text: 'Welcome to Barangay Service Management System! We\'re here to help you with document requests, track your requests, and keep you updated with announcements. Tap "Get Started" to begin! 👋',
            },
          ],
        },
        {
          params: { access_token: this.pageAccessToken },
        }
      );

      this.logger.log('Greeting set successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Error setting greeting:', error.response?.data || error.message);
      throw error;
    }
  }

  private async callSendAPI(recipientId: string, message: any) {
    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/me/messages`;
      
      const response = await axios.post(
        url,
        {
          recipient: { id: recipientId },
          message,
          messaging_type: 'RESPONSE',
        },
        {
          params: { access_token: this.pageAccessToken },
        }
      );

      this.logger.log(`Message sent to ${recipientId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error sending message:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendTypingOn(recipientId: string) {
    return this.sendSenderAction(recipientId, 'typing_on');
  }

  async sendTypingOff(recipientId: string) {
    return this.sendSenderAction(recipientId, 'typing_off');
  }

  async markSeen(recipientId: string) {
    return this.sendSenderAction(recipientId, 'mark_seen');
  }

  private async sendSenderAction(recipientId: string, action: string) {
    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/me/messages`;
      
      await axios.post(
        url,
        {
          recipient: { id: recipientId },
          sender_action: action,
        },
        {
          params: { access_token: this.pageAccessToken },
        }
      );
    } catch (error) {
      this.logger.error('Error sending sender action:', error.response?.data || error.message);
    }
  }
}
