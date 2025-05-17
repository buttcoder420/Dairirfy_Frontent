import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ProductManage = () => {
  const { user, token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");
  const [updatedPrice, setUpdatedPrice] = useState("");
  const [stockStatus, setStockStatus] = useState("in stock");
  const [updatedImages, setUpdatedImages] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const MAX_IMAGES = 5;

  // Auto-slide images in product list
  useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(() => {
        setProducts((prevProducts) =>
          prevProducts.map((product) => ({
            ...product,
            currentImageIndex:
              product.images?.length > 1
                ? (product.currentImageIndex + 1) % product.images.length
                : 0,
          }))
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [products]);

  // Auto-slide images in modal
  useEffect(() => {
    if (modalVisible && updatedImages.length > 1) {
      const interval = setInterval(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setCurrentImageIndex((prev) => (prev + 1) % updatedImages.length);
          fadeAnim.setValue(0);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [modalVisible, updatedImages]);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/product/my-product",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const productsWithIndex = response.data.products.map((product) => ({
        ...product,
        currentImageIndex: 0,
      }));
      setProducts(productsWithIndex);
    } catch (error) {
      Toast.show({ type: "error", text1: "Error fetching products" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await axios.delete(
                `https://finalyear-backend.onrender.com/api/v1/product/delete/${productId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              Toast.show({
                type: "success",
                text1: "Product deleted successfully!",
              });
              fetchProducts();
            } catch (error) {
              Toast.show({ type: "error", text1: "Error deleting product" });
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle Image Picker
  const pickImage = async () => {
    if (updatedImages.length >= MAX_IMAGES) {
      Toast.show({
        type: "error",
        text1: `Maximum ${MAX_IMAGES} images allowed`,
      });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - updatedImages.length,
    });

    if (!result.canceled) {
      setUpdatedImages([
        ...updatedImages,
        ...result.assets.map((asset) => asset.uri),
      ]);
    }
  };

  // Remove image from array
  const removeImage = (index) => {
    const newImages = [...updatedImages];
    newImages.splice(index, 1);
    setUpdatedImages(newImages);
    if (currentImageIndex >= newImages.length) {
      setCurrentImageIndex(Math.max(0, newImages.length - 1));
    }
  };

  // Open edit modal with product data
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setUpdatedName(product.name);
    setUpdatedDescription(product.description);
    setUpdatedPrice(product.price.toString());
    setStockStatus(product.quantity);
    setUpdatedImages(product.images || []);
    setCurrentImageIndex(0);
    setModalVisible(true);
  };

  // Update product
  const handleUpdateProduct = async () => {
    if (
      !updatedName ||
      !updatedDescription ||
      !updatedPrice ||
      updatedImages.length === 0
    ) {
      Toast.show({
        type: "error",
        text1: "Please fill all fields and add at least one image",
      });
      return;
    }

    setUpdating(true);
    try {
      const bodyData = {
        name: updatedName,
        description: updatedDescription,
        price: updatedPrice,
        quantity: stockStatus,
        images: updatedImages,
      };

      await axios.put(
        `https://finalyear-backend.onrender.com/api/v1/product/update/${selectedProduct._id}`,
        bodyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Toast.show({
        type: "success",
        text1: "Product updated successfully!",
      });
      setModalVisible(false);
      fetchProducts();
    } catch (error) {
      Toast.show({ type: "error", text1: "Error updating product" });
    } finally {
      setUpdating(false);
    }
  };

  // Render image indicators
  const renderIndicators = (images, currentIndex) => {
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

  // Render product item
  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        {item.images?.length > 0 ? (
          <>
            <Image
              source={{ uri: item.images[item.currentImageIndex] }}
              style={styles.productImage}
              resizeMode="cover"
            />
            {item.images.length > 1 &&
              renderIndicators(item.images, item.currentImageIndex)}
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#9575CD" />
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>{item.price} Rs</Text>
          <View
            style={[
              styles.stockBadge,
              item.quantity === "in stock" ? styles.inStock : styles.outOfStock,
            ]}
          >
            <Text style={styles.stockText}>{item.quantity}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditProduct(item)}
          >
            <Ionicons name="create" size={18} color="#5E35B1" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item._id)}
          >
            <Ionicons name="trash" size={18} color="#D32F2F" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Manage Products</Text>
          <Text style={styles.headerSubtitle}>Your product inventory</Text>
        </View>
        <View style={styles.headerDecoration} />
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7E57C2" />
          <Text style={styles.loadingText}>Loading your products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIllustration}>
            <Ionicons name="cube-outline" size={80} color="#B39DDB" />
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyTitle}>No Products Added</Text>
              <Text style={styles.emptyDescription}>
                You haven't added any products yet. Start by adding your first
                product!
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={products}
          contentContainerStyle={styles.listContent}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Edit Product</Text>
          </View>

          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalContent}
          >
            {/* Image Section */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>
                Product Images ({updatedImages.length}/{MAX_IMAGES})
              </Text>

              {updatedImages.length > 0 ? (
                <View style={styles.imageCarouselContainer}>
                  <Animated.Image
                    source={{ uri: updatedImages[currentImageIndex] }}
                    style={[styles.mainImage, { opacity: fadeAnim }]}
                  />
                  {renderIndicators(updatedImages, currentImageIndex)}

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.thumbnailContainer}
                  >
                    {updatedImages.map((img, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setCurrentImageIndex(index)}
                        style={styles.thumbnailWrapper}
                      >
                        <Image
                          source={{ uri: img }}
                          style={[
                            styles.thumbnail,
                            index === currentImageIndex &&
                              styles.activeThumbnail,
                          ]}
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeImage(index)}
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.noImagesContainer}>
                  <Ionicons name="image-outline" size={50} color="#B39DDB" />
                  <Text style={styles.noImagesText}>No images selected</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.addImageButton,
                  updatedImages.length >= MAX_IMAGES && styles.disabledButton,
                ]}
                onPress={pickImage}
                disabled={updatedImages.length >= MAX_IMAGES}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={
                    updatedImages.length >= MAX_IMAGES ? "#aaa" : "#7E57C2"
                  }
                />
                <Text
                  style={[
                    styles.addImageText,
                    updatedImages.length >= MAX_IMAGES && styles.disabledText,
                  ]}
                >
                  {updatedImages.length >= MAX_IMAGES
                    ? "Maximum reached"
                    : "Add Images"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Product Details Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Product Details</Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Product Name*</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter product name"
                  value={updatedName}
                  onChangeText={setUpdatedName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Description*</Text>
                <TextInput
                  style={[styles.textInput, styles.descriptionInput]}
                  placeholder="Enter product description"
                  value={updatedDescription}
                  onChangeText={setUpdatedDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.flex1]}>
                  <Text style={styles.inputLabel}>Price*</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0.00"
                    value={updatedPrice}
                    onChangeText={setUpdatedPrice}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, styles.flex1]}>
                  <Text style={styles.inputLabel}>Stock Status*</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={stockStatus}
                      onValueChange={(itemValue) => setStockStatus(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="In Stock" value="in stock" />
                      <Picker.Item label="Out of Stock" value="out of stock" />
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateProduct}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Update Product</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  // Header Styles
  header: {
    backgroundColor: "#7E57C2",
    paddingTop: StatusBar.currentHeight + 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    paddingHorizontal: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  headerDecoration: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  // Loading and Empty States
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#616161",
    fontWeight: "500",
  },
  emptyIllustration: {
    alignItems: "center",
  },
  emptyTextContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#424242",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    lineHeight: 24,
  },

  // Product List Styles
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    width: 120,
    height: 140,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EDE7F6",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    padding: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: "#616161",
    marginBottom: 10,
    lineHeight: 20,
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#7E57C2",
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  inStock: {
    backgroundColor: "#E8F5E9",
  },
  outOfStock: {
    backgroundColor: "#FFEBEE",
  },
  stockText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#424242",
    textTransform: "uppercase",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  editButton: {
    backgroundColor: "#EDE7F6",
  },
  deleteButton: {
    backgroundColor: "#F3E5F5",
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "600",
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#fff",
    width: 12,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7E57C2",
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
    elevation: 4,
  },
  modalBackButton: {
    marginRight: 10,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    paddingBottom: 30,
  },

  // Image Section
  imageSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 15,
  },
  imageCarouselContainer: {
    marginBottom: 15,
  },
  mainImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#EDE7F6",
    marginBottom: 10,
  },
  thumbnailContainer: {
    marginBottom: 15,
  },
  thumbnailWrapper: {
    position: "relative",
    marginRight: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumbnail: {
    borderColor: "#7E57C2",
  },
  removeImageButton: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  noImagesContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDE7F6",
    borderRadius: 12,
    marginBottom: 15,
  },
  noImagesText: {
    marginTop: 10,
    color: "#7E57C2",
    fontSize: 16,
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1C4E9",
    borderRadius: 10,
    backgroundColor: "#EDE7F6",
  },
  addImageText: {
    marginLeft: 10,
    color: "#7E57C2",
    fontWeight: "600",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  disabledText: {
    color: "#aaa",
  },

  // Form Section
  formSection: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    marginHorizontal: -5,
  },
  flex1: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },

  // Save Button
  saveButton: {
    backgroundColor: "#7E57C2",
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ProductManage;
