import { useEffect, useState } from 'react';

interface AutoSlideProps {
  enabled: boolean;
  onNext: () => void;
  delay?: number;
}

export const useAutoSlide = ({
  enabled,
  onNext,
  delay = 4000,
}: AutoSlideProps) => {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!enabled || isPaused) return;

    const interval = setInterval(onNext, delay);
    return () => clearInterval(interval);
  }, [enabled, isPaused, onNext, delay]);

  return { setIsPaused };
};
