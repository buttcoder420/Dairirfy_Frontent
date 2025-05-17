import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { AuthContext } from "./../../Context/AuthContext";

const CreateShop = ({ navigation }) => {
  const { user, token } = useContext(AuthContext);
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [deliveryRange, setDeliveryRange] = useState(1);
  const [dairyInfo, setDairyInfo] = useState("");
  const [shopPhoto, setShopPhoto] = useState(null);
  const [shopStatus, setShopStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);

  // 🌍 Fetch User's Current Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Allow location access to continue.",
        });
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
  }, []);

  // � Fetch Shops
  const fetchShops = async () => {
    try {
      const response = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/shop/my-shop",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        }
      );

      if (response.data.shop) {
        setShops([response.data.shop]);
        const shop = response.data.shop;
        setShopName(shop.shopName);
        setLocation(shop.location);
        setDeliveryRange(shop.deliveryRange);
        setDairyInfo(shop.dairyInfo);
        setShopPhoto(shop.shopPhoto[0]);
        setShopStatus(shop.shopStatus === "on");
      } else {
        setShops([]);
      }
    } catch (error) {
      setShops([]);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // 🗺️ Handle Map Click to Select Location
  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
  };

  // 📸 Function to Pick Image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setShopPhoto(result.assets[0].uri);
    }
  };

  // 🛒 Function to Create Shop
  const handleCreateShop = async () => {
    if (!shopName || !location || !dairyInfo) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all required fields!",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://finalyear-backend.onrender.com/api/v1/shop/create",
        {
          shopName,
          location,
          deliveryRange,
          dairyInfo,
          shopPhoto: shopPhoto ? [shopPhoto] : [],
          shopStatus: shopStatus ? "on" : "off",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Shop Created Successfully!",
      });

      navigation.navigate("sellerdashboard");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Function to Update Shop
  const handleUpdateShop = async (shopId) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `https://finalyear-backend.onrender.com/api/v1/shop/update/${shopId}`,
        {
          shopName,
          location,
          deliveryRange,
          dairyInfo,
          shopPhoto: shopPhoto ? [shopPhoto] : [],
          shopStatus: shopStatus ? "on" : "off",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Shop Updated Successfully!",
      });
      navigation.navigate("sellerdashboard");
      fetchShops();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Function to Delete Shop
  const handleDeleteShop = async (shopId) => {
    Alert.alert(
      "Delete Shop",
      "Are you sure you want to delete your shop? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await axios.delete(
                `https://finalyear-backend.onrender.com/api/v1/shop/delete/${shopId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Shop Deleted Successfully!",
              });
              navigation.navigate("sellerdashboard");
              fetchShops();
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: error.response?.data?.message || "Something went wrong!",
              });
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.miniHeader}>
        <View style={styles.headerLine} />
        <Text style={styles.miniHeaderTitle}>
          {shops.length > 0 ? "EDIT SHOP" : "NEW SHOP"}
        </Text>
        <View style={styles.headerLine} />
      </View>

      {/* Shop Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop Photo</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {shopPhoto ? (
            <Image source={{ uri: shopPhoto }} style={styles.image} />
          ) : (
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraText}>📷</Text>
              <Text style={styles.cameraLabel}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Shop Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop Information</Text>

        <Text style={styles.inputLabel}>Shop Name</Text>
        <TextInput
          placeholder="e.g., Fresh Milk Dairy"
          style={styles.input}
          value={shopName}
          onChangeText={setShopName}
        />

        <Text style={styles.inputLabel}>Dairy Information</Text>
        <TextInput
          placeholder="Describe your dairy products"
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          value={dairyInfo}
          onChangeText={setDairyInfo}
          multiline
        />
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop Location</Text>
        <Text style={styles.mapInstructions}>
          Tap on the map to set your shop location
        </Text>
        <View style={styles.mapContainer}>
          {location && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={handleMapPress}
            >
              <Marker coordinate={location} title="Shop Location" />
            </MapView>
          )}
        </View>
      </View>

      {/* Delivery Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Settings</Text>

        <Text style={styles.inputLabel}>Delivery Range (km)</Text>
        <View style={styles.rangeContainer}>
          {[1, 2, 3].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.rangeButton,
                deliveryRange === range && styles.rangeButtonActive,
              ]}
              onPress={() => setDeliveryRange(range)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  deliveryRange === range && styles.rangeButtonTextActive,
                ]}
              >
                {range} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Shop Status</Text>
          <View style={styles.switchWrapper}>
            <Text style={styles.switchText}>
              {shopStatus ? "Open" : "Closed"}
            </Text>
            <Switch
              value={shopStatus}
              onValueChange={setShopStatus}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={shopStatus ? "#2e86de" : "#f4f3f4"}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {shops.length > 0 ? (
          <>
            <TouchableOpacity
              onPress={() => handleUpdateShop(shops[0]._id)}
              style={[styles.button, styles.updateButton]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update Shop</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteShop(shops[0]._id)}
              style={[styles.button, styles.deleteButton]}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Delete Shop</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleCreateShop}
            style={[styles.button, styles.createButton]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Shop</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f7fa",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
  },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    width: 120,
    height: 120,
    alignSelf: "center",
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
  },
  cameraIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  cameraText: {
    fontSize: 32,
    marginBottom: 5,
  },
  cameraLabel: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  inputLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapInstructions: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  rangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  rangeButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  rangeButtonActive: {
    backgroundColor: "#2e86de",
    borderColor: "#2e86de",
  },
  rangeButtonText: {
    color: "#7f8c8d",
    fontWeight: "500",
  },
  rangeButtonTextActive: {
    color: "#fff",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  switchLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  switchWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: {
    marginRight: 10,
    color: "#2c3e50",
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createButton: {
    backgroundColor: "#2e86de",
  },
  updateButton: {
    backgroundColor: "#27ae60",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  miniHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 25,
  },
  miniHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    marginHorizontal: 15,
    letterSpacing: 1,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
});

export default CreateShop;
