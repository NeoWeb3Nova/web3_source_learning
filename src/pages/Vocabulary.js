import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
const VocabularyPage = () => {
    return (_jsxs(Box, { p: 6, children: [_jsxs(Box, { mb: 6, children: [_jsx(Heading, { size: "lg", mb: 2, color: "primary.600", children: "\u8BCD\u6C47\u5B66\u4E60" }), _jsx(Text, { color: "gray.600", children: "\u5B66\u4E60\u548C\u7BA1\u7406\u60A8\u7684Web3.0\u548CDeFi\u8BCD\u6C47" })] }), _jsx(Outlet, {})] }));
};
export default VocabularyPage;
