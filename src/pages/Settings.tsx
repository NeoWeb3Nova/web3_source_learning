import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

/**
 * 设置页面组件
 */
const SettingsPage: React.FC = () => {
  return (
    <Box p={6}>
      <Box mb={6}>
        <Heading size="lg" mb={2} color="primary.600">
          设置
        </Heading>
        <Text color="gray.600">
          个性化您的学习体验
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
          设置页面功能开发中...
        </Text>
      </Box>
    </Box>
  );
};

export default SettingsPage;