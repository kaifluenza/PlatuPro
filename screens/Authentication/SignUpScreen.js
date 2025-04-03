//automatically assign manager role?
import { 
    StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard
} from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import SplashScreen from "./SplashScreen";

const SignUpScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [resName, setResName] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");

    
    const handleSignUp = async () => {
        if (!email.trim() || !password.trim() || !name.trim() || !resName.trim()) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        //validate email 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            setEmailError("Please enter a valid email address.");
            return;
        }else{
            setEmailError(""); //clear error if valid
        }

       
        setLoading(true); //show splash screen while signing up

        try{
            //step 1 : create user in firebase Auth
            console.log("Creating user...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            const restaurantId = userId; //the manager owns the restaurant
            console.log("✅ User ID: ", userId);
            console.log("✅ Restaurant ID: ", restaurantId);


            //step 2 : allow new users to create their firestore user doc
            console.log("Creating user document in firestore.");
            const db = getFirestore();
            await setDoc(doc(db, "users", userId),{
                name:name,
                email:email,
                role:"pending",  //temporary role
                restaurantId:restaurantId,
            })
            console.log("✅ User document created in firestore.");

            
            //step 3 : initialize restaurant collections (as a pending manager)
            console.log("Creating all restaurant collections");
            await createRestaurantCollections(restaurantId, resName);
            

            //step 4 : call Cloud Function to assign manager role (custom claim)
            const userData = {
                userId,
                name,
                email,
                role: "manager",
                restaurantId
            };
            console.log("📤 Sending to setUserRole:", userData);
            const setUserRole = httpsCallable(getFunctions(), "setUserRole");
            await setUserRole(userData);

            //step 5 : delay to allow firebase to process custom claims
            console.log("Waiting for firebase to update custom claims...");
            await new Promise((resolve)=>setTimeout(resolve,2000)); //wait 1 second
            if (auth.currentUser) {
                await auth.currentUser.getIdToken(true); // Force refresh token
            } else {
                console.error("Error: No authenticated user found.");
                return;
            }

 
            //step 6 : fetch the lastest token result and confirm role is assigned
            const tokenResult = await auth.currentUser.getIdTokenResult();
            console.log("Checking custom claims...", tokenResult.claims);
            if(!tokenResult.claims.role || !tokenResult.claims.restaurantId){
                console.error("Custom claims not set. Signing out...");
                return logout();
            }

            console.log("✅ Custom claims confirmed: ", tokenResult.claims);

          
            //step 7 : update firestore user doc with correct role
            await setDoc(doc(db, "users", userId), { role: "manager" }, { merge: true });
            console.log("✅ Firestore user role updated.");


            console.log("✅ Sign-up complete! The app will now automatically switch to the correct screen.");
        }catch(error){
            console.error("Error during sign-up: ", error.message);
            Alert.alert("Sign-Up Failed", error.message);
        }finally{
            setLoading(false);
        }
    }
    
    
    //function to create restaurant collections
    const createRestaurantCollections = async (restaurantId, resName) => {
        try{
            const db = getFirestore();

            console.log("Starting restaurant collections creation...")
            
            //create restaurant document
            const restaurantDoc = setDoc(doc(db,`restaurants/${restaurantId}`),{
                ownerId: restaurantId,
                ownerName: name,
                restaurantName: resName,
                createdAt: new Date(),
            });
            console.log("✅ Restaurant document created.");

            //inventory collection : prepopulated
            const inventoryDoc =  setDoc(doc(db, `restaurants/${restaurantId}/inventory/server_inventory`),{
                "Soft Drinks" : ["Coke", "Diet Coke", "Coke Zero", "Sprite", "Iced Tea", "Sweet Tea"],
                "Beer": ["Sapporo", "Singha"],
                "Cleaning Supplies" : ["Hand Soap", "Multifold Hand Towels", "Disinfectant Spray", "Windex", "Toilet Bowl Cleaner"],
                "Misc" : ["Thai Tea", "Green Tea", "Silken Tofu", "Straws"],
                "To-Go's" : ["Paper Bags (Small)", "Paper Bags (Large)"],
            });

            //supply requests collection : prepopulated 
            const supplyRequestsDoc = setDoc(doc(db, `restaurants/${restaurantId}/supply_requests/server_requests`), {
                "Soft Drinks": ["Coke", "Sprite"],
                "Beer": ["Sapporo", "Singha"],
            });
            
            //posts collection 
            const postsDoc = setDoc(doc(db,`restaurants/${restaurantId}/posts/welcome_post`),{
                title:`Welcome to ${resName}'s Dashboard!`,
                content:"This is your first post. You can use this section to post announcements.",
                createdAt: new Date(),
                createdBy: "Platu Pro",
                restaurantId: restaurantId,
            });
           
            //wait for ALL writes to finish before moving on
            await Promise.all([restaurantDoc, inventoryDoc, supplyRequestsDoc, postsDoc]);

            
            console.log("✅ ALL restaurant collections successfully created.");
        }catch(error){
            console.log("Error creating restaurant collections", error.message);
            throw error; 
        }
    }

    if (loading) {
        return <SplashScreen message="Creating your account... Please wait." />;
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS==="ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Sign Up</Text>

                    <View style={styles.row}>
                        <Text style={styles.subTitle}>Create an account or </Text> 

                        <TouchableOpacity onPress={()=> navigation.navigate('SignIn')}>
                            <Text style={styles.subTitle2}>Sign In</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Name"
                            value={name}
                            onChangeText={(text)=>setName(text)}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputBox}>
                        <TextInput
                        style={styles.inputText}
                        placeholder="Restaurant Name"
                        value={resName}
                        onChangeText={(text)=>setResName(text)}
                    />
                    </View>

                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Email"
                            value={email}
                            onChangeText={(text)=>{
                                setEmail(text)
                                setEmailError(""); //clear error when user starts typing again
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                    </View>

                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={(text)=>setPassword(text)}
                        />
                    </View>


                    <View style={{padding:20}}>
                        <TouchableOpacity style={styles.signUpBtn} onPress={()=>handleSignUp()}>
                            <Text style={styles.signUpBtnText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: "#FAC590",
    },
    scrollContainer:{
        flexGrow:1,
        justifyContent:"center",
        alignItems:"center",
        padding:20,
        paddingBottom:50,
    },
    innerContainer:{
        width:"100%",
        alignItems:"center",
        justifyContent:"center",
    },
    row:{
        flexDirection:"row",
        marginBottom:20,
    },
    title:{
        fontFamily:"Poppins-Bold",
        fontSize:35,
        color:"white",
        marginBottom:20,
    },
    subTitle:{
        fontFamily:"Poppins-Regular",
        fontSize:18,
        fontWeight:"400",
        color:"#676666",
    },
    subTitle2:{
        fontFamily:"Poppins-Regular",
        fontWeight:"500",
        fontSize:18,
        color:"#EE744F",
        marginBottom:10,
        textDecorationLine:"underline",
    },
    inputBox:{
        width:"85%",
        height:45,
        backgroundColor: "#FCE2C7",
        borderRadius:15,
        borderWidth: 1,
        borderColor: "#E3B590",
        paddingHorizontal: 15,
        marginBottom:20,
        justifyContent:"center",
        elevation: 2, // Subtle shadow for input box
        
    },
    inputText:{
        fontFamily:"Poppins-Regular",
        height:40,
        color:"gray",
        fontSize: 16,
        color: "#5A5A5A",
    },
    errorText:{
        fontFamily:"Poppins-Regular",
        color:"red",
        fontSize:14,
        textAlign:"left",
    },
    signUpBtn:{
        backgroundColor:"#FB9546",
        padding:10,
        borderRadius:8,
    },
    signUpBtnText:{
        fontFamily:"Poppins-Bold",
        color:"white",
        fontSize:18,
    },
    

});

export default SignUpScreen;