import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

/**
 * 练习页面组件
 */
const PracticePage: React.FC = () => {
  return (
    <Box p={6}>
      <Box mb={6}>
        <Heading size="lg" mb={2} color="primary.600">
          练习测试
        </Heading>
        <Text color="gray.600">
          通过多种练习模式巩固您的词汇掌握
        </Text>
      </Box>
      
      {/* 子路由内容 */}
      <Outlet />
    </Box>
  );
};

export default PracticePage;