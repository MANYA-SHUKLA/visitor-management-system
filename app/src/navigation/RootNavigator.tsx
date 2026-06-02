import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BootstrapScreen from '../screens/BootstrapScreen';
import LoginScreen from '../screens/LoginScreen';
import GuardNavigator from './GuardNavigator';
import ResidentNavigator from './ResidentNavigator';
import AdminNavigator from './AdminNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Bootstrap" component={BootstrapScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Guard" component={GuardNavigator} />
        <Stack.Screen name="Resident" component={ResidentNavigator} />
        <Stack.Screen name="Admin" component={AdminNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
