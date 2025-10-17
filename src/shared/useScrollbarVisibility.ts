import { useEffect, useState } from 'react';

export const useScrollbarVisibility = (ref: React.RefObject<HTMLElement>) => {
  const [isScrollable, setIsScrollable] = useState(false);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    const checkScrollbar = () => {
      if (!ref.current) return;
      
      const element = ref.current;
      const hasVerticalScrollbar = element.scrollHeight > element.clientHeight;
      setIsScrollable(hasVerticalScrollbar);

      // Detect scrollbar width
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      (outer.style as any).msOverflowStyle = 'scrollbar';
      document.body.appendChild(outer);

      const inner = document.createElement('div');
      outer.appendChild(inner);

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      setScrollbarWidth(scrollbarWidth);

      document.body.removeChild(outer);
    };

    // Check immediately and on resize
    checkScrollbar();
    window.addEventListener('resize', checkScrollbar);

    // Use MutationObserver to check when content changes
    const observer = new MutationObserver(checkScrollbar);
    if (ref.current) {
      observer.observe(ref.current, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    return () => {
      window.removeEventListener('resize', checkScrollbar);
      observer.disconnect();
    };
  }, [ref]);

  return { isScrollable, scrollbarWidth };
};

export const forceScrollbarVisibility = (element: HTMLElement) => {
  // Force scrollbar to always be visible using CSS
  element.style.overflowY = 'scroll';
  element.style.scrollbarWidth = 'auto';
  (element.style as any).msOverflowStyle = 'scrollbar';
  
  // For webkit browsers, ensure scrollbar is always visible
  const style = document.createElement('style');
  const className = `force-scrollbar-${Date.now()}`;
  element.classList.add(className);
  
  style.textContent = `
    .${className}::-webkit-scrollbar {
      width: 16px !important;
      display: block !important;
    }
    .${className}::-webkit-scrollbar-track {
      background: #f1f1f1 !important;
    }
    .${className}::-webkit-scrollbar-thumb {
      background: #888 !important;
      border-radius: 4px !important;
    }
  `;
  
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
    element.classList.remove(className);
  };
};