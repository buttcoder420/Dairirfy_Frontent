import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  Linking,
  TextInput,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ShopDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { shopId } = route.params;
  const [shopDetails, setShopDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [shopRating, setShopRating] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        // Fetch shop details and products
        const [shopResponse, ratingResponse] = await Promise.all([
          axios.get(
            `https://finalyear-backend.onrender.com/api/v1/order/ShopOrder/${shopId}`
          ),
          axios.get(
            `https://finalyear-backend.onrender.com/api/v1/rating/shop-rating/${shopId}`
          ),
        ]);

        setShopDetails(shopResponse.data);
        setShopRating(ratingResponse.data);
        setFilteredProducts(shopResponse.data.products || []);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShopDetails();
  }, [shopId]);

  // Auto-slide product images
  useEffect(() => {
    if (filteredProducts?.length > 0) {
      // Initialize currentImageIndices
      const initialIndices = {};
      filteredProducts.forEach((_, index) => {
        initialIndices[index] = 0;
      });
      setCurrentImageIndices(initialIndices);

      // Set up interval for auto-sliding
      const interval = setInterval(() => {
        setCurrentImageIndices((prevIndices) => {
          const newIndices = { ...prevIndices };
          Object.keys(newIndices).forEach((key) => {
            const productIndex = parseInt(key);
            const product = filteredProducts[productIndex];
            if (product?.images?.length > 1) {
              newIndices[productIndex] =
                (newIndices[productIndex] + 1) % product.images.length;
            }
          });
          return newIndices;
        });

        // Add fade animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          fadeAnim.setValue(1);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [filteredProducts]);

  // Filter products based on search query
  useEffect(() => {
    if (shopDetails?.products) {
      if (searchQuery.trim() === "") {
        setFilteredProducts(shopDetails.products);
      } else {
        const filtered = shopDetails.products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(filtered);
      }
    }
  }, [searchQuery, shopDetails]);

  const renderImageIndicators = (images, currentIndex) => {
    if (!images || images.length <= 1) return null;

    return (
      <View style={styles.indicatorsContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading Shop Details...</Text>
      </View>
    );
  }

  if (!shopDetails || !shopDetails.shop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.errorText}>Shop not found</Text>
      </View>
    );
  }

  const { shop, products } = shopDetails;
  const owner = shopDetails.owner || shop.shopOwner;

  const handleShopClick = (shopId) => {
    navigation.navigate("getall", { shopId });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Shop Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Image
            source={{
              uri: shop.shopPhoto[0] || "https://via.placeholder.com/80",
            }}
            style={styles.shopImage}
          />
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{shop.shopName}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {shopRating?.averageRating || "New"}
                {shopRating?.totalRatings
                  ? ` (${shopRating.totalRatings})`
                  : ""}
              </Text>
            </View>
            <View style={styles.shopMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={16} color="white" />
                <Text style={styles.metaText}>{owner.address}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Products Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {filteredProducts.length} Products
          </Text>
          <TouchableOpacity onPress={() => handleShopClick(shop._id)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyProducts}>
            <Ionicons name="search-off" size={50} color="#CCC" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <View style={styles.productCard}>
                <View style={styles.productImageContainer}>
                  {item.images?.length > 0 ? (
                    <>
                      <Animated.Image
                        source={{
                          uri: item.images[currentImageIndices[index] || 0],
                        }}
                        style={[styles.productImage, { opacity: fadeAnim }]}
                      />
                      {renderImageIndicators(
                        item.images,
                        currentImageIndices[index] || 0
                      )}
                    </>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                  )}
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.productDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={styles.productqua} numberOfLines={2}>
                    {item.quantity}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>Rs. {item.price} Kg</Text>
                    <TouchableOpacity
                      style={styles.cartButton}
                      onPress={() =>
                        navigation.navigate("productdetail", {
                          product: item,
                          shopId: shop._id,
                        })
                      }
                    >
                      <Ionicons name="cart" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Owner Details Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Shop Owner</Text>
        <View style={styles.ownerCard}>
          <View style={styles.ownerInfo}>
            <Image
              source={{
                uri:
                  owner.profilePhoto ||
                  "https://randomuser.me/api/portraits/men/1.jpg",
              }}
              style={styles.ownerImage}
            />
            <View style={styles.ownerDetails}>
              <Text style={styles.ownerName}>
                {owner.firstName} {owner.lastName}
              </Text>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={16} color="#6C63FF" />
                <Text style={styles.contactText}>{owner.phoneNumber}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                <Text style={styles.contactText}>{owner.whatsappNumber}</Text>
              </View>
            </View>
          </View>
          <View style={styles.ownerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Linking.openURL(`https://wa.me/${owner.whatsappNumber}`)
              }
            >
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
              <Text style={styles.actionText}>Whatsapp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={() => Linking.openURL(`tel:${owner.phoneNumber}`)}
            >
              <Ionicons name="call" size={16} color="white" />
              <Text style={[styles.actionText, styles.callButtonText]}>
                Call
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Shop Description */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>About the Shop</Text>
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{shop.dairyInfo}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 10,
    color: "#6C63FF",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  errorIcon: {
    fontSize: 50,
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  errorText: {
    marginTop: 10,
    color: "#FF6B6B",
    fontSize: 18,
    fontWeight: "500",
  },
  headerContainer: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#6C63FF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "white",
  },
  shopInfo: {
    marginLeft: 15,
    flex: 1,
  },
  shopName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    color: "white",
    marginLeft: 5,
    fontSize: 14,
  },
  shopMeta: {
    marginTop: 5,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  metaText: {
    color: "white",
    fontSize: 13,
    marginLeft: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 5,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    color: "#6C63FF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyProducts: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  productsList: {
    paddingBottom: 10,
  },
  productCard: {
    backgroundColor: "white",
    width: 160,
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    height: 120,
    width: "100%",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productDetails: {
    padding: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  productDesc: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    height: 32,
  },
  productqua: {
    fontSize: 14,
    color: "green",
    fontWeight: "bold",
    marginBottom: 10,
    height: 32,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6C63FF",
  },
  cartButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  ownerCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ownerInfo: {
    flexDirection: "row",
    marginBottom: 15,
  },
  ownerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  ownerDetails: {
    marginLeft: 15,
    justifyContent: "center",
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  contactText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
  },
  ownerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6C63FF",
    flex: 1,
    marginHorizontal: 5,
  },
  callButton: {
    backgroundColor: "#6C63FF",
  },
  actionText: {
    marginLeft: 5,
    color: "#6C63FF",
    fontSize: 14,
    fontWeight: "500",
  },
  callButtonText: {
    color: "white",
  },
  descriptionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 10,
  },
  indicatorsContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
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
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EDE7F6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#9575CD",
    fontSize: 14,
  },
});

export default ShopDetailsScreen;
