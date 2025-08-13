import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Progress,
  Tooltip,
  keyframes,
  useDisclosure,
} from '@chakra-ui/react';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  BookOpenIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import { Achievement, AchievementType, AchievementStatus } from '@/types/progress';

// 解锁动画
const unlockAnimation = keyframes`
  0% {
    transform: scale(0.8) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(5deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`;

// 闪烁动画
const glowAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6);
  }
`;

// 脉冲动画
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

/**
 * 成就徽章组件Props
 */
interface AchievementBadgesProps {
  /** 成就列表 */
  achievements: Achievement[];
  /** 显示模式 */
  mode?: 'grid' | 'list' | 'showcase';
  /** 是否显示进度 */
  showProgress?: boolean;
  /** 是否显示动画 */
  showAnimation?: boolean;
  /** 新解锁的成就ID列表 */
  newlyUnlocked?: string[];
  /** 成就解锁回调 */
  onAchievementUnlock?: (achievement: Achievement) => void;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 成就徽章系统和解锁动画组件
 * 支持多种显示模式和动画效果
 */
export const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  achievements,
  mode = 'grid',
  showProgress = true,
  showAnimation = true,
  newlyUnlocked = [],
  onAchievementUnlock,
  className,
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 主题颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  /**
   * 获取成就图标
   */
  const getAchievementIcon = (type: AchievementType) => {
    const iconMap = {
      [AchievementType.STUDY_STREAK]: FireIcon,
      [AchievementType.WORDS_MASTERED]: BookOpenIcon,
      [AchievementType.PRACTICE_COUNT]: ChartBarIcon,
      [AchievementType.ACCURACY_RATE]: StarIcon,
      [AchievementType.STUDY_TIME]: ClockIcon,
      [AchievementType.CATEGORY_MASTER]: AcademicCapIcon,
    };
    return iconMap[type] || TrophyIcon;
  };

  /**
   * 获取成就颜色
   */
  const getAchievementColor = (status: AchievementStatus, type: AchievementType) => {
    if (status === AchievementStatus.LOCKED) return 'gray';
    
    const colorMap = {
      [AchievementType.STUDY_STREAK]: 'orange',
      [AchievementType.WORDS_MASTERED]: 'green',
      [AchievementType.PRACTICE_COUNT]: 'blue',
      [AchievementType.ACCURACY_RATE]: 'yellow',
      [AchievementType.STUDY_TIME]: 'purple',
      [AchievementType.CATEGORY_MASTER]: 'teal',
    };
    return colorMap[type] || 'gold';
  };

  /**
   * 获取成就等级
   */
  const getAchievementRarity = (rewardPoints: number) => {
    if (rewardPoints >= 1000) return { rarity: '传说', color: 'purple' };
    if (rewardPoints >= 500) return { rarity: '史诗', color: 'orange' };
    if (rewardPoints >= 200) return { rarity: '稀有', color: 'blue' };
    if (rewardPoints >= 100) return { rarity: '优秀', color: 'green' };
    return { rarity: '普通', color: 'gray' };
  };

  /**
   * 处理成就点击
   */
  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    onOpen();
  };

  /**
   * 处理新解锁成就的动画
   */
  useEffect(() => {
    if (newlyUnlocked.length > 0 && onAchievementUnlock) {
      newlyUnlocked.forEach(achievementId => {
        const achievement = achievements.find(a => a.id === achievementId);
        if (achievement) {
          onAchievementUnlock(achievement);
        }
      });
    }
  }, [newlyUnlocked, achievements, onAchievementUnlock]);

  /**
   * 单个成就徽章组件
   */
  const AchievementBadge: React.FC<{ achievement: Achievement; size?: 'sm' | 'md' | 'lg' }> = ({ 
    achievement, 
    size = 'md' 
  }) => {
    const IconComponent = getAchievementIcon(achievement.type);
    const color = getAchievementColor(achievement.status, achievement.type);
    const rarity = getAchievementRarity(achievement.rewardPoints);
    const isNewlyUnlocked = newlyUnlocked.includes(achievement.id);
    const isUnlocked = achievement.status === AchievementStatus.UNLOCKED;
    const progressPercent = achievement.target > 0 ? (achievement.progress / achievement.target) * 100 : 0;

    const sizeMap = {
      sm: { box: '60px', icon: 24, text: 'xs' },
      md: { box: '80px', icon: 32, text: 'sm' },
      lg: { box: '100px', icon: 40, text: 'md' },
    };
    const sizeConfig = sizeMap[size];

    return (
      <Tooltip
        label={
          <VStack spacing={1} align="start">
            <Text fontWeight="bold">{achievement.name}</Text>
            <Text fontSize="xs">{achievement.description}</Text>
            {!isUnlocked && (
              <Text fontSize="xs" color="gray.400">
                进度: {achievement.progress}/{achievement.target}
              </Text>
            )}
          </VStack>
        }
        placement="top"
      >
        <Box
          position="relative"
          cursor="pointer"
          onClick={() => handleAchievementClick(achievement)}
          animation={
            showAnimation && isNewlyUnlocked
              ? `${unlockAnimation} 0.6s ease-out`
              : showAnimation && isUnlocked
              ? `${pulseAnimation} 2s infinite`
              : undefined
          }
        >
          <Box
            w={sizeConfig.box}
            h={sizeConfig.box}
            borderRadius="full"
            bg={isUnlocked ? `${color}.100` : 'gray.100'}
            border="3px solid"
            borderColor={isUnlocked ? `${color}.500` : 'gray.300'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            transition="all 0.2s"
            _hover={{
              transform: 'scale(1.05)',
              shadow: 'lg',
            }}
            animation={
              showAnimation && isUnlocked && rarity.rarity === '传说'
                ? `${glowAnimation} 2s infinite`
                : undefined
            }
          >
            <IconComponent
              width={sizeConfig.icon}
              height={sizeConfig.icon}
              color={isUnlocked ? `var(--chakra-colors-${color}-500)` : 'var(--chakra-colors-gray-400)'}
            />

            {/* 稀有度指示器 */}
            {isUnlocked && rarity.rarity !== '普通' && (
              <Box
                position="absolute"
                top="-2px"
                right="-2px"
                w="20px"
                h="20px"
                borderRadius="full"
                bg={`${rarity.color}.500`}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <StarIcon width={12} height={12} color="white" />
              </Box>
            )}

            {/* 进度环 */}
            {!isUnlocked && showProgress && achievement.status === AchievementStatus.IN_PROGRESS && (
              <Box
                position="absolute"
                top="-3px"
                left="-3px"
                right="-3px"
                bottom="-3px"
                borderRadius="full"
                background={`conic-gradient(${color}.500 ${progressPercent * 3.6}deg, transparent 0deg)`}
                mask="radial-gradient(circle, transparent 70%, black 70%)"
                WebkitMask="radial-gradient(circle, transparent 70%, black 70%)"
              />
            )}
          </Box>

          {/* 成就名称 */}
          <Text
            fontSize={sizeConfig.text}
            textAlign="center"
            mt={2}
            fontWeight={isUnlocked ? 'bold' : 'normal'}
            color={isUnlocked ? textColor : 'gray.500'}
            noOfLines={2}
          >
            {achievement.name}
          </Text>

          {/* 新解锁标识 */}
          {isNewlyUnlocked && (
            <Badge
              position="absolute"
              top="-8px"
              left="50%"
              transform="translateX(-50%)"
              colorScheme="yellow"
              variant="solid"
              fontSize="xs"
              animation={showAnimation ? `${pulseAnimation} 1s infinite` : undefined}
            >
              NEW!
            </Badge>
          )}
        </Box>
      </Tooltip>
    );
  };

  /**
   * 网格模式
   */
  if (mode === 'grid') {
    const unlockedAchievements = achievements.filter(a => a.status === AchievementStatus.UNLOCKED);
    const inProgressAchievements = achievements.filter(a => a.status === AchievementStatus.IN_PROGRESS);
    const lockedAchievements = achievements.filter(a => a.status === AchievementStatus.LOCKED);

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
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              成就徽章
            </Text>
            <Badge colorScheme="gold" variant="subtle">
              {unlockedAchievements.length}/{achievements.length}
            </Badge>
          </HStack>

          {/* 已解锁成就 */}
          {unlockedAchievements.length > 0 && (
            <Box>
              <Text fontSize="md" fontWeight="medium" mb={3} color={textColor}>
                已获得 ({unlockedAchievements.length})
              </Text>
              <SimpleGrid columns={{ base: 3, md: 4, lg: 6 }} spacing={4}>
                {unlockedAchievements.map(achievement => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* 进行中成就 */}
          {inProgressAchievements.length > 0 && (
            <Box>
              <Text fontSize="md" fontWeight="medium" mb={3} color={textColor}>
                进行中 ({inProgressAchievements.length})
              </Text>
              <SimpleGrid columns={{ base: 3, md: 4, lg: 6 }} spacing={4}>
                {inProgressAchievements.map(achievement => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* 未解锁成就 */}
          {lockedAchievements.length > 0 && (
            <Box>
              <Text fontSize="md" fontWeight="medium" mb={3} color="gray.500">
                未解锁 ({lockedAchievements.length})
              </Text>
              <SimpleGrid columns={{ base: 3, md: 4, lg: 6 }} spacing={4}>
                {lockedAchievements.map(achievement => (
                  <AchievementBadge key={achievement.id} achievement={achievement} size="sm" />
                ))}
              </SimpleGrid>
            </Box>
          )}
        </VStack>

        {/* 成就详情模态框 */}
        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={3}>
                {selectedAchievement && (
                  <>
                    <Box
                      w="50px"
                      h="50px"
                      borderRadius="full"
                      bg={`${getAchievementColor(selectedAchievement.status, selectedAchievement.type)}.100`}
                      border="2px solid"
                      borderColor={`${getAchievementColor(selectedAchievement.status, selectedAchievement.type)}.500`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {React.createElement(getAchievementIcon(selectedAchievement.type), {
                        width: 24,
                        height: 24,
                        color: `var(--chakra-colors-${getAchievementColor(selectedAchievement.status, selectedAchievement.type)}-500)`,
                      })}
                    </Box>
                    <VStack spacing={0} align="start">
                      <Text fontSize="lg" fontWeight="bold">
                        {selectedAchievement.name}
                      </Text>
                      <Badge
                        colorScheme={getAchievementRarity(selectedAchievement.rewardPoints).color}
                        variant="subtle"
                      >
                        {getAchievementRarity(selectedAchievement.rewardPoints).rarity}
                      </Badge>
                    </VStack>
                  </>
                )}
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedAchievement && (
                <VStack spacing={4} align="stretch">
                  <Text color={textColor}>
                    {selectedAchievement.description}
                  </Text>

                  {selectedAchievement.status !== AchievementStatus.UNLOCKED && (
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" color={textColor}>
                          完成进度
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {selectedAchievement.progress}/{selectedAchievement.target}
                        </Text>
                      </HStack>
                      <Progress
                        value={(selectedAchievement.progress / selectedAchievement.target) * 100}
                        colorScheme={getAchievementColor(selectedAchievement.status, selectedAchievement.type)}
                        size="md"
                        borderRadius="full"
                      />
                    </Box>
                  )}

                  <HStack justify="space-between" pt={4} borderTop="1px solid" borderColor={borderColor}>
                    <VStack spacing={0} align="start">
                      <Text fontSize="sm" color="gray.500">
                        奖励积分
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="gold">
                        {selectedAchievement.rewardPoints}
                      </Text>
                    </VStack>

                    {selectedAchievement.unlockedAt && (
                      <VStack spacing={0} align="end">
                        <Text fontSize="sm" color="gray.500">
                          解锁时间
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedAchievement.unlockedAt.toLocaleDateString()}
                        </Text>
                      </VStack>
                    )}
                  </HStack>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    );
  }

  // 其他模式的实现可以根据需要添加
  return null;
};

export default AchievementBadges;