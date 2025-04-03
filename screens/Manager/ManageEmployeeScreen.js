import { useState, useEffect } from "react";
import { 
    View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, FlatList, SafeAreaView, KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { subscribeToEmployeeData } from "../../data/employeeData";
import { useAuth } from "../../context/AuthContext";  
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

const ManageEmployeeScreen = () => {
    const { restaurantId } = useAuth(); //get restaurantId from auth context
    
    //for displaying employees
    const [employees, setEmployees] = useState(new Map());
    const [showEmployees, setShowEmployees] = useState(false);

    //fetch employee  ONLY when user click view
    useEffect(()=>{
        if(!showEmployees || !restaurantId) return;
        console.log("Fetching employees for restaurantID: ", restaurantId);

        const unsubscribe = subscribeToEmployeeData(restaurantId, setEmployees);
        return () => unsubscribe(); //unsubscribe when hiding employees
    },[showEmployees, restaurantId]);

    //fields for adding employee
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [emailError, setEmailError] = useState(""); //track error message
    const [loading, setLoading] = useState(false);

    //for deleting employee
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    
    //for dropdown picker
    const [open, setOpen] = useState(false); 
    const [items, setItems] = useState([
        {label:"Server", value:"server"},
        {label:"Assistant Manager", value:"assistant_manager"}
    ]);

    //function to add employee
    const handleAddEmployee = async () => {
        //input validation
        if(!name || !email || !role){
            Alert.alert("Error", "Please fill in all fields before proceeding.");
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

        //get authenticated user
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            console.error("❌ No authenticated user found.");
            Alert.alert("Error", "You must be logged in to add an employee.");
            return;
        }
        //check claims in front end
        const tokenResult = await user.getIdTokenResult(); 
        if (tokenResult.claims.role !== "manager") {
            console.error("❌ Unauthorized: Only managers can add employees.");
            Alert.alert("Error", "You do not have permission to add employees.");
            return;
        }
        //pass raw token to backend too!
        const token = await user.getIdToken(); 

        //call Cloud Functions to create employee and set their role
        console.log("📌 Creating employee with details:", { name, email, role, restaurantId });

        const createEmployee = httpsCallable(getFunctions(), "createEmployee");
        const setUserRole = httpsCallable(getFunctions(), "setUserRole");
        const deleteUser = httpsCallable(getFunctions(), "deleteAuthUser");

        let userId = null; // Track created user ID

        try{
            setLoading(true);

            //call createEmployee to create the user
            const result = await createEmployee({ name, email, role, restaurantId });
    
            //if user created succesfully
            if(result.data?.success){
                userId = result.data.userId;
                console.log("✅ Employee created successfully. User ID: ", userId);

                //send email, if reset link was generated
                if (result.data.resetLink) {
                    console.log(`📩 Password reset link generated via Cloud Function. Sending email: ${email} `);
                    await sendPasswordResetEmail(auth, email);
                } else {
                    console.warn("⚠️ No reset link received. Falling back to frontend.");
                    throw new Error("Failed to generate password reset link. Please try again.");
                }

                //Assign role via cloud function
                const employeeData = {
                    userId,
                    name,
                    email,
                    role,
                    restaurantId,
                    token  //send token to backend for final verification
                };
                console.log("Setting custom claims (role) for: ", userId);
                await setUserRole(employeeData);
                console.log("✅ Custom claim successfully set!"); 
                
                //show success alert if employee was successfully created
                if(result.data?.success){
                    Alert.alert(`✅ ${name} added as ${role==="assistant_manager"? "Assistant Manager" : "Server"}.\nThey must check their email to reset password.`);
                    //reset fields
                    setName("");
                    setEmail("");
                    setRole(null);
                }
            }else{
                throw new Error(result.data?.message || "Employee creation failed.");
            }
        }catch(error){
            console.error("❌ Error adding employee:", error);
            Alert.alert("❌ Error", error.message || "Something went wrong while creating the employee.");
            // If the user was created but Firestore setup failed, delete them from Auth
            if (userId) {
                try {
                    console.warn(`🔥 Deleting incomplete user: ${userId}`);
                    await deleteUser({ userId });
                    console.log("✅ Incomplete user auth deleted successfully.");
                } catch (deleteError) {
                    console.error("⚠️ Failed to delete incomplete user:", deleteError);
                }
            }
        }finally{
            setLoading(false);
            setModalVisible(false);
        }

    }

    //helper function for deleting employee
    const handleCardPress = (empolyeeId) => {
        setSelectedEmployeeId(selectedEmployeeId === empolyeeId ? null : empolyeeId); //toggle selection
    };

    //convert employees map into flatlist-friendly array
    const processEmployeeData = (employees) => {
        return Array.from(employees.entries()).map(([role, employees])=>({
            role, 
            employees,
        }))
    };

    //function for render card
    const renderEmployeeCard = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.employeeCard}
                onPress={() => handleCardPress(item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.cardContent}>
                    {/* Left Side: Employee Info */}
                    <View>
                        <Text style={styles.employeeName}>{item.name}</Text>
                        <Text style={styles.employeeEmail}>{item.email}</Text>
                    </View>
    
                    {/* Right Side: Show delete button ONLY for selected card */}
                    {selectedEmployeeId === item.id && (
                        <TouchableOpacity onPress={() => handleDeleteEmployee(item)} style={styles.deleteButton}>
                            { loading? 
                                ( <ActivityIndicator size="small" color="#4F595C"/>) : 
                                ( <MaterialIcons name="delete" size={28} color="#F74A3D"/> )
                            }
                            
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };
    


    //function to delete employee
    const handleDeleteEmployee = async (employee) => {
        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to remove ${employee.name}'s account?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        // Check authentication
                        const auth = getAuth();
                        const user = auth.currentUser;
                        if (!user) {
                            console.error("❌ No authenticated user found.");
                            Alert.alert("Error", "You must be logged in to remove an employee.");
                            return;
                        }
                        // Check manager role
                        const tokenResult = await user.getIdTokenResult();
                        if (tokenResult.claims.role !== "manager") {
                            console.error("❌ Unauthorized: Only managers can remove employees.");
                            Alert.alert("Error", "You do not have permission to remove employees.");
                            return;
                        }
                        // Get token for backend verification
                        const token = await user.getIdToken();
                        
                        console.log(`Deleting employee: ${employee.name}..\n(Employee ID: ${employee.id})`);
                        const deleteEmployee = httpsCallable(getFunctions(), "deleteEmployee");
    
                        try {
                            setLoading(true);
                            // Call deleteEmployee function
                            const result = await deleteEmployee({ 
                                employeeId: employee.id, 
                                restaurantId, 
                                token 
                            });
    
                            if (!result.data?.success) {
                                throw new Error(result.data?.error || "❌ Employee deletion failed.");
                            }
                            console.log("✅ Employee deleted successfully.");
                            Alert.alert("Success", `${employee.name} has been removed.`);
    
                            // Update UI: Remove employee from state
                            setEmployees((prevEmployees) => {
                                const updatedMap = new Map(prevEmployees);
                                for (const [role, employeeList] of updatedMap) {
                                    updatedMap.set(role, employeeList.filter(emp => emp.id !== employee.id));
                                }
                                return updatedMap;
                            });
    
                            setSelectedEmployeeId(null); // Hide delete button after deletion
                        } catch (error) {
                            console.error("❌ Error deleting employee:", error);
                            Alert.alert("❌ Error", error.message || "Failed to remove employee.");
                        }finally{
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };
    
    

    return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <FlatList
                data={showEmployees ? processEmployeeData(employees) : []}
                keyExtractor={(item) => item.role}
                ListHeaderComponent={() => (
                    
                    <View style={styles.cardContainer}>
                        <Text style={styles.title}>Employee Management</Text>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Add a Platu "Pro" to your team!</Text>
                            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
                                <Text style={styles.buttonText}>+ Add Employee</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>See who your Pros are and their information.</Text>
                            <TouchableOpacity
                                style={[styles.button, { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 2 }]}
                                onPress={() => setShowEmployees(!showEmployees)}
                            >
                                <MaterialIcons
                                    name={showEmployees ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                    size={28}
                                    color="white"
                                />
                                <Text style={styles.buttonText}>Employees</Text>
                                
                            </TouchableOpacity>

                        </View>

                        {showEmployees && employees.size === 0 && (
                            <Text style={styles.emptyText}>
                                It's quiet in here... Add your first team member to get started!
                            </Text>
                        )}
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={styles.roleContainer}>
                        <Text style={styles.roleTitle}>
                            {item.role === "assistant_manager" ? "Assistant Managers" : "Servers"}
                        </Text>

                        <FlatList
                            data={item.employees}
                            keyExtractor={(employee) => employee.id}
                            renderItem={renderEmployeeCard}
                            scrollEnabled={false} // prevents nested scroll
                        />
                    </View>
                )}
                contentContainerStyle={[styles.container, { paddingBottom: 150}]}
                showsVerticalScrollIndicator={false}
            />


            {/* modal for entering employee details */}
            <Modal
                animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={()=> setModalVisible(false)}
            >
                
                            <View style={styles.modalOverlay}>
                                  <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Add New Employee</Text>
                                    <View style={styles.inputBox}>
                                        <TextInput
                                            style={styles.inputText}
                                            placeholder="Employee Name"
                                            value={name}
                                            onChangeText={(text)=>setName(text)}
                                        />
                                    </View>
                                    <View style={styles.inputBox}>
                                        <TextInput
                                            style={[styles.inputText, emailError? {borderColor:"red",borderWidth:2} : {}]}
                                            placeholder="Email Address"
                                            value={email}
                                            onChangeText={(text)=>{
                                                setEmail(text);
                                                setEmailError(""); //clear error whe use starts typig again
                                            }}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                                    </View>
                                    <DropDownPicker
                                         open={open}
                                         value={role}
                                        items={items}
                                        setOpen={setOpen}
                                        setValue={setRole}
                                        setItems={setItems}
                                        placeholder="Select Role"
                                        style={styles.dropdown}  // ✅ Matches input fields
                                        dropDownContainerStyle={styles.dropdownContainer}  // ✅ Styles dropdown list
                                        textStyle={styles.dropdownText}  // ✅ Matches input text color
                                        placeholderStyle={styles.placeholderText}  // ✅ Matches input placeholder
                                        onPress={() => Keyboard.dismiss()}  // ✅ Dismisses keyboard when tapped

                                    />
                                    <TouchableOpacity onPress={()=>handleAddEmployee()} style={styles.modalButton}>
                                        { loading ? (
                                            <ActivityIndicator size="small" color="#4F595C" />
                                        ) : (
                                            <Text style={styles.buttonText}>Create Account</Text>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={()=>{
                                            setModalVisible(false);
                                            //reset fields
                                            setName("");
                                            setEmail("");
                                            setRole(null);
                                            setEmailError("");
                                        }}
                                    >
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                        
            </Modal>
        
        </View>
    </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFDF7',
    },
    container:{
        padding:15,
        backgroundColor:"#FAF4E4",
        gap:12,
    },
    title:{
        fontFamily:"Poppins-Bold",
        color:"#4C403A",
        fontSize:23,
        marginBottom:20,
    },
    inputBox:{
        width:"100%",
        justifyContent:"center",
        marginBottom:10,
    },
    inputText: {
        fontFamily:"Poppins-Regular",
        width: "100%",
        height: 45, // Increase height for better visibility
        borderRadius: 10, // Smooth rounded corners
        borderWidth: 1, // Default border
        borderColor: "#ccc", // Light gray border for a clean look
        paddingHorizontal: 15, // Space inside the input
        fontSize: 16, // Slightly bigger text for readability
        color:"#63605F"
    },
    cardContainer: {
        width: "100%",
        paddingHorizontal: 13,
    },
    card: {
        backgroundColor: "#FEFCF7", 
        paddingVertical: 15,
        paddingHorizontal:20,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontFamily:"Poppins-Regular",
        fontSize: 18,
        color: "#3E3C3B",
        textAlign: "left",
        marginBottom: 10,
    },
    emptyText: {
        fontFamily:"Poppins-Regular",
        fontSize: 18,
        color: "#6E6E6E",
        textAlign: "center",
        marginBottom: 10,
    },
    button:{
        backgroundColor: "#D97742",
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: "100%",
        marginVertical: 5,
    },
    buttonText: {
        fontFamily:"Poppins-Bold",
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    modalOverlay:{
        flex:1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#F6DFD5",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        gap:10,
    },
    scrollContainer:{
        flexGrow:1,
    },
    modalTitle: {
        fontFamily:"Poppins-Bold",
        fontSize: 22,
        margin:10,
        textAlign:"center",
        color:"#63605F",
    },
    dropdown: {
        width: "100%",
        height: 45,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ccc",  // ✅ Same border color as inputs
        backgroundColor: "#F6DFD5",  // ✅ Matches input background
        marginBottom:20,
    },
    dropdownContainer: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ccc",  // ✅ Keeps dropdown list consistent
        backgroundColor: "#F6DFD5",  // ✅ Matches input background
    },
    dropdownText: {
        fontFamily:"Poppins-Regular",
        fontSize: 16,
        color: "#63605F",  // ✅ Same text color as inputs
    },
    placeholderText: {
        fontFamily:"Poppins-Regular",
        fontSize: 16,
        color: "#A1A1A1",  // ✅ Same placeholder color as inputs
    },
    modalButton: {
        backgroundColor: "#F39165",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
        marginBottom: 10,
    },
    cancelButton: {
        padding: 8,
        alignItems: "center",
    },
    cancelBtnText:{
        fontFamily:"Poppins-Bold",
        fontSize:17,
        color:"#63605F",
    },
    errorText:{
        fontFamily:"Poppins-Regular",
        color:"red",
        fontSize:14,
        marginTop:5,
        textAlign:"left",
    },
    employeeCard:{
        backgroundColor: "#FFFDF6",
        paddingVertical: 15,
        paddingHorizontal:10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 10,
        
    },
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal:10,
        gap:15,
    },
    employeeName: {
        fontFamily:"Poppins-Bold",
        fontSize: 17,
        color: "#555",
    },
    employeeEmail: {
        fontFamily:"Poppins-Regular",
        fontSize: 16,
        color: "#555",
    },
    roleContainer: {
        width: "100%",
        marginBottom: 10,
    },
    roleTitle: {
        fontFamily:"Poppins-Bold",
        fontSize: 22,
        color: "#4C403A",
        textAlign: "left",
        marginBottom: 10,
    },
});


export default ManageEmployeeScreen;