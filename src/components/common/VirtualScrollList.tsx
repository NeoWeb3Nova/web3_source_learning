import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { useVirtualScroll, usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

const VirtualScrollList = <T,>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 5,
  onScroll,
  className,
  style,
}: VirtualScrollListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { renderCount } = usePerformanceOptimization();

  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange,
  } = useVirtualScroll(items, itemHeight, height, overscan);

  // 优化的滚动处理
  const optimizedHandleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    handleScroll(event);
    onScroll?.(event.currentTarget.scrollTop);
  }, [handleScroll, onScroll]);

  // 渲染可见项目
  const renderedItems = useMemo(() => {
    return visibleItems.map((item, index) => {
      const actualIndex = visibleRange.startIndex + index;
      return (
        <Box
          key={actualIndex}
          height={`${itemHeight}px`}
          display="flex"
          alignItems="center"
        >
          {renderItem(item, actualIndex)}
        </Box>
      );
    });
  }, [visibleItems, visibleRange.startIndex, itemHeight, renderItem]);

  // 性能监控
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && renderCount > 1) {
      console.log(`VirtualScrollList rendered ${renderCount} times`);
    }
  }, [renderCount]);

  return (
    <Box
      ref={containerRef}
      height={`${height}px`}
      overflowY="auto"
      onScroll={optimizedHandleScroll}
      className={className}
      style={style}
    >
      <Box height={`${totalHeight}px`} position="relative">
        <Box
          transform={`translateY(${offsetY}px)`}
          position="absolute"
          top={0}
          left={0}
          right={0}
        >
          <VStack spacing={0} align="stretch">
            {renderedItems}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(VirtualScrollList) as <T>(
  props: VirtualScrollListProps<T>
) => JSX.Element;