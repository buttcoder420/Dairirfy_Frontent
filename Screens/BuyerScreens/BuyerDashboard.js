import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import BuyerFooter from "./BuyerFooter";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { AuthContext } from "../../Context/AuthContext";

const { width, height } = Dimensions.get("window");

const BuyerDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopRatings, setShopRatings] = useState({}); // Store ratings for each shop

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location access is needed to use this feature."
          );
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        if (loc && loc.coords) {
          setLocation(loc.coords);
        } else {
          Alert.alert("Error", "Couldn't fetch your location.");
        }
      } catch (error) {
        console.error("Location Error:", error);
        Alert.alert("Error", "Location fetch failed.");
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
      fetchShops();
    }
  }, [location]);

  const fetchShops = async () => {
    try {
      const response = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/shop/all-shop"
      );
      if (response.data && Array.isArray(response.data.shops)) {
        const filteredShops = response.data.shops.filter((shop) => {
          const distance = getDistanceFromLatLonInKm(
            location.latitude,
            location.longitude,
            shop.location.latitude,
            shop.location.longitude
          );
          return distance <= 3;
        });

        setShops(filteredShops);

        // Fetch ratings for each shop
        filteredShops.forEach((shop) => {
          fetchShopRating(shop._id);
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  // New function to fetch shop rating
  const fetchShopRating = async (shopId) => {
    try {
      const response = await axios.get(
        `https://finalyear-backend.onrender.com/api/v1/rating/shop-rating/${shopId}`
      );

      setShopRatings((prev) => ({
        ...prev,
        [shopId]: response.data.averageRating || "0.00",
      }));
    } catch (error) {
      setShopRatings((prev) => ({
        ...prev,
        [shopId]: "New", // Default value if no rating exists
      }));
    }
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleMarkerPress = (shop) => {
    setSelectedShop(shop);
  };
  const handleLogout = () => {
    logout();
  };

  // if (!location || !region) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#FF6B6B" />
  //       <Text style={styles.loadingText}>Finding your location...</Text>
  //     </View>
  //   );
  // }

  const handleShopClick = (shopId) => {
    navigation.navigate("buy", { shopId });
  };

  return (
    <View style={styles.container}>
      {/* Vibrant Header with Logo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
            />
            <Text style={styles.headerTitle}>
              {(user?.firstName || "Buyer") + " " + (user?.lastName || "")}
            </Text>
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={16} color="white" />
            <Text style={styles.locationText}>Current Location</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Fixed Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          customMapStyle={mapStyle}
        >
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={3000}
            strokeColor="rgba(255, 107, 107, 0.3)"
            fillColor="rgba(255, 107, 107, 0.1)"
          />
          {shops.map((shop) => (
            <Marker
              key={shop._id}
              coordinate={{
                latitude: shop.location.latitude,
                longitude: shop.location.longitude,
              }}
              onPress={() => handleMarkerPress(shop)}
            >
              <View style={styles.markerContainer}>
                <Image
                  source={{
                    uri: shop.shopPhoto[0] || "https://via.placeholder.com/50",
                  }}
                  style={styles.markerImage}
                />
                <View
                  style={[
                    styles.markerStatus,
                    {
                      backgroundColor:
                        shop.shopStatus === "on" ? "#4CAF50" : "#FF6B6B",
                    },
                  ]}
                />
              </View>
            </Marker>
          ))}
        </MapView>
        <View style={styles.mapInfoBox}>
          <Text style={styles.mapInfoText}>{shops.length} shops nearby</Text>
        </View>
      </View>

      {/* Scrollable Shop List Section */}
      <View style={styles.shopListContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Shops</Text>
          <View style={styles.filterBadge}>
            <Text style={styles.filterText}>3km radius</Text>
          </View>
        </View>

        <ScrollView
          style={styles.shopScrollView}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#FF6B6B"
              style={styles.loader}
            />
          ) : shops.length > 0 ? (
            shops.map((shop) => (
              <TouchableOpacity
                key={shop._id}
                style={[
                  styles.shopCard,
                  selectedShop?._id === shop._id && styles.selectedShopCard,
                ]}
                onPress={() => handleShopClick(shop._id)}
                activeOpacity={0.7}
              >
                <Image
                  source={{
                    uri: shop.shopPhoto[0] || "https://via.placeholder.com/80",
                  }}
                  style={styles.shopImage}
                />
                <View style={styles.shopDetails}>
                  <View style={styles.shopHeaderRow}>
                    <Text style={styles.shopName} numberOfLines={1}>
                      {shop.shopName}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            shop.shopStatus === "on"
                              ? "rgba(76, 175, 80, 0.1)"
                              : "rgba(255, 107, 107, 0.1)",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              shop.shopStatus === "on" ? "#4CAF50" : "#FF6B6B",
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              shop.shopStatus === "on" ? "#4CAF50" : "#FF6B6B",
                          },
                        ]}
                      >
                        {shop.shopStatus === "on" ? "Open" : "Closed"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.shopDescription} numberOfLines={2}>
                    {shop.dairyInfo || "Fresh dairy products available"}
                  </Text>
                  <View style={styles.shopFooter}>
                    <View style={styles.infoItem}>
                      <Ionicons name="navigate" size={14} color="#FF6B6B" />
                      <Text style={styles.infoText}>
                        {getDistanceFromLatLonInKm(
                          location.latitude,
                          location.longitude,
                          shop.location.latitude,
                          shop.location.longitude
                        ).toFixed(1)}
                        km away
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="star" size={14} color="#FFC107" />
                      <Text style={styles.infoText}>
                        {shopRatings[shop._id] || "New"}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={50} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>No Shops Found</Text>
              <Text style={styles.emptyText}>
                We couldn't find any dairy shops within 3km radius
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <BuyerFooter />
    </View>
  );
};

// Map styling
const mapStyle = [
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "poi",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "transit",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#FF6B6B",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerContent: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 100,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "white",
    marginLeft: 6,
    opacity: 0.9,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  // Map Styles
  mapContainer: {
    height: 250,
    margin: 16,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  mapInfoBox: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  mapInfoText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  markerContainer: {
    alignItems: "center",
  },
  markerImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "white",
  },
  markerStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "white",
    position: "absolute",
    bottom: -1,
    right: -1,
  },
  // Shop List Container
  shopListContainer: {
    flex: 1,
    marginTop: 10,
    marginBottom: 96,
  },
  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3748",
  },
  filterBadge: {
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  // Shop Scroll View
  shopScrollView: {
    paddingHorizontal: 16,
  },
  // Shop Card
  shopCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedShopCard: {
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  shopDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  shopHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  shopName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2D3748",
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  shopDescription: {
    fontSize: 14,
    color: "#718096",
    lineHeight: 20,
    marginBottom: 10,
  },
  shopFooter: {
    flexDirection: "row",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoText: {
    fontSize: 13,
    color: "#4A5568",
    marginLeft: 5,
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A5568",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    lineHeight: 20,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#718096",
  },
  loader: {
    marginVertical: 30,
  },
});

export default BuyerDashboard;
