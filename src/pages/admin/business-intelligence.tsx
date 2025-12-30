import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import styled from '@emotion/styled';
import { useAuth } from 'contexts/AuthContext';
import { Layout } from 'components/ui/Layout';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { theme } from 'styles/theme';
import { 
  KPIMetric, 
  CustomerLifetimeValue, 
  TechnicianEfficiency,
  ChairReliabilityScore,
  PredictiveMaintenanceAlert
} from 'types/business-intelligence';
import { BusinessIntelligenceService } from 'lib/business-intelligence-service';
import { CompetitiveAnalysis } from 'components/CompetitiveAnalysis';

const Container = styled.div`
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const TabsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  background: ${props => props.active ? theme.colors.primary[50] : 'transparent'};
  color: ${props => props.active ? theme.colors.primary[700] : theme.colors.text.secondary};
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary[500] : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primary[50]};
    color: ${theme.colors.primary[700]};
  }
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const KPICard = styled(Card)`
  padding: ${theme.spacing.lg};
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const KPIValue = styled.div<{ trend?: string }>`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => {
    switch (props.trend) {
      case 'up': return theme.colors.success[600];
      case 'down': return theme.colors.error[600];
      default: return theme.colors.primary[600];
    }
  }};
  margin-bottom: ${theme.spacing.sm};
`;

const KPILabel = styled.div`
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing.xs};
`;

const KPITrend = styled.div<{ trend?: string }>`
  font-size: ${theme.typography.fontSize.sm};
  color: ${props => {
    switch (props.trend) {
      case 'up': return theme.colors.success[600];
      case 'down': return theme.colors.error[600];
      default: return theme.colors.text.secondary;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
`;

const KPITarget = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  background: ${theme.colors.gray[100]};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
`;

const ContentGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.xl};
`;

const SectionCard = styled(Card)`
  padding: ${theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: ${theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${theme.colors.gray[200]};
  }
  
  th {
    background: ${theme.colors.gray[50]};
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.text.primary};
  }
  
  tr:hover {
    background: ${theme.colors.gray[50]};
  }
`;

const TierBadge = styled.span<{ tier: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${props => {
    switch (props.tier) {
      case 'platinum':
        return `background: ${theme.colors.purple[100]}; color: ${theme.colors.purple[700]};`;
      case 'gold':
        return `background: ${theme.colors.yellow[100]}; color: ${theme.colors.yellow[700]};`;
      case 'silver':
        return `background: ${theme.colors.gray[200]}; color: ${theme.colors.gray[700]};`;
      default:
        return `background: ${theme.colors.orange[100]}; color: ${theme.colors.orange[700]};`;
    }
  }}
`;

const EfficiencyScore = styled.span<{ score: number }>`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => {
    if (props.score >= 80) return theme.colors.success[600];
    if (props.score >= 60) return theme.colors.warning[600];
    return theme.colors.error[600];
  }};
`;

const ReliabilityScore = styled.span<{ score: number }>`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => {
    if (props.score >= 70) return theme.colors.success[600];
    if (props.score >= 40) return theme.colors.warning[600];
    return theme.colors.error[600];
  }};
`;

const AlertItem = styled.div<{ priority: string }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'critical': return theme.colors.error[500];
      case 'high': return theme.colors.error[400];
      case 'medium': return theme.colors.warning[500];
      default: return theme.colors.primary[500];
    }
  }};
  background: ${props => {
    switch (props.priority) {
      case 'critical': return theme.colors.error[50];
      case 'high': return theme.colors.error[50];
      case 'medium': return theme.colors.warning[50];
      default: return theme.colors.primary[50];
    }
  }};
  margin-bottom: ${theme.spacing.sm};
`;

const AlertTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const AlertDetails = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const PriorityBadge = styled.span<{ priority: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${props => {
    switch (props.priority) {
      case 'critical':
        return `background: ${theme.colors.error[100]}; color: ${theme.colors.error[700]};`;
      case 'high':
        return `background: ${theme.colors.error[100]}; color: ${theme.colors.error[700]};`;
      case 'medium':
        return `background: ${theme.colors.warning[100]}; color: ${theme.colors.warning[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

type TabType = 'overview' | 'customers' | 'technicians' | 'assets' | 'predictions' | 'competitive';

const BusinessIntelligence: NextPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [customerLTVs, setCustomerLTVs] = useState<CustomerLifetimeValue[]>([]);
  const [technicianEfficiency, setTechnicianEfficiency] = useState<TechnicianEfficiency[]>([]);
  const [chairReliability, setChairReliability] = useState<ChairReliabilityScore[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<PredictiveMaintenanceAlert[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadBusinessIntelligenceData();
    }
  }, [user]);

  const loadBusinessIntelligenceData = async () => {
    try {
      setLoading(true);
      
      // Define current period (last 30 days)
      const period = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      };
      
      const [
        kpiData,
        clvData,
        efficiencyData,
        reliabilityData,
        alertsData
      ] = await Promise.all([
        BusinessIntelligenceService.calculateKPIs(period),
        BusinessIntelligenceService.calculateCustomerLifetimeValues(),
        BusinessIntelligenceService.calculateTechnicianEfficiency(period),
        BusinessIntelligenceService.calculateChairReliabilityScores(),
        BusinessIntelligenceService.generatePredictiveMaintenanceAlerts()
      ]);
      
      setKpis(kpiData);
      setCustomerLTVs(clvData);
      setTechnicianEfficiency(efficiencyData);
      setChairReliability(reliabilityData);
      setMaintenanceAlerts(alertsData);
      
    } catch (error) {
      console.error('Error loading business intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <Container>
          <div>Access denied. Admin only.</div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Business Intelligence</Title>
          <Button variant="primary" onClick={loadBusinessIntelligenceData}>
            Refresh Data
          </Button>
        </Header>

        <TabsContainer>
          <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </Tab>
          <Tab active={activeTab === 'customers'} onClick={() => setActiveTab('customers')}>
            Customer Analytics
          </Tab>
          <Tab active={activeTab === 'technicians'} onClick={() => setActiveTab('technicians')}>
            Technician Performance
          </Tab>
          <Tab active={activeTab === 'assets'} onClick={() => setActiveTab('assets')}>
            Asset Reliability
          </Tab>
          <Tab active={activeTab === 'predictions'} onClick={() => setActiveTab('predictions')}>
            Predictive Insights
          </Tab>
          <Tab active={activeTab === 'competitive'} onClick={() => setActiveTab('competitive')}>
            Competitive Analysis
          </Tab>
        </TabsContainer>

        {loading ? (
          <LoadingState>Loading business intelligence data...</LoadingState>
        ) : (
          <ContentGrid>
            {activeTab === 'overview' && (
              <>
                <KPIGrid>
                  {kpis.map(kpi => (
                    <KPICard key={kpi.id}>
                      {kpi.target && (
                        <KPITarget>Target: {kpi.target}{kpi.unit}</KPITarget>
                      )}
                      <KPIValue trend={kpi.trend}>
                        {kpi.unit === 'ZAR' ? formatCurrency(kpi.value) : 
                         kpi.unit === '%' ? formatPercentage(kpi.value) : 
                         kpi.value.toLocaleString()}{kpi.unit !== 'ZAR' && kpi.unit !== '%' ? kpi.unit : ''}
                      </KPIValue>
                      <KPILabel>{kpi.name}</KPILabel>
                      <KPITrend trend={kpi.trend}>
                        {getTrendIcon(kpi.trend)} {formatPercentage(Math.abs(kpi.trendPercentage))}
                      </KPITrend>
                    </KPICard>
                  ))}
                </KPIGrid>

                <SectionCard>
                  <SectionTitle>Recent Predictive Maintenance Alerts</SectionTitle>
                  {maintenanceAlerts.slice(0, 5).map(alert => (
                    <AlertItem key={alert.id} priority={alert.priority}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <AlertTitle>{alert.chairModel} - {alert.predictedIssue}</AlertTitle>
                          <AlertDetails>
                            Location: {alert.location} | 
                            Probability: {alert.probability}% | 
                            Timeframe: {alert.estimatedTimeframe} days | 
                            Est. Cost: {formatCurrency(alert.estimatedCost)}
                          </AlertDetails>
                        </div>
                        <PriorityBadge priority={alert.priority}>{alert.priority}</PriorityBadge>
                      </div>
                    </AlertItem>
                  ))}
                </SectionCard>
              </>
            )}

            {activeTab === 'customers' && (
              <SectionCard>
                <SectionTitle>Customer Lifetime Value Analysis</SectionTitle>
                <DataTable>
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Tier</th>
                      <th>Total Revenue</th>
                      <th>Total Jobs</th>
                      <th>Avg Job Value</th>
                      <th>Monthly Revenue</th>
                      <th>Predicted LTV</th>
                      <th>Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerLTVs.slice(0, 20).map(clv => (
                      <tr key={clv.clientId}>
                        <td>{clv.clientName}</td>
                        <td>
                          <TierBadge tier={clv.tier}>{clv.tier}</TierBadge>
                        </td>
                        <td>{formatCurrency(clv.totalRevenue)}</td>
                        <td>{clv.totalJobs}</td>
                        <td>{formatCurrency(clv.averageJobValue)}</td>
                        <td>{formatCurrency(clv.monthlyAverageRevenue)}</td>
                        <td>{formatCurrency(clv.predictedLifetimeValue)}</td>
                        <td>
                          <span style={{ 
                            color: clv.riskScore > 70 ? theme.colors.error[600] : 
                                   clv.riskScore > 40 ? theme.colors.warning[600] : 
                                   theme.colors.success[600] 
                          }}>
                            {clv.riskScore.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </SectionCard>
            )}

            {activeTab === 'technicians' && (
              <SectionCard>
                <SectionTitle>Technician Performance Metrics</SectionTitle>
                <DataTable>
                  <thead>
                    <tr>
                      <th>Technician</th>
                      <th>Total Jobs</th>
                      <th>Completion Rate</th>
                      <th>Avg Duration</th>
                      <th>On-Time %</th>
                      <th>Revenue Generated</th>
                      <th>Profitability</th>
                      <th>Efficiency Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicianEfficiency.map(tech => (
                      <tr key={tech.technicianId}>
                        <td>{tech.technicianName}</td>
                        <td>{tech.totalJobs}</td>
                        <td>{formatPercentage((tech.completedJobs / tech.totalJobs) * 100)}</td>
                        <td>{Math.round(tech.averageJobDuration)} min</td>
                        <td>{formatPercentage(tech.onTimeCompletion)}</td>
                        <td>{formatCurrency(tech.revenueGenerated)}</td>
                        <td>{formatCurrency(tech.profitability)}</td>
                        <td>
                          <EfficiencyScore score={tech.efficiencyScore}>
                            {tech.efficiencyScore}/100
                          </EfficiencyScore>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </SectionCard>
            )}

            {activeTab === 'assets' && (
              <SectionCard>
                <SectionTitle>Chair Reliability Analysis</SectionTitle>
                <DataTable>
                  <thead>
                    <tr>
                      <th>Chair Model</th>
                      <th>Age (Months)</th>
                      <th>Total Services</th>
                      <th>Avg Time Between Services</th>
                      <th>Maintenance Cost</th>
                      <th>Reliability Score</th>
                      <th>Replacement Rec.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chairReliability.slice(0, 20).map(chair => (
                      <tr key={chair.chairId}>
                        <td>{chair.chairModel}</td>
                        <td>{Math.round(chair.ageInMonths)}</td>
                        <td>{chair.totalServices}</td>
                        <td>{Math.round(chair.averageTimeBetweenServices)} days</td>
                        <td>{formatCurrency(chair.maintenanceCost)}</td>
                        <td>
                          <ReliabilityScore score={chair.reliabilityScore}>
                            {chair.reliabilityScore}/100
                          </ReliabilityScore>
                        </td>
                        <td>
                          {chair.replacementRecommendation ? (
                            <span style={{ color: theme.colors.error[600] }}>Yes</span>
                          ) : (
                            <span style={{ color: theme.colors.success[600] }}>No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </SectionCard>
            )}

            {activeTab === 'predictions' && (
              <SectionCard>
                <SectionTitle>Predictive Maintenance Alerts</SectionTitle>
                {maintenanceAlerts.map(alert => (
                  <AlertItem key={alert.id} priority={alert.priority}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <AlertTitle>
                          {alert.chairModel} at {alert.location}
                        </AlertTitle>
                        <AlertDetails>
                          <strong>Predicted Issue:</strong> {alert.predictedIssue}<br/>
                          <strong>Probability:</strong> {alert.probability}%<br/>
                          <strong>Estimated Timeframe:</strong> {alert.estimatedTimeframe} days<br/>
                          <strong>Recommended Action:</strong> {alert.recommendedAction}<br/>
                          <strong>Estimated Cost:</strong> {formatCurrency(alert.estimatedCost)}
                        </AlertDetails>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, alignItems: 'flex-end' }}>
                        <PriorityBadge priority={alert.priority}>{alert.priority}</PriorityBadge>
                        <Button size="sm" variant="outline">Acknowledge</Button>
                      </div>
                    </div>
                  </AlertItem>
                ))}
              </SectionCard>
            )}

            {activeTab === 'competitive' && (
              <CompetitiveAnalysis />
            )}
          </ContentGrid>
        )}
      </Container>
    </Layout>
  );
};

export default BusinessIntelligence;