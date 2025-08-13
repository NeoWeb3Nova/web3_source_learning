import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

/**
 * 进度页面组件
 */
const ProgressPage: React.FC = () => {
  return (
    <Box p={6}>
      <Box mb={6}>
        <Heading size="lg" mb={2} color="primary.600">
          学习进度
        </Heading>
        <Text color="gray.600">
          查看您的学习统计和成就
        </Text>
      </Box>
      
      <Box
        bg="white"
        p={6}
        borderRadius="xl"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text color="gray.500" textAlign="center">
          进度页面功能开发中...
        </Text>
      </Box>
    </Box>
  );
};

export default ProgressPage;