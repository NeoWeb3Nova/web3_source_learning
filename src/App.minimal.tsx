import React from 'react';
import { ChakraProvider, Box, Text, VStack, Button } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Minimal theme
const theme = {
  colors: {
    brand: {
      50: '#e3f2fd',
      500: '#3182CE',
      900: '#1a365d',
    },
  },
};

// Minimal pages
const HomePage = () => (
  <VStack spacing={4} p={8}>
    <Text fontSize="2xl" fontWeight="bold">Web3.0 DeFi词汇大作战</Text>
    <Text>专业的区块链和去中心化金融词汇学习应用</Text>
    <Button colorScheme="blue">开始学习</Button>
  </VStack>
);

const PracticePage = () => (
  <VStack spacing={4} p={8}>
    <Text fontSize="2xl" fontWeight="bold">练习模式</Text>
    <Text>多种题型练习，提升词汇掌握度</Text>
  </VStack>
);

const ProgressPage = () => (
  <VStack spacing={4} p={8}>
    <Text fontSize="2xl" fontWeight="bold">学习进度</Text>
    <Text>查看学习统计和成就</Text>
  </VStack>
);

const SettingsPage = () => (
  <VStack spacing={4} p={8}>
    <Text fontSize="2xl" fontWeight="bold">设置</Text>
    <Text>个性化配置和偏好设置</Text>
  </VStack>
);

// Navigation
const Navigation = () => (
  <Box bg="blue.500" color="white" p={4}>
    <VStack spacing={2}>
      <Link to="/"><Button variant="ghost" color="white">首页</Button></Link>
      <Link to="/practice"><Button variant="ghost" color="white">练习</Button></Link>
      <Link to="/progress"><Button variant="ghost" color="white">进度</Button></Link>
      <Link to="/settings"><Button variant="ghost" color="white">设置</Button></Link>
    </VStack>
  </Box>
);

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Box minH="100vh" bg="gray.50">
          <Navigation />
          <Box flex="1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
};

export default App;