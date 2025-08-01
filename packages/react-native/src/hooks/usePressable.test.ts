import * as UseChecks from '@react-native-ama/core/src/hooks/useChecks';
import { ERROR_STYLE } from '@react-native-ama/internal';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePressable } from './usePressable';

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('usePressable', () => {
  describe('accessibilityState', () => {
    it.each`
      state         | value
      ${'disabled'} | ${true}
      ${'busy'}     | ${true}
      ${'expanded'} | ${true}
      ${'selected'} | ${true}
    `('handles the accessibilityState prop $state', ({ state, value }) => {
      const stateProp: Record<string, any> = {};
      stateProp[state] = value;

      const { result } = renderHook(() =>
        usePressable<any>(
          {
            accessibilityRole: 'button',
            accessibilityLabel: 'Label here',
            ...stateProp,
          },
          null,
        ),
      );

      expect(result.current.accessibilityState).toEqual(stateProp);
    });
  });

  describe('checks', () => {
    let noUndefinedProperty: jest.Mock;
    let contrastChecker: jest.Mock;
    let checkMinimumSize: jest.Mock;
    let accessibilityLabelChecker: jest.Mock;
    let uppercaseChecker: jest.Mock;

    beforeEach(function () {
      noUndefinedProperty = jest.fn();
      contrastChecker = jest.fn();
      checkMinimumSize = jest.fn();
      accessibilityLabelChecker = jest.fn();
      uppercaseChecker = jest.fn();

      // @ts-ignore
      jest.spyOn(UseChecks, 'useChecks').mockReturnValue({
        noUndefinedProperty,
        contrastChecker,
        checkMinimumSize,
        noUppercaseStringChecker: accessibilityLabelChecker,
        uppercaseChecker,
      } as any);
    });

    it('checks that the "accessibilityRole" property is not UNDEFINED', () => {
      renderHook(() => usePressable({}, null));

      expect(noUndefinedProperty).toHaveBeenCalledWith({
        properties: {
          accessibilityRole: undefined,
          accessibilityState: {},
        },
        property: 'accessibilityRole',
        rule: 'NO_ACCESSIBILITY_ROLE',
      });
    });

    it('checks that the "accessibilityLabel" property is not UNDEFINED', () => {
      renderHook(() => usePressable({}, null));

      expect(noUndefinedProperty).toHaveBeenCalledWith({
        properties: {
          accessibilityRole: undefined,
          accessibilityState: {},
        },
        property: 'accessibilityLabel',
        rule: 'NO_ACCESSIBILITY_LABEL',
      });
    });

    it('performs a check on the accessibility label', () => {
      renderHook(() =>
        usePressable<any>(
          {
            accessibilityLabel: 'This is the accessibility label',
            accessibilityHint: 'This is the hint',
          },
          null,
        ),
      );

      expect(accessibilityLabelChecker).toHaveBeenCalledWith({
        text: 'This is the accessibility label',
      });
    });
  });

  describe('style', () => {
    beforeEach(function () {
      jest.spyOn(console, 'info').mockImplementation(() => {});
    });

    it('applies the error style if the accessibilityRole is undefined', () => {
      const { result } = renderHook(() =>
        usePressable<any>({
          accessibilityLabel: 'This is the accessibility label',
          style: {
            color: 'yellow',
          },
        }),
      );

      expect(result.current.style).toMatchObject({
        color: 'yellow',
        ...ERROR_STYLE,
      });
    });

    it('applies the error style if the accessibilityLabel is undefined', () => {
      const { result } = renderHook(() =>
        usePressable<any>({
          accessibilityRole: 'button',
          style: {
            color: 'yellow',
          },
        }),
      );

      expect(result.current.style).toMatchObject({
        color: 'yellow',
        ...ERROR_STYLE,
      });
    });

    it('applies the error style if the accessibilityLabel check fails', () => {
      const { result } = renderHook(() =>
        usePressable<any>({
          accessibilityLabel: 'ALL UPPERCASE IS NO GOOD',
          style: {
            color: 'yellow',
          },
        }),
      );

      expect(result.current.style).toMatchObject({
        color: 'yellow',
        ...ERROR_STYLE,
      });
    });

    it('applies the error style if the minimum size layout check fails', async () => {
      const { result } = renderHook(() =>
        usePressable<any>({
          accessibilityRole: 'button',
          accessibilityLabel: 'This is valid',
          style: {
            color: 'brown',
          },
        }),
      );

      expect(result.current.style).toMatchObject({
        color: 'brown',
      });

      act(() => {
        result.current.onLayout?.({
          nativeEvent: { layout: { width: 20, height: 20 } },
        } as any);
      });

      await waitFor(() =>
        expect(result.current.style).toMatchObject({
          color: 'brown',
          ...ERROR_STYLE,
        }),
      );
    });
  });
});
