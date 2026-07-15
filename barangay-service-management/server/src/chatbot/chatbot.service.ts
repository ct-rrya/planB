import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessengerService } from './messenger.service';
import { Resident } from '../database/schemas/resident.schema';
import { Conversation } from '../database/schemas/conversation.schema';
import { ConversationState } from '../database/schemas/conversation-state.schema';
import { DocumentType } from '../database/schemas/document-type.schema';
import { Request } from '../database/schemas/request.schema';
import { Announcement } from '../database/schemas/announcement.schema';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private messengerService: MessengerService,
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    @InjectModel(ConversationState.name) private conversationStateModel: Model<ConversationState>,
    @InjectModel(DocumentType.name) private documentTypeModel: Model<DocumentType>,
    @InjectModel(Request.name) private requestModel: Model<Request>,
    @InjectModel(Announcement.name) private announcementModel: Model<Announcement>,
  ) {}

  async handleMessage(senderPSID: string, message: string) {
    this.logger.log(`Received message from ${senderPSID}: ${message}`);

    // Save conversation
    await this.saveConversation(senderPSID, 'resident', message);

    // Send typing indicator
    await this.messengerService.sendTypingOn(senderPSID);

    // Get or create conversation state
    const state = await this.getOrCreateState(senderPSID);

    // Check if resident exists
    const resident = await this.residentModel.findOne({ messengerPSID: senderPSID });

    // If resident doesn't exist and not in registration flow, start registration
    const registrationStates = [
      'awaiting_name',
      'awaiting_birthdate',
      'awaiting_sex',
      'awaiting_contact',
      'awaiting_purok',
      'awaiting_civil_status',
      'awaiting_address',
    ];

    if (!resident && !registrationStates.includes(state.currentState)) {
      return this.startRegistration(senderPSID, state);
    }

    // Handle based on current state
    switch (state.currentState) {
      case 'awaiting_name':
        return this.handleNameInput(senderPSID, message, state);
      case 'awaiting_birthdate':
        return this.handleBirthDateInput(senderPSID, message, state);
      case 'awaiting_sex':
        return this.handleSexInput(senderPSID, message, state);
      case 'awaiting_contact':
        return this.handleContactInput(senderPSID, message, state);
      case 'awaiting_purok':
        return this.handlePurokInput(senderPSID, message, state);
      case 'awaiting_civil_status':
        return this.handleCivilStatusInput(senderPSID, message, state);
      case 'awaiting_address':
        return this.handleAddressInput(senderPSID, message, state);
      case 'selecting_document':
        return this.handleDocumentSelection(senderPSID, message, state, resident);
      case 'awaiting_purpose':
        return this.handlePurposeInput(senderPSID, message, state, resident);
      case 'awaiting_confirmation':
        return this.handleConfirmation(senderPSID, message, state, resident);
      case 'awaiting_tracking':
        return this.handleTrackingInput(senderPSID, message, state, resident);
      default:
        // In idle state, check for document request keywords
        return this.handleIdleMessage(senderPSID, message, resident, state);
    }
  }

  private async handleIdleMessage(senderPSID: string, message: string, resident: any, state: ConversationState) {
    if (!resident) {
      return this.startRegistration(senderPSID, state);
    }

    const lowerMessage = message.trim().toLowerCase();
    
    // Check for document request keywords
    const documentKeywords = [
      'request document',
      'document',
      'clearance',
      'barangay clearance',
      'request',
      'certificate',
      'residency',
      'indigency',
    ];

    if (documentKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return this.showDocumentTypes(senderPSID, state);
    }

    // Default: show main menu
    return this.showMainMenu(senderPSID);
  }

  async handlePostback(senderPSID: string, payload: string) {
    this.logger.log(`Received postback from ${senderPSID}: ${payload}`);

    await this.messengerService.sendTypingOn(senderPSID);

    const resident = await this.residentModel.findOne({ messengerPSID: senderPSID });
    const state = await this.getOrCreateState(senderPSID);

    switch (payload) {
      case 'GET_STARTED':
        if (!resident) {
          return this.startRegistration(senderPSID, state);
        }
        return this.showMainMenu(senderPSID);

      case 'REQUEST_DOCUMENT':
        if (!resident) {
          return this.startRegistration(senderPSID, state);
        }
        return this.showDocumentTypes(senderPSID, state);

      case 'TRACK_REQUEST':
        if (!resident) {
          return this.startRegistration(senderPSID, state);
        }
        return this.askTrackingNumber(senderPSID, state);

      case 'VIEW_ANNOUNCEMENTS':
        return this.showAnnouncements(senderPSID, state);

      case 'INFORMATION':
        return this.showInformation(senderPSID, state);

      case 'MAIN_MENU':
        return this.showMainMenu(senderPSID);

      case 'CONFIRM_REQUEST':
        return this.confirmAndSaveRequest(senderPSID, state, resident);

      case 'CANCEL_REQUEST':
        await this.updateState(senderPSID, 'idle', {});
        const cancelMsg = "❌ Request cancelled.\n\nNo problem! You can start a new request anytime.";
        await this.sendAndSave(senderPSID, cancelMsg);
        return this.showMainMenu(senderPSID);

      default:
        // Handle document selection postbacks
        if (payload.startsWith('DOC_')) {
          const documentId = payload.replace('DOC_', '');
          return this.handleDocumentSelectionById(senderPSID, documentId, state, resident);
        }
        return this.showMainMenu(senderPSID);
    }
  }

  private async startRegistration(senderPSID: string, state: ConversationState) {
    await this.updateState(senderPSID, 'awaiting_name', {});
    
    const response = "Welcome to Barangay Service Management! 🏘️\n\nBefore using our services, we need to register you.\n\nLet's begin.\n\nPlease enter your complete name:";
    await this.sendAndSave(senderPSID, response);
  }

  private async handleNameInput(senderPSID: string, message: string, state: ConversationState) {
    const nameParts = message.trim().split(/\s+/);
    
    if (nameParts.length < 2) {
      const response = "Please enter your complete name with at least first name and last name.\n\nExample: Juan Santos or Juan Cruz Santos";
      return this.sendAndSave(senderPSID, response);
    }

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

    await this.updateState(senderPSID, 'awaiting_birthdate', {
      firstName,
      middleName,
      lastName,
    });

    const response = `Thank you, ${firstName}! 😊\n\nNext, please enter your birth date.\n\nExample:\nJanuary 15, 2002  or  2002-01-15`;
    await this.sendAndSave(senderPSID, response);
  }

  private async handleBirthDateInput(senderPSID: string, message: string, state: ConversationState) {
    const birthDate = this.parseBirthDate(message.trim());
    
    if (!birthDate) {
      const response = "That doesn't look like a valid birth date.\n\nPlease enter it in one of these formats:\n• YYYY-MM-DD (e.g., 2002-01-15)\n• Month Day, Year (e.g., January 15, 2002)";
      return this.sendAndSave(senderPSID, response);
    }

    // Validate birth date is not in the future
    if (birthDate > new Date()) {
      const response = "Birth date cannot be in the future. Please enter a valid birth date.";
      return this.sendAndSave(senderPSID, response);
    }

    // Validate age is at least 1 year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (birthDate > oneYearAgo) {
      const response = "You must be at least 1 year old. Please enter a valid birth date.";
      return this.sendAndSave(senderPSID, response);
    }

    state.context.birthDate = birthDate.toISOString();
    await this.updateState(senderPSID, 'awaiting_sex', state.context);

    const quickReplies = [
      { content_type: 'text' as const, title: 'Male', payload: 'SEX_MALE' },
      { content_type: 'text' as const, title: 'Female', payload: 'SEX_FEMALE' },
    ];

    const response = "What is your sex?";
    await this.messengerService.sendTextMessage(senderPSID, response, quickReplies);
    await this.saveConversation(senderPSID, 'bot', response);
  }

  private async handleSexInput(senderPSID: string, message: string, state: ConversationState) {
    const sex = message.trim().toLowerCase();
    
    if (sex !== 'male' && sex !== 'female') {
      const quickReplies = [
        { content_type: 'text' as const, title: 'Male', payload: 'SEX_MALE' },
        { content_type: 'text' as const, title: 'Female', payload: 'SEX_FEMALE' },
      ];
      
      const response = "Please select either Male or Female.";
      await this.messengerService.sendTextMessage(senderPSID, response, quickReplies);
      return this.saveConversation(senderPSID, 'bot', response);
    }

    state.context.sex = sex.charAt(0).toUpperCase() + sex.slice(1);
    await this.updateState(senderPSID, 'awaiting_contact', state.context);

    const response = "Please enter your contact number.\n\nExample: 09123456789";
    await this.sendAndSave(senderPSID, response);
  }

  private async handleContactInput(senderPSID: string, message: string, state: ConversationState) {
    const contactNumber = this.validatePhilippineNumber(message.trim());
    
    if (!contactNumber) {
      const response = "Please enter a valid Philippine mobile number.\n\nExample: 09123456789\n\nMust be 11 digits starting with 09.";
      return this.sendAndSave(senderPSID, response);
    }

    state.context.contactNumber = contactNumber;
    await this.updateState(senderPSID, 'awaiting_purok', state.context);

    const quickReplies = [
      { content_type: 'text' as const, title: 'Purok 1', payload: 'PUROK_1' },
      { content_type: 'text' as const, title: 'Purok 2', payload: 'PUROK_2' },
      { content_type: 'text' as const, title: 'Purok 3', payload: 'PUROK_3' },
      { content_type: 'text' as const, title: 'Purok 4', payload: 'PUROK_4' },
      { content_type: 'text' as const, title: 'Purok 5', payload: 'PUROK_5' },
    ];

    const response = "Which Purok do you belong to?";
    await this.messengerService.sendTextMessage(senderPSID, response, quickReplies);
    await this.saveConversation(senderPSID, 'bot', response);
  }

  private async handlePurokInput(senderPSID: string, message: string, state: ConversationState) {
    const purok = message.trim();
    
    // Accept "Purok 1", "Purok 2", etc. or just "1", "2", etc.
    const purokMatch = purok.match(/(?:Purok\s*)?(\d+)/i);
    
    if (!purokMatch) {
      const quickReplies = [
        { content_type: 'text' as const, title: 'Purok 1', payload: 'PUROK_1' },
        { content_type: 'text' as const, title: 'Purok 2', payload: 'PUROK_2' },
        { content_type: 'text' as const, title: 'Purok 3', payload: 'PUROK_3' },
        { content_type: 'text' as const, title: 'Purok 4', payload: 'PUROK_4' },
        { content_type: 'text' as const, title: 'Purok 5', payload: 'PUROK_5' },
      ];
      
      const response = "Please select a valid Purok.";
      await this.messengerService.sendTextMessage(senderPSID, response, quickReplies);
      return this.saveConversation(senderPSID, 'bot', response);
    }

    const purokNumber = purokMatch[1];
    state.context.purok = `Purok ${purokNumber}`;
    await this.updateState(senderPSID, 'awaiting_civil_status', state.context);

    const quickReplies = [
      { content_type: 'text' as const, title: 'Single', payload: 'STATUS_SINGLE' },
      { content_type: 'text' as const, title: 'Married', payload: 'STATUS_MARRIED' },
      { content_type: 'text' as const, title: 'Widowed', payload: 'STATUS_WIDOWED' },
      { content_type: 'text' as const, title: 'Separated', payload: 'STATUS_SEPARATED' },
    ];

    const response = "What is your civil status?";
    await this.messengerService.sendTextMessage(senderPSID, response, quickReplies);
    await this.saveConversation(senderPSID, 'bot', response);
  }

  private async handleCivilStatusInput(senderPSID: string, message: string, state: ConversationState) {
    const status = message.trim().toLowerCase();
    const validStatuses = ['single', 'married', 'widowed', 'separated'];
    
    if (!validStatuses.includes(status)) {
      const quickReplies = [
        { content_type: 'text' as const, title: 'Single', payload: 'STATUS_SINGLE' },
        { content_type: 'text' as const, title: 'Married', payload: 'STATUS_MARRIED' },
        { content_type: 'text' as const, title: 'Widowed', payload: 'STATUS_WIDOWED' },
        { content_type: 'text' as const, title: 'Separated', payload: 'STATUS_SEPARATED' },
      ];
      
      const response = "Please select a valid civil status.";
      await this.messengerService.sendTextMessage(senderPSID, response, quickReplies);
      return this.saveConversation(senderPSID, 'bot', response);
    }

    state.context.civilStatus = status.charAt(0).toUpperCase() + status.slice(1);
    await this.updateState(senderPSID, 'awaiting_address', state.context);

    const response = "Finally, please enter your complete address.\n\nExample: 123 Main Street, Sitio Maharlika";
    await this.sendAndSave(senderPSID, response);
  }

  private async handleAddressInput(senderPSID: string, message: string, state: ConversationState) {
    const address = message.trim();
    
    if (address.length < 10) {
      const response = "Please provide a more complete address (at least 10 characters).";
      return this.sendAndSave(senderPSID, response);
    }

    // Now create the resident with ALL collected data
    try {
      const newResident = new this.residentModel({
        firstName: state.context.firstName,
        middleName: state.context.middleName || '',
        lastName: state.context.lastName,
        birthDate: new Date(state.context.birthDate),
        sex: state.context.sex,
        contactNumber: state.context.contactNumber,
        purok: state.context.purok,
        civilStatus: state.context.civilStatus,
        address: address,
        messengerPSID: senderPSID,
      });

      await newResident.save();

      await this.updateState(senderPSID, 'idle', {});

      const response = `Registration complete! ✅\n\nWelcome, ${state.context.firstName}! 🎉\n\nYou can now use our services.\n\nHow can I help you today?`;
      await this.sendAndSave(senderPSID, response);
      
      return this.showMainMenu(senderPSID);
    } catch (error) {
      this.logger.error('Error creating resident:', error);
      const response = "Sorry, there was an error completing your registration. Please try again later or contact our office.";
      return this.sendAndSave(senderPSID, response);
    }
  }

  // Helper method to parse birth date from various formats
  private parseBirthDate(input: string): Date | null {
    // Try YYYY-MM-DD format
    const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const date = new Date(input);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try natural language format (e.g., "January 15, 2002")
    const naturalDate = new Date(input);
    if (!isNaN(naturalDate.getTime())) {
      return naturalDate;
    }

    // Try MM/DD/YYYY format
    const slashMatch = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const [, month, day, year] = slashMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return null;
  }

  // Helper method to validate Philippine mobile number
  private validatePhilippineNumber(input: string): string | null {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, '');
    
    // Check if it's 11 digits and starts with 09
    if (cleaned.length === 11 && cleaned.startsWith('09')) {
      return cleaned;
    }
    
    // Check if it's 10 digits starting with 9 (missing leading 0)
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      return '0' + cleaned;
    }
    
    return null;
  }

  private async showMainMenu(senderPSID: string) {
    await this.updateState(senderPSID, 'idle', {});
    
    const quickReplies = [
      { content_type: 'text' as const, title: '📝 Request Document', payload: 'REQUEST_DOCUMENT' },
      { content_type: 'text' as const, title: '📦 Track Request', payload: 'TRACK_REQUEST' },
      { content_type: 'text' as const, title: '📢 Announcements', payload: 'VIEW_ANNOUNCEMENTS' },
      { content_type: 'text' as const, title: 'ℹ️ Info', payload: 'INFORMATION' },
    ];

    const response = "What can I help you with today?";
    await this.messengerService.sendTextMessage(senderPSID, response, quickReplies);
    await this.saveConversation(senderPSID, 'bot', response);
  }

  private async showDocumentTypes(senderPSID: string, state: ConversationState) {
    // Seed default document types if none exist
    await this.seedDefaultDocumentTypes();

    const documents = await this.documentTypeModel.find({ isActive: true }).limit(10).exec();

    if (documents.length === 0) {
      const response = "Sorry, there are no available document types at the moment.";
      await this.sendAndSave(senderPSID, response);
      return this.showMainMenu(senderPSID);
    }

    const elements = documents.map((doc) => ({
      title: doc.name,
      subtitle: `Fee: ₱${doc.fee}\nProcessing: ${doc.processingDays} days\n\n${doc.description}`,
      buttons: [
        {
          type: 'postback' as const,
          title: 'Request',
          payload: `DOC_${doc._id}`,
        },
      ],
    }));

    await this.messengerService.sendGenericTemplate(senderPSID, elements);
    await this.updateState(senderPSID, 'selecting_document', {});
    await this.saveConversation(senderPSID, 'bot', 'Showing available document types');
  }

  private async seedDefaultDocumentTypes() {
    const count = await this.documentTypeModel.countDocuments().exec();
    
    if (count > 0) {
      return; // Documents already exist
    }

    this.logger.log('Seeding default document types...');

    const defaultDocuments = [
      {
        name: 'Barangay Clearance',
        description: 'Required for various purposes such as employment, business, and other transactions.',
        requirements: ['Valid ID', 'Proof of Residency', 'Community Tax Certificate'],
        fee: 50,
        processingDays: 2,
        isActive: true,
      },
      {
        name: 'Certificate of Residency',
        description: 'Certifies that the individual is a resident of the barangay.',
        requirements: ['Valid ID', 'Proof of Residency'],
        fee: 30,
        processingDays: 1,
        isActive: true,
      },
      {
        name: 'Certificate of Indigency',
        description: 'For economically disadvantaged residents seeking financial assistance or services.',
        requirements: ['Valid ID', 'Proof of Income (if any)', 'Barangay Interview'],
        fee: 0,
        processingDays: 3,
        isActive: true,
      },
      {
        name: 'Business Clearance',
        description: 'Required for operating a business within the barangay jurisdiction.',
        requirements: ['Valid ID', 'Business Permit', 'DTI Registration', 'Proof of Business Location'],
        fee: 200,
        processingDays: 5,
        isActive: true,
      },
      {
        name: 'Barangay ID',
        description: 'Official identification card for barangay residents.',
        requirements: ['Valid ID', 'Proof of Residency', '1x1 ID Picture (2 pcs)', 'Birth Certificate'],
        fee: 100,
        processingDays: 7,
        isActive: true,
      },
    ];

    try {
      await this.documentTypeModel.insertMany(defaultDocuments);
      this.logger.log('Default document types seeded successfully');
    } catch (error) {
      this.logger.error('Error seeding default document types:', error);
    }
  }

  private async handleDocumentSelectionById(senderPSID: string, documentId: string, state: ConversationState, resident: any) {
    if (!resident) {
      return this.startRegistration(senderPSID, state);
    }

    const document = await this.documentTypeModel.findById(documentId).exec();
    
    if (!document) {
      const response = "Sorry, that document type is no longer available.";
      await this.sendAndSave(senderPSID, response);
      return this.showMainMenu(senderPSID);
    }

    // Store document information in context
    await this.updateState(senderPSID, 'awaiting_purpose', {
      documentId: documentId,
      documentName: document.name,
      documentFee: document.fee,
      documentProcessingDays: document.processingDays,
    });

    const response = `You've selected: ${document.name}\n\n💰 Fee: ₱${document.fee}\n⏱️ Processing Time: ${document.processingDays} days\n\nWhat is the purpose of this document?\n\nExamples:\n• Employment\n• Scholarship\n• Bank Requirement\n• Government Transaction`;
    await this.sendAndSave(senderPSID, response);
  }

  private async handleDocumentSelection(senderPSID: string, message: string, state: ConversationState, resident: any) {
    // This handles text-based selection if needed
    return this.showDocumentTypes(senderPSID, state);
  }

  private async handlePurposeInput(senderPSID: string, message: string, state: ConversationState, resident: any) {
    const purpose = message.trim();
    
    if (purpose.length < 3) {
      const response = "Please provide a more detailed purpose for the document.\n\nExamples:\n• Employment\n• Scholarship\n• Bank Requirement";
      return this.sendAndSave(senderPSID, response);
    }

    // Store purpose in context
    state.context.purpose = purpose;
    await this.updateState(senderPSID, 'awaiting_confirmation', state.context);

    // Show confirmation summary with Quick Replies
    const confirmationMessage = `📋 Request Summary\n\n📄 Document: ${state.context.documentName}\n🎯 Purpose: ${purpose}\n💰 Fee: ₱${state.context.documentFee}\n⏱️ Processing: ${state.context.documentProcessingDays} days\n\nConfirm this request?`;

    const quickReplies = [
      { content_type: 'text' as const, title: '✅ Confirm', payload: 'CONFIRM_REQUEST' },
      { content_type: 'text' as const, title: '❌ Cancel', payload: 'CANCEL_REQUEST' },
    ];

    await this.messengerService.sendTextMessage(senderPSID, confirmationMessage, quickReplies);
    await this.saveConversation(senderPSID, 'bot', confirmationMessage);
  }

  private async handleConfirmation(senderPSID: string, message: string, state: ConversationState, resident: any) {
    const response = message.trim().toLowerCase();
    
    if (response === 'confirm' || response === '✅ confirm') {
      return this.confirmAndSaveRequest(senderPSID, state, resident);
    } else if (response === 'cancel' || response === '❌ cancel') {
      await this.updateState(senderPSID, 'idle', {});
      const cancelMsg = "❌ Request cancelled.\n\nNo problem! You can start a new request anytime.";
      await this.sendAndSave(senderPSID, cancelMsg);
      return this.showMainMenu(senderPSID);
    } else {
      // Invalid input, show quick replies again
      const confirmationMessage = `📋 Request Summary\n\n📄 Document: ${state.context.documentName}\n🎯 Purpose: ${state.context.purpose}\n💰 Fee: ₱${state.context.documentFee}\n⏱️ Processing: ${state.context.documentProcessingDays} days\n\nPlease confirm or cancel this request:`;

      const quickReplies = [
        { content_type: 'text' as const, title: '✅ Confirm', payload: 'CONFIRM_REQUEST' },
        { content_type: 'text' as const, title: '❌ Cancel', payload: 'CANCEL_REQUEST' },
      ];

      await this.messengerService.sendTextMessage(senderPSID, confirmationMessage, quickReplies);
      await this.saveConversation(senderPSID, 'bot', confirmationMessage);
    }
  }

  private async confirmAndSaveRequest(senderPSID: string, state: ConversationState, resident: any) {
    if (!resident) {
      return this.startRegistration(senderPSID, state);
    }

    try {
      // Create request
      const trackingNumber = await this.generateTrackingNumber();
      
      const newRequest = new this.requestModel({
        trackingNumber,
        resident: resident._id,
        documentType: state.context.documentId,
        purpose: state.context.purpose,
        status: 'pending',
        requestedAt: new Date(),
      });

      await newRequest.save();

      await this.updateState(senderPSID, 'idle', {});

      const response = `✅ Request submitted successfully!\n\n🔖 Tracking Number:\n${trackingNumber}\n\n📄 Document: ${state.context.documentName}\n📋 Status: Pending\n\nYou can use this tracking number to check your request status.\n\nPlease wait for approval. We'll notify you once your document is ready for pickup!\n\nThank you! 😊`;
      await this.sendAndSave(senderPSID, response);

      return this.showMainMenu(senderPSID);
    } catch (error) {
      this.logger.error('Error creating request:', error);
      const response = "Sorry, there was an error submitting your request. Please try again later.";
      await this.sendAndSave(senderPSID, response);
      return this.showMainMenu(senderPSID);
    }
  }

  private async askTrackingNumber(senderPSID: string, state: ConversationState) {
    await this.updateState(senderPSID, 'awaiting_tracking', {});
    
    const response = "Please enter your tracking number (e.g., REQ-2026-000001):";
    await this.sendAndSave(senderPSID, response);
  }

  private async handleTrackingInput(senderPSID: string, message: string, state: ConversationState, resident: any) {
    const trackingNumber = message.trim().toUpperCase();

    try {
      const request = await this.requestModel
        .findOne({ trackingNumber })
        .populate('documentType', 'name')
        .populate('resident', 'firstName lastName')
        .exec();

      if (!request) {
        const response = `❌ No request found with tracking number: ${trackingNumber}\n\nPlease check your tracking number and try again.`;
        await this.sendAndSave(senderPSID, response);
        return this.showMainMenu(senderPSID);
      }

      // Check if this request belongs to the resident
      if (resident && request.resident._id.toString() !== resident._id.toString()) {
        const response = "❌ This tracking number doesn't belong to your account.";
        await this.sendAndSave(senderPSID, response);
        return this.showMainMenu(senderPSID);
      }

      const statusEmoji = {
        pending: '🕐',
        approved: '✅',
        ready: '📦',
        released: '🎉',
        rejected: '❌',
      };

      const documentType = request.documentType as any;
      const response = `📋 Request Status\n\n🔖 Tracking #: ${request.trackingNumber}\n📄 Document: ${documentType.name}\n${statusEmoji[request.status]} Status: ${request.status.toUpperCase()}\n📅 Requested: ${new Date(request.requestedAt).toLocaleDateString()}\n\n${this.getStatusMessage(request.status)}`;

      await this.sendAndSave(senderPSID, response);
      await this.updateState(senderPSID, 'idle', {});
      
      return this.showMainMenu(senderPSID);
    } catch (error) {
      this.logger.error('Error fetching request:', error);
      const response = "Sorry, there was an error retrieving your request. Please try again.";
      await this.sendAndSave(senderPSID, response);
      return this.showMainMenu(senderPSID);
    }
  }

  private getStatusMessage(status: string): string {
    const messages = {
      pending: 'Your request is being reviewed by our staff. We\'ll process it shortly.',
      approved: 'Good news! Your request has been approved and is being processed.',
      ready: 'Your document is ready for pickup! Please visit our office during office hours.',
      released: 'Your document has been released. Thank you for using our service!',
      rejected: 'Unfortunately, your request was not approved. Please contact our office for more details.',
    };
    return messages[status] || 'Status unknown.';
  }

  private async showAnnouncements(senderPSID: string, state: ConversationState) {
    const announcements = await this.announcementModel
      .find({ published: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    if (announcements.length === 0) {
      const response = "📢 No announcements at the moment.";
      await this.sendAndSave(senderPSID, response);
      return this.showMainMenu(senderPSID);
    }

    await this.updateState(senderPSID, 'idle', {});

    for (const announcement of announcements) {
      const message = `📢 ${announcement.title}\n\n${announcement.content}\n\n📅 ${new Date(announcement.createdAt).toLocaleDateString()}`;
      await this.sendAndSave(senderPSID, message);
      
      // Add delay between messages
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return this.showMainMenu(senderPSID);
  }

  private async showInformation(senderPSID: string, state: ConversationState) {
    await this.updateState(senderPSID, 'idle', {});
    
    const response = `ℹ️ Barangay Information\n\n🏢 Office Hours:\nMonday - Friday: 8:00 AM - 5:00 PM\nSaturday: 8:00 AM - 12:00 PM\nSunday: Closed\n\n📋 Requirements:\nMost documents require:\n• Valid ID\n• Proof of Residency\n• Community Tax Certificate\n\n🚨 Emergency Contacts:\n• Barangay Hall: (032) 123-4567\n• Barangay Captain: 0912-345-6789\n• Emergency Hotline: 911\n\n📍 Address:\nBarangay Hall, Main Street\nCebu City, Philippines`;

    await this.sendAndSave(senderPSID, response);
    return this.showMainMenu(senderPSID);
  }

  private async generateTrackingNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `REQ-${year}-`;

    const latestRequest = await this.requestModel
      .findOne({ trackingNumber: new RegExp(`^${prefix}`) })
      .sort({ trackingNumber: -1 })
      .exec();

    let sequence = 1;
    if (latestRequest) {
      const lastNumber = parseInt(latestRequest.trackingNumber.split('-')[2]);
      sequence = lastNumber + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  private async getOrCreateState(messengerPSID: string): Promise<ConversationState> {
    let state = await this.conversationStateModel.findOne({ messengerPSID }).exec();
    
    if (!state) {
      state = new this.conversationStateModel({
        messengerPSID,
        currentState: 'idle',
        context: {},
      });
      await state.save();
    }

    return state;
  }

  private async updateState(messengerPSID: string, newState: string, context: any) {
    await this.conversationStateModel.updateOne(
      { messengerPSID },
      {
        currentState: newState,
        context,
        lastInteraction: new Date(),
      },
      { upsert: true }
    );
  }

  private async saveConversation(messengerPSID: string, sender: string, message: string, metadata?: any) {
    const resident = await this.residentModel.findOne({ messengerPSID }).exec();
    
    const conversation = new this.conversationModel({
      messengerPSID,
      resident: resident?._id,
      sender,
      message,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });

    await conversation.save();
  }

  private async sendAndSave(senderPSID: string, message: string) {
    await this.messengerService.sendTextMessage(senderPSID, message);
    await this.saveConversation(senderPSID, 'bot', message);
  }

  async setupMessengerProfile() {
    try {
      await this.messengerService.setGetStartedButton();
      await this.messengerService.setGreeting();
      await this.messengerService.setPersistentMenu();
      this.logger.log('Messenger profile setup complete');
    } catch (error) {
      this.logger.error('Error setting up messenger profile:', error);
    }
  }
}
