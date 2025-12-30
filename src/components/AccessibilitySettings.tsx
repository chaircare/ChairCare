import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useAccessibility } from 'contexts/AccessibilityContext';
import { Button } from 'components/ui/Button';
import { theme } from 'styles/theme';

const SettingsContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const SettingsToggle = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${theme.colors.primary[500]};
  color: white;
  border: none;
  cursor: pointer;
  font-size: 20px;
  box-shadow: ${theme.shadows.lg};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.primary[600]};
    transform: scale(1.05);
  }
  
  &:focus {
    outline: 2px solid ${theme.colors.primary[300]};
    outline-offset: 2px;
  }
`;

const SettingsPanel = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 60px;
  right: 0;
  width: 320px;
  padding: ${theme.spacing.lg};
  display: ${props => props.isOpen ? 'block' : 'none'};
  box-shadow: ${theme.shadows.xl};
  border: 1px solid ${theme.colors.gray[200]};
  background: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.lg};
`;

const PanelTitle = styled.h3`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const SettingGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SettingLabel = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const SettingDescription = styled.p`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-bottom: ${theme.spacing.sm};
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${theme.colors.primary[500]};
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
  
  &:focus + span {
    box-shadow: 0 0 0 2px ${theme.colors.primary[200]};
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${theme.colors.gray[300]};
  transition: 0.2s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.2s;
    border-radius: 50%;
  }
`;

const FontSizeControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

const FontSizeButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${theme.colors.gray[300]};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  
  &:hover {
    background: ${theme.colors.gray[50]};
  }
  
  &:focus {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 1px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FontSizeDisplay = styled.span`
  min-width: 80px;
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const LanguageSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  
  &:focus {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 1px;
  }
`;

const ResetButton = styled(Button)`
  width: 100%;
  margin-top: ${theme.spacing.lg};
`;

const languages = {
  en: 'English',
  af: 'Afrikaans',
  zu: 'isiZulu',
  xh: 'isiXhosa'
};

const fontSizeLabels = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  'extra-large': 'Extra Large'
};

export const AccessibilitySettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    settings,
    updateSettings,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    setLanguage,
    announceToScreenReader
  } = useAccessibility();

  const handleTogglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      announceToScreenReader('Accessibility settings panel opened');
    } else {
      announceToScreenReader('Accessibility settings panel closed');
    }
  };

  const handleHighContrastToggle = () => {
    toggleHighContrast();
    announceToScreenReader(
      settings.highContrast 
        ? 'High contrast mode disabled' 
        : 'High contrast mode enabled'
    );
  };

  const handleReducedMotionToggle = () => {
    toggleReducedMotion();
    announceToScreenReader(
      settings.reducedMotion 
        ? 'Reduced motion disabled' 
        : 'Reduced motion enabled'
    );
  };

  const handleScreenReaderToggle = () => {
    updateSettings({ screenReaderMode: !settings.screenReaderMode });
    announceToScreenReader(
      settings.screenReaderMode 
        ? 'Screen reader mode disabled' 
        : 'Screen reader mode enabled'
    );
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as typeof settings.language;
    setLanguage(newLanguage);
    announceToScreenReader(`Language changed to ${languages[newLanguage]}`);
  };

  const handleFontSizeIncrease = () => {
    increaseFontSize();
    announceToScreenReader(`Font size increased to ${fontSizeLabels[settings.fontSize]}`);
  };

  const handleFontSizeDecrease = () => {
    decreaseFontSize();
    announceToScreenReader(`Font size decreased to ${fontSizeLabels[settings.fontSize]}`);
  };

  const handleReset = () => {
    updateSettings({
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
      screenReaderMode: false,
      keyboardNavigation: true,
      language: 'en'
    });
    announceToScreenReader('Accessibility settings reset to defaults');
  };

  return (
    <SettingsContainer>
      <SettingsToggle
        onClick={handleTogglePanel}
        aria-label="Open accessibility settings"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        ♿
      </SettingsToggle>
      
      <SettingsPanel 
        id="accessibility-panel"
        isOpen={isOpen}
        role="dialog"
        aria-label="Accessibility Settings"
        aria-hidden={!isOpen}
      >
        <PanelTitle>Accessibility Settings</PanelTitle>
        
        <SettingGroup>
          <SettingLabel>Font Size</SettingLabel>
          <SettingDescription>
            Adjust the text size throughout the application
          </SettingDescription>
          <FontSizeControls>
            <FontSizeButton
              onClick={handleFontSizeDecrease}
              disabled={settings.fontSize === 'small'}
              aria-label="Decrease font size"
            >
              A-
            </FontSizeButton>
            <FontSizeDisplay>
              {fontSizeLabels[settings.fontSize]}
            </FontSizeDisplay>
            <FontSizeButton
              onClick={handleFontSizeIncrease}
              disabled={settings.fontSize === 'extra-large'}
              aria-label="Increase font size"
            >
              A+
            </FontSizeButton>
          </FontSizeControls>
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>High Contrast</SettingLabel>
          <SettingDescription>
            Increase color contrast for better visibility
          </SettingDescription>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={settings.highContrast}
              onChange={handleHighContrastToggle}
              aria-label="Toggle high contrast mode"
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>Reduced Motion</SettingLabel>
          <SettingDescription>
            Minimize animations and transitions
          </SettingDescription>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={handleReducedMotionToggle}
              aria-label="Toggle reduced motion"
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>Screen Reader Mode</SettingLabel>
          <SettingDescription>
            Enhanced support for screen readers
          </SettingDescription>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={settings.screenReaderMode}
              onChange={handleScreenReaderToggle}
              aria-label="Toggle screen reader mode"
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingGroup>

        <SettingGroup>
          <SettingLabel htmlFor="language-select">Language</SettingLabel>
          <SettingDescription>
            Choose your preferred language
          </SettingDescription>
          <LanguageSelect
            id="language-select"
            value={settings.language}
            onChange={handleLanguageChange}
            aria-label="Select language"
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </LanguageSelect>
        </SettingGroup>

        <ResetButton
          variant="outline"
          onClick={handleReset}
          aria-label="Reset all accessibility settings to defaults"
        >
          Reset to Defaults
        </ResetButton>
      </SettingsPanel>
    </SettingsContainer>
  );
};