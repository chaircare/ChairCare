import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from 'contexts/ThemeContext';
import { useAuth } from 'contexts/AuthContext';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

const ChatBotContainer = styled.div<{ theme: any; isOpen: boolean }>`
  position: fixed;
  bottom: ${props => props.theme.spacing.xl};
  right: ${props => props.theme.spacing.xl};
  z-index: 1000;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    bottom: ${props => props.theme.spacing.lg};
    right: ${props => props.theme.spacing.lg};
    left: ${props => props.theme.spacing.lg};
  }
`;

const ChatToggle = styled.button<{ theme: any; isOpen: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.theme.gradients.primary};
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: ${props => props.theme.shadows.professional};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.professionalHover};
  }
  
  ${props => props.isOpen && `
    transform: rotate(45deg);
  `}
`;

const ChatWindow = styled.div<{ theme: any; isOpen: boolean }>`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  box-shadow: ${props => props.theme.shadows['2xl']};
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  transform: ${props => props.isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'};
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 400px;
    right: 0;
    left: 0;
  }
`;

const ChatHeader = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background: ${props => props.theme.gradients.primary};
  color: white;
  border-radius: ${props => props.theme.borderRadius['2xl']} ${props => props.theme.borderRadius['2xl']} 0 0;
`;

const ChatTitle = styled.h3<{ theme: any }>`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const ChatSubtitle = styled.p<{ theme: any }>`
  margin: ${props => props.theme.spacing.xs} 0 0 0;
  font-size: ${props => props.theme.typography.fontSize.sm};
  opacity: 0.9;
`;

const ChatMessages = styled.div<{ theme: any }>`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const Message = styled.div<{ theme: any; isBot: boolean }>`
  display: flex;
  justify-content: ${props => props.isBot ? 'flex-start' : 'flex-end'};
`;

const MessageBubble = styled.div<{ theme: any; isBot: boolean }>`
  max-width: 80%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.xl};
  background: ${props => props.isBot 
    ? (props.theme.mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : props.theme.colors.gray[100])
    : props.theme.gradients.primary
  };
  color: ${props => props.isBot 
    ? props.theme.colors.text.primary 
    : 'white'
  };
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const Suggestions = styled.div<{ theme: any }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const SuggestionButton = styled.button<{ theme: any }>`
  background: transparent;
  border: 1px solid ${props => props.theme.colors.primary[300]};
  color: ${props => props.theme.colors.primary[600]};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary[500]};
    color: white;
    border-color: ${props => props.theme.colors.primary[500]};
  }
`;

const ChatInput = styled.div<{ theme: any }>`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const Input = styled.input<{ theme: any }>`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  outline: none;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary[500]};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const SendButton = styled.button<{ theme: any }>`
  background: ${props => props.theme.gradients.primary};
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ChatBot: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial welcome message
      const welcomeMessage: ChatMessage = {
        id: '1',
        text: `Hello ${user?.name || 'there'}! 👋 I'm your Chair Care assistant. I'm here to help you navigate the system and answer any questions you might have.`,
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          'How do I request a service?',
          'How to scan QR codes?',
          'View my chair history',
          'Contact support'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user?.name]);

  const getResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase();
    
    let response = '';
    let suggestions: string[] = [];

    if (lowerMessage.includes('service') || lowerMessage.includes('request')) {
      response = "To request a service: 1) Go to the 'Scan' page, 2) Scan your chair's QR code, 3) Fill out the service request form. You can also navigate directly from your dashboard!";
      suggestions = ['Show me scan page', 'What services are available?', 'How long does service take?'];
    } else if (lowerMessage.includes('scan') || lowerMessage.includes('qr')) {
      response = "To scan a QR code: 1) Click 'Scan' in the navigation, 2) Allow camera access, 3) Point your camera at the QR code on your chair. The system will automatically detect and process it!";
      suggestions = ['Camera not working?', 'Where is the QR code?', 'Manual chair entry'];
    } else if (lowerMessage.includes('history') || lowerMessage.includes('track')) {
      response = "You can view your chair history by: 1) Going to your dashboard, 2) Finding your chair in the 'My Chairs' section, 3) Clicking 'View History'. This shows all past services and maintenance!";
      suggestions = ['How to add new chair?', 'Update chair information', 'Service status meaning'];
    } else if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('contact')) {
      response = "For additional support: 📧 Email: info@chaircare.co.za | 📞 Phone: +27 (0) 12 345 6789 | Our team is available 24/7 to assist you!";
      suggestions = ['Emergency service?', 'Billing questions', 'Technical issues'];
    } else if (lowerMessage.includes('navigation') || lowerMessage.includes('navigate') || lowerMessage.includes('menu')) {
      response = "Navigation help: Use the sidebar menu to access different sections. 🏠 Dashboard = Overview, 📱 Scan = QR Scanner, 📋 History = Service records. The menu is always available on the left side!";
      suggestions = ['Mobile navigation', 'Keyboard shortcuts', 'Quick actions'];
    } else {
      response = "I'm here to help! I can assist you with scanning QR codes, requesting services, viewing chair history, navigation, and general support. What would you like to know more about?";
      suggestions = ['Request service', 'Scan QR code', 'View history', 'Contact support'];
    }

    return {
      id: Date.now().toString(),
      text: response,
      isBot: true,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = getResponse(inputValue);
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <ChatBotContainer theme={theme} isOpen={isOpen}>
      <ChatWindow theme={theme} isOpen={isOpen}>
        <ChatHeader theme={theme}>
          <ChatTitle theme={theme}>Chair Care Assistant</ChatTitle>
          <ChatSubtitle theme={theme}>Here to help you navigate the system</ChatSubtitle>
        </ChatHeader>
        
        <ChatMessages theme={theme}>
          {messages.map((message) => (
            <div key={message.id}>
              <Message theme={theme} isBot={message.isBot}>
                <MessageBubble theme={theme} isBot={message.isBot}>
                  {message.text}
                </MessageBubble>
              </Message>
              
              {message.suggestions && message.suggestions.length > 0 && (
                <Suggestions theme={theme}>
                  {message.suggestions.map((suggestion, index) => (
                    <SuggestionButton
                      key={index}
                      theme={theme}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </SuggestionButton>
                  ))}
                </Suggestions>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ChatMessages>
        
        <ChatInput theme={theme}>
          <Input
            theme={theme}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
          />
          <SendButton
            theme={theme}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            ➤
          </SendButton>
        </ChatInput>
      </ChatWindow>
      
      <ChatToggle
        theme={theme}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
      </ChatToggle>
    </ChatBotContainer>
  );
};