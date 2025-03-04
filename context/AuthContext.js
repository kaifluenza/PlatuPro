import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut} from "firebase/auth";
import { auth } from "../firebase";
import SplashScreen from "../screens/Authentication/SplashScreen";
import { doc, getDoc, getFirestore } from "firebase/firestore";

//create the Auth context
const AuthContext = createContext();

//auth provider component
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const db = getFirestore();

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, async (currentUser)=>{
            if(currentUser){
                try {
                    const userRef = doc(db, "users", currentUser.uid);
                    const userSnap = await getDoc(userRef);
                    const userRole = userSnap.exists() ? userSnap.data().role : "server";

                    setUser(currentUser);
                    setRole(userRole);
                } catch (error) {
                    console.error("Error fetching role:", error);
                    setRole("server"); // Default role
                }
            }else{
                setUser(null);
                setRole(null);
            }
            setLoading(false); 
        });

        return () => unsubscribe(); //cleanup listener
    },[db]);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setRole(null);
        setLoading(false);
    };

    return(
        <AuthContext.Provider value={{user,role, logout}}>
            {loading ? <SplashScreen/> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

