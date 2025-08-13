import { ComponentStyleConfig } from '@chakra-ui/react';

// Button组件样式
const Button: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 'semibold',
    borderRadius: 'lg',
    minH: '44px', // 触摸友好的最小高度
    _focus: {
      boxShadow: '0 0 0 2px var(--chakra-colors-primary-500)',
    },
  },
  sizes: {
    sm: {
      fontSize: 'sm',
      px: 4,
      py: 2,
      minH: '36px',
    },
    md: {
      fontSize: 'md',
      px: 6,
      py: 3,
      minH: '44px',
    },
    lg: {
      fontSize: 'lg',
      px: 8,
      py: 4,
      minH: '52px',
    },
  },
  variants: {
    solid: {
      bg: 'primary.500',
      color: 'white',
      _hover: {
        bg: 'primary.600',
        _disabled: {
          bg: 'primary.500',
        },
      },
      _active: {
        bg: 'primary.700',
      },
    },
    outline: {
      border: '2px solid',
      borderColor: 'primary.500',
      color: 'primary.500',
      _hover: {
        bg: 'primary.50',
      },
      _active: {
        bg: 'primary.100',
      },
    },
    ghost: {
      color: 'primary.500',
      _hover: {
        bg: 'primary.50',
      },
      _active: {
        bg: 'primary.100',
      },
    },
  },
  defaultProps: {
    size: 'md',
    variant: 'solid',
  },
};

// Card组件样式
const Card: ComponentStyleConfig = {
  baseStyle: {
    p: 6,
    bg: 'white',
    borderRadius: 'xl',
    boxShadow: 'sm',
    border: '1px solid',
    borderColor: 'gray.200',
  },
  variants: {
    elevated: {
      boxShadow: 'lg',
      border: 'none',
    },
    outline: {
      boxShadow: 'none',
      border: '2px solid',
      borderColor: 'gray.200',
    },
  },
  defaultProps: {
    variant: 'elevated',
  },
};

export const components = {
  Button,
  Card,
};