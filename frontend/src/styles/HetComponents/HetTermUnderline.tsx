import { useEffect, useRef, useState } from 'react';

interface HetTermUnderlineProps {
  children?: string;
  className?: string;
}

export default function HetTermUnderline(props: HetTermUnderlineProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); 
        }
      },
      { threshold: 0.1 } 
    );

    if (spanRef.current) {
      observer.observe(spanRef.current);
    }

    return () => {
      if (spanRef.current) {
        observer.unobserve(spanRef.current);
      }
    };
  }, []);

  return (
    <span
      ref={spanRef}
      className={`font-semibold text-altGreen ${props.className}`}
      style={{
        animation: isVisible
          ? 'underlineSlideIn 1s ease-out forwards'
          : 'none',
        backgroundImage: 'linear-gradient(#B5C7C2, rgba(11, 82, 64, 0.08))',
        backgroundPosition: '1% 100%',
        backgroundSize: '0% 8px',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {props.children}
    </span>
  );
}