import { useMemo } from 'react';

// Hook para calcular dimensões otimizadas
export function useOptimalGridDimensions(
  containerWidth: number,
  minItemSize: number = 40,
  maxItemSize: number = 60,
  preferredItemsPerRow: number = 8
) {
  return useMemo(() => {
    const gap = 4;
    const availableWidth = containerWidth - (gap * (preferredItemsPerRow - 1));
    const calculatedItemSize = Math.floor(availableWidth / preferredItemsPerRow);
    
    // Ajustar para limites
    const itemSize = Math.max(minItemSize, Math.min(maxItemSize, calculatedItemSize));
    
    // Recalcular itemsPerRow baseado no tamanho final
    const actualItemsPerRow = Math.floor((containerWidth + gap) / (itemSize + gap));
    
    return {
      itemSize,
      itemsPerRow: actualItemsPerRow,
      gap
    };
  }, [containerWidth, minItemSize, maxItemSize, preferredItemsPerRow]);
}