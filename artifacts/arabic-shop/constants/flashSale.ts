let _target: Date | null = null;

export function getFlashSaleTarget(): Date {
  if (!_target) {
    _target = new Date(
      Date.now() + 6 * 3600 * 1000 + 23 * 60 * 1000 + 41 * 1000
    );
  }
  return _target;
}

export function getFlashTimeLeft(): { h: number; m: number; s: number } {
  const diff = Math.max(0, getFlashSaleTarget().getTime() - Date.now());
  return {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}
