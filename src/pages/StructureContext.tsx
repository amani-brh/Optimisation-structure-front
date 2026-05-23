import { createContext, useContext, useState, ReactNode } from 'react';

interface StructureData {
  L: number;       // Portée (m)
  H: number;       // Hauteur poteau h₁ (m)
  setL: (v: number) => void;
  setH: (v: number) => void;
}

const StructureContext = createContext<StructureData>({
  L: 20, H: 6,
  setL: () => {}, setH: () => {},
});

export function StructureProvider({ children }: { children: ReactNode }) {
  const [L, setL] = useState(20);
  const [H, setH] = useState(6);
  return (
    <StructureContext.Provider value={{ L, H, setL, setH }}>
      {children}
    </StructureContext.Provider>
  );
}

export const useStructure = () => useContext(StructureContext);