import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

/**
 * 词汇页面组件
 */
const VocabularyPage: React.FC = () => {
  return (
    <Box p={6}>
      <Box mb={6}>
        <Heading size="lg" mb={2} color="primary.600">
          词汇学习
        </Heading>
        <Text color="gray.600">
          学习和管理您的Web3.0和DeFi词汇
        </Text>
      </Box>
      
      {/* 子路由内容 */}
      <Outlet />
    </Box>
  );
};

export default VocabularyPage;