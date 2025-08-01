import React from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { useDynamicList } from '../hooks/useDynamicList';

type DynamicFlatListProps<T> = FlatListProps<T> & {
  singularMessage: string;
  pluralMessage: string;
  isPlural?: (count: number) => boolean;
};

export const DynamicFlatList = React.forwardRef<
  FlatList,
  DynamicFlatListProps<any>
>(
  (
    { data, singularMessage, pluralMessage, isPlural, ...rest },
    forwardedRef,
  ) => {
    const dynamicList = useDynamicList({
      data: data ?? [],
      pluralMessage,
      singularMessage,
      numColumns: rest.numColumns,
      isPlural,
    });

    return __DEV__ ? (
      <FlatList
        data={data}
        {...rest}
        ref={forwardedRef}
        style={dynamicList.style}
      />
    ) : (
      <FlatList data={data} {...rest} ref={forwardedRef} />
    );
  },
);
