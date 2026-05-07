import { useState, useEffect } from "react";
import { getFlashTimeLeft } from "@/constants/flashSale";

export type FlashTime = { h: number; m: number; s: number };

const _listeners = new Set<(t: FlashTime) => void>();
let _intervalId: ReturnType<typeof setInterval> | null = null;

function startSharedInterval() {
  if (_intervalId !== null) return;
  _intervalId = setInterval(() => {
    const time = getFlashTimeLeft();
    _listeners.forEach((fn) => fn(time));
  }, 1000);
}

function stopSharedInterval() {
  if (_intervalId !== null) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
}

export function useFlashSaleTimer(active: boolean): FlashTime {
  const [time, setTime] = useState<FlashTime>(getFlashTimeLeft);

  useEffect(() => {
    if (!active) return;
    _listeners.add(setTime);
    startSharedInterval();
    return () => {
      _listeners.delete(setTime);
      if (_listeners.size === 0) stopSharedInterval();
    };
  }, [active]);

  return time;
}
