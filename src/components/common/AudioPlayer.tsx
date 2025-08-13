import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Badge,
  Tooltip,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Progress,
  Fade,
} from '@chakra-ui/react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useEnhancedAudio, EnhancedAudioState, AudioPlayMode } from '@/hooks/useEnhancedAudio';

/**
 * 音频播放器组件Props
 */
interface AudioPlayerProps {
  /** 音频URL */
  audioUrl?: string;
  /** 文本内容（用于TTS） */
  text?: string;
  /** 显示模式 */
  variant?: 'compact' | 'full' | 'minimal';
  /** 是否显示控制按钮 */
  showControls?: boolean;
  /** 是否显示音量控制 */
  showVolumeControl?: boolean;
  /** 是否显示播放速度控制 */
  showSpeedControl?: boolean;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 播放完成回调 */
  onPlayComplete?: () => void;
  /** 播放错误回调 */
  onPlayError?: (error: Error) => void;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 音频播放器组件
 * 支持多种播放模式和丰富的控制功能
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  text,
  variant = 'full',
  showControls = true,
  showVolumeControl = true,
  showSpeedControl = true,
  autoPlay = false,
  onPlayComplete,
  onPlayError,
  className,
}) => {
  const [volume, setVolume] = useState(80);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(80);

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  // 音频Hook
  const {
    state,
    currentMode,
    isWebAudioSupported,
    isTTSSupported,
    playAudio,
    playText,
    stop,
    pause,
    resume,
    setVolume: setAudioVolume,
    setPlaybackRate: setAudioPlaybackRate,
  } = useEnhancedAudio({
    volume: volume / 100,
    playbackRate,
    enableFallback: true,
    enableCache: true,
  });

  /**
   * 播放状态图标
   */
  const getPlayIcon = () => {
    switch (state) {
      case EnhancedAudioState.PLAYING:
        return PauseIcon;
      case EnhancedAudioState.LOADING:
        return ArrowPathIcon;
      default:
        return PlayIcon;
    }
  };

  /**
   * 播放状态颜色
   */
  const getPlayColor = () => {
    switch (state) {
      case EnhancedAudioState.PLAYING:
        return 'green.500';
      case EnhancedAudioState.LOADING:
        return 'blue.500';
      case EnhancedAudioState.ERROR:
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  /**
   * 处理播放/暂停
   */
  const handlePlayPause = async () => {
    try {
      if (state === EnhancedAudioState.PLAYING) {
        pause();
      } else if (state === EnhancedAudioState.PAUSED) {
        await resume();
      } else {
        if (audioUrl) {
          await playAudio(audioUrl, text);
        } else if (text) {
          await playText(text);
        }
      }
    } catch (error) {
      console.error('Play/pause error:', error);
      onPlayError?.(error as Error);
    }
  };

  /**
   * 处理停止
   */
  const handleStop = () => {
    stop();
  };

  /**
   * 处理音量变化
   */
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setAudioVolume(newVolume / 100);
    
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  /**
   * 处理静音切换
   */
  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(previousVolume);
      setAudioVolume(previousVolume / 100);
    } else {
      setIsMuted(true);
      setPreviousVolume(volume);
      setVolume(0);
      setAudioVolume(0);
    }
  };

  /**
   * 处理播放速度变化
   */
  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    setAudioPlaybackRate(speed);
  };

  /**
   * 自动播放
   */
  useEffect(() => {
    if (autoPlay && (audioUrl || text)) {
      handlePlayPause();
    }
  }, [autoPlay, audioUrl, text]);

  /**
   * 播放完成处理
   */
  useEffect(() => {
    if (state === EnhancedAudioState.IDLE && onPlayComplete) {
      onPlayComplete();
    }
  }, [state, onPlayComplete]);

  /**
   * 最小化模式
   */
  if (variant === 'minimal') {
    const PlayIconComponent = getPlayIcon();
    
    return (
      <Tooltip label={state === EnhancedAudioState.PLAYING ? '暂停' : '播放'}>
        <IconButton
          className={className}
          aria-label={state === EnhancedAudioState.PLAYING ? '暂停' : '播放'}
          icon={<PlayIconComponent width={20} height={20} />}
          colorScheme="primary"
          variant="ghost"
          size="sm"
          onClick={handlePlayPause}
          isLoading={state === EnhancedAudioState.LOADING}
          isDisabled={!audioUrl && !text}
          color={getPlayColor()}
        />
      </Tooltip>
    );
  }

  /**
   * 紧凑模式
   */
  if (variant === 'compact') {
    const PlayIconComponent = getPlayIcon();
    
    return (
      <HStack
        className={className}
        spacing={2}
        p={2}
        bg={bgColor}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
      >
        <IconButton
          aria-label={state === EnhancedAudioState.PLAYING ? '暂停' : '播放'}
          icon={<PlayIconComponent width={16} height={16} />}
          size="sm"
          variant="ghost"
          onClick={handlePlayPause}
          isLoading={state === EnhancedAudioState.LOADING}
          isDisabled={!audioUrl && !text}
          color={getPlayColor()}
        />

        {showVolumeControl && (
          <HStack spacing={1} w="80px">
            <IconButton
              aria-label={isMuted ? '取消静音' : '静音'}
              icon={isMuted ? <SpeakerXMarkIcon width={14} height={14} /> : <SpeakerWaveIcon width={14} height={14} />}
              size="xs"
              variant="ghost"
              onClick={handleMuteToggle}
            />
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={100}
              size="sm"
              colorScheme="primary"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={3} />
            </Slider>
          </HStack>
        )}

        <Badge
          colorScheme={state === EnhancedAudioState.PLAYING ? 'green' : 'gray'}
          variant="subtle"
          fontSize="xs"
        >
          {currentMode === AudioPlayMode.WEB_AUDIO ? 'WEB' : 
           currentMode === AudioPlayMode.HTML5_AUDIO ? 'HTML5' : 'TTS'}
        </Badge>
      </HStack>
    );
  }

  /**
   * 完整模式
   */
  const PlayIconComponent = getPlayIcon();

  return (
    <Box
      className={className}
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      p={4}
      shadow="sm"
    >
      <VStack spacing={4} align="stretch">
        {/* 状态指示器 */}
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Badge
              colorScheme={
                state === EnhancedAudioState.PLAYING ? 'green' :
                state === EnhancedAudioState.LOADING ? 'blue' :
                state === EnhancedAudioState.ERROR ? 'red' : 'gray'
              }
              variant="subtle"
            >
              {state === EnhancedAudioState.PLAYING ? '播放中' :
               state === EnhancedAudioState.LOADING ? '加载中' :
               state === EnhancedAudioState.PAUSED ? '已暂停' :
               state === EnhancedAudioState.ERROR ? '错误' : '就绪'}
            </Badge>
            
            <Badge colorScheme="blue" variant="outline" fontSize="xs">
              {currentMode === AudioPlayMode.WEB_AUDIO ? 'Web Audio API' :
               currentMode === AudioPlayMode.HTML5_AUDIO ? 'HTML5 Audio' :
               'Text-to-Speech'}
            </Badge>
          </HStack>

          {/* 功能支持指示 */}
          <HStack spacing={1}>
            {isWebAudioSupported && (
              <Tooltip label="支持Web Audio API">
                <Badge colorScheme="green" variant="solid" fontSize="xs">WEB</Badge>
              </Tooltip>
            )}
            {isTTSSupported && (
              <Tooltip label="支持文本转语音">
                <Badge colorScheme="purple" variant="solid" fontSize="xs">TTS</Badge>
              </Tooltip>
            )}
          </HStack>
        </HStack>

        {/* 播放进度 */}
        {state === EnhancedAudioState.LOADING && (
          <Fade in={true}>
            <Progress size="sm" isIndeterminate colorScheme="blue" borderRadius="full" />
          </Fade>
        )}

        {/* 主控制区域 */}
        {showControls && (
          <HStack justify="center" spacing={4}>
            <IconButton
              aria-label={state === EnhancedAudioState.PLAYING ? '暂停' : '播放'}
              icon={<PlayIconComponent width={24} height={24} />}
              colorScheme="primary"
              size="lg"
              borderRadius="full"
              onClick={handlePlayPause}
              isLoading={state === EnhancedAudioState.LOADING}
              isDisabled={!audioUrl && !text}
            />

            <IconButton
              aria-label="停止"
              icon={<StopIcon width={20} height={20} />}
              variant="outline"
              size="md"
              onClick={handleStop}
              isDisabled={state === EnhancedAudioState.IDLE}
            />
          </HStack>
        )}

        {/* 音量控制 */}
        {showVolumeControl && (
          <HStack spacing={3}>
            <IconButton
              aria-label={isMuted ? '取消静音' : '静音'}
              icon={isMuted ? <SpeakerXMarkIcon width={20} height={20} /> : <SpeakerWaveIcon width={20} height={20} />}
              size="sm"
              variant="ghost"
              onClick={handleMuteToggle}
            />
            
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={100}
              colorScheme="primary"
              flex="1"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            
            <Text fontSize="sm" color={textColor} minW="40px">
              {volume}%
            </Text>
          </HStack>
        )}

        {/* 播放速度控制 */}
        {showSpeedControl && (
          <HStack spacing={3}>
            <Text fontSize="sm" color={textColor} minW="60px">
              播放速度
            </Text>
            
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="播放速度设置"
                icon={<Cog6ToothIcon width={16} height={16} />}
                size="sm"
                variant="ghost"
              />
              <MenuList>
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
                  <MenuItem
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    bg={playbackRate === speed ? 'primary.50' : undefined}
                    color={playbackRate === speed ? 'primary.600' : undefined}
                  >
                    {speed}x {speed === 1.0 && '(正常)'}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            
            <Text fontSize="sm" color={textColor} minW="40px">
              {playbackRate}x
            </Text>
          </HStack>
        )}

        {/* 音频信息 */}
        {(audioUrl || text) && (
          <Box p={2} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
            <Text fontSize="xs" color={textColor} noOfLines={2}>
              {audioUrl ? `音频: ${audioUrl.split('/').pop()}` : `文本: ${text?.substring(0, 50)}...`}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AudioPlayer;