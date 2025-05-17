import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
  ToastAndroid,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../../Context/AuthContext";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";

const { width, height } = Dimensions.get("window");

const ProductOrderScreen = () => {
  const { user, token } = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();
  const { product, shopId } = route.params || {};
  const mapRef = useRef(null);

  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(product?.price || 0);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [modalVisible, setModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Location state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({
    coordinates: [0, 0],
    address: "",
    placeId: "",
  });
  const [region, setRegion] = useState({
    latitude: 33.6844,
    longitude: 73.0479,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Handle product images
  const productImages = product?.images || [];
  const hasMultipleImages = productImages.length > 1;

  useEffect(() => {
    if (!product || !shopId) {
      ToastAndroid.show(
        "Product or shop information missing",
        ToastAndroid.SHORT
      );
      navigation.goBack();
      return;
    }
    setTotalPrice((product.price || 0) * quantity);
    getCurrentLocation();
  }, [quantity, product]);

  // Auto slide images if multiple exist
  useEffect(() => {
    let interval;
    if (hasMultipleImages) {
      interval = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % productImages.length
        );
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [hasMultipleImages, productImages.length]);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        ToastAndroid.show(
          "Please enable location permissions",
          ToastAndroid.SHORT
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const firstAddress = address[0];
        const formattedAddress = `${firstAddress.street || ""}, ${
          firstAddress.city || ""
        }, ${firstAddress.region || ""}, ${firstAddress.country || ""}`;

        setSelectedLocation({
          coordinates: [location.coords.longitude, location.coords.latitude],
          address: formattedAddress,
          placeId: "current-location",
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
      ToastAndroid.show("Error getting your location", ToastAndroid.SHORT);
    }
  };

  const validateQuantity = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      setInputError("Please enter a valid number");
      return false;
    }
    if (numValue < 1) {
      setInputError("Quantity must be at least 1");
      return false;
    }
    if (product?.stock && numValue > product.stock) {
      setInputError(`Only ${product.stock} units available`);
      return false;
    }
    setInputError("");
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateQuantity(quantity)) return;
    if (!selectedLocation.address) {
      ToastAndroid.show(
        "Please select a delivery location",
        ToastAndroid.SHORT
      );
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        productId: product._id,
        shopId,
        quantity,
        paymentMethod,
        deliveryLocation: selectedLocation,
      };

      const response = await axios.post(
        "https://finalyear-backend.onrender.com/api/v1/order/place-order",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        ToastAndroid.show("Your order has been confirmed", ToastAndroid.LONG);
        setModalVisible(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to place order";
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    try {
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address.length > 0) {
        const firstAddress = address[0];
        const formattedAddress = `${firstAddress.street || ""}, ${
          firstAddress.city || ""
        }, ${firstAddress.region || ""}, ${firstAddress.country || ""}`;

        setSelectedLocation({
          coordinates: [longitude, latitude],
          address: formattedAddress,
          placeId: `manual-${Date.now()}`,
        });

        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          500
        );
      }
    } catch (error) {
      console.error("Error getting address:", error);
      ToastAndroid.show("Error getting address", ToastAndroid.SHORT);
    }
  };

  const handleBack = () => navigation.goBack();

  if (!product || !shopId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>

        {/* Product Card */}
        <View style={styles.card}>
          <View style={styles.productRow}>
            <View style={styles.imageContainer}>
              {productImages.length > 0 ? (
                <>
                  <Image
                    source={{ uri: productImages[currentImageIndex] }}
                    style={styles.productImage}
                    onError={() => console.log("Image load error")}
                  />
                  {hasMultipleImages && (
                    <View style={styles.imageIndicators}>
                      {productImages.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.imageIndicator,
                            index === currentImageIndex &&
                              styles.activeIndicator,
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                </View>
              )}
            </View>
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDescription}>
                {product.description}
              </Text>
              <Text style={styles.price}>Rs. {product.price} / Kg</Text>
              {product.stock && (
                <Text style={styles.stockText}>
                  Available: {product.stock} Kg
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Delivery Location */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => setLocationModalVisible(true)}
          >
            <Ionicons name="location-sharp" size={20} color="#4CAF50" />
            <Text style={styles.locationText} numberOfLines={1}>
              {selectedLocation.address || "Select delivery location"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Quantity Selector */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quantity (in Kg)</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              onPress={() => {
                const newQty = quantity - 1;
                if (validateQuantity(newQty)) setQuantity(newQty);
              }}
              style={styles.quantityButton}
              disabled={quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.quantityInput}
              value={quantity.toString()}
              onChangeText={(text) => {
                const numValue = Math.max(1, Number(text) || 1);
                setQuantity(numValue);
                validateQuantity(numValue);
              }}
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={() => {
                const newQty = quantity + 1;
                if (validateQuantity(newQty)) setQuantity(newQty);
              }}
              style={styles.quantityButton}
              disabled={product.stock && quantity >= product.stock}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          {inputError ? (
            <Text style={styles.errorText}>{inputError}</Text>
          ) : null}
        </View>

        {/* Payment Options */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOption}>
            <Ionicons name="cash" size={24} color="#4CAF50" />
            <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Kg Price</Text>
            <Text style={styles.summaryValue}>Rs. {product.price}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantity</Text>
            <Text style={styles.summaryValue}>{quantity} Kg</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>
              {selectedLocation.address ? "To your location" : "Not specified"}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Price</Text>
            <Text style={styles.totalPrice}>Rs. {totalPrice}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.orderButton,
            (!!inputError || loading || !selectedLocation.address) &&
              styles.disabledButton,
          ]}
          onPress={handlePlaceOrder}
          disabled={!!inputError || loading || !selectedLocation.address}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.orderButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Location Selection Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={locationModalVisible}
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setLocationModalVisible(false)}
              style={styles.modalBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              Select Delivery Location
            </Text>
          </View>

          {/* Map View */}
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {selectedLocation.coordinates[0] !== 0 && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.coordinates[1],
                  longitude: selectedLocation.coordinates[0],
                }}
                title="Delivery Location"
              />
            )}
          </MapView>

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
          >
            <MaterialIcons name="my-location" size={24} color="#4CAF50" />
          </TouchableOpacity>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmLocationButton}
            onPress={() => setLocationModalVisible(false)}
          >
            <Text style={styles.confirmLocationText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Order Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>Order Confirmed!</Text>
            {productImages.length > 0 && (
              <Image
                source={{ uri: productImages[0] }}
                style={styles.modalProductImage}
                onError={() => console.log("Image load error")}
              />
            )}
            <Text style={styles.modalText}>
              Your order for {product.name} has been placed successfully.
            </Text>
            <Text style={styles.modalText}>
              Delivery to:{" "}
              <Text style={styles.boldText}>{selectedLocation.address}</Text>
            </Text>
            <Text style={styles.modalText}>
              Total Amount:{" "}
              <Text style={styles.boldText}>Rs. {totalPrice}</Text>
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  imageIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: "#fff",
    width: 10,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  stockText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  quantityInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    marginHorizontal: 12,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  errorText: {
    color: "#FF5252",
    fontSize: 14,
    marginTop: 8,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F0F7F4",
    borderRadius: 8,
    marginTop: 8,
  },
  paymentOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#666",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  orderButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
    color: "#666",
    lineHeight: 24,
  },
  boldText: {
    fontWeight: "600",
    color: "#333",
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 20,
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginTop: 8,
  },
  locationText: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
  },
  modalBackButton: {
    padding: 4,
  },
  map: {
    width: "100%",
    height: height * 0.6,
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmLocationButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmLocationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginVertical: 12,
  },
});

export default ProductOrderScreen;
