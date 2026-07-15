import { Controller, Get, Post, Body, Query, HttpCode, ForbiddenException, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { ChatbotService } from './chatbot.service';

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly configService: ConfigService,
  ) {
    // Log configured verify token on startup
    const configuredToken = this.configService.get<string>('meta.verifyToken');
    console.log('=== MESSENGER WEBHOOK CONFIGURATION ===');
    console.log('Configured META_VERIFY_TOKEN:', configuredToken);
    console.log('Webhook URL: /api/chatbot/webhook');
    console.log('======================================');
  }

  @Get('webhook')
  @ApiOperation({ summary: 'Verify webhook' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = this.configService.get<string>('meta.verifyToken');

    // Log incoming verification request
    console.log('=== WEBHOOK VERIFICATION REQUEST ===');
    console.log('hub.mode:', mode);
    console.log('hub.verify_token:', token);
    console.log('hub.challenge:', challenge);
    console.log('Expected token:', verifyToken);
    console.log('====================================');

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✓ Webhook verified successfully!');
      // Return ONLY the challenge string with status 200
      return res.status(200).send(challenge);
    }

    console.log('✗ Webhook verification FAILED - Invalid token or mode');
    throw new ForbiddenException('Verification failed');
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive messages from Facebook' })
  async receiveMessage(@Body() body: any, @Res() res: Response) {
    console.log('=== WEBHOOK EVENT RECEIVED ===');
    console.log('Body object:', body.object);
    console.log('==============================');

    if (body.object === 'page') {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging[0];
        const senderPSID = webhookEvent.sender.id;

        if (webhookEvent.message) {
          // Handle text message
          const messageText = webhookEvent.message.text;
          console.log(`Message from ${senderPSID}:`, messageText);
          await this.chatbotService.handleMessage(senderPSID, messageText);
        } else if (webhookEvent.postback) {
          // Handle postback
          const payload = webhookEvent.postback.payload;
          console.log(`Postback from ${senderPSID}:`, payload);
          await this.chatbotService.handlePostback(senderPSID, payload);
        }
      }

      // Return ONLY the string with status 200
      return res.status(200).send('EVENT_RECEIVED');
    }

    console.log('✗ Invalid webhook event - not a page object');
    return res.status(404).send('Not Found');
  }

  @Post('setup')
  @ApiOperation({ summary: 'Setup Messenger profile (Get Started, Persistent Menu, Greeting)' })
  async setupProfile() {
    await this.chatbotService.setupMessengerProfile();
    return { message: 'Messenger profile setup complete' };
  }
}
