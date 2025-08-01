import {
  checkAccessibilityRole as checkAccessibilityRoleImplementation,
  checkFocusTrap as checkFocusTrapImplementation,
  checkForAccessibilityState,
  checkMinimumSize as checkMinimumSizeImplementation,
  contrastChecker as contrastCheckerImplementation,
  ERROR_STYLE,
  getRuleAction,
  logFailure,
  LogParams,
  noUndefinedProperty as noUndefinedPropertyImplementation,
  uppercaseStringChecker as noUppercaseStringCheckerImplementation,
  uppercaseChecker as uppercaseCheckerImplementation,
  type CheckFocusTrap,
  type CheckForAccessibilityState,
  type ContrastChecker,
  type NoUndefinedProperty,
  type UppercaseChecker,
  type UppercaseStringChecker,
} from '@react-native-ama/internal';
import * as React from 'react';
import {
  AccessibilityRole,
  InteractionManager,
  LayoutChangeEvent,
} from 'react-native';
import { isDevContextValue, useAMAContext } from '../components/AMAProvider';

export const useChecks = () => {
  const context = useAMAContext();

  if (!isDevContextValue(context)) {
    return null;
  }

  /**
   * Because the AMA Error view cannot be removed by default, this hacky solution
   * allows the dev to hide it if all the issues have been solved.
   */
  const fakeRandom = React.useRef('' + Date.now() + Math.random() * 42);
  const hasErrors = React.useRef(false);
  const failedTests = React.useRef<string[]>([]);
  const shouldCheckLayout = React.useRef(true);
  const layoutCheckTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [minimumSizeFailed, setMinimumSizeFailed] = React.useState(false);
  const [debugStyle, setDebugStyle] = React.useState<any>({});

  const { trackError, removeError } = context;

  const logResult = (
    name: string,
    result: LogParams | LogParams[] | null,
  ): Record<string, any> => {
    const index = failedTests.current.indexOf(name);

    if (result === null) {
      if (index >= 0 && hasErrors.current) {
        failedTests.current.splice(index);

        hasErrors.current = false;

        InteractionManager.runAfterInteractions(() => {
          removeError(fakeRandom.current);

          setTimeout(() => {
            setDebugStyle({});
          }, 100);
        });
      }
    }

    const results = Array.isArray(result) ? result : [result];

    results.forEach(logParam => {
      if (logParam === null) {
        return;
      }

      const action = getRuleAction?.(logParam.rule);
      const hasFailed = action === 'MUST_NOT' || action === 'MUST';

      if (index < 0) {
        // @ts-ignore
        logFailure?.({ action, ...logParam });
      }

      if (!hasFailed) {
        return;
      } else if (index >= 0) {
        return;
      }

      failedTests.current.push(name);

      InteractionManager.runAfterInteractions(() => {
        trackError(fakeRandom.current);

        setDebugStyle(ERROR_STYLE);
      });

      hasErrors.current = true;
    });

    // @ts-ignore
    return hasErrors.current ? ERROR_STYLE : {};
  };

  const noUndefinedProperty = <T>(params: NoUndefinedProperty<T>) =>
    logResult(
      `noUndefinedProperty ${params.property as string}`,
      noUndefinedPropertyImplementation(params),
    );

  const contrastChecker = (params: ContrastChecker) =>
    logResult('contrastChecker', contrastCheckerImplementation(params));

  const checkMinimumSize = (params: LayoutChangeEvent) => {
    return logResult(
      'checkMinimumSize',
      checkMinimumSizeImplementation(params),
    );
  };

  const noUppercaseStringChecker = (params: UppercaseStringChecker) =>
    logResult(
      'accessibilityLabelChecker',
      noUppercaseStringCheckerImplementation(params),
    );

  const uppercaseChecker = (params: UppercaseChecker) =>
    logResult('uppercaseChecker', uppercaseCheckerImplementation(params));

  const checkFocusTrap = (params: CheckFocusTrap) => {
    checkFocusTrapImplementation(params).then(result => {
      logResult('checkFocusTrap', result);
    });
  };

  const checkAccessibilityRole = (param: AccessibilityRole) => {
    logResult(
      'checkAccessibilityRole',
      checkAccessibilityRoleImplementation(param),
    );
  };

  const checkCompatibleAccessibilityState = (props: Record<string, any>) => {
    const amaStates = ['checked', 'selected'];

    const params: CheckForAccessibilityState = {
      accessibilityRole: props.accessibilityRole,
      accessibilityState: props?.accessibilityState,
    };

    amaStates.forEach(amaState => {
      if (amaState in props) {
        // @ts-ignore
        params[amaState] = props[amaState];
      }
    });

    logResult(
      'checkCompatibleAccessibilityState',
      checkForAccessibilityState(params),
    );
  };

  const onLayout = (event: LayoutChangeEvent) => {
    /**
     * When the check fails there are situation when adding a border makes the
     * component meet the minimum size requirement, and this causes a loop as the
     * state is update continuously between true and false.
     * To "avoid" that we wait at least 100ms before checking the size again, as
     * this gives the dev time to hot-reload the changes.
     */
    if (!shouldCheckLayout.current) {
      return;
    }

    shouldCheckLayout.current = false;

    if (layoutCheckTimeout.current) {
      clearTimeout(layoutCheckTimeout.current);
    }

    layoutCheckTimeout.current = setTimeout(() => {
      shouldCheckLayout.current = true;
    }, 1000);

    const result = checkMinimumSize(event);

    setMinimumSizeFailed(Object.keys(result).length > 0);
  };

  return {
    logResult,
    noUndefinedProperty,
    contrastChecker,
    onLayout,
    noUppercaseStringChecker,
    uppercaseChecker,
    checkFocusTrap,
    minimumSizeFailed,
    checkCompatibleAccessibilityState,
    checkAccessibilityRole,
    debugStyle,
  };
};
