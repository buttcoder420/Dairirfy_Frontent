import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import moment from "moment";

const AllUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatLastLogin = (lastLoginAt) => {
    if (!lastLoginAt)
      return { text: "Never logged in", color: "#b2bec3", days: null };

    const now = moment();
    const lastLogin = moment(lastLoginAt);
    const daysDiff = now.diff(lastLogin, "days");
    const hoursDiff = now.diff(lastLogin, "hours");
    const minutesDiff = now.diff(lastLogin, "minutes");

    if (minutesDiff < 1) {
      return {
        text: "Just now",
        color: "#00b894",
        days: 0,
      };
    } else if (hoursDiff < 1) {
      return {
        text: `${minutesDiff} minute${minutesDiff === 1 ? "" : "s"} ago`,
        color: "#00b894",
        days: 0,
      };
    } else if (daysDiff === 0) {
      return {
        text: "Today at " + lastLogin.format("h:mm A"),
        color: "#00b894",
        days: 0,
      };
    } else if (daysDiff === 1) {
      return {
        text: "Yesterday at " + lastLogin.format("h:mm A"),
        color: "#00cec9",
        days: 1,
      };
    } else if (daysDiff <= 7) {
      return {
        text: `${daysDiff} days ago (${lastLogin.format("MMM D")})`,
        color: "#fdcb6e",
        days: daysDiff,
      };
    } else {
      return {
        text: `${daysDiff} days ago (${lastLogin.format("MMM D, YYYY")})`,
        color: "#d63031",
        days: daysDiff,
      };
    }
  };

  const showToast = (message, isSuccess = true) => {
    Alert.alert(
      isSuccess ? "Success ✅" : "Error ❌",
      message,
      [{ text: "OK" }],
      { cancelable: true }
    );
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/users/all"
      );
      if (response.data?.success) {
        const processedUsers = response.data.users.map((user) => ({
          ...user,
          loginInfo: formatLastLogin(user.lastLoginAt),
        }));
        setUsers(processedUsers);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
      showToast("Could not fetch users. Check server connection.", false);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await axios.delete(
                `https://finalyear-backend.onrender.com/api/v1/users/delete/${userId}`
              );
              setUsers((prevUsers) =>
                prevUsers.filter((user) => user._id !== userId)
              );
              showToast("User deleted successfully.");
            } catch (err) {
              console.error("Error deleting user:", err);
              showToast("Could not delete user.", false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setModalVisible(true);
  };

  const updateUser = async () => {
    if (!editUser) return;
    try {
      const response = await axios.put(
        `https://finalyear-backend.onrender.com/api/v1/users/update/${editUser._id}`,
        editUser
      );
      if (response.data?.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === editUser._id
              ? {
                  ...response.data.user,
                  loginInfo: formatLastLogin(response.data.user.lastLoginAt),
                }
              : user
          )
        );
        showToast("User updated successfully.");
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      showToast("Could not update user.", false);
    } finally {
      setModalVisible(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const renderItem = ({ item, index }) => (
    <View style={styles.userCard}>
      <View style={styles.userIndex}>
        <Text style={styles.indexText}>{indexOfFirstUser + index + 1}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstName} {item.lastName}
          {item.role === "admin" && (
            <Text style={styles.adminBadge}> ADMIN</Text>
          )}
        </Text>
        <View style={styles.detailRow}>
          <Icon name="email" size={16} color="#6c5ce7" />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="person" size={16} color="#6c5ce7" />
          <Text style={styles.detailText}>@{item.userName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="phone" size={16} color="#6c5ce7" />
          <Text style={styles.detailText}>{item.phoneNumber || "N/A"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="access-time" size={16} color="#6c5ce7" />
          <Text style={[styles.detailText, { color: item.loginInfo.color }]}>
            {item.loginInfo.text}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="circle" size={12} color={item.loginInfo.color} />
          <Text
            style={[
              styles.detailText,
              {
                color: item.loginInfo.color,
                fontWeight: "bold",
              },
            ]}
          >
            {item.loginInfo.days === null
              ? "Never active"
              : item.loginInfo.days === 0
              ? "Active User"
              : item.loginInfo.days <= 7
              ? `Active ${item.loginInfo.days} day${
                  item.loginInfo.days === 1 ? "" : "s"
                } ago`
              : `Inactive for ${item.loginInfo.days} days`}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Icon name="edit" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteUser(item._id)}
        >
          <Icon name="delete" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={50} color="#ff7675" />
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#fff"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#e0e0e0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          Showing {currentUsers.length} of {filteredUsers.length} users
        </Text>
      </View>

      <FlatList
        data={currentUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={50} color="#b2bec3" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.paginationButton}
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <Icon
              name="chevron-left"
              size={24}
              color={currentPage === 1 ? "#dfe6e9" : "#6c5ce7"}
            />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            style={styles.paginationButton}
            onPress={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <Icon
              name="chevron-right"
              size={24}
              color={currentPage === totalPages ? "#dfe6e9" : "#6c5ce7"}
            />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit User</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#6c5ce7" />
                </TouchableOpacity>
              </View>

              {editUser && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      value={editUser.firstName}
                      onChangeText={(text) =>
                        setEditUser((prev) => ({ ...prev, firstName: text }))
                      }
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      value={editUser.lastName}
                      onChangeText={(text) =>
                        setEditUser((prev) => ({ ...prev, lastName: text }))
                      }
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={editUser.email}
                      onChangeText={(text) =>
                        setEditUser((prev) => ({ ...prev, email: text }))
                      }
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Username</Text>
                    <TextInput
                      style={styles.input}
                      value={editUser.userName}
                      onChangeText={(text) =>
                        setEditUser((prev) => ({ ...prev, userName: text }))
                      }
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      value={editUser.phoneNumber}
                      onChangeText={(text) =>
                        setEditUser((prev) => ({ ...prev, phoneNumber: text }))
                      }
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Address</Text>
                    <TextInput
                      style={[styles.input, { height: 80 }]}
                      value={editUser.address}
                      onChangeText={(text) =>
                        setEditUser((prev) => ({ ...prev, address: text }))
                      }
                      multiline
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={updateUser}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#ff7675",
    marginVertical: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#6c5ce7",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "#6c5ce7",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
  },
  searchContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    elevation: 1,
  },
  countText: {
    color: "#636e72",
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userIndex: {
    backgroundColor: "#6c5ce7",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  indexText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#2d3436",
  },
  adminBadge: {
    fontSize: 12,
    color: "#fff",
    backgroundColor: "#e84393",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  detailText: {
    marginLeft: 8,
    color: "#636e72",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#00b894",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: "#d63031",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    elevation: 2,
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
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  pageText: {
    marginHorizontal: 15,
    color: "#636e72",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2d3436",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 6,
    color: "#636e72",
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f5f6fa",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#2d3436",
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  saveButton: {
    backgroundColor: "#6c5ce7",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 0,
    marginBottom: 100,
    elevation: 2,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AllUser;
