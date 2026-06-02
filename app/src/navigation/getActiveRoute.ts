import type { NavigationState, PartialState } from '@react-navigation/native';

export function getActiveRouteName(
  state: NavigationState | PartialState<NavigationState> | undefined
): string {
  if (!state || state.index === undefined) return '';
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state as NavigationState);
  }
  return route.name;
}
