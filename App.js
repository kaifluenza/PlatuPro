import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SafeAreaProvider, useSafeAreaFrame } from 'react-native-safe-area-context';

import SignInScreen from "./screens/Authentication/SignInScreen";
import SignUpScreen from './screens/Authentication/SignUpScreen';
import SplashPage from './screens/Authentication/SplashScreen';

import HomeScreen from './screens/Manager/HomeScreen';
import ManageInventoryScreen from './screens/Manager/ManageInventoryScreen';
import ManageEmployeeScreen from './screens/Manager/ManageEmployeeScreen';
import RequestScreen from "./screens/Manager/RequestsScreen";
import MoreScreen from './screens/Manager/MoreScreen';

import EmployeeDashboardScreen from './screens/Server/EmployeeDashboardScreen';
import RestockingScreen from './screens/Server/RestockingScreen';

// import AssistantHomeScreen from './screens/AssistantManager/AssistantHomeScreen';

import AccountScreen from './screens/AccountScreen';
//import PostDetailsScreen from './screens/PostDetailssScreen';

import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useState, useEffect } from 'react';



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator(); 

function MoreStackScreen(){ //lets manager navigate to inventory and employee management 
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false}}>
      <MoreStack.Screen name="MoreOptions" component={MoreScreen} options={{ title: "More Options" }} />
      <MoreStack.Screen name="Inventory" component={ManageInventoryScreen} options={{ title: "Manage Inventory" }} />
      <MoreStack.Screen name="Employee" component={ManageEmployeeScreen} options={{ title: "Manage Employees" }} />
    </MoreStack.Navigator>
  );
}

function ManagerTabs() { //manager bottom tabs (nav bar)
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} 
        options={{
          tabBarIcon:({color,size})=> <Ionicons name="home" size={size} color={color}/>
        }}
      />
      <Tab.Screen name="Requests" component={RequestScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="tasks" size={size} color={color} />,
        }} 
      />
      <Tab.Screen name="More" component={MoreStackScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}


function AssistantTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} 
        options={{
          tabBarIcon:({color,size})=> <Ionicons name="home" size={size} color={color}/>
        }}/>
      <Tab.Screen name="Requests" component={RequestScreen}  options={{
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="tasks" size={size} color={color} />,
        }} />
      <Tab.Screen name="Inventory" component={ManageInventoryScreen} options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="inventory" size={size} color={color} />,
        }}/>
    </Tab.Navigator>
  );
}

function ServerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={EmployeeDashboardScreen} options={{
          tabBarIcon:({color,size})=> <Ionicons name="home" size={size} color={color}/>
        }} />
      <Tab.Screen name="Restock" component={RestockingScreen} options={{
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="tasks" size={size} color={color} />,
        }} />
      <Tab.Screen  name="Account" component={AccountScreen} options={{
       tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color}/>,
      }} />
    </Tab.Navigator>
  );
}


function RootStack(){
  const { user, role } = useAuth();  //get authentication states

  return(
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        role === "manager" ? (
          <>
            <Stack.Screen name="ManagerTabs" component={ManagerTabs} options={{ headerShown: false, title:"" }} />
            <Stack.Screen name="Account" component={AccountScreen} options={{ headerShown: true, title: "My Account" }} />
            {/* <Stack.Screen name='PostDetails' component={PostDetailsScreen} options={{ headerShown: true, title: "Post Details" }} /> */}
          </>
          ) : role === "assistant_manager" ? (
          <>
              <Stack.Screen name="AssistantTabs" component={AssistantTabs} options={{ headerShown: false, title: "" }} />
              <Stack.Screen name="Account" component={AccountScreen} options={{ headerShown: true, title: "My Account" }}/>
              {/* <Stack.Screen name='PostDetails' component={PostDetailsScreen}/> */}
          </>
          ) : (
          <>
              <Stack.Screen name="ServerTabs" component={ServerTabs} options={{ headerShown: false, title: "" }} />
              <Stack.Screen name="Account" component={AccountScreen} options={{ headerShown: true, title: "My Account" }}/>
              {/* <Stack.Screen name='PostDetails' component={PostDetailsScreen}/> */}
          </>
          )
        ) : (
        <>
          <Stack.Screen name='SignIn' component={SignInScreen} />
          <Stack.Screen name='SignUp' component={SignUpScreen} />
          <Stack.Screen name='SplashScreen' component={SplashPage}/>
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App(){
  //for custom font
  const [fontsLoaded] = useFonts({
    "Poppins-Regular":require("./assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold":require("./assets/fonts/Poppins-Bold.ttf"),
  });

  const [appReady, setAppReady] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    if(fontsLoaded){
      await SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [fontsLoaded]);

  useEffect(()=>{
    SplashScreen.preventAutoHideAsync();
    if(fontsLoaded){
      onLayoutRootView();
    }
  },[fontsLoaded]);

  // Let native splash stay while loading
  if (!fontsLoaded || !appReady) {
    return null;
  }


  return(
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootStack/>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

