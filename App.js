import * as React from 'react';
import { View, Text} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';


const Stack = createNativeStackNavigator();


const RootStack = () => {
  return (
    <Stack.Navigator initialRouteName='Home'>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
      />

      <Stack.Screen name="Manage Inventory" component={ManageInventoryScreen}/>
    </Stack.Navigator>
  );
};


const App = () => {
  return (
    <NavigationContainer>
      <RootStack/>
    </NavigationContainer>
  );
};

export default App;

