import React from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { useAuth } from 'contexts/AuthContext';
import { useTheme, ThemeToggle } from 'contexts/ThemeContext';
import { Logo } from 'components/ui/Logo';
import { Footer } from 'components/ui/Footer';
import { BackIcon } from 'components/icons/IconSystem';
import { renderNavigationIcon } from 'utils/iconUtils';

const LayoutContainer = styled.div<{ theme: any }>`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.secondary};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  transition: background-color 0.3s ease;
`;

const MainWrapper = styled.div<{ theme: any }>`
  display: flex;
  flex: 1;
`;

const Sidebar = styled.aside<{ isOpen: boolean; theme: any }>`
  width: 280px;
  background: ${props => props.theme.colors.background.primary};
  border-right: 1px solid ${props => props.theme.colors.border.primary};
  box-shadow: ${props => props.theme.shadows.lg};
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  overflow-y: auto;
  transition: all 0.3s ease;
  
  @media (max-width: 1024px) {
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const SidebarHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(3, 105, 161, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(3, 105, 161, 0.05) 100%)'
  };
`;

const UserInfo = styled.div<{ theme: any }>`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.02)'
  };
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const UserName = styled.div<{ theme: any }>`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const UserRole = styled.div<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: ${props => props.theme.spacing.xs};
`;

const Navigation = styled.nav<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg} 0;
`;

const NavSection = styled.div<{ theme: any }>`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const NavSectionTitle = styled.h3<{ theme: any }>`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  padding: 0 ${props => props.theme.spacing.xl};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const NavItem = styled.button<{ active?: boolean; theme: any }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.active 
    ? (props.theme.mode === 'dark' 
      ? 'rgba(14, 165, 233, 0.15)' 
      : props.theme.colors.primary[50]
    ) 
    : 'transparent'
  };
  border: none;
  border-left: 3px solid ${props => props.active ? props.theme.colors.primary[500] : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: ${props => props.active 
      ? (props.theme.mode === 'dark' 
        ? 'rgba(14, 165, 233, 0.15)' 
        : props.theme.colors.primary[50]
      ) 
      : (props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : props.theme.colors.gray[50]
      )
    };
    color: ${props => props.active ? props.theme.colors.primary[600] : props.theme.colors.text.primary};
  }
`;

const NavIcon = styled.span<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.lg};
  width: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainContainer = styled.div<{ theme: any }>`
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1024px) {
    margin-left: 0;
  }
`;

const TopBar = styled.header<{ theme: any }>`
  background: ${props => props.theme.colors.background.primary};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.md};
  }
`;

const TopBarLeft = styled.div<{ theme: any }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const MenuButton = styled.button<{ theme: any }>`
  display: none;
  background: none;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : props.theme.colors.gray[100]
    };
  }
  
  @media (max-width: 1024px) {
    display: block;
  }
`;

const BackButton = styled.button<{ theme: any }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : props.theme.colors.gray[100]
    };
    color: ${props => props.theme.colors.text.primary};
  }
`;

const TopBarActions = styled.div<{ theme: any }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const WelcomeText = styled.span<{ theme: any }>`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MainContent = styled.main<{ theme: any }>`
  flex: 1;
  padding: ${props => props.theme.spacing.xl};
  min-height: 0; /* Prevents flex item from overflowing */
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.md};
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.sm};
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

interface NavItemConfig {
  iconKey: string;
  label: string;
  path: string;
  section?: string;
}

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showBackButton = false,
  backButtonText = "Back",
  onBackClick 
}) => {
  const { user, logout } = useAuth();
  const { theme, mode } = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const getNavigationItems = (): NavItemConfig[] => {
    if (!user) return [];

    const commonItems: NavItemConfig[] = [
      { iconKey: 'dashboard', label: 'Dashboard', path: '/dashboard', section: 'Main' },
      { iconKey: 'scanChair', label: 'Scan Chair', path: '/scan', section: 'Main' }
    ];

    if (user.role === 'admin') {
      return [
        ...commonItems,
        { iconKey: 'addChair', label: 'Add Chair', path: '/chairs/create', section: 'Chairs' },
        { iconKey: 'chairRegistry', label: 'Chair Registry', path: '/admin/chairs', section: 'Chairs' },
        { iconKey: 'qrCodes', label: 'QR Codes', path: '/chairs/qr-generator', section: 'Chairs' },
        { iconKey: 'serviceRequests', label: 'Service Requests', path: '/admin/service-requests', section: 'Jobs' },
        { iconKey: 'jobManagement', label: 'Job Management', path: '/admin/jobs', section: 'Jobs' },
        { iconKey: 'jobProgress', label: 'Job Progress', path: '/admin/job-progress', section: 'Jobs' },
        { iconKey: 'technicians', label: 'Manage Technicians', path: '/admin/technicians', section: 'Users' },
        { iconKey: 'clients', label: 'Manage Clients', path: '/admin/clients', section: 'Users' },
        { iconKey: 'clientRequests', label: 'Client Requests', path: '/admin/client-requests', section: 'Users' },
        { iconKey: 'inventory', label: 'Inventory', path: '/admin/inventory', section: 'Operations' },
        { iconKey: 'pricing', label: 'Pricing Management', path: '/admin/pricing-management', section: 'Operations' },
        { iconKey: 'businessIntelligence', label: 'Business Intelligence', path: '/admin/business-intelligence', section: 'Analytics' },
        { iconKey: 'offlineCapabilities', label: 'Offline Sync', path: '/admin/offline-capabilities', section: 'System' },
        { iconKey: 'invoices', label: 'Invoices', path: '/admin/invoices', section: 'Billing' },
        { iconKey: 'emailTest', label: 'Email Test', path: '/admin/email-test', section: 'System' }
      ];
    }

    if (user.role === 'technician') {
      return [
        ...commonItems,
        { iconKey: 'myJobs', label: 'My Jobs', path: '/technician/jobs', section: 'Jobs' }
      ];
    }

    // Client role
    return [
      { iconKey: 'clientDashboard', label: 'My Dashboard', path: '/client/dashboard', section: 'Main' },
      { iconKey: 'serviceProgress', label: 'Service Progress', path: '/client/service-progress', section: 'Main' },
      { iconKey: 'invoices', label: 'My Invoices', path: '/client/invoices', section: 'Main' },
      { iconKey: 'myChairs', label: 'My Chairs', path: '/client/chairs', section: 'Chairs' },
      { iconKey: 'scanChair', label: 'Scan Chair', path: '/scan', section: 'Tools' }
    ];
  };

  const navigationItems = getNavigationItems();
  const groupedItems = navigationItems.reduce((acc, item) => {
    const section = item.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItemConfig[]>);

  const handleNavigation = (path: string) => {
    router.push(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const isActivePath = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  return (
    <LayoutContainer theme={theme}>
      <Overlay isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      
      <MainWrapper theme={theme}>
        <Sidebar isOpen={sidebarOpen} theme={theme}>
          <SidebarHeader theme={theme}>
            <Logo 
              variant={mode} 
              size="md" 
              showText={true}
              customLogo="/images/lightmode.jpeg"
              customLogoAlt="Chair Care Logo"
            />
            {user && (
              <UserInfo theme={theme}>
                <UserName theme={theme}>{user.name}</UserName>
                <UserRole theme={theme}>{user.role}</UserRole>
              </UserInfo>
            )}
          </SidebarHeader>

          <Navigation theme={theme}>
            {Object.entries(groupedItems).map(([section, items]) => (
              <NavSection key={section} theme={theme}>
                <NavSectionTitle theme={theme}>{section}</NavSectionTitle>
                {items.map((item) => (
                  <NavItem
                    key={item.path}
                    active={isActivePath(item.path)}
                    theme={theme}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <NavIcon theme={theme}>
                      {renderNavigationIcon(item.iconKey, 'custom', 18)}
                    </NavIcon>
                    {item.label}
                  </NavItem>
                ))}
              </NavSection>
            ))}
            
            <NavSection theme={theme}>
              <NavSectionTitle theme={theme}>Account</NavSectionTitle>
              <NavItem theme={theme} onClick={handleLogout}>
                <NavIcon theme={theme}>
                  {renderNavigationIcon('logout', 'custom', 18)}
                </NavIcon>
                Logout
              </NavItem>
            </NavSection>
          </Navigation>
        </Sidebar>

        <MainContainer theme={theme}>
          <TopBar theme={theme}>
            <TopBarLeft theme={theme}>
              <MenuButton theme={theme} onClick={() => setSidebarOpen(!sidebarOpen)}>
                ☰
              </MenuButton>
              
              {showBackButton && (
                <BackButton theme={theme} onClick={handleBackClick}>
                  <BackIcon size={16} />
                  {backButtonText}
                </BackButton>
              )}
            </TopBarLeft>
            
            <TopBarActions theme={theme}>
              {user && (
                <WelcomeText theme={theme}>
                  Welcome, {user.name}
                </WelcomeText>
              )}
              <ThemeToggle />
            </TopBarActions>
          </TopBar>

          <MainContent theme={theme}>
            {children}
          </MainContent>
        </MainContainer>
      </MainWrapper>
      
      <Footer />
    </LayoutContainer>
  );
};