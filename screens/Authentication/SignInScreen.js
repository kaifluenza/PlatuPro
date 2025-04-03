import { StyleSheet, View, Text, TextInput, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../../firebase";

const SignInScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleSignIn = async () => {
        //input validation
        if(!email.trim() || !password.trim()){
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        setLoading(true);

        try{
            await signInWithEmailAndPassword(auth,email,password);
            console.log("Signed-in sucessfully.");

        }catch(error){
            console.error("Sign-in error", error);
            Alert.alert("Sign-in Failed", getFriendlyErrorMessage(error.code));
        }finally{
            setLoading(false);
        }
    };

    //map firbase errors to user-friendly messages
    const getFriendlyErrorMessage = (errorCode) => {
        switch (errorCode) {
            case "auth/invalid-email":
                return "Invalid email format. Please enter a valid email.";
            case "auth/user-not-found":
                return "No account found with this email.";
            case "auth/wrong-password":
                return "Incorrect password. Please try again.";
            case "auth/too-many-requests":
                return "Too many failed attempts. Try again later.";
            case "auth/network-request-failed":
                return "Network error. Please check your internet connection.";
            default:
                return "An unexpected error occurred. Please try again.";
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Platu Pro</Text>

            <View style={styles.inputBox}>
                <TextInput
                    style={styles.inputText}
                    placeholder="Email"
                    value={email}
                    onChangeText={(text)=>setEmail(text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
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
                <TouchableOpacity onPress={()=>handleSignIn()} style={styles.signInBtn} disabled={loading}>
                    { loading ? (
                        <ActivityIndicator size="small" color="#3E3C3B"/>
                    ) : (
                        <Text style={styles.signInBtnText}>Sign In</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.signup}>
                <Text style={styles.signUpText}>No Account? </Text> 
                <TouchableOpacity onPress={()=> navigation.navigate('SignUp')}>
                    <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
            </View>
            
        </View>
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#fac596",
        alignItems:"center",
        justifyContent:"center",
    },
    title:{
       fontFamily:"Poppins-Bold",
        fontSize:40,
        color: "#F9F3EE",
        marginBottom:35,
    },
    inputBox:{
        width:"80%",
        height:50,
        borderRadius:25,
        marginBottom:20,
        justifyContent:"center",
        padding:20,
        borderRadius: 12, // Rounded corners for smooth feel
        borderWidth: 1.5, // Subtle border
        borderColor: "#E3B590", // Soft pastel border (slightly darker than background)
        backgroundColor: "#fce2c7", // Soft pastel background (lighter than screen)
    },
    inputText:{
        height:40,
        color: "#5A5A5A", // Darker gray for better contrast
        fontSize: 16,
        fontFamily:"Poppins-Regular",
    },
    signInBtn:{
        backgroundColor:"#EE744F",
        padding:10,
        borderRadius:10,
    },
    signInBtnText:{
        color:"#F9F3EE",
        fontFamily:"Poppins-Bold",
        fontSize:18,
    },
    signup:{
        margin:30,
        flexDirection:'row',
    },
    signUpText:{
        fontWeight:"300",
        fontSize:18,
        fontFamily:"Poppins-Regular",
        color:"#676666",
        marginBottom:20,
    },
    signUpLink:{
        fontFamily:"Poppins-Regular",
        fontWeight:"300",
        fontSize:18,
        color:"#EE744F",
        marginBottom:20,
        textDecorationLine:"underline",
    },
}); 

export default SignInScreen;