import React, { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from 'styles/theme';
import { Card } from 'components/ui/Card';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const SectionCard = styled(Card)`
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const CompetitorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const CompetitorCard = styled(Card)`
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.gray[200]};
`;

const HighlightedCompetitorCard = styled(Card)`
  padding: ${theme.spacing.lg};
  border: 2px solid ${theme.colors.primary[500]};
`;

const CompetitorName = styled.h3`
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.gray[100]};
  
  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const MetricValue = styled.span`
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const MarketShareBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  margin: ${theme.spacing.sm} 0;
`;

const MarketShareFill = styled.div<{ percentage: number; color: string }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: ${props => props.color};
  transition: width 0.3s ease;
`;

const StrengthsList = styled.ul`
  margin: ${theme.spacing.sm} 0;
  padding-left: ${theme.spacing.lg};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const WeaknessesList = styled.ul`
  margin: ${theme.spacing.sm} 0;
  padding-left: ${theme.spacing.lg};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const PricingComparisonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${theme.spacing.lg};
  
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

const PositionBadge = styled.span<{ position: 'premium' | 'competitive' | 'budget' }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  
  ${props => {
    switch (props.position) {
      case 'premium':
        return `background: ${theme.colors.purple[100]}; color: ${theme.colors.purple[700]};`;
      case 'competitive':
        return `background: ${theme.colors.primary[100]}; color: ${theme.colors.primary[700]};`;
      case 'budget':
        return `background: ${theme.colors.success[100]}; color: ${theme.colors.success[700]};`;
      default:
        return `background: ${theme.colors.gray[100]}; color: ${theme.colors.gray[700]};`;
    }
  }}
`;

const TrendsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const TrendItem = styled.div<{ impact: 'positive' | 'negative' | 'neutral' }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${props => {
    switch (props.impact) {
      case 'positive': return theme.colors.success[500];
      case 'negative': return theme.colors.error[500];
      default: return theme.colors.gray[400];
    }
  }};
  background: ${props => {
    switch (props.impact) {
      case 'positive': return theme.colors.success[50];
      case 'negative': return theme.colors.error[50];
      default: return theme.colors.gray[50];
    }
  }};
`;

const TrendTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const TrendDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const RecommendationItem = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary[700]};
  font-size: ${theme.typography.fontSize.sm};
`;

interface Competitor {
  name: string;
  marketShare: number;
  averagePricing: number;
  strengths: string[];
  weaknesses: string[];
}

interface MarketTrend {
  trend: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface CompetitiveAnalysisProps {
  className?: string;
}

export const CompetitiveAnalysis: React.FC<CompetitiveAnalysisProps> = ({ className }) => {
  const [competitors] = useState<Competitor[]>([
    {
      name: 'Office Solutions Pro',
      marketShare: 35,
      averagePricing: 450,
      strengths: [
        'Established brand recognition',
        'Large technician network',
        'Corporate contracts'
      ],
      weaknesses: [
        'Higher pricing',
        'Slower response times',
        'Limited technology adoption'
      ]
    },
    {
      name: 'Quick Fix Furniture',
      marketShare: 25,
      averagePricing: 320,
      strengths: [
        'Competitive pricing',
        'Fast response times',
        'Good customer service'
      ],
      weaknesses: [
        'Limited service range',
        'Smaller coverage area',
        'Basic technology'
      ]
    },
    {
      name: 'Corporate Chair Care',
      marketShare: 20,
      averagePricing: 380,
      strengths: [
        'Specialized expertise',
        'Quality workmanship',
        'Warranty programs'
      ],
      weaknesses: [
        'Higher costs',
        'Limited availability',
        'Slow adoption of new tech'
      ]
    }
  ]);

  const [ourMarketShare] = useState(15);
  const [ourAveragePricing] = useState(350);
  const [pricingPosition] = useState<'premium' | 'competitive' | 'budget'>('competitive');

  const [marketTrends] = useState<MarketTrend[]>([
    {
      trend: 'Increased demand for sustainable practices',
      impact: 'positive',
      description: 'Companies are prioritizing eco-friendly furniture maintenance over replacement'
    },
    {
      trend: 'Remote work reducing office furniture needs',
      impact: 'negative',
      description: 'Hybrid work models are decreasing demand for office chair maintenance'
    },
    {
      trend: 'Technology integration in service delivery',
      impact: 'positive',
      description: 'Customers expect digital solutions, QR codes, and real-time tracking'
    },
    {
      trend: 'Cost optimization focus',
      impact: 'neutral',
      description: 'Businesses are scrutinizing all expenses, including maintenance contracts'
    }
  ]);

  const [opportunities] = useState([
    'Leverage technology advantage for competitive differentiation',
    'Target mid-market companies underserved by premium providers',
    'Develop subscription-based maintenance packages',
    'Expand into adjacent markets (desks, storage solutions)',
    'Partner with furniture manufacturers for warranty services'
  ]);

  const [threats] = useState([
    'Large competitors may adopt similar technology',
    'Economic downturn reducing maintenance budgets',
    'New entrants with disruptive business models',
    'Furniture manufacturers offering direct services',
    'Shift to disposable furniture culture'
  ]);

  const [recommendations] = useState([
    'Invest in marketing to increase brand awareness and market share',
    'Develop premium service tier to compete with high-end providers',
    'Create strategic partnerships with office furniture dealers',
    'Implement customer loyalty programs to improve retention',
    'Focus on technology as key differentiator in sales presentations'
  ]);

  const getCompetitorColor = (index: number): string => {
    const colors = [
      theme.colors.error[500],
      theme.colors.warning[500],
      theme.colors.accent[500],
      theme.colors.primary[500]
    ];
    return colors[index % colors.length];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getTrendIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '➡️';
    }
  };

  return (
    <Container className={className}>
      <SectionCard>
        <SectionTitle>Market Position Overview</SectionTitle>
        
        <CompetitorGrid>
          {competitors.map((competitor, index) => (
            <CompetitorCard key={competitor.name}>
              <CompetitorName>{competitor.name}</CompetitorName>
              
              <MetricRow>
                <MetricLabel>Market Share</MetricLabel>
                <MetricValue>{competitor.marketShare}%</MetricValue>
              </MetricRow>
              
              <MarketShareBar>
                <MarketShareFill 
                  percentage={competitor.marketShare} 
                  color={getCompetitorColor(index)}
                />
              </MarketShareBar>
              
              <MetricRow>
                <MetricLabel>Average Pricing</MetricLabel>
                <MetricValue>{formatCurrency(competitor.averagePricing)}</MetricValue>
              </MetricRow>
              
              <div style={{ marginTop: theme.spacing.md }}>
                <MetricLabel>Strengths:</MetricLabel>
                <StrengthsList>
                  {competitor.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </StrengthsList>
              </div>
              
              <div>
                <MetricLabel>Weaknesses:</MetricLabel>
                <WeaknessesList>
                  {competitor.weaknesses.map((weakness, idx) => (
                    <li key={idx}>{weakness}</li>
                  ))}
                </WeaknessesList>
              </div>
            </CompetitorCard>
          ))}
          
          {/* Our Company Card */}
          <HighlightedCompetitorCard>
            <CompetitorName>Chair Care (Us)</CompetitorName>
            
            <MetricRow>
              <MetricLabel>Market Share</MetricLabel>
              <MetricValue>{ourMarketShare}%</MetricValue>
            </MetricRow>
            
            <MarketShareBar>
              <MarketShareFill 
                percentage={ourMarketShare} 
                color={theme.colors.primary[500]}
              />
            </MarketShareBar>
            
            <MetricRow>
              <MetricLabel>Average Pricing</MetricLabel>
              <MetricValue>{formatCurrency(ourAveragePricing)}</MetricValue>
            </MetricRow>
            
            <MetricRow>
              <MetricLabel>Position</MetricLabel>
              <PositionBadge position={pricingPosition}>{pricingPosition}</PositionBadge>
            </MetricRow>
            
            <div style={{ marginTop: theme.spacing.md }}>
              <MetricLabel>Strengths:</MetricLabel>
              <StrengthsList>
                <li>Advanced technology platform</li>
                <li>QR code tracking system</li>
                <li>Real-time job management</li>
                <li>Competitive pricing</li>
              </StrengthsList>
            </div>
            
            <div>
              <MetricLabel>Areas for Improvement:</MetricLabel>
              <WeaknessesList>
                <li>Lower market share</li>
                <li>Brand recognition</li>
                <li>Technician network size</li>
              </WeaknessesList>
            </div>
          </HighlightedCompetitorCard>
        </CompetitorGrid>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Pricing Comparison</SectionTitle>
        
        <PricingComparisonTable>
          <thead>
            <tr>
              <th>Service Type</th>
              <th>Chair Care</th>
              <th>Office Solutions Pro</th>
              <th>Quick Fix Furniture</th>
              <th>Corporate Chair Care</th>
              <th>Market Position</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Cleaning</td>
              <td>{formatCurrency(150)}</td>
              <td>{formatCurrency(180)}</td>
              <td>{formatCurrency(120)}</td>
              <td>{formatCurrency(160)}</td>
              <td><PositionBadge position="competitive">Competitive</PositionBadge></td>
            </tr>
            <tr>
              <td>Repair Service</td>
              <td>{formatCurrency(350)}</td>
              <td>{formatCurrency(450)}</td>
              <td>{formatCurrency(280)}</td>
              <td>{formatCurrency(380)}</td>
              <td><PositionBadge position="competitive">Competitive</PositionBadge></td>
            </tr>
            <tr>
              <td>Full Restoration</td>
              <td>{formatCurrency(650)}</td>
              <td>{formatCurrency(800)}</td>
              <td>{formatCurrency(550)}</td>
              <td>{formatCurrency(720)}</td>
              <td><PositionBadge position="competitive">Competitive</PositionBadge></td>
            </tr>
            <tr>
              <td>Emergency Service</td>
              <td>{formatCurrency(450)}</td>
              <td>{formatCurrency(600)}</td>
              <td>{formatCurrency(400)}</td>
              <td>{formatCurrency(520)}</td>
              <td><PositionBadge position="competitive">Competitive</PositionBadge></td>
            </tr>
          </tbody>
        </PricingComparisonTable>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Market Trends</SectionTitle>
        
        <TrendsList>
          {marketTrends.map((trend, index) => (
            <TrendItem key={index} impact={trend.impact}>
              <TrendTitle>
                {getTrendIcon(trend.impact)} {trend.trend}
              </TrendTitle>
              <TrendDescription>{trend.description}</TrendDescription>
            </TrendItem>
          ))}
        </TrendsList>
      </SectionCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.lg }}>
        <SectionCard>
          <SectionTitle>Opportunities</SectionTitle>
          <RecommendationsList>
            {opportunities.map((opportunity, index) => (
              <RecommendationItem key={index}>
                💡 {opportunity}
              </RecommendationItem>
            ))}
          </RecommendationsList>
        </SectionCard>

        <SectionCard>
          <SectionTitle>Threats</SectionTitle>
          <RecommendationsList>
            {threats.map((threat, index) => (
              <div key={index} style={{
                padding: theme.spacing.md,
                background: theme.colors.error[50],
                border: `1px solid ${theme.colors.error[200]}`,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.error[700],
                fontSize: theme.typography.fontSize.sm,
                marginBottom: theme.spacing.sm
              }}>
                ⚠️ {threat}
              </div>
            ))}
          </RecommendationsList>
        </SectionCard>
      </div>

      <SectionCard>
        <SectionTitle>Strategic Recommendations</SectionTitle>
        <RecommendationsList>
          {recommendations.map((recommendation, index) => (
            <RecommendationItem key={index}>
              🎯 {recommendation}
            </RecommendationItem>
          ))}
        </RecommendationsList>
      </SectionCard>
    </Container>
  );
};