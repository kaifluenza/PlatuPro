import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStaticNavigation } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import ManageInventoryScreen from './screens/ManageInventoryScreen';
import RestockingScreen from './screens/RestockingScreen';
import AnnouncemenceScreen from './screens/AnnouncemenceScreen';

const RootStack = createNativeStackNavigator({
  initialRouteName:'Home',
  screens:{
    Home:HomeScreen,
    Inventory:ManageInventoryScreen,
    Restocking:RestockingScreen,
    Announcemence:AnnouncemenceScreen,
  },
});

const Navigation = createStaticNavigation(RootStack);


const App = () => {
  return <Navigation/>
};

export default App;

