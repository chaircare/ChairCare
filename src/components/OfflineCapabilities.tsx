import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from 'styles/theme';
import { useAuth } from 'contexts/AuthContext';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { offlineService } from 'lib/offline-service';
import { SyncStatus, OfflineSettings } from 'types/offline';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const StatusCard = styled(Card)<{ status: 'online' | 'offline' | 'syncing' }>`
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'online': return theme.colors.success[500];
      case 'offline': return theme.colors.error[500];
      case 'syncing': return theme.colors.warning[500];
      default: return theme.colors.gray[300];
    }
  }};
  background: ${props => {
    switch (props.status) {
      case 'online': return theme.colors.success[50];
      case 'offline': return theme.colors.error[50];
      case 'syncing': return theme.colors.warning[50];
      default: return theme.colors.background.primary;
    }
  }};
`;

const StatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const StatusTitle = styled.h3`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const StatusIndicator = styled.div<{ status: 'online' | 'offline' | 'syncing' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${props => {
    switch (props.status) {
      case 'online':
        return `
          background: ${theme.colors.success[100]};
          color: ${theme.colors.success[700]};
        `;
      case 'offline':
        return `
          background: ${theme.colors.error[100]};
          color: ${theme.colors.error[700]};
        `;
      case 'syncing':
        return `
          background: ${theme.colors.warning[100]};
          color: ${theme.colors.warning[700]};
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          color: ${theme.colors.gray[700]};
        `;
    }
  }}
`;

const StatusDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
`;

const StatusMetric = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const MetricLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  margin: ${theme.spacing.md} 0;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${theme.colors.primary[500]};
  transition: width 0.3s ease;
`;

const SettingsCard = styled(Card)`
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const SettingsTitle = styled.h3`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
`;

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
`;

const SettingLabel = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const SettingDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.xs};
`;

const Toggle = styled.button<{ active: boolean }>`
  width: 48px;
  height: 24px;
  border-radius: ${theme.borderRadius.full};
  border: none;
  background: ${props => props.active ? theme.colors.primary[500] : theme.colors.gray[300]};
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all 0.2s ease;
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

const ErrorList = styled.div`
  margin-top: ${theme.spacing.md};
`;

const ErrorItem = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.error[50]};
  border: 1px solid ${theme.colors.error[200]};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.error[700]};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.sm};
`;

interface OfflineCapabilitiesProps {
  className?: string;
}

export const OfflineCapabilities: React.FC<OfflineCapabilitiesProps> = ({ className }) => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [settings, setSettings] = useState<OfflineSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeOfflineService();
    loadSyncStatus();
    
    // Set up periodic status updates
    const interval = setInterval(loadSyncStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeOfflineService = async () => {
    try {
      await offlineService.initialize();
      const currentSettings = offlineService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const status = await offlineService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleSettingChange = (key: keyof OfflineSettings, value: any) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    offlineService.updateSettings({ [key]: value });
  };

  const handleForceSync = async () => {
    try {
      await offlineService.forcSync();
      await loadSyncStatus();
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  const handleClearOfflineData = async () => {
    if (window.confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      try {
        await offlineService.clearOfflineData();
        await loadSyncStatus();
      } catch (error) {
        console.error('Failed to clear offline data:', error);
      }
    }
  };

  const getStatusType = (): 'online' | 'offline' | 'syncing' => {
    if (!syncStatus) return 'offline';
    if (syncStatus.syncInProgress) return 'syncing';
    return syncStatus.isOnline ? 'online' : 'offline';
  };

  const getStatusText = (): string => {
    const statusType = getStatusType();
    switch (statusType) {
      case 'online': return 'Online & Synced';
      case 'offline': return 'Offline Mode';
      case 'syncing': return 'Syncing Data...';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = (): string => {
    const statusType = getStatusType();
    switch (statusType) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'syncing': return '🟡';
      default: return '⚪';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    const mb = bytes;
    return `${mb.toFixed(1)} MB`;
  };

  const formatLastSync = (date?: Date): string => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Container className={className}>
        <div>Loading offline capabilities...</div>
      </Container>
    );
  }

  return (
    <Container className={className}>
      <StatusCard status={getStatusType()}>
        <StatusHeader>
          <StatusTitle>Offline Status</StatusTitle>
          <StatusIndicator status={getStatusType()}>
            {getStatusIcon()} {getStatusText()}
          </StatusIndicator>
        </StatusHeader>

        {syncStatus && (
          <>
            <StatusDetails>
              <StatusMetric>
                <MetricValue>{syncStatus.pendingItems}</MetricValue>
                <MetricLabel>Pending Items</MetricLabel>
              </StatusMetric>
              <StatusMetric>
                <MetricValue>{formatBytes(syncStatus.storageUsed)}</MetricValue>
                <MetricLabel>Storage Used</MetricLabel>
              </StatusMetric>
              <StatusMetric>
                <MetricValue>{formatLastSync(syncStatus.lastSyncTime)}</MetricValue>
                <MetricLabel>Last Sync</MetricLabel>
              </StatusMetric>
              <StatusMetric>
                <MetricValue>{syncStatus.errors.length}</MetricValue>
                <MetricLabel>Sync Errors</MetricLabel>
              </StatusMetric>
            </StatusDetails>

            {syncStatus.syncInProgress && (
              <ProgressBar>
                <ProgressFill progress={syncStatus.syncProgress} />
              </ProgressBar>
            )}

            {syncStatus.errors.length > 0 && (
              <ErrorList>
                {syncStatus.errors.slice(0, 3).map(error => (
                  <ErrorItem key={error.id}>
                    {error.error}
                  </ErrorItem>
                ))}
              </ErrorList>
            )}
          </>
        )}

        <ActionButtons>
          <Button 
            variant="primary" 
            onClick={handleForceSync}
            disabled={!syncStatus?.isOnline || syncStatus?.syncInProgress}
          >
            Force Sync
          </Button>
          <Button 
            variant="outline" 
            onClick={loadSyncStatus}
          >
            Refresh Status
          </Button>
          {user?.role === 'admin' && (
            <Button 
              variant="secondary" 
              onClick={handleClearOfflineData}
            >
              Clear Offline Data
            </Button>
          )}
        </ActionButtons>
      </StatusCard>

      {settings && (
        <SettingsCard>
          <SettingsTitle>Offline Settings</SettingsTitle>
          
          <SettingsGrid>
            <SettingGroup>
              <SettingItem>
                <div>
                  <SettingLabel>Auto Sync</SettingLabel>
                  <SettingDescription>
                    Automatically sync data when online
                  </SettingDescription>
                </div>
                <Toggle
                  active={settings.autoSync}
                  onClick={() => handleSettingChange('autoSync', !settings.autoSync)}
                />
              </SettingItem>

              <SettingItem>
                <div>
                  <SettingLabel>WiFi Only Sync</SettingLabel>
                  <SettingDescription>
                    Only sync when connected to WiFi
                  </SettingDescription>
                </div>
                <Toggle
                  active={settings.syncOnlyOnWifi}
                  onClick={() => handleSettingChange('syncOnlyOnWifi', !settings.syncOnlyOnWifi)}
                />
              </SettingItem>

              <SettingItem>
                <div>
                  <SettingLabel>Compress Photos</SettingLabel>
                  <SettingDescription>
                    Reduce photo file sizes for faster sync
                  </SettingDescription>
                </div>
                <Toggle
                  active={settings.compressPhotos}
                  onClick={() => handleSettingChange('compressPhotos', !settings.compressPhotos)}
                />
              </SettingItem>
            </SettingGroup>

            <SettingGroup>
              <SettingItem>
                <div>
                  <SettingLabel>Sync Interval</SettingLabel>
                  <SettingDescription>
                    How often to sync data (minutes)
                  </SettingDescription>
                </div>
                <Select
                  value={settings.syncInterval}
                  onChange={(e) => handleSettingChange('syncInterval', parseInt(e.target.value))}
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </Select>
              </SettingItem>

              <SettingItem>
                <div>
                  <SettingLabel>Photo Quality</SettingLabel>
                  <SettingDescription>
                    Quality level for compressed photos
                  </SettingDescription>
                </div>
                <Select
                  value={settings.photoQuality}
                  onChange={(e) => handleSettingChange('photoQuality', e.target.value)}
                >
                  <option value="low">Low (Fastest)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Slowest)</option>
                </Select>
              </SettingItem>

              <SettingItem>
                <div>
                  <SettingLabel>Conflict Resolution</SettingLabel>
                  <SettingDescription>
                    How to handle sync conflicts
                  </SettingDescription>
                </div>
                <Select
                  value={settings.conflictResolution}
                  onChange={(e) => handleSettingChange('conflictResolution', e.target.value)}
                >
                  <option value="ask_user">Ask User</option>
                  <option value="server_wins">Server Wins</option>
                  <option value="client_wins">Client Wins</option>
                </Select>
              </SettingItem>
            </SettingGroup>
          </SettingsGrid>
        </SettingsCard>
      )}
    </Container>
  );
};