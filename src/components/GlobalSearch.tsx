import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { theme } from 'styles/theme';
import { useAuth } from 'contexts/AuthContext';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';
import { Chair, Job, User } from 'types/chair-care';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  padding-right: 40px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.secondary};
  font-size: 18px;
  pointer-events: none;
`;

const SearchResults = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xl};
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  display: ${props => props.isOpen ? 'block' : 'none'};
  margin-top: 4px;
`;

const SearchSection = styled.div`
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.gray[100]};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${theme.colors.gray[50]};
`;

const SearchResultItem = styled.button<{ highlighted?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  background: ${props => props.highlighted ? theme.colors.primary[50] : 'transparent'};
  color: ${theme.colors.text.primary};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  &:hover {
    background: ${theme.colors.primary[50]};
  }
  
  &:focus {
    outline: none;
    background: ${theme.colors.primary[100]};
  }
`;

const ResultIcon = styled.div<{ type: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
  
  ${props => {
    switch (props.type) {
      case 'chair':
        return `background: ${theme.colors.accent[500]};`;
      case 'job':
        return `background: ${theme.colors.primary[500]};`;
      case 'client':
        return `background: ${theme.colors.success[500]};`;
      case 'technician':
        return `background: ${theme.colors.warning[500]};`;
      default:
        return `background: ${theme.colors.gray[500]};`;
    }
  }}
`;

const ResultContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultSubtitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoResults = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const LoadingState = styled.div`
  padding: ${theme.spacing.lg};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const KeyboardHint = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  background: ${theme.colors.gray[50]};
  border-top: 1px solid ${theme.colors.gray[100]};
`;

interface SearchResult {
  id: string;
  type: 'chair' | 'job' | 'client' | 'technician';
  title: string;
  subtitle: string;
  data: any;
}

interface GlobalSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultSelect,
  placeholder = "Search chairs, jobs, clients..."
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performSearch(searchTerm.trim());
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (term: string) => {
    if (!user) return;

    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search chairs
      const chairsQuery = query(
        collection(db, 'chairs'),
        orderBy('chairId'),
        limit(5)
      );
      const chairsSnapshot = await getDocs(chairsQuery);
      
      chairsSnapshot.docs.forEach(doc => {
        const chair = { id: doc.id, ...doc.data() } as Chair;
        const searchableText = `${chair.chairId} ${chair.chairNumber} ${chair.location} ${chair.model || ''}`.toLowerCase();
        
        if (searchableText.includes(term.toLowerCase())) {
          searchResults.push({
            id: chair.id,
            type: 'chair',
            title: chair.chairId || chair.chairNumber,
            subtitle: `${chair.location} • ${chair.model || 'Office Chair'}`,
            data: chair
          });
        }
      });

      // Search jobs (admin and assigned technician only)
      if (user.role === 'admin' || user.role === 'technician') {
        let jobsQuery;
        if (user.role === 'technician') {
          jobsQuery = query(
            collection(db, 'jobs'),
            where('assignedTechnicianId', '==', user.id),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
        } else {
          jobsQuery = query(
            collection(db, 'jobs'),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
        }

        const jobsSnapshot = await getDocs(jobsQuery);
        
        jobsSnapshot.docs.forEach(doc => {
          const job = { id: doc.id, ...doc.data() } as Job;
          const searchableText = `${job.jobId} ${job.clientName} ${job.location || ''}`.toLowerCase();
          
          if (searchableText.includes(term.toLowerCase())) {
            searchResults.push({
              id: job.id,
              type: 'job',
              title: job.jobId,
              subtitle: `${job.clientName} • ${job.status}`,
              data: job
            });
          }
        });
      }

      // Search clients (admin only)
      if (user.role === 'admin') {
        const clientsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'client'),
          limit(5)
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        
        clientsSnapshot.docs.forEach(doc => {
          const client = { id: doc.id, ...doc.data() } as User;
          const searchableText = `${client.name} ${client.companyName || ''} ${client.email}`.toLowerCase();
          
          if (searchableText.includes(term.toLowerCase())) {
            searchResults.push({
              id: client.id,
              type: 'client',
              title: client.name,
              subtitle: client.companyName || client.email,
              data: client
            });
          }
        });

        // Search technicians
        const techniciansQuery = query(
          collection(db, 'users'),
          where('role', '==', 'technician'),
          limit(5)
        );
        const techniciansSnapshot = await getDocs(techniciansQuery);
        
        techniciansSnapshot.docs.forEach(doc => {
          const technician = { id: doc.id, ...doc.data() } as User;
          const searchableText = `${technician.name} ${technician.email} ${technician.specialization || ''}`.toLowerCase();
          
          if (searchableText.includes(term.toLowerCase())) {
            searchResults.push({
              id: technician.id,
              type: 'technician',
              title: technician.name,
              subtitle: technician.specialization || technician.email,
              data: technician
            });
          }
        });
      }

      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setHighlightedIndex(-1);

    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleResultSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
    
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // Default navigation behavior
      switch (result.type) {
        case 'chair':
          window.location.href = `/admin/chairs/${result.id}`;
          break;
        case 'job':
          window.location.href = `/admin/jobs/${result.id}`;
          break;
        case 'client':
          window.location.href = `/admin/clients/${result.id}`;
          break;
        case 'technician':
          window.location.href = `/admin/technicians/${result.id}`;
          break;
      }
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'chair': return '🪑';
      case 'job': return '💼';
      case 'client': return '🏢';
      case 'technician': return '👨‍🔧';
      default: return '📄';
    }
  };

  const groupedResults = results.reduce((groups, result) => {
    const type = result.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);

  const sectionTitles = {
    chair: 'Chairs',
    job: 'Jobs',
    client: 'Clients',
    technician: 'Technicians'
  };

  return (
    <SearchContainer>
      <SearchInput
        ref={searchInputRef}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        aria-label="Global search"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
        aria-autocomplete="list"
      />
      <SearchIcon>🔍</SearchIcon>
      
      <SearchResults ref={resultsRef} isOpen={isOpen} role="listbox">
        {loading ? (
          <LoadingState>Searching...</LoadingState>
        ) : results.length === 0 && searchTerm.length >= 2 ? (
          <NoResults>
            No results found for "{searchTerm}"
          </NoResults>
        ) : (
          <>
            {Object.entries(groupedResults).map(([type, typeResults]) => (
              <SearchSection key={type}>
                <SectionTitle>{sectionTitles[type as keyof typeof sectionTitles]}</SectionTitle>
                {typeResults.map((result, index) => {
                  const globalIndex = results.indexOf(result);
                  return (
                    <SearchResultItem
                      key={result.id}
                      highlighted={globalIndex === highlightedIndex}
                      onClick={() => handleResultSelect(result)}
                      role="option"
                      aria-selected={globalIndex === highlightedIndex}
                    >
                      <ResultIcon type={result.type}>
                        {getResultIcon(result.type)}
                      </ResultIcon>
                      <ResultContent>
                        <ResultTitle>{result.title}</ResultTitle>
                        <ResultSubtitle>{result.subtitle}</ResultSubtitle>
                      </ResultContent>
                    </SearchResultItem>
                  );
                })}
              </SearchSection>
            ))}
            {results.length > 0 && (
              <KeyboardHint>
                Use ↑↓ to navigate, Enter to select, Esc to close
              </KeyboardHint>
            )}
          </>
        )}
      </SearchResults>
    </SearchContainer>
  );
};