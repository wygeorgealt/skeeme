import { createContext, useCallback, useContext, type PropsWithChildren } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export type PrimaryTabRoute = 'index' | 'library' | 'profile';
type ScrollUpdateHandler = (route: PrimaryTabRoute, isScrolled: boolean) => void;

const TabBarScrollContext = createContext<ScrollUpdateHandler | null>(null);

interface TabBarScrollProviderProps extends PropsWithChildren {
    onScrollChange: ScrollUpdateHandler;
}

export function TabBarScrollProvider({
    children,
    onScrollChange,
}: TabBarScrollProviderProps) {
    return (
        <TabBarScrollContext.Provider value={onScrollChange}>
            {children}
        </TabBarScrollContext.Provider>
    );
}

export function useTabBarScroll(route: PrimaryTabRoute) {
    const reportScroll = useContext(TabBarScrollContext);
    if (!reportScroll) {
        throw new Error('useTabBarScroll must be used inside TabBarScrollProvider');
    }

    return useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            reportScroll(route, event.nativeEvent.contentOffset.y > 6);
        },
        [reportScroll, route],
    );
}
