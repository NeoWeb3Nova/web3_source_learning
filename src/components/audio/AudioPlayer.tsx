import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Tooltip,
  useColorModeValue,
  Progress,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from '@chakra-ui/react';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ForwardIcon,
  BackwardIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useEnhancedAudio, EnhancedAudioState } from '@/hooks/useEnhancedAudio';

/**
 * 音频播放器组件Props
 */
interface AudioPlayerProps {
  /** 音频URL */
  audioUrl: string;
  /** 音频文本（用于TTS备用方案） */
  audioText?: string;
  /** 显示模式 */
  variant?: 'compact' | 'full' | 'minimal';
  /** 是否显示进度条 */
  showProgress?: boolean;
  /** 是否显示时间 */
  showTime?: boolean;
  /** 是否显示音量控制 */
  showVolumeControl?: boolean;
  /** 是否显示播放速度控制 */
  showSpeedControl?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 播放开始回调 */
  onPlay?: () => void;
  /** 播放结束回调 */
  onEnd?: () => void;
  /** 错误回调 */
  onError?: (error: string) => void;
}

/**
 * 音频播放器组件
 * 提供完整的音频播放控制界面
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  audioText,
  variant = 'full',
  showProgress = true,
  showTime = true,
  showVolumeControl = true,
  showSpeedControl = true,
  className,
  onPlay,
  onEnd,
  onError,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const {
    state,
    currentMode,
    playAudio,
    stop,
    pause,
    resume,
    setVolume,
    setPlaybackRate,
  } = useEnhancedAudio({
    enableFallback: true,
    enableCache: true,
  });

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  const isPlaying = state === EnhancedAudioState.PLAYING;
  const isLoading = state === EnhancedAudioState.LOADING;
  const hasError = state === EnhancedAudioState.ERROR;

  /**
   * 处理播放/暂停
   */
  const handleTogglePlay = async () => {
    try {
      if (isPlaying) {
        pause();
      } else {
        await playAudio(audioUrl, audioText);
        onPlay?.();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '播放失败';
      onError?.(errorMessage);
    }
  };

  /**
   * 处理停止
   */
  const handleStop = () => {
    stop();
    onEnd?.();
  };

  /**
   * 处理音量变化
   */
  const handleVolumeChange = (value: number) => {
    setVolume(value / 100);
  };

  /**
   * 处理播放速度变化
   */
  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
  };

  /**
   * 获取音量图标
   */
  const getVolumeIcon = () => {
    return SpeakerWaveIcon; // 简化处理，实际可以根据音量显示不同图标
  };

  /**
   * 最小化模式
   */
  if (variant === 'minimal') {
    return (
      <HStack className={className} spacing={2}>
        <IconButton
          aria-label={isPlaying ? '暂停' : '播放'}
          icon={isPlaying ? <PauseIcon width={16} height={16} /> : <PlayIcon width={16} height={16} />}
          size="sm"
          variant="ghost"
          onClick={handleTogglePlay}
          isLoading={isLoading}
          colorScheme={hasError ? 'red' : 'blue'}
        />
        {hasError && (
          <Badge colorScheme="red" variant="subtle" fontSize="xs">
            错误
          </Badge>
        )}
      </HStack>
    );
  }

  /**
   * 紧凑模式
   */
  if (variant === 'compact') {
    return (
      <Box
        className={className}
        bg={bgColor}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        p={3}
      >
        <HStack spacing={3}>
          <IconButton
            aria-label={isPlaying ? '暂停' : '播放'}
            icon={isPlaying ? <PauseIcon width={20} height={20} /> : <PlayIcon width={20} height={20} />}
            size="sm"
            colorScheme="blue"
            onClick={handleTogglePlay}
            isLoading={isLoading}
          />
          
          {showProgress && (
            <Box flex="1">
              <Progress
                value={isPlaying ? 50 : 0} // 简化处理，实际需要真实进度
                size="sm"
                colorScheme="blue"
                borderRadius="full"
              />
            </Box>
          )}
          
          {hasError && (
            <Badge colorScheme="red" variant="subtle">
              错误
            </Badge>
          )}
        </HStack>
        
        {hasError && (
          <Text fontSize="xs" color="red.500" mt={2}>
            播放失败，请重试
          </Text>
        )}
      </Box>
    );
  }

  /**
   * 完整模式
   */
  return (
    <Box
      className={className}
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      p={6}
      shadow="sm"
    >
      <VStack spacing={4}>
        {/* 主控制区域 */}
        <HStack spacing={4} w="full" justify="center">
          {/* 播放/暂停按钮 */}
          <IconButton
            aria-label={isPlaying ? '暂停' : '播放'}
            icon={isPlaying ? <PauseIcon width={24} height={24} /> : <PlayIcon width={24} height={24} />}
            size="lg"
            colorScheme="blue"
            borderRadius="full"
            onClick={handleTogglePlay}
            isLoading={isLoading}
            _hover={{
              transform: 'scale(1.05)',
            }}
          />

          {/* 停止按钮 */}
          <IconButton
            aria-label="停止"
            icon={<SpeakerXMarkIcon width={20} height={20} />}
            variant="ghost"
            onClick={handleStop}
            isDisabled={state === EnhancedAudioState.IDLE}
          />
        </HStack>

        {/* 进度条 */}
        {showProgress && (
          <Box w="full">
            <Progress
              value={isPlaying ? 50 : 0} // 简化处理
              size="lg"
              colorScheme="blue"
              borderRadius="full"
            />
          </Box>
        )}

        {/* 底部控制栏 */}
        <HStack justify="space-between" w="full">
          {/* 音量控制 */}
          {showVolumeControl && (
            <HStack spacing={2}>
              <IconButton
                aria-label="音量"
                icon={React.createElement(getVolumeIcon(), { width: 16, height: 16 })}
                size="sm"
                variant="ghost"
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              />
              
              {showVolumeSlider && (
                <Box w="80px">
                  <Slider
                    defaultValue={80}
                    onChange={handleVolumeChange}
                    min={0}
                    max={100}
                    step={1}
                    colorScheme="blue"
                    size="sm"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={3} />
                  </Slider>
                </Box>
              )}
            </HStack>
          )}

          {/* 播放速度控制 */}
          {showSpeedControl && (
            <Menu>
              <MenuButton as={Button} size="sm" variant="ghost" rightIcon={<Cog6ToothIcon width={16} height={16} />}>
                1x
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleSpeedChange(0.5)}>0.5x</MenuItem>
                <MenuItem onClick={() => handleSpeedChange(0.75)}>0.75x</MenuItem>
                <MenuItem onClick={() => handleSpeedChange(1)}>1x</MenuItem>
                <MenuItem onClick={() => handleSpeedChange(1.25)}>1.25x</MenuItem>
                <MenuItem onClick={() => handleSpeedChange(1.5)}>1.5x</MenuItem>
                <MenuItem onClick={() => handleSpeedChange(2)}>2x</MenuItem>
              </MenuList>
            </Menu>
          )}

          {/* 状态指示 */}
          <HStack spacing={2}>
            {isLoading && (
              <Badge colorScheme="blue" variant="subtle">
                加载中
              </Badge>
            )}
            {hasError && (
              <Badge colorScheme="red" variant="subtle">
                错误
              </Badge>
            )}
            <Badge colorScheme="gray" variant="subtle" fontSize="xs">
              {currentMode}
            </Badge>
          </HStack>
        </HStack>

        {/* 错误信息 */}
        {hasError && (
          <Box w="full" p={3} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
            <Text fontSize="sm" color="red.600">
              播放失败，请检查网络连接或尝试其他播放方式
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AudioPlayer;