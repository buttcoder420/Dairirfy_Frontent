import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const GetAll = ({ route }) => {
  const navigation = useNavigation();
  const { shopId } = route.params;
  const [shopDetails, setShopDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [shopRating, setShopRating] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [220, 80],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
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
        console.error("Error fetching shop details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShopDetails();
  }, [shopId]);

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

  const handleOrder = (product) => {
    navigation.navigate("productdetail", {
      product: product,
      shopId: shopDetails?.shop?._id,
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Ionicons key={i} name="star" size={14} color="#FFD700" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={14} color="#FFD700" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={14} color="#FFD700" />
        );
      }
    }

    return <View style={styles.starContainer}>{stars}</View>;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  if (!shopDetails || !shopDetails.shop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Shop not available</Text>
      </View>
    );
  }

  const { shop, products } = shopDetails;

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Image
          source={{
            uri: shop.shopPhoto[0] || "https://via.placeholder.com/300",
          }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{shop.shopName}</Text>
          <View style={styles.ratingContainer}>
            {shopRating ? (
              <Text style={styles.ratingText}>
                ★ {shopRating.averageRating || "New"}
                {shopRating.totalRatings ? ` (${shopRating.totalRatings})` : ""}
              </Text>
            ) : (
              <Text style={styles.ratingText}>★ New</Text>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 180],
                  outputRange: [180, 80],
                  extrapolate: "clamp",
                }),
              },
            ],
            opacity: scrollY.interpolate({
              inputRange: [0, 180],
              outputRange: [1, 0.8],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
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
      </Animated.View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        numColumns={2}
        contentContainerStyle={styles.productsGrid}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => handleOrder(item)}
            activeOpacity={0.9}
          >
            <View style={styles.productImageContainer}>
              <Image
                source={{
                  uri: item.images[0] || "https://via.placeholder.com/150",
                }}
                style={styles.productImage}
              />
              {item.discount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{item.discount}% OFF</Text>
                </View>
              )}
            </View>

            <View style={styles.productDetails}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>

              {/* Product Rating */}
              {item.rating && (
                <View style={styles.productRating}>
                  {renderStars(item.rating)}
                  <Text style={styles.ratingCount}>
                    ({item.ratingCount || 0})
                  </Text>
                </View>
              )}

              <View style={styles.priceContainer}>
                <Text style={styles.currentPrice}>{item.price} Rs</Text>
                {item.originalPrice && (
                  <Text style={styles.originalPrice}>
                    {Math.round(item.originalPrice)} Rs
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleOrder(item)}
              >
                <Text style={styles.addButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-off" size={50} color="#CCC" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
        ListHeaderComponent={<View style={{ height: 220 }} />}
      />
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 18,
    fontWeight: "500",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 10,
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  shopInfo: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  shopName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ratingContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  ratingText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  searchContainer: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    zIndex: 20,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 60,
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
  productsGrid: {
    paddingTop: 160,
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  productImageContainer: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#6C5CE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  productDetails: {
    padding: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  productRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: "row",
    marginRight: 5,
  },
  ratingCount: {
    fontSize: 12,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6C5CE7",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
  },
  addButton: {
    backgroundColor: "#6C5CE7",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
});

export default GetAll;
