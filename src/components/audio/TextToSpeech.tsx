import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  IconButton,
  Text,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Badge,
  Tooltip,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  SpeakerWaveIcon,
  StopIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useEnhancedAudio, EnhancedAudioState, AudioPlayMode } from '@/hooks/useEnhancedAudio';

/**
 * 语音配置
 */
interface SpeechConfig {
  /** 语音 */
  voice?: SpeechSynthesisVoice;
  /** 语速 (0.1-10) */
  rate?: number;
  /** 音调 (0-2) */
  pitch?: number;
  /** 音量 (0-1) */
  volume?: number;
  /** 语言 */
  lang?: string;
}

/**
 * 文本转语音组件Props
 */
interface TextToSpeechProps {
  /** 要朗读的文本 */
  text: string;
  /** 语音配置 */
  config?: SpeechConfig;
  /** 显示模式 */
  variant?: 'button' | 'panel' | 'inline';
  /** 是否显示配置选项 */
  showControls?: boolean;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 播放开始回调 */
  onStart?: () => void;
  /** 播放结束回调 */
  onEnd?: () => void;
  /** 错误回调 */
  onError?: (error: string) => void;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 文本转语音组件
 * 支持多语言、语音选择和参数调节
 */
export const TextToSpeech: React.FC<TextToSpeechProps> = ({
  text,
  config = {},
  variant = 'button',
  showControls = false,
  autoPlay = false,
  onStart,
  onEnd,
  onError,
  className,
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentConfig, setCurrentConfig] = useState<SpeechConfig>({
    rate: 1,
    pitch: 1,
    volume: 1,
    lang: 'zh-CN',
    ...config,
  });

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  // 使用增强音频Hook
  const {
    state,
    isTTSSupported,
    playText,
    stop,
  } = useEnhancedAudio({
    mode: AudioPlayMode.TEXT_TO_SPEECH,
    enableFallback: true,
  });

  const isSpeaking = state === EnhancedAudioState.PLAYING;
  const isLoading = state === EnhancedAudioState.LOADING;
  const hasError = state === EnhancedAudioState.ERROR;

  /**
   * 检查浏览器支持
   */
  useEffect(() => {
    const supported = isTTSSupported;
    setIsSupported(supported);

    if (supported && 'speechSynthesis' in window) {
      // 加载可用语音
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // 如果没有设置语音，选择默认中文语音
        if (!currentConfig.voice && availableVoices.length > 0) {
          const chineseVoice = availableVoices.find(voice => 
            voice.lang.startsWith('zh') || voice.lang.includes('Chinese')
          );
          if (chineseVoice) {
            setCurrentConfig(prev => ({ ...prev, voice: chineseVoice }));
          }
        }
      };

      // 语音列表可能需要异步加载
      if (speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
      }

      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [currentConfig.voice, isTTSSupported]);

  /**
   * 开始朗读
   */
  const speak = useCallback(async () => {
    if (!isSupported || !text.trim()) {
      const errorMsg = '浏览器不支持语音合成或文本为空';
      onError?.(errorMsg);
      return;
    }

    try {
      onStart?.();
      await playText(text, {
        lang: currentConfig.lang,
        rate: currentConfig.rate,
        pitch: currentConfig.pitch,
        volume: currentConfig.volume,
      });
      onEnd?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '语音合成失败';
      onError?.(errorMsg);
    }
  }, [isSupported, text, currentConfig, playText, onStart, onEnd, onError]);

  /**
   * 停止朗读
   */
  const stopSpeaking = useCallback(() => {
    stop();
    onEnd?.();
  }, [stop, onEnd]);

  /**
   * 切换播放状态
   */
  const toggle = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak();
    }
  }, [isSpeaking, speak, stopSpeaking]);

  /**
   * 更新配置
   */
  const updateConfig = useCallback((updates: Partial<SpeechConfig>) => {
    setCurrentConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // 自动播放
  useEffect(() => {
    if (autoPlay && text && isSupported) {
      speak();
    }
  }, [autoPlay, text, isSupported, speak]);

  // 不支持的情况
  if (!isSupported) {
    return (
      <Alert status="warning" size="sm">
        <AlertIcon />
        您的浏览器不支持语音合成功能
      </Alert>
    );
  }

  /**
   * 按钮模式
   */
  if (variant === 'button') {
    return (
      <Tooltip label={isSpeaking ? '停止朗读' : '开始朗读'}>
        <IconButton
          className={className}
          aria-label={isSpeaking ? '停止朗读' : '开始朗读'}
          icon={
            isSpeaking ? (
              <StopIcon width={16} height={16} />
            ) : (
              <SpeakerWaveIcon width={16} height={16} />
            )
          }
          size="sm"
          variant="ghost"
          colorScheme={isSpeaking ? 'red' : 'blue'}
          onClick={toggle}
          isDisabled={!text.trim()}
          isLoading={isLoading}
        />
      </Tooltip>
    );
  }

  /**
   * 内联模式
   */
  if (variant === 'inline') {
    return (
      <HStack className={className} spacing={2}>
        <IconButton
          aria-label={isSpeaking ? '停止朗读' : '开始朗读'}
          icon={
            isSpeaking ? (
              <StopIcon width={16} height={16} />
            ) : (
              <SpeakerWaveIcon width={16} height={16} />
            )
          }
          size="sm"
          variant="ghost"
          colorScheme={isSpeaking ? 'red' : 'blue'}
          onClick={toggle}
          isDisabled={!text.trim()}
          isLoading={isLoading}
        />
        
        {isSpeaking && (
          <Badge colorScheme="blue" variant="subtle" fontSize="xs">
            朗读中...
          </Badge>
        )}
        
        {hasError && (
          <Badge colorScheme="red" variant="subtle" fontSize="xs">
            错误
          </Badge>
        )}
      </HStack>
    );
  }

  /**
   * 面板模式
   */
  return (
    <Box
      className={className}
      bg={bgColor}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      p={4}
    >
      <VStack spacing={4} align="stretch">
        {/* 标题和控制 */}
        <HStack justify="space-between">
          <Text fontSize="md" fontWeight="medium" color={textColor}>
            文本朗读
          </Text>
          
          <HStack spacing={2}>
            <IconButton
              aria-label={isSpeaking ? '停止朗读' : '开始朗读'}
              icon={
                isSpeaking ? (
                  <StopIcon width={20} height={20} />
                ) : (
                  <SpeakerWaveIcon width={20} height={20} />
                )
              }
              colorScheme={isSpeaking ? 'red' : 'blue'}
              onClick={toggle}
              isDisabled={!text.trim()}
              isLoading={isLoading}
            />
            
            {showControls && (
              <IconButton
                aria-label="设置"
                icon={<Cog6ToothIcon width={16} height={16} />}
                size="sm"
                variant="ghost"
              />
            )}
          </HStack>
        </HStack>

        {/* 文本预览 */}
        <Box
          p={3}
          bg={useColorModeValue('gray.50', 'gray.700')}
          borderRadius="md"
          maxH="100px"
          overflowY="auto"
        >
          <Text fontSize="sm" color={textColor} noOfLines={4}>
            {text || '暂无文本'}
          </Text>
        </Box>

        {/* 控制面板 */}
        {showControls && (
          <VStack spacing={3} align="stretch">
            {/* 语音选择 */}
            {voices.length > 0 && (
              <Box>
                <Text fontSize="sm" mb={2} color={textColor}>
                  语音选择
                </Text>
                <Select
                  size="sm"
                  value={currentConfig.voice?.name || ''}
                  onChange={(e) => {
                    const selectedVoice = voices.find(v => v.name === e.target.value);
                    updateConfig({ voice: selectedVoice });
                  }}
                >
                  {voices
                    .filter(voice => voice.lang.startsWith('zh') || voice.lang.includes('en'))
                    .map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                </Select>
              </Box>
            )}

            {/* 语速控制 */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" color={textColor}>
                  语速
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {currentConfig.rate}x
                </Text>
              </HStack>
              <Slider
                value={currentConfig.rate || 1}
                onChange={(value) => updateConfig({ rate: value })}
                min={0.1}
                max={3}
                step={0.1}
                colorScheme="blue"
                size="sm"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={4} />
              </Slider>
            </Box>

            {/* 音调控制 */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" color={textColor}>
                  音调
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {currentConfig.pitch?.toFixed(1)}
                </Text>
              </HStack>
              <Slider
                value={currentConfig.pitch || 1}
                onChange={(value) => updateConfig({ pitch: value })}
                min={0}
                max={2}
                step={0.1}
                colorScheme="blue"
                size="sm"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={4} />
              </Slider>
            </Box>

            {/* 音量控制 */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" color={textColor}>
                  音量
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {Math.round((currentConfig.volume || 1) * 100)}%
                </Text>
              </HStack>
              <Slider
                value={(currentConfig.volume || 1) * 100}
                onChange={(value) => updateConfig({ volume: value / 100 })}
                min={0}
                max={100}
                step={1}
                colorScheme="blue"
                size="sm"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={4} />
              </Slider>
            </Box>
          </VStack>
        )}

        {/* 状态指示 */}
        <HStack justify="center">
          {isLoading && (
            <Badge colorScheme="blue" variant="subtle">
              加载中...
            </Badge>
          )}
          {isSpeaking && (
            <Badge colorScheme="blue" variant="subtle">
              正在朗读...
            </Badge>
          )}
          {hasError && (
            <Badge colorScheme="red" variant="subtle">
              播放失败
            </Badge>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default TextToSpeech;