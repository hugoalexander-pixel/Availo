import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isCompact: boolean;
  isMediumLarge: boolean;
  isLandscape: boolean;
  numColumns: number;
  contentMaxWidth: number;
}

export const useResponsive = (): ResponsiveInfo => {
  const { width, height } = useWindowDimensions();
  const isCompact = width < 600;
  const isMediumLarge = width >= 600;
  const isLandscape = width > height;
  const numColumns = isMediumLarge ? 2 : 1;

  return {
    width,
    height,
    isCompact,
    isMediumLarge,
    isLandscape,
    numColumns,
    contentMaxWidth: 720,
  };
};
