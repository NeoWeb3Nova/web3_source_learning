import React, { useState, useRef, useEffect } from 'react';
import { Box, Image, Skeleton, useColorModeValue } from '@chakra-ui/react';
import { LazyLoadObserver, supportsWebP, getOptimizedImageUrl } from '../../utils/performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  quality?: number;
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  style?: React.CSSProperties;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  borderRadius?: string | number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  lazy = true,
  placeholder,
  fallback,
  onLoad,
  onError,
  className,
  style,
  objectFit = 'cover',
  borderRadius,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<LazyLoadObserver | null>(null);

  const placeholderBg = useColorModeValue('gray.200', 'gray.600');

  // 检查WebP支持
  useEffect(() => {
    supportsWebP().then(setWebpSupported);
  }, []);

  // 生成优化的图片URL
  useEffect(() => {
    if (webpSupported !== null) {
      const optimized = getOptimizedImageUrl(src, {
        width: typeof width === 'number' ? width : undefined,
        height: typeof height === 'number' ? height : undefined,
        quality,
        format: webpSupported ? 'webp' : undefined,
      });
      setOptimizedSrc(optimized);
    }
  }, [src, width, height, quality, webpSupported]);

  // 懒加载逻辑
  useEffect(() => {
    if (!lazy || shouldLoad) return;

    const container = containerRef.current;
    if (!container) return;

    if (!observerRef.current) {
      observerRef.current = new LazyLoadObserver({
        rootMargin: '50px',
        threshold: 0.1,
      });
    }

    observerRef.current.observe(container, () => {
      setShouldLoad(true);
    });

    return () => {
      if (observerRef.current && container) {
        observerRef.current.unobserve(container);
      }
    };
  }, [lazy, shouldLoad]);

  // 清理观察器
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const imageStyle: React.CSSProperties = {
    objectFit,
    width: '100%',
    height: '100%',
    ...style,
  };

  return (
    <Box
      ref={containerRef}
      position="relative"
      width={width}
      height={height}
      className={className}
      borderRadius={borderRadius}
      overflow="hidden"
    >
      {/* 占位符 */}
      {!isLoaded && !isError && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={placeholderBg}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {placeholder ? (
            <Image src={placeholder} alt="" style={imageStyle} />
          ) : (
            <Skeleton width="100%" height="100%" />
          )}
        </Box>
      )}

      {/* 主图片 */}
      {shouldLoad && !isError && (
        <Image
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          opacity={isLoaded ? 1 : 0}
          transition="opacity 0.3s ease-in-out"
        />
      )}

      {/* 错误回退 */}
      {isError && fallback && (
        <Image
          src={fallback}
          alt={alt}
          style={imageStyle}
          onError={() => {
            // 如果回退图片也失败，显示默认占位符
            setIsError(true);
          }}
        />
      )}

      {/* 错误状态 */}
      {isError && !fallback && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={placeholderBg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="gray.500"
          fontSize="sm"
        >
          图片加载失败
        </Box>
      )}
    </Box>
  );
};

export default OptimizedImage;