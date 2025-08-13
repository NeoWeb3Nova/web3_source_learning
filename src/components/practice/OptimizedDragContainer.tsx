import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MobileDragItem } from './MobileDragItem';

/**
 * 拖拽项目数据
 */
interface DragItem {
  id: string;
  content: string;
  correctPosition: number;
}

/**
 * 优化拖拽容器Props
 */
interface OptimizedDragContainerProps {
  /** 项目列表 */
  items: DragItem[];
  /** 项目变化回调 */
  onItemsChange: (items: DragItem[]) => void;
  /** 是否显示结果 */
  showResult?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 性能优化的拖拽容器组件
 * 使用虚拟化和内存优化技术
 */
export const OptimizedDragContainer: React.FC<OptimizedDragContainerProps> = ({
  items,
  onItemsChange,
  showResult = false,
  disabled = false,
  className,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 响应式配置
  const isMobile = useBreakpointValue({ base: true, md: false });
  const itemSpacing = useBreakpointValue({ base: 3, md: 4 });

  // 主题颜色
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  /**
   * 优化的项目ID列表（避免重复计算）
   */
  const itemIds = useMemo(() => items.map(item => item.id), [items]);

  /**
   * 项目映射（快速查找）
   */
  const itemMap = useMemo(() => {
    const map = new Map<string, DragItem>();
    items.forEach(item => map.set(item.id, item));
    return map;
  }, [items]);

  /**
   * 检查项目是否在正确位置
   */
  const isItemCorrect = useCallback((item: DragItem, currentIndex: number) => {
    return item.correctPosition === currentIndex;
  }, []);

  /**
   * 处理拖拽开始
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (disabled) return;

    const { active } = event;
    const item = itemMap.get(active.id as string);
    
    if (item) {
      setActiveId(active.id as string);
      setDraggedItem(item);
    }
  }, [disabled, itemMap]);

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (disabled) return;

    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeIndex = items.findIndex(item => item.id === active.id);
    const overIndex = items.findIndex(item => item.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      const newItems = [...items];
      const [movedItem] = newItems.splice(activeIndex, 1);
      newItems.splice(overIndex, 0, movedItem);
      
      onItemsChange(newItems);
    }
  }, [disabled, items, onItemsChange]);

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (disabled) return;

    setActiveId(null);
    setDraggedItem(null);

    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeIndex = items.findIndex(item => item.id === active.id);
    const overIndex = items.findIndex(item => item.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      const newItems = [...items];
      const [movedItem] = newItems.splice(activeIndex, 1);
      newItems.splice(overIndex, 0, movedItem);
      
      onItemsChange(newItems);
    }
  }, [disabled, items, onItemsChange]);

  /**
   * 处理单个项目的拖拽开始
   */
  const handleItemDragStart = useCallback((id: string) => {
    if (!disabled) {
      setActiveId(id);
      const item = itemMap.get(id);
      if (item) {
        setDraggedItem(item);
      }
    }
  }, [disabled, itemMap]);

  /**
   * 处理单个项目的拖拽结束
   */
  const handleItemDragEnd = useCallback((id: string) => {
    setActiveId(null);
    setDraggedItem(null);
  }, []);

  /**
   * 处理位置变化
   */
  const handlePositionChange = useCallback((id: string, newIndex: number) => {
    if (disabled) return;

    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1 || currentIndex === newIndex) return;

    // 确保新索引在有效范围内
    const clampedIndex = Math.max(0, Math.min(newIndex, items.length - 1));
    
    const newItems = [...items];
    const [movedItem] = newItems.splice(currentIndex, 1);
    newItems.splice(clampedIndex, 0, movedItem);
    
    onItemsChange(newItems);
  }, [disabled, items, onItemsChange]);

  /**
   * 渲染项目列表
   */
  const renderItems = useMemo(() => {
    return items.map((item, index) => (
      <MobileDragItem
        key={item.id}
        id={item.id}
        content={item.content}
        index={index}
        isCorrect={showResult ? isItemCorrect(item, index) : false}
        isWrong={showResult ? !isItemCorrect(item, index) : false}
        showResult={showResult}
        disabled={disabled}
        isDragging={activeId === item.id}
        onDragStart={handleItemDragStart}
        onDragEnd={handleItemDragEnd}
        onPositionChange={handlePositionChange}
      />
    ));
  }, [
    items,
    showResult,
    disabled,
    activeId,
    isItemCorrect,
    handleItemDragStart,
    handleItemDragEnd,
    handlePositionChange,
  ]);

  /**
   * 性能监控（开发环境）
   */
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (renderTime > 16) { // 超过一帧的时间
          console.warn(`OptimizedDragContainer render took ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  });

  return (
    <Box
      ref={containerRef}
      className={className}
      p={4}
      bg={bgColor}
      borderRadius="lg"
      border="2px dashed"
      borderColor={borderColor}
      minH="200px"
      position="relative"
    >
      {isMobile ? (
        // 移动端使用自定义拖拽实现
        <VStack spacing={itemSpacing}>
          {renderItems}
        </VStack>
      ) : (
        // 桌面端使用dnd-kit
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <VStack spacing={itemSpacing}>
              {renderItems}
            </VStack>
          </SortableContext>
        </DndContext>
      )}

      {/* 拖拽状态指示器 */}
      {activeId && draggedItem && (
        <Box
          position="absolute"
          top="8px"
          right="8px"
          bg="primary.500"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="xs"
          fontWeight="medium"
          zIndex={10}
        >
          拖拽中: {draggedItem.content}
        </Box>
      )}
    </Box>
  );
};

export default OptimizedDragContainer;