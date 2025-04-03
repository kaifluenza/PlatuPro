import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut} from "firebase/auth";
import { auth } from "../firebase";
import SplashScreen from "../screens/Authentication/SplashScreen";
import { getFirestore, doc, getDoc } from "firebase/firestore";

//create the Auth context
const AuthContext = createContext();

//auth provider component
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const [restaurantId, setRestaurantId] = useState(null);
    const [name, setName] = useState(null);

    //function to check claims - retry for 10 secs before logging user out
    const checkClaims = async (currentUser) => {
        console.log("Checking user claims...");

        for(let i=0; i<6 ; i++){ //retry 6 times every 2 seconds
            const tokenResult = await currentUser.getIdTokenResult(true);
            const claims = tokenResult.claims;

            
            if(claims?.role && claims?.restaurantId){
                setRole(claims.role);
                setRestaurantId(claims.restaurantId);
                console.log("✅ Custom claims successfully retrieved:", claims);
                return; //exit if claims exist
            }
            console.warn("Custom claims not found. Retrying in 2 seconds...");
            await new Promise(resolve=> setTimeout(resolve, 2000));
        }

        console.log("Custom claims not found after retries. Signing out...");
        logout();
    }

    //function to fetch user's details from firestore
    const fetchUserDetails = async (uid) => {
        const db = getFirestore();
        try{
            console.log("Fetching user details for:", uid);

            const userDocRef = doc(db, "users", uid);
            const userSnapShot = await getDoc(userDocRef);

            if(userSnapShot.exists()){
                const userData = userSnapShot.data();
                console.log("Firestore user data:", userData);
                setName(userData.name || "No Name Found");
            }else{
                console.warn("Nor user document found in firestore");
                setName(null);
            }

        }catch(error){
            console.error("Error fetchign user details:", error);
            setName(null);
        }
    }

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, async (currentUser)=>{
            if(currentUser){
                await checkClaims(currentUser);
                await fetchUserDetails(currentUser.uid);
                setUser(currentUser);
            }else{
                setUser(null);
                setRole(null);
                setRestaurantId(null);
            }

            setLoading(false); 
        });

        return () => unsubscribe(); //cleanup listener on unmount
    },[]);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setRole(null);
        setRestaurantId(null);
        setLoading(false);
    };

    return(
        <AuthContext.Provider value={{user,name,role,restaurantId,logout}}>
            {loading ? <SplashScreen/> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

