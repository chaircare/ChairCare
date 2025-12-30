// Offline Service for Chair Care
import { 
  OfflineData, 
  SyncConflict, 
  OfflineSettings, 
  SyncStatus, 
  NetworkStatus,
  OfflineJob,
  OfflinePhoto
} from 'types/offline';
import { openDB, IDBPDatabase } from 'idb';

class OfflineService {
  private db: IDBPDatabase | null = null;
  private syncInProgress = false;
  private networkStatus: NetworkStatus = {
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  };

  private settings: OfflineSettings = {
    maxStorageSize: 500, // 500MB
    syncInterval: 5, // 5 minutes
    autoSync: true,
    syncOnlyOnWifi: false,
    compressPhotos: true,
    photoQuality: 'medium',
    maxRetryAttempts: 3,
    conflictResolution: 'ask_user'
  };

  async initialize(): Promise<void> {
    try {
      // Initialize IndexedDB
      this.db = await openDB('ChairCareOffline', 1, {
        upgrade(db) {
          // Offline data store
          if (!db.objectStoreNames.contains('offlineData')) {
            const offlineStore = db.createObjectStore('offlineData', { keyPath: 'id' });
            offlineStore.createIndex('type', 'type');
            offlineStore.createIndex('syncStatus', 'syncStatus');
            offlineStore.createIndex('timestamp', 'timestamp');
          }

          // Sync conflicts store
          if (!db.objectStoreNames.contains('syncConflicts')) {
            const conflictsStore = db.createObjectStore('syncConflicts', { keyPath: 'id' });
            conflictsStore.createIndex('resolved', 'resolved');
          }

          // Offline jobs store
          if (!db.objectStoreNames.contains('offlineJobs')) {
            const jobsStore = db.createObjectStore('offlineJobs', { keyPath: 'id' });
            jobsStore.createIndex('syncStatus', 'syncStatus');
            jobsStore.createIndex('technicianId', 'technicianId');
          }

          // Offline photos store
          if (!db.objectStoreNames.contains('offlinePhotos')) {
            const photosStore = db.createObjectStore('offlinePhotos', { keyPath: 'id' });
            photosStore.createIndex('uploadStatus', 'uploadStatus');
            photosStore.createIndex('jobId', 'jobId');
          }

          // Cache store for frequently accessed data
          if (!db.objectStoreNames.contains('cache')) {
            const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
            cacheStore.createIndex('expiry', 'expiry');
          }
        }
      });

      // Set up network monitoring
      this.setupNetworkMonitoring();
      
      // Set up auto-sync if enabled
      if (this.settings.autoSync) {
        this.setupAutoSync();
      }

      console.log('Offline service initialized');
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    // Basic online/offline detection
    window.addEventListener('online', () => {
      this.networkStatus.isOnline = true;
      this.onNetworkStatusChange();
    });

    window.addEventListener('offline', () => {
      this.networkStatus.isOnline = false;
      this.onNetworkStatusChange();
    });

    // Enhanced network information if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateConnectionInfo = () => {
        this.networkStatus.effectiveType = connection.effectiveType || 'unknown';
        this.networkStatus.downlink = connection.downlink || 0;
        this.networkStatus.rtt = connection.rtt || 0;
      };

      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }
  }

  private onNetworkStatusChange(): void {
    if (this.networkStatus.isOnline && this.settings.autoSync) {
      // Trigger sync when coming back online
      setTimeout(() => this.syncPendingData(), 1000);
    }
  }

  private setupAutoSync(): void {
    setInterval(() => {
      if (this.networkStatus.isOnline && !this.syncInProgress) {
        this.syncPendingData();
      }
    }, this.settings.syncInterval * 60 * 1000);
  }

  // Store data for offline use
  async storeOfflineData(data: Omit<OfflineData, 'id' | 'timestamp' | 'syncStatus' | 'retryCount'>): Promise<string> {
    if (!this.db) throw new Error('Offline service not initialized');

    const offlineData: OfflineData = {
      ...data,
      id: this.generateId(),
      timestamp: new Date(),
      syncStatus: 'pending',
      retryCount: 0
    };

    await this.db.add('offlineData', offlineData);
    
    // Trigger sync if online
    if (this.networkStatus.isOnline && this.settings.autoSync) {
      setTimeout(() => this.syncPendingData(), 100);
    }

    return offlineData.id;
  }

  // Store offline job
  async storeOfflineJob(job: Omit<OfflineJob, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Offline service not initialized');

    const offlineJob: OfflineJob = {
      ...job,
      id: this.generateId()
    };

    await this.db.add('offlineJobs', offlineJob);
    return offlineJob.id;
  }

  // Store offline photo
  async storeOfflinePhoto(photo: Omit<OfflinePhoto, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Offline service not initialized');

    const offlinePhoto: OfflinePhoto = {
      ...photo,
      id: this.generateId()
    };

    await this.db.add('offlinePhotos', offlinePhoto);
    return offlinePhoto.id;
  }

  // Get pending sync items
  async getPendingSyncItems(): Promise<OfflineData[]> {
    if (!this.db) return [];

    const tx = this.db.transaction('offlineData', 'readonly');
    const index = tx.store.index('syncStatus');
    return await index.getAll('pending');
  }

  // Get offline jobs for technician
  async getOfflineJobs(technicianId: string): Promise<OfflineJob[]> {
    if (!this.db) return [];

    const tx = this.db.transaction('offlineJobs', 'readonly');
    const index = tx.store.index('technicianId');
    return await index.getAll(technicianId);
  }

  // Sync pending data to server
  async syncPendingData(): Promise<void> {
    if (this.syncInProgress || !this.networkStatus.isOnline) return;

    this.syncInProgress = true;
    
    try {
      const pendingItems = await this.getPendingSyncItems();
      
      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          await this.handleSyncError(item, error as Error);
        }
      }

      // Sync photos
      await this.syncPendingPhotos();

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: OfflineData): Promise<void> {
    if (!this.db) return;

    // Update sync status
    await this.db.put('offlineData', {
      ...item,
      syncStatus: 'syncing'
    });

    // Perform actual sync based on item type and action
    let response;
    
    switch (item.type) {
      case 'job':
        response = await this.syncJobData(item);
        break;
      case 'chair':
        response = await this.syncChairData(item);
        break;
      case 'service_request':
        response = await this.syncServiceRequestData(item);
        break;
      case 'stock_movement':
        response = await this.syncStockMovementData(item);
        break;
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }

    // Mark as synced
    await this.db.put('offlineData', {
      ...item,
      syncStatus: 'synced'
    });
  }

  private async syncJobData(item: OfflineData): Promise<any> {
    const endpoint = item.action === 'create' ? '/api/jobs' : `/api/jobs/${item.data.id}`;
    const method = item.action === 'create' ? 'POST' : 
                   item.action === 'update' ? 'PUT' : 'DELETE';

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: item.action !== 'delete' ? JSON.stringify(item.data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async syncChairData(item: OfflineData): Promise<any> {
    // Similar implementation for chair data sync
    const endpoint = item.action === 'create' ? '/api/chairs' : `/api/chairs/${item.data.id}`;
    const method = item.action === 'create' ? 'POST' : 
                   item.action === 'update' ? 'PUT' : 'DELETE';

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: item.action !== 'delete' ? JSON.stringify(item.data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async syncServiceRequestData(item: OfflineData): Promise<any> {
    // Implementation for service request sync
    return this.syncJobData(item); // Similar to job data
  }

  private async syncStockMovementData(item: OfflineData): Promise<any> {
    const response = await fetch('/api/inventory/movements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(item.data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async syncPendingPhotos(): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('offlinePhotos', 'readonly');
    const index = tx.store.index('uploadStatus');
    const pendingPhotos = await index.getAll('pending');

    for (const photo of pendingPhotos) {
      try {
        await this.uploadPhoto(photo);
      } catch (error) {
        console.error(`Failed to upload photo ${photo.id}:`, error);
        await this.db.put('offlinePhotos', {
          ...photo,
          uploadStatus: 'failed'
        });
      }
    }
  }

  private async uploadPhoto(photo: OfflinePhoto): Promise<void> {
    if (!this.db) return;

    // Update status to uploading
    await this.db.put('offlinePhotos', {
      ...photo,
      uploadStatus: 'uploading'
    });

    // Get file from local storage (would need to implement file storage)
    const formData = new FormData();
    // formData.append('file', photoFile);
    formData.append('jobId', photo.jobId);
    formData.append('type', photo.type);
    if (photo.chairId) formData.append('chairId', photo.chairId);
    if (photo.description) formData.append('description', photo.description);

    const response = await fetch('/api/photos/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Update photo with server URL
    await this.db.put('offlinePhotos', {
      ...photo,
      serverUrl: result.url,
      uploadStatus: 'uploaded'
    });
  }

  private async handleSyncError(item: OfflineData, error: Error): Promise<void> {
    if (!this.db) return;

    const retryCount = item.retryCount + 1;
    
    if (retryCount >= this.settings.maxRetryAttempts) {
      // Mark as failed
      await this.db.put('offlineData', {
        ...item,
        syncStatus: 'failed',
        retryCount,
        lastSyncAttempt: new Date()
      });
    } else {
      // Schedule retry
      await this.db.put('offlineData', {
        ...item,
        syncStatus: 'pending',
        retryCount,
        lastSyncAttempt: new Date()
      });
    }
  }

  // Get sync status
  async getSyncStatus(): Promise<SyncStatus> {
    if (!this.db) {
      return {
        isOnline: this.networkStatus.isOnline,
        pendingItems: 0,
        syncInProgress: false,
        syncProgress: 0,
        errors: [],
        storageUsed: 0,
        storageLimit: this.settings.maxStorageSize
      };
    }

    const pendingItems = await this.getPendingSyncItems();
    const storageUsed = await this.calculateStorageUsage();

    return {
      isOnline: this.networkStatus.isOnline,
      pendingItems: pendingItems.length,
      syncInProgress: this.syncInProgress,
      syncProgress: 0, // Would calculate based on sync progress
      errors: [], // Would get from error store
      storageUsed,
      storageLimit: this.settings.maxStorageSize
    };
  }

  private async calculateStorageUsage(): Promise<number> {
    if (!this.db) return 0;

    // Estimate storage usage (simplified)
    const offlineData = await this.db.getAll('offlineData');
    const photos = await this.db.getAll('offlinePhotos');
    
    let totalSize = 0;
    
    // Estimate data size (rough calculation)
    totalSize += offlineData.length * 1; // 1KB per data item
    totalSize += photos.reduce((sum, photo) => sum + photo.fileSize, 0);
    
    return totalSize / (1024 * 1024); // Convert to MB
  }

  // Cache frequently accessed data
  async cacheData(key: string, data: any, maxAge: number = 60): Promise<void> {
    if (!this.db) return;

    const cacheItem = {
      key,
      data,
      timestamp: new Date(),
      expiry: new Date(Date.now() + maxAge * 60 * 1000)
    };

    await this.db.put('cache', cacheItem);
  }

  // Get cached data
  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) return null;

    const cacheItem = await this.db.get('cache', key);
    
    if (!cacheItem) return null;
    
    // Check if expired
    if (new Date() > cacheItem.expiry) {
      await this.db.delete('cache', key);
      return null;
    }

    return cacheItem.data;
  }

  // Clear expired cache
  async clearExpiredCache(): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('cache', 'readwrite');
    const index = tx.store.index('expiry');
    const now = new Date();
    
    const cursor = await index.openCursor(IDBKeyRange.upperBound(now));
    
    while (cursor) {
      await cursor.delete();
      await cursor.continue();
    }
  }

  // Utility methods
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Update settings
  updateSettings(newSettings: Partial<OfflineSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('offlineSettings', JSON.stringify(this.settings));
  }

  // Get current settings
  getSettings(): OfflineSettings {
    return { ...this.settings };
  }

  // Force sync
  async forcSync(): Promise<void> {
    if (this.syncInProgress) return;
    await this.syncPendingData();
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    if (!this.db) return;

    const stores = ['offlineData', 'offlineJobs', 'offlinePhotos', 'cache'];
    
    for (const storeName of stores) {
      const tx = this.db.transaction(storeName, 'readwrite');
      await tx.store.clear();
    }
  }
}

// Export singleton instance
export const offlineService = new OfflineService();