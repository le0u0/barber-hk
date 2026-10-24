"use client";

import { useEffect, useRef, useState } from "react";
import {
  endBarberShow,
  startBarberShow,
  type BarberCard,
  type BarberShowStatus,
  type WakeLockSentinelLike,
} from "./barber-show";

const EMPTY_STATUS: BarberShowStatus = { fullscreen: false, wakeLock: false };

export function useBarberShow() {
  const [card, setCard] = useState<BarberCard | null>(null);
  const [status, setStatus] = useState<BarberShowStatus>(EMPTY_STATUS);
  const sentinel = useRef<WakeLockSentinelLike | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    return () => {
      generation.current += 1;
      const current = sentinel.current;
      sentinel.current = null;
      void endBarberShow(current);
    };
  }, []);

  async function open(next: BarberCard) {
    const ticket = ++generation.current;
    setCard(next);
    const result = await startBarberShow(document.documentElement);
    if (ticket !== generation.current) {
      await endBarberShow(result.sentinel);
      return;
    }
    sentinel.current = result.sentinel;
    setStatus(result.status);
  }

  async function close() {
    generation.current += 1;
    const current = sentinel.current;
    sentinel.current = null;
    await endBarberShow(current);
    setStatus(EMPTY_STATUS);
    setCard(null);
  }

  async function retryBright() {
    const ticket = generation.current;
    const result = await startBarberShow(document.documentElement);
    if (ticket !== generation.current) {
      await endBarberShow(result.sentinel);
      return;
    }
    const previous = sentinel.current;
    sentinel.current = result.sentinel;
    if (previous && previous !== result.sentinel) {
      await endBarberShow(previous, () => {});
    }
    setStatus(result.status);
  }

  return { card, status, open, close, retryBright };
}
