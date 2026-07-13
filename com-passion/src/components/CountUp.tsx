import { useEffect, useRef, useState } from 'react';

interface Props {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export default function CountUp({ to, duration = 1400, prefix = '', suffix = '' }: Props) {
  const [val, setVal] = useState(0);
  const isFloat = to % 1 !== 0;
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(to * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  const formattedVal = isFloat 
    ? val.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(val).toLocaleString('vi-VN');

  return (
    <span ref={ref}>
      {prefix}
      {formattedVal}
      {suffix}
    </span>
  );
}
