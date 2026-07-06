"use client";
import React, { useState, useEffect } from 'react';

interface Props {
  value: number;
  prefix?: string;
  duration?: number;
  decimals?: number;
}

export default function CountUp({ value, prefix = "", duration = 1500, decimals = 0 }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo for smooth deceleration
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * value);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value); // Ensure exact final value
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(count);

  return <span>{prefix}{formatted}</span>;
}
