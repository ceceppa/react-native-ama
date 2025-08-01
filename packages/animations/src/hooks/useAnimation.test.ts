import * as AMAProvider from '@react-native-ama/core';
import { renderHook } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { useAnimation } from './useAnimation';

beforeEach(() => {
  jest.clearAllMocks();
});

let timing = jest.spyOn(Animated, 'timing');

describe('useAnimation', () => {
  describe('Given isReduceMotionEnabled is false', () => {
    beforeEach(() => {
      jest.spyOn(AMAProvider, 'useAMAContext').mockReturnValue({
        ...amaContextValues,
        isReduceMotionEnabled: false,
      } as any);
    });

    it('Then plays only the main timing', () => {
      const { result } = renderHook(() =>
        useAnimation({
          duration: 300,
          useNativeDriver: false,
          from: {
            left: 0,
            opacity: 0,
          },
          to: {
            left: 100,
            opacity: 1,
          },
        }),
      );

      result.current.play();

      expect(timing).toHaveBeenCalledTimes(1);
      expect(timing).toHaveBeenCalledWith(expect.any(Animated.Value), {
        duration: 300,
        toValue: 1,
        useNativeDriver: false,
      });
    });
  });

  describe('Given isReduceMotionEnabled is true', () => {
    beforeEach(() => {
      jest.spyOn(AMAProvider, 'useAMAContext').mockReturnValue({
        ...amaContextValues,
        isReduceMotionEnabled: true,
      } as any);
    });

    it('Then plays the reduceMotion and the main progress', () => {
      const { result } = renderHook(() =>
        useAnimation({
          duration: 300,
          useNativeDriver: false,
          from: {
            left: 0,
            opacity: 0,
          },
          to: {
            left: 100,
            opacity: 1,
          },
        }),
      );

      result.current.play();

      expect(timing).toHaveBeenCalledTimes(2);
      expect(timing).toHaveBeenNthCalledWith(1, expect.any(Animated.Value), {
        duration: 0,
        toValue: 1,
        useNativeDriver: false,
      });
      expect(timing).toHaveBeenNthCalledWith(2, expect.any(Animated.Value), {
        duration: 300,
        toValue: 1,
        useNativeDriver: false,
      });
    });

    it('Then plays the main progress with duration 0 when is a motion-only animation', () => {
      const { result } = renderHook(() =>
        useAnimation({
          duration: 300,
          useNativeDriver: false,
          from: {
            left: 0,
          },
          to: {
            left: 100,
          },
        }),
      );

      result.current.play();

      expect(timing).toHaveBeenCalledTimes(2);
      expect(timing).toHaveBeenNthCalledWith(1, expect.any(Animated.Value), {
        duration: 0,
        toValue: 1,
        useNativeDriver: false,
      });
      expect(timing).toHaveBeenNthCalledWith(2, expect.any(Animated.Value), {
        duration: 0,
        toValue: 1,
        useNativeDriver: false,
      });
    });

    it('Then plays the main progress with duration 0 when skipIfReduceMotionEnabled is set to true', () => {
      const { result } = renderHook(() =>
        useAnimation({
          duration: 300,
          useNativeDriver: false,
          skipIfReduceMotionEnabled: true,
          from: {
            opacity: 0,
          },
          to: {
            opacity: 100,
          },
        }),
      );

      result.current.play();

      expect(timing).toHaveBeenCalledTimes(2);
      expect(timing).toHaveBeenNthCalledWith(1, expect.any(Animated.Value), {
        duration: 0,
        toValue: 1,
        useNativeDriver: false,
      });
      expect(timing).toHaveBeenNthCalledWith(2, expect.any(Animated.Value), {
        duration: 0,
        toValue: 1,
        useNativeDriver: false,
      });
    });
  });
});

const amaContextValues = {
  isReduceTransparencyEnabled: false,
  isBoldTextEnabled: false,
  isGrayscaleEnabled: false,
  isInvertColorsEnabled: false,
  isReduceMotionEnabled: false,
  isScreenReaderEnabled: false,
  reactNavigationScreenOptions: {
    animationEnabled: true,
    animation: 'default',
  },
};

jest.mock('@react-native-ama/core');
