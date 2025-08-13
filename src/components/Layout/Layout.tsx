import React from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

/**
 * Layout组件Props
 */
interface LayoutProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 是否显示顶部导航 */
  showTopNav?: boolean;
  /** 是否显示底部导航 */
  showBottomNav?: boolean;
  /** 是否显示侧边导航 */
  showSideNav?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 测试ID */
  testId?: string;
}

/**
 * 简化的安全区域组件
 */
const SafeAreaBox: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Box>{children}</Box>;
};

/**
 * Layout组件
 * 提供响应式布局和导航结构
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  showTopNav = false,
  showBottomNav = false,
  showSideNav = false,
  className,
  style,
  testId,
}) => {
  return (
    <SafeAreaBox>
      <Box
        className={className}
        style={style}
        data-testid={testId}
        minH="100vh"
        bg={useColorModeValue('gray.50', 'gray.900')}
        position="relative"
      >
        {/* 简化的内容区域 */}
        <Box
          flex="1"
          p={4}
          maxW="1200px"
          mx="auto"
          overflowY="auto"
        >
          {children}
        </Box>
      </Box>
    </SafeAreaBox>
  );
};

export default Layout;