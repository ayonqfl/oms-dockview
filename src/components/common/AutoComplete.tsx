import React, { useState, useRef, useEffect } from 'react';

interface AutoCompleteProps {
  value: string;
  suggestions: string[];
  completeMethod: (query: string) => void;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minChars?: number;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({
  value,
  suggestions,
  completeMethod,
  onChange,
  placeholder = "Search symbol...",
  className = "",
  minChars = 3
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          listRef.current && !listRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
    
    if (newValue.length >= minChars) {
      setIsLoading(true);
      setIsOpen(true);
      try {
        await completeMethod(newValue);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
    // Refocus input after selection
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (value.length >= minChars && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // Highlight matching text in suggestions
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    
    return (
      <>
        {before}
        <span className="text-warning fw-bold">{match}</span>
        {after}
      </>
    );
  };

  return (
    <div className={`modern-autocomplete position-relative ${className}`}>
      <div className="input-wrapper position-relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="form-control form-control-sm bg-dark text-light border-secondary modern-input"
          placeholder={placeholder}
          style={{
            paddingRight: '2.5rem',
            border: '1px solid #6c757d',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
        />
        
        {/* Search Icon */}
        <div className="position-absolute top-50 end-0 translate-middle-y me-2">
          {isLoading ? (
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <i className="fas fa-search text-muted"></i>
          )}
        </div>
      </div>
      
      {/* Suggestions Dropdown */}
      {isOpen && (
        <ul 
          ref={listRef}
          className="suggestions-list position-absolute start-0 end-0 mt-1 shadow-lg rounded"
          style={{
            background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
            border: '1px solid #4a5568',
            maxHeight: '300px',
            overflowY: 'auto',
            top: '100%',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            listStyle: 'none',
            paddingLeft: '0px'
          }}
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                className={`suggestion-item px-2 py-2 cursor-pointer transition-all ${
                  index === highlightedIndex 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-light hover-bg'
                } ${index !== suggestions.length - 1 ? 'border-bottom border-dark' : ''}`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  borderBottom: index !== suggestions.length - 1 ? '1px solid #4a5568' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <span className="symbol-text">
                    {highlightMatch(suggestion, value)}
                  </span>
                  {index === highlightedIndex && (
                    <i className="fas fa-arrow-right text-white-50 ms-2"></i>
                  )}
                </div>
              </li>
            ))
          ) : value.length >= minChars ? (
            <li className="px-3 py-3 text-center text-muted">
              <i className="fas fa-search me-2"></i>
              No symbols found for "{value}"
            </li>
          ) : (
            <li className="px-3 py-3 text-center text-muted">
              <i className="fas fa-info-circle me-2"></i>
              Type at least {minChars} characters to search
            </li>
          )}
        </ul>
      )}
      
      {/* Modern Styles */}
      <style>{`
        .modern-autocomplete .modern-input:focus {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
          background: #1a1a1a !important;
        }
        
        .suggestions-list {
          scrollbar-width: thin;
          scrollbar-color: #4a5568 #2d3748;
        }
        
        .suggestions-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .suggestions-list::-webkit-scrollbar-track {
          background: #2d3748;
          border-radius: 0 4px 4px 0;
        }
        
        .suggestions-list::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 3px;
        }
        
        .suggestions-list::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
        
        .hover-bg:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          transform: translateX(4px);
        }
        
        .suggestion-item {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .symbol-text {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        
        .modern-autocomplete {
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default AutoComplete;