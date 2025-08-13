import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Heading, Text } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
const PracticePage = () => {
    return (_jsxs(Box, { p: 6, children: [_jsxs(Box, { mb: 6, children: [_jsx(Heading, { size: "lg", mb: 2, color: "primary.600", children: "\u7EC3\u4E60\u6D4B\u8BD5" }), _jsx(Text, { color: "gray.600", children: "\u901A\u8FC7\u591A\u79CD\u7EC3\u4E60\u6A21\u5F0F\u5DE9\u56FA\u60A8\u7684\u8BCD\u6C47\u638C\u63E1" })] }), _jsx(Outlet, {})] }));
};
export default PracticePage;
