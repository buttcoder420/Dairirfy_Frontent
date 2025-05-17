import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import axios from "axios";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const Profile = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    phoneNumber: "",
    whatsappNumber: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Smooth button animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.97,
        duration: 80,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 80,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Enhanced toast configuration
  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      position: "top",
      topOffset: 50,
      visibilityTime: 3000,
      autoHide: true,
      props: {
        style: styles.toastStyle,
        text1Style: styles.toastText1,
        text2Style: styles.toastText2,
      },
    });
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/users/me"
      );
      setUser(response.data.user);
      setFormData({
        firstName: response.data.user.firstName || "",
        lastName: response.data.user.lastName || "",
        userName: response.data.user.userName || "",
        phoneNumber: response.data.user.phoneNumber || "",
        whatsappNumber: response.data.user.whatsappNumber || "",
        address: response.data.user.address || "",
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showToast("error", "Error", "Failed to fetch user data");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        "https://finalyear-backend.onrender.com/api/v1/users/update-profile",
        formData
      );

      showToast("success", "Success", "Profile updated successfully");

      setUser(response.data.user);
      setEditMode(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to update profile"
      );
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("error", "Error", "Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        "https://finalyear-backend.onrender.com/api/v1/users/update-profile",
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }
      );

      showToast("success", "Success", "Password changed successfully");

      setPasswordMode(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to change password"
      );
    }
  };

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={styles.spinnerContainer}>
          <Ionicons
            name="ios-refresh"
            size={40}
            color="#7c4dff"
            style={{ transform: [{ rotate: loading ? "0deg" : "360deg" }] }}
          />
        </Animated.View>
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.emoji}>👨‍💼</Text>
            <View style={styles.onlineIndicator} />
          </View>

          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.actionButtons}>
            {!editMode && !passwordMode && (
              <>
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => {
                      animateButton();
                      setEditMode(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="edit-2"
                      size={16}
                      color="#fff"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Edit Profile</Text>
                  </TouchableOpacity>
                </Animated.View>

                <View style={{ width: 10 }} />

                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                  <TouchableOpacity
                    style={[styles.button, styles.changePasswordButton]}
                    onPress={() => {
                      animateButton();
                      setPasswordMode(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="lock"
                      size={16}
                      color="#fff"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Change Password</Text>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </View>
        </View>

        {/* Profile Form */}
        {editMode ? (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="user"
                    size={16}
                    color="#7c4dff"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, firstName: text })
                    }
                    placeholder="First Name"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="user"
                    size={16}
                    color="#7c4dff"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, lastName: text })
                    }
                    placeholder="Last Name"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="at-sign"
                  size={16}
                  color="#7c4dff"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.userName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, userName: text })
                  }
                  placeholder="Username"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="phone"
                    size={16}
                    color="#7c4dff"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={formData.phoneNumber}
                    onChangeText={(text) =>
                      setFormData({ ...formData, phoneNumber: text })
                    }
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>WhatsApp</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="logo-whatsapp"
                    size={16}
                    color="#7c4dff"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={formData.whatsappNumber}
                    onChangeText={(text) =>
                      setFormData({ ...formData, whatsappNumber: text })
                    }
                    placeholder="WhatsApp Number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="map-pin"
                  size={16}
                  color="#7c4dff"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: text })
                  }
                  placeholder="Your Address"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.formButtons}>
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={() => {
                    animateButton();
                    handleProfileUpdate();
                  }}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <Ionicons
                      name="ios-refresh"
                      size={18}
                      color="#fff"
                      style={{
                        transform: [{ rotate: loading ? "0deg" : "360deg" }],
                      }}
                    />
                  ) : (
                    <>
                      <Feather
                        name="check"
                        size={16}
                        color="#fff"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <View style={{ width: 10 }} />

              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    animateButton();
                    setEditMode(false);
                  }}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Feather
                    name="x"
                    size={16}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        ) : passwordMode ? (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Change Password</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="lock"
                  size={16}
                  color="#7c4dff"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={passwordData.oldPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, oldPassword: text })
                  }
                  placeholder="Current Password"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="lock"
                  size={16}
                  color="#7c4dff"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={passwordData.newPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, newPassword: text })
                  }
                  placeholder="New Password"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="lock"
                  size={16}
                  color="#7c4dff"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, confirmPassword: text })
                  }
                  placeholder="Confirm New Password"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.formButtons}>
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={() => {
                    animateButton();
                    handlePasswordChange();
                  }}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <Ionicons
                      name="ios-refresh"
                      size={18}
                      color="#fff"
                      style={{
                        transform: [{ rotate: loading ? "0deg" : "360deg" }],
                      }}
                    />
                  ) : (
                    <>
                      <Feather
                        name="check"
                        size={16}
                        color="#fff"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Update Password</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <View style={{ width: 10 }} />

              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    animateButton();
                    setPasswordMode(false);
                  }}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Feather
                    name="x"
                    size={16}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>Personal Details</Text>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Feather name="user" size={16} color="#fff" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoText}>
                  {user?.userName || "Not set"}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Feather name="phone" size={16} color="#fff" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoText}>
                  {user?.phoneNumber || "Not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>WhatsApp</Text>
                <Text style={styles.infoText}>
                  {user?.whatsappNumber || "Not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Feather name="map-pin" size={16} color="#fff" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoText}>
                  {user?.address || "Not provided"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Custom Toast Notification */}
      <Toast config={toastConfig} />
    </View>
  );
};

// Custom Toast Configuration
const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <Ionicons name="checkmark-circle" size={24} color="#fff" />
      <View style={styles.toastTextContainer}>
        <Text style={styles.toastText1}>{text1}</Text>
        <Text style={styles.toastText2}>{text2}</Text>
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <Ionicons name="close-circle" size={24} color="#fff" />
      <View style={styles.toastTextContainer}>
        <Text style={styles.toastText1}>{text1}</Text>
        <Text style={styles.toastText2}>{text2}</Text>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fe",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fe",
  },
  spinnerContainer: {
    transform: [{ rotate: "0deg" }],
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#7c4dff",
    fontWeight: "500",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 25,
    backgroundColor: "#7c4dff",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 20,
    shadowColor: "#7c4dff",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
    backgroundColor: "#fff",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  emoji: {
    fontSize: 50,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4caf50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    maxWidth: (width - 60) / 2,
    padding: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  editButton: {
    backgroundColor: "#651fff",
  },
  changePasswordButton: {
    backgroundColor: "#ff6d00",
  },
  saveButton: {
    backgroundColor: "#00c853",
  },
  cancelButton: {
    backgroundColor: "#ff3d00",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fe",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#212121",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#7c4dff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 3,
  },
  infoText: {
    fontSize: 14,
    color: "#212121",
    fontWeight: "500",
  },
  // Toast Styles
  toastContainer: {
    width: "90%",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  successToast: {
    backgroundColor: "#4caf50",
  },
  errorToast: {
    backgroundColor: "#f44336",
  },
  toastTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  toastText1: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  toastText2: {
    color: "#fff",
    fontSize: 13,
    marginTop: 2,
  },
});

export default Profile;
