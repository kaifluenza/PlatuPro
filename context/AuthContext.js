import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut} from "firebase/auth";
import { auth } from "../firebase";
import SplashScreen from "../screens/Authentication/SplashScreen";

//create the Auth context
const AuthContext = createContext();

//auth provider component
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, (currentUser)=>{
            setUser(currentUser);
            setLoading(false); 
        });

        return () => unsubscribe(); //cleanup listener
    },[]);

    const logout = async () => {
        await signOut(auth);
    };


    return(
        <AuthContext.Provider value={{user,setUser}}>
            {loading ? <SplashScreen/> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

