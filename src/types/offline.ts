// Offline Capabilities Types for Chair Care

export interface OfflineData {
  id: string;
  type: 'job' | 'chair' | 'service_request' | 'stock_movement' | 'photo';
  data: any;
  action: 'create' | 'update' | 'delete';
  timestamp: Date;
  userId: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastSyncAttempt?: Date;
  conflictResolution?: 'server_wins' | 'client_wins' | 'merge' | 'manual';
}

export interface SyncConflict {
  id: string;
  localData: any;
  serverData: any;
  conflictType: 'version' | 'concurrent_edit' | 'deleted_on_server';
  timestamp: Date;
  resolved: boolean;
  resolution?: 'server_wins' | 'client_wins' | 'merge' | 'manual';
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface OfflineSettings {
  maxStorageSize: number; // MB
  syncInterval: number; // minutes
  autoSync: boolean;
  syncOnlyOnWifi: boolean;
  compressPhotos: boolean;
  photoQuality: 'low' | 'medium' | 'high';
  maxRetryAttempts: number;
  conflictResolution: 'ask_user' | 'server_wins' | 'client_wins';
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime?: Date;
  pendingItems: number;
  syncInProgress: boolean;
  syncProgress: number; // 0-100
  errors: SyncError[];
  storageUsed: number; // MB
  storageLimit: number; // MB
}

export interface SyncError {
  id: string;
  itemId: string;
  error: string;
  timestamp: Date;
  retryable: boolean;
}

export interface OfflineJob {
  id: string;
  jobId: string;
  clientName: string;
  location: string;
  chairs: OfflineChair[];
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: Date;
  endTime?: Date;
  notes: string;
  photos: OfflinePhoto[];
  partsUsed: OfflinePartUsage[];
  technicianId: string;
  syncStatus: 'pending' | 'synced';
}

export interface OfflineChair {
  id: string;
  chairId: string;
  chairNumber: string;
  model?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
  servicesPerformed: string[];
  beforePhotos: string[];
  afterPhotos: string[];
  notes: string;
}

export interface OfflinePhoto {
  id: string;
  localPath: string;
  serverUrl?: string;
  chairId?: string;
  jobId: string;
  type: 'before' | 'after' | 'issue' | 'part';
  description?: string;
  timestamp: Date;
  compressed: boolean;
  fileSize: number;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed';
}

export interface OfflinePartUsage {
  id: string;
  partId: string;
  partName: string;
  quantity: number;
  chairId: string;
  notes?: string;
  timestamp: Date;
}

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // ms
}

export interface CacheStrategy {
  type: 'cache_first' | 'network_first' | 'cache_only' | 'network_only';
  maxAge: number; // minutes
  staleWhileRevalidate: boolean;
}

export interface OfflineCapabilities {
  canCreateJobs: boolean;
  canUpdateJobs: boolean;
  canTakePhotos: boolean;
  canRecordPartUsage: boolean;
  canAccessInventory: boolean;
  canViewHistory: boolean;
  storageAvailable: number; // MB
}