import { requireNativeView } from 'expo';
import * as React from 'react';
import { ReactNativeAmaViewProps } from './ReactNativeAma.types';

const NativeView: React.ComponentType = requireNativeView('ReactNativeAma');

export default function ReactNativeAmaView(props: ReactNativeAmaViewProps) {
  return <NativeView {...props} />;
}
