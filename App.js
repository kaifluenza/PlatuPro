import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';

import SignInScreen from "./screens/Authentication/SignInScreen";
import SignUpScreen from './screens/Authentication/SignUpScreen';
import SplashScreen from './screens/Authentication/SplashScreen';
import HomeScreen from './screens/Manager/HomeScreen';
import ManageInventoryScreen from './screens/Manager/ManageInventoryScreen';
import ManageEmployeeScreen from './screens/Manager/ManageEmployeeScreen';
import RequestScreen from "./screens/Manager/RequestsScreen";
import AnnouncemenceScreen from './screens/Manager/AnnouncemenceScreen';
import EmployeeDashboardScreen from './screens/Server/EmployeeDashboardScreen';
import RestockingScreen from './screens/Server/RestockingScreen';
import AnnouncementBoardScreen from './screens/Server/AnnouncementBoardScreen';
import AssistantHomeScreen from './screens/AssistantManager/AssistantHomeScreen';

const Stack = createNativeStackNavigator();


function RootStack(){
  const { user, role } = useAuth();  //get authentication states

  return(
    <Stack.Navigator>
      {user ? (
        role === "manager" ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen}/>
            <Stack.Screen name='Inventory' component={ManageInventoryScreen}/>
            <Stack.Screen name='Requests' component={RequestScreen}/>
            <Stack.Screen name='Announcemence' component={AnnouncemenceScreen}/>
            <Stack.Screen name='Employee' component={ManageEmployeeScreen}/>
          </>
          ) : role === "assistant_manager" ? (
          <>
            <Stack.Screen name="Home" component={AssistantHomeScreen}/>
            <Stack.Screen name='Inventory' component={ManageInventoryScreen}/>
            <Stack.Screen name='Requests' component={RequestScreen}/>
            <Stack.Screen name='Announcemence' component={AnnouncemenceScreen}/>
          </>
          ) : (
          <>
            <Stack.Screen name='Dashboard' component={EmployeeDashboardScreen}/>
            <Stack.Screen name='Restocking' component={RestockingScreen}/>
            <Stack.Screen name='Announcements' component={AnnouncementBoardScreen}/>
          </> 
          )
        ) : (
        <>
          <Stack.Screen name='SignIn' component={SignInScreen} />
          <Stack.Screen name='SignUp' component={SignUpScreen} />
          <Stack.Screen name='SplashScreen' component={SplashScreen}/>
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App(){
  return(
    <AuthProvider>
      <NavigationContainer>
        <RootStack/>
      </NavigationContainer>
    </AuthProvider>
  );
}

