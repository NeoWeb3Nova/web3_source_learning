import React, { forwardRef } from 'react';
import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  Input,
  InputProps,
  Select,
  SelectProps,
  Textarea,
  TextareaProps,
  Progress,
  ProgressProps,
  Modal,
  ModalProps,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuProps,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TabsProps,
  Alert,
  AlertProps,
  Box,
  BoxProps,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  useAccessibleModal,
  useAccessibleDropdown,
  useAccessibleTabs,
  useAccessibleProgressBar,
  useAccessibleForm,
  useScreenReaderAnnouncer,
  useKeyboardNavigation,
} from '../../hooks/useAccessibility';
import { KEYBOARD_KEYS, createScreenReaderText } from '../../utils/accessibility';

/**
 * 可访问的按钮组件
 */
interface AccessibleButtonProps extends ButtonProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  screenReaderText?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ children, screenReaderText, ...props }, ref) => {
    return (
      <Button ref={ref} {...props}>
        {children}
        {screenReaderText && (
          <Text as="span" style={createScreenReaderText(screenReaderText)}>
            {screenReaderText}
          </Text>
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

/**
 * 可访问的图标按钮组件
 */
interface AccessibleIconButtonProps extends IconButtonProps {
  screenReaderText?: string;
}

export const AccessibleIconButton = forwardRef<HTMLButtonElement, AccessibleIconButtonProps>(
  ({ screenReaderText, ...props }, ref) => {
    return (
      <IconButton ref={ref} {...props}>
        {screenReaderText && (
          <Text as="span" style={createScreenReaderText(screenReaderText)}>
            {screenReaderText}
          </Text>
        )}
      </IconButton>
    );
  }
);

AccessibleIconButton.displayName = 'AccessibleIconButton';

/**
 * 可访问的输入框组件
 */
interface AccessibleInputProps extends InputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, helperText, required, ...props }, ref) => {
    const { getFieldProps } = useAccessibleForm();
    const { fieldProps, errorProps, hasError } = getFieldProps(
      props.name || 'input',
      label,
      required
    );

    return (
      <Box>
        <Input
          ref={ref}
          {...props}
          {...fieldProps}
          borderColor={hasError ? 'red.500' : undefined}
        />
        {error && (
          <Text {...errorProps} color="red.500" fontSize="sm" mt={1}>
            {error}
          </Text>
        )}
        {helperText && !error && (
          <Text color="gray.500" fontSize="sm" mt={1}>
            {helperText}
          </Text>
        )}
      </Box>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

/**
 * 可访问的选择框组件
 */
interface AccessibleSelectProps extends SelectProps {
  label: string;
  error?: string;
  required?: boolean;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ label, error, required, children, ...props }, ref) => {
    const { getFieldProps } = useAccessibleForm();
    const { fieldProps, errorProps, hasError } = getFieldProps(
      props.name || 'select',
      label,
      required
    );

    return (
      <Box>
        <Select
          ref={ref}
          {...props}
          {...fieldProps}
          borderColor={hasError ? 'red.500' : undefined}
        >
          {children}
        </Select>
        {error && (
          <Text {...errorProps} color="red.500" fontSize="sm" mt={1}>
            {error}
          </Text>
        )}
      </Box>
    );
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';

/**
 * 可访问的文本域组件
 */
interface AccessibleTextareaProps extends TextareaProps {
  label: string;
  error?: string;
  required?: boolean;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ label, error, required, ...props }, ref) => {
    const { getFieldProps } = useAccessibleForm();
    const { fieldProps, errorProps, hasError } = getFieldProps(
      props.name || 'textarea',
      label,
      required
    );

    return (
      <Box>
        <Textarea
          ref={ref}
          {...props}
          {...fieldProps}
          borderColor={hasError ? 'red.500' : undefined}
        />
        {error && (
          <Text {...errorProps} color="red.500" fontSize="sm" mt={1}>
            {error}
          </Text>
        )}
      </Box>
    );
  }
);

AccessibleTextarea.displayName = 'AccessibleTextarea';

/**
 * 可访问的进度条组件
 */
interface AccessibleProgressProps extends ProgressProps {
  label?: string;
  showPercentage?: boolean;
}

export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  value = 0,
  max = 100,
  min = 0,
  label,
  showPercentage = true,
  ...props
}) => {
  const { progressProps } = useAccessibleProgressBar(value, max, min);
  const percentage = Math.round(((value - min) / (max - min)) * 100);

  return (
    <Box>
      {label && (
        <Text fontSize="sm" mb={2}>
          {label}
          {showPercentage && ` (${percentage}%)`}
        </Text>
      )}
      <Progress
        value={value}
        max={max}
        min={min}
        {...progressProps}
        {...props}
      />
    </Box>
  );
};

/**
 * 可访问的模态框组件
 */
interface AccessibleModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  ...props
}) => {
  const { modalRef, modalId, modalProps } = useAccessibleModal(isOpen);

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent ref={modalRef} {...modalProps}>
        <ModalHeader id={`${modalId}-title`}>{title}</ModalHeader>
        <ModalCloseButton aria-label="关闭模态框" />
        <ModalBody>
          {description && (
            <Text id={`${modalId}-description`} mb={4}>
              {description}
            </Text>
          )}
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

/**
 * 可访问的下拉菜单组件
 */
interface AccessibleMenuProps extends Omit<MenuProps, 'children'> {
  buttonText: string;
  buttonProps?: ButtonProps;
  children: React.ReactNode;
}

export const AccessibleMenu: React.FC<AccessibleMenuProps> = ({
  buttonText,
  buttonProps,
  children,
  ...props
}) => {
  const {
    isOpen,
    containerRef,
    elementRef,
    open,
    close,
    buttonProps: accessibleButtonProps,
    menuProps,
  } = useAccessibleDropdown();

  return (
    <Menu isOpen={isOpen} onOpen={open} onClose={close} {...props}>
      <MenuButton
        as={Button}
        ref={elementRef}
        {...buttonProps}
        {...accessibleButtonProps}
      >
        {buttonText}
      </MenuButton>
      <MenuList ref={containerRef} {...menuProps}>
        {children}
      </MenuList>
    </Menu>
  );
};

/**
 * 可访问的标签页组件
 */
interface AccessibleTabsProps extends Omit<TabsProps, 'children'> {
  tabs: Array<{
    label: string;
    content: React.ReactNode;
  }>;
  defaultIndex?: number;
}

export const AccessibleTabs: React.FC<AccessibleTabsProps> = ({
  tabs,
  defaultIndex = 0,
  ...props
}) => {
  const {
    activeIndex,
    selectTab,
    tablistRef,
    tablistProps,
    getTabProps,
    getPanelProps,
  } = useAccessibleTabs(tabs.map(tab => tab.label), defaultIndex);

  return (
    <Tabs index={activeIndex} onChange={selectTab} {...props}>
      <TabList ref={tablistRef} {...tablistProps}>
        {tabs.map((tab, index) => (
          <Tab key={index} {...getTabProps(index)}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {tabs.map((tab, index) => (
          <TabPanel key={index} {...getPanelProps(index)}>
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};

/**
 * 可访问的警告组件
 */
interface AccessibleAlertProps extends AlertProps {
  title?: string;
  announcement?: boolean;
}

export const AccessibleAlert: React.FC<AccessibleAlertProps> = ({
  title,
  announcement = true,
  children,
  status = 'info',
  ...props
}) => {
  const { announce } = useScreenReaderAnnouncer();

  React.useEffect(() => {
    if (announcement && (title || children)) {
      const message = title || (typeof children === 'string' ? children : '警告信息');
      announce(message, status === 'error' ? 'assertive' : 'polite');
    }
  }, [announcement, title, children, status, announce]);

  return (
    <Alert
      status={status}
      role="alert"
      aria-live={status === 'error' ? 'assertive' : 'polite'}
      {...props}
    >
      {children}
    </Alert>
  );
};

/**
 * 跳转到主内容的链接
 */
interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href = '#main-content',
  children = '跳转到主内容',
}) => {
  const skipLinkStyles = {
    position: 'absolute' as const,
    left: '-9999px',
    zIndex: 999999,
    padding: '8px 16px',
    background: 'blue.500',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '0 0 4px 4px',
    fontSize: 'sm',
    fontWeight: 'bold',
    _focus: {
      left: '6px',
      top: '6px',
    },
  };

  return (
    <Box
      as="a"
      href={href}
      sx={skipLinkStyles}
      _focus={{
        left: '6px',
        top: '6px',
      }}
    >
      {children}
    </Box>
  );
};

/**
 * 屏幕阅读器专用文本组件
 */
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ children }) => {
  return (
    <Text as="span" style={createScreenReaderText('')}>
      {children}
    </Text>
  );
};

/**
 * 焦点指示器组件
 */
interface FocusIndicatorProps extends BoxProps {
  children: React.ReactNode;
  visible?: boolean;
}

export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  visible = true,
  ...props
}) => {
  const focusColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Box
      {...props}
      sx={{
        '&:focus-within': visible ? {
          outline: `2px solid ${focusColor}`,
          outlineOffset: '2px',
        } : {},
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
};

export default {
  AccessibleButton,
  AccessibleIconButton,
  AccessibleInput,
  AccessibleSelect,
  AccessibleTextarea,
  AccessibleProgress,
  AccessibleModal,
  AccessibleMenu,
  AccessibleTabs,
  AccessibleAlert,
  SkipLink,
  ScreenReaderOnly,
  FocusIndicator,
};