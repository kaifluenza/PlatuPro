import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, FlatList} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { subscribeToEmployeeData } from "../../data/employeeData";
import { useAuth } from "../../context/AuthContext";  
import { getAuth } from "firebase/auth";
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

    //for deleting employee
    

    //for dropdown picker
    const [open, setOpen] = useState(false); 
    const [items, setItems] = useState([
        {label:"Server", value:"server"},
        {label:"Assistant Manager", value:"assistant_manager"}
    ]);

    const [emailError, setEmailError] = useState(""); //track error message
    
    //function to add employee
    const handleAddEmployee = async () => {
        //input validation
        if(!name || !email || !role){
            Alert.alert("Error", "Please fill in all fields before proceeding.");
            return;
        }
        //validate email in 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            setEmailError("Please enter a valid email address.");
            return;
        }else{
            setEmailError(""); //clear error if valid
        }

        //DEBUG
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

        try{
            //call createEmployee to create the user
            const result = await createEmployee({ name, email, role, restaurantId });

            if(!result.data || !result.data.success || !result.data.userId){
               throw new Error("❌ Employee creation failed. No userId returned.");
            }

            const userId = result.data.userId;
            console.log("✅ Employee created successfully:", userId);

            //call setUserRole to assign role
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
            Alert.alert("✅ Success", `${name} added as ${role}!\nThey must check their email to set their password.`);
        }catch(error){
            console.error("❌ Error adding employee:", error);
            Alert.alert("❌ Error", error.message || "Something went wrong while creating the employee.");
        }finally{
            //reset fields
            setName("");
            setEmail("");
            setRole(null);
            setModalVisible(false);
        }
    }

    //convert employees map into flatlist-friendly array
    const processEmployeeData = (employees) => {
        return Array.from(employees.entries()).map(([role, employees])=>({
            role, 
            employees,
        }))
    };

    const renderEmployeeCard = ({item}) => (
        <View style={styles.employeeCard}>
            <Text style={styles.employeeName}>{item.name}</Text>
            <Text style={styles.employeeEmail}>{item.email}</Text>
        </View>
    );
    
    
    

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Manage Employee</Text>

       <View style={styles.butttonsContainer}>
            <TouchableOpacity onPress={()=>setModalVisible(true)} style={styles.button}>
                <Text style={styles.buttonText}>+ Add Employee</Text>
            </TouchableOpacity>


            {/* button to toggle employee list */}
            <TouchableOpacity 
                style={styles.button}
                onPress={()=> setShowEmployees(!showEmployees)}
            >
                <Text style={styles.buttonText}>{showEmployees? "Hide Employees" : "View Employees"}</Text>
            </TouchableOpacity>
       </View>

        {/* Employee list : ONLY shown when showEmployee is true */}
        {showEmployees && (
            <FlatList
                data={processEmployeeData(employees)}
                keyExtractor={(item)=>item.role}
                renderItem={ ({item}) => (
                    <View style={styles.roleContainer}>
                        <Text style={styles.roleTitle}>
                            {item.role === "assistant_manager" ? "Assistant Managers" : "Servers"}
                        </Text>

                        <FlatList
                            data={item.employees}
                            keyExtractor={(employee)=> employee.id}
                            renderItem={renderEmployeeCard}
                            scrollEnabled={false} //prevent nested scrolling
                        />
                    </View>
                )}
            />
        )}


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
                        style={styles.dropdown}
                    />
                    
                    <TouchableOpacity onPress={()=>handleAddEmployee()} style={styles.modalButton}>
                        <Text style={styles.buttonText}>Create Account</Text>
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
                        <Text>Cancel</Text>
                    </TouchableOpacity>

                  </View>
                </View>
            </Modal>


        
    </View>
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:24,
        backgroundColor:'#8BBFFB',
        alignItems:"center",
        gap:12,
    },
    title:{
        color:'#FFF4E2',
        fontSize:32,
        fontWeight:'bold',
        margin:20,
    },
    dropdown: {
        marginTop: 10,
        backgroundColor: '#FFF',
    },
    inputBox:{
        width:"100%",
        justifyContent:"center",
        marginBottom:10,
    },
    inputText: {
        width: "100%",
        height: 45, // Increase height for better visibility
        borderRadius: 10, // Smooth rounded corners
        borderWidth: 1, // Default border
        borderColor: "#ccc", // Light gray border for a clean look
        paddingHorizontal: 15, // Space inside the input
        fontSize: 16, // Slightly bigger text for readability
    },
    button:{
        backgroundColor: "#5187CD",
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: "50%",
        marginVertical: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    butttonsContainer:{
        gap:20,
    },
    modalOverlay:{
        flex:1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        gap:10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        margin:10,
        textAlign:"center",
    },
    dropdown: {
        width: "100%",
        marginBottom: 10,
    },
    modalButton: {
        backgroundColor: "#008CBA",
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
    errorText:{
        color:"red",
        fontSize:14,
        marginTop:5,
        textAlign:"left",
    },
    employeeCard:{
        backgroundColor: "#FFF",
        padding: 15,
        paddingHorizontal: 50,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 10,
        alignItems: "center",
    },
    employeeName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    employeeEmail: {
        fontSize: 14,
        color: "#555",
    },
    roleContainer: {
        width: "100%",
        marginBottom: 10,
        paddingHorizontal: 30,
    },
    roleTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#444",
        textAlign: "left",
        marginBottom: 10,
    },
});


export default ManageEmployeeScreen;