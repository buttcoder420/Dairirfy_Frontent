import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const AllShops = () => {
  const { token } = useContext(AuthContext);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchUserLocation();
    fetchShops();
  }, [token]);

  const fetchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Allow location access to see nearby shops."
      );
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
  };

  const fetchShops = async () => {
    try {
      const res = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/shop/all-shop",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.shops) setShops(res.data.shops);
    } catch (error) {
      showToast("Failed to load shops", false);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, isSuccess = true) => {
    Alert.alert(isSuccess ? "✅ Success" : "❌ Error", message);
  };

  const openMaps = (lat, lon) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    Linking.openURL(url).catch(() =>
      showToast("Could not open maps app", false)
    );
  };

  const renderShopItem = ({ item }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => setSelectedShop(item)}
    >
      <View style={styles.shopHeader}>
        <Text style={styles.shopName}>{item.shopName}</Text>
        <View
          style={[
            styles.statusBadge,
            item.shopStatus === "active"
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <Text style={styles.statusText}>{item.shopStatus}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Icon name="person" size={16} color="#6c5ce7" />
        <Text style={styles.detailText}>
          {item.shopOwner?.firstName + " " + item.shopOwner?.lastName}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="email" size={16} color="#6c5ce7" />
        <Text style={styles.detailText}>{item.shopOwner?.email}</Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="local-shipping" size={16} color="#6c5ce7" />
        <Text style={styles.detailText}>Delivers: {item.deliveryRange} km</Text>
      </View>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={() =>
          openMaps(item.location?.latitude, item.location?.longitude)
        }
      >
        <Icon name="location-on" size={16} color="#fff" />
        <Text style={styles.locationButtonText}>View on Map</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Loading shops...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Shops</Text>
        <Text style={styles.headerSubtitle}>
          {shops.length} shops available
        </Text>
      </View>

      {/* Shops List */}
      <FlatList
        data={shops}
        keyExtractor={(item) => item._id}
        renderItem={renderShopItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="storefront" size={50} color="#b2bec3" />
            <Text style={styles.emptyText}>No shops found</Text>
          </View>
        }
      />

      {/* Shop Location Modal */}
      {selectedShop && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedShop.shopName}</Text>
              <TouchableOpacity onPress={() => setSelectedShop(null)}>
                <Icon name="close" size={24} color="#6c5ce7" />
              </TouchableOpacity>
            </View>

            <MapView
              style={styles.map}
              initialRegion={{
                latitude: selectedShop.location?.latitude || 0,
                longitude: selectedShop.location?.longitude || 0,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: selectedShop.location?.latitude || 0,
                  longitude: selectedShop.location?.longitude || 0,
                }}
                title={selectedShop.shopName}
              />
              {userLocation && (
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  pinColor="blue"
                  title="Your Location"
                />
              )}
            </MapView>

            <View style={styles.modalFooter}>
              <Text style={styles.modalAddress}>
                📍 Delivery Range: {selectedShop.deliveryRange} km
              </Text>
              <Text style={styles.modalInfo}>{selectedShop.dairyInfo}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    backgroundColor: "#6c5ce7",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  loadingText: {
    marginTop: 10,
    color: "#636e72",
  },
  listContent: {
    padding: 15,
  },
  shopCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  shopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  shopName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3436",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "rgba(0, 184, 148, 0.2)",
  },
  inactiveBadge: {
    backgroundColor: "rgba(214, 48, 49, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  detailText: {
    marginLeft: 8,
    color: "#636e72",
    fontSize: 14,
  },
  locationButton: {
    flexDirection: "row",
    backgroundColor: "#6c5ce7",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: "#b2bec3",
    fontWeight: "500",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d3436",
  },
  map: {
    width: "100%",
    height: 300,
  },
  modalFooter: {
    padding: 15,
  },
  modalAddress: {
    fontSize: 14,
    color: "#636e72",
    marginBottom: 5,
  },
  modalInfo: {
    fontSize: 14,
    color: "#2d3436",
  },
});

export default AllShops;
