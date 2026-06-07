import { createContext, useContext, useState, ReactNode } from 'react';

const STORAGE_KEY = 'geometrie';

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

interface StructureData {
  L: number;
  H: number;
  setL: (v: number) => void;
  setH: (v: number) => void;
}

const StructureContext = createContext<StructureData>({
  L: 20, H: 6,
  setL: () => {}, setH: () => {},
});

export function StructureProvider({ children }: { children: ReactNode }) {
  const stored = loadStored();
  const [L, setL] = useState<number>(stored.L ?? 20);
  const [H, setH] = useState<number>(stored.H ?? 6);
  return (
    <StructureContext.Provider value={{ L, H, setL, setH }}>
      {children}
    </StructureContext.Provider>
  );
}

export const useStructure = () => useContext(StructureContext);
export { STORAGE_KEY, loadStored };