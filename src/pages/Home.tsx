import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
} from '@chakra-ui/react';

/**
 * 简化的首页组件
 */
const HomePage: React.FC = () => {
  return (
    <Box p={6}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={4} color="blue.600">
            Web3.0 DeFi词汇大作战
          </Heading>
          <Text fontSize="lg" color="gray.600">
            掌握区块链和去中心化金融的核心词汇
          </Text>
        </Box>

        <Box textAlign="center" py={10}>
          <Text color="gray.700" mb={4} fontSize="lg">
            欢迎来到Web3.0词汇学习应用！
          </Text>
          <Text color="gray.500" mb={6}>
            应用正在初始化中，功能即将上线...
          </Text>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => {
              alert('功能开发中，敬请期待！');
            }}
          >
            开始学习
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default HomePage;