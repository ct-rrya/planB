export interface User {
  id: string;
  username: string;
  role: 'admin' | 'super_admin';
  createdAt: Date;
}

export interface Resident {
  id: string;
  _id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate: string;
  sex: 'Male' | 'Female';
  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Separated';
  contactNumber: string;
  address: string;
  purok: string;
  messengerPSID?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentType {
  id: string;
  _id?: string;
  name: string;
  description: string;
  requirements: string[];
  fee: number;
  processingDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Request {
  id: string;
  _id?: string;
  trackingNumber: string;
  resident: Resident;
  documentType: DocumentType;
  purpose: string;
  remarks?: string;
  status: 
    | 'pending' 
    | 'approved' 
    | 'certificate_generated' 
    | 'printed' 
    | 'secretary_signed' 
    | 'captain_signed' 
    | 'sealed' 
    | 'ready' 
    | 'released' 
    | 'rejected';
  requestedAt: Date;
  approvedAt?: Date;
  approvedBy?: User | string;
  
  // Certificate fields
  certificateNumber?: string;
  certificateUrl?: string;
  orNumber?: string;
  generatedAt?: Date;
  generatedBy?: User | string;
  
  // Workflow tracking
  printed?: boolean;
  printedAt?: Date;
  printedBy?: User | string;
  
  secretarySigned?: boolean;
  secretarySignedAt?: Date;
  secretarySignedBy?: User | string;
  
  captainSigned?: boolean;
  captainSignedAt?: Date;
  captainSignedBy?: User | string;
  
  sealApplied?: boolean;
  sealAppliedAt?: Date;
  sealAppliedBy?: User | string;
  
  readyForPickup?: boolean;
  readyForPickupAt?: Date;
  readyForPickupBy?: User | string;
  
  releasedAt?: Date;
  releasedBy?: User;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  _id?: string;
  title: string;
  content: string;
  imageUrl?: string;
  published: boolean;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  resident: Resident;
  sender: 'resident' | 'admin';
  message: string;
  timestamp: Date;
}

export interface AuditLog {
  id: string;
  _id?: string;
  action: string;
  module: 'auth' | 'resident' | 'document' | 'request' | 'announcement' | 'user' | 'system';
  admin: User | string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  resourceId?: string;
  resourceType?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt?: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
