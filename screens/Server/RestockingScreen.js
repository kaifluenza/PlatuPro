import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, Button } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import inventoryData from '../../data/inventoryData';

const RestockingScreen = () => {

  const [requestBtn, setRequestBtn] = useState(false);
  const [itemsToRequest, setItemsToRequest] = useState([]);
  let request_list = [];

  // Convert the Map to an array for SectionList
  const sections = Array.from(inventoryData, ([title, items]) => ({
    title,
    data: Array.from(items),  // Convert the Set to an array
  }));

  //convert itemsToRequest to a sectioned array for SectionList
  const sectionedRequestList = itemsToRequest.reduce((acc,{category,item })=>{
    //check if category already exists in accumulator
    const existingSection = acc.find(section => section.title === category);
    //if category exists, push item into the data array
    if(existingSection){
      existingSection.data.push(item);
    }else{ //if category doesn't exist, create new section
      acc.push({title:category, data:[item]});
    }

    return acc;
  },[]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restocking List</Text>
      <Text>*Update by Employee</Text>

      <View style={styles.requestBoard}>
        <Text>Current Requested Items:</Text>
        {itemsToRequest.length > 0 && (
          <SectionList
            sections={sectionedRequestList}
            renderItem={({item})=> <Text>{item}</Text>}
            renderSectionHeader={({section:{title}})=> (
              <View>
                <Text>{title}:</Text>
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.horizontalStack}>
        
        <Button
          title="Request"
          color="white"
          onPress={() => {
            console.log("user is making request(s)");
            setRequestBtn(true);
          }}
        />

        {requestBtn && (
          <>
            <Button
              title="Send"
              color="blue"
              onPress={(isChecked) => {
                console.log("sending request..", request_list);
                // Send request logic here
                console.log("current request list: ", request_list);
                //filter out items that already exist in itemsToRequest
                const filtered_request_list = request_list.filter((item)=>
                  !itemsToRequest.some((i)=>i.item===item.item&&i.category===item.category)
                );
                console.log("filtered request list:", filtered_request_list);

                
                setItemsToRequest((prev)=>[...prev, ...filtered_request_list]);
                console.log("itemsToReqeust: ", itemsToRequest);

                request_list=[];  //clear request list after requested
                setRequestBtn(false);  // Hide the buttons
              }}
            />

            <Button
              title="Cancel"
              color="blue"
              onPress={() => {
                request_list=[]; //clear request list after requested
                setRequestBtn(false);  // Hide the buttons
              }}
            />
          </>
        )}
      </View>

      <Text>Inventory</Text>
      <SectionList
        sections={sections}  // Use the transformed data
        keyExtractor={(item, index) => item + index}
        renderItem={({ item, section }) => (
          <View style={styles.item} flexDirection="row" justifyContent="space-between">
            <Text style={styles.item}>{item}</Text>

            {requestBtn && (
              <BouncyCheckbox
                size={20}
                fillColor="green"
                onPress={(isChecked) => {
                  if (isChecked) {
                    request_list.push({category:section.title, item:item});
                    console.log("request list:" , request_list);
                  } else {
                    request_list = request_list.filter(
                      (array_item)=> array_item.item!==item || array_item.category !== section.title
                    );
                    console.log("request list:" , request_list);
                  }
                }}
              />
            )}
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader} flexDirection="row">
            <Text style={styles.sectionHeader}>{title}</Text>
          </View>
        )}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8604F',
  },
  title: {
    marginTop: 16,
    paddingVertical: 8,
    color: '#FFF4E2',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#3CC9CB',
    borderRadius: 8,
    padding: 5,
  },
  item: {
    fontSize: 14,
    backgroundColor: '#B4E6D4',
    borderRadius: 8,
    padding: 5,
    marginVertical: 4,
  },
  horizontalStack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestBoard: {
    flexGrow: 1,
    minHeight: '10%',
    fontSize: 14,
    backgroundColor: '#DF9D93',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    justifyContent:"center",
    alignItems:"center",
  },
});

export default RestockingScreen;
