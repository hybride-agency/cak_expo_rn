
import {Dimensions, Platform, StatusBar} from 'react-native';

export const normalizeFont = (value: number) => {
  const {height, width} = Dimensions.get('window');
  const standardLength = Math.max(width, height);
  const systemInset =
    width > height ? 0 : Platform.OS === 'ios' ? 78 : StatusBar.currentHeight || 0;
  const usableHeight = standardLength - systemInset;

  return Math.round((value * usableHeight) / 812);
};
