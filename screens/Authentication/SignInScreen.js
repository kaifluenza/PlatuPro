import { StyleSheet, View, Text, Button, TextInput, Alert } from "react-native";
import { useState } from "react";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../../firebase";

const SignInScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleSignIn = async () => {
        try{
            await signInWithEmailAndPassword(auth,email,password);
            console.log("Signed-in sucessfully.");
        }catch(error){
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Platu Pro</Text>

            <View style={styles.inputBox}>
                <TextInput
                    style={styles.inputText}
                    placeholder="username"
                    value={email}
                    onChangeText={(text)=>setEmail(text)}
                />
            </View>

            <View style={styles.inputBox}>
                <TextInput
                    style={styles.inputText}
                    placeholder="password"
                    secureTextEntry
                    value={password}
                    onChangeText={(text)=>setPassword(text)}
                />
            </View>

            <Button 
                title="Sign In" 
                onPress={handleSignIn}
            />



            <View style={styles.signup}>
                <Button 
                    color="gray"
                    title="No Account? Sign Up"
                    onPress={()=>{
                        Alert.alert("In-app sign-up is coming soon. Please contact Kai for assistance.");
                    }} 
                />
            </View>
            
        </View>
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        backGroundColor:"#fac596",
        alignItems:"center",
        justifyContent:"center",
    },
    title:{
        fontWeight:"bold",
        fontSize:40,
        color:"#676666",
        marginBottom:40,
    },
    inputBox:{
        width:"80%",
        height:50,
        backGroundColor:"",
        borderRadius:25,
        marginBottom:20,
        justifyContent:"center",
        padding:20,
    },
    inputText:{
        height:40,
        color:"gray"
    },
    signup:{
        margin:40,
    },

});

export default SignInScreen;