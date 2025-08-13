import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const QuickPracticePage: React.FC = () => {
  return (
    <Box
      bg="white"
      p={6}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.200"
    >
      <Text color="gray.500" textAlign="center">
        快速练习页面功能开发中...
      </Text>
    </Box>
  );
};

export default QuickPracticePage;