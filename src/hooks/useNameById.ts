import { useMemo } from 'react';

const useNameById = <T extends { id: string; name: string }>(
  items: T[],
): Map<string, string> =>
  useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => map.set(item.id, item.name));
    return map;
  }, [items]);

export { useNameById };
