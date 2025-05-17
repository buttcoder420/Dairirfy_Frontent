import React, { useContext, useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Register from "./../RegisterForm/Register";
import SellerDashboard from "../Screens/SellerScreens/SellerDashboard";
import Login from "../RegisterForm/Login"; // This is the Login screen
import SplashScreen from "../Screens/SplashScreen";
import Home from "../Screens/Home";
import Test from "../Screens/Test";
import BuyerDashboard from "../Screens/BuyerScreens/BuyerDashboard";
import AdminDashboard from "../Screens/AdminScreen/AdminDashboard";
import { AuthContext } from "../Context/AuthContext"; // Import AuthContext
import CreateShop from "../Screens/SellerScreens/CreateShop";
import ProductManage from "../Screens/SellerScreens/ProductManage";
import AddProduct from "../Screens/SellerScreens/AddProduct";
import BuyerFooter from "../Screens/BuyerScreens/BuyerFooter";
import Order from "../Screens/BuyerScreens/Order";
import Sales from "../Screens/SellerScreens/Sales";
import UserBuy from "../Screens/BuyerScreens/UserBuy";
import BuyrOrderPage from "../Screens/BuyerScreens/BuyrOrderPage";
import Cart from "./../Screens/BuyerScreens/Cart";
import GetAllProduct from "../Screens/BuyerScreens/GetAllProduct";
import ProductDetail from "../Screens/BuyerScreens/ProductDetail";
import AllUser from "../Screens/AdminScreen/AllUser";
import AllShops from "../Screens/AdminScreen/AllShops";
import UserAccount from "../Screens/BuyerScreens/UserAccount";
import Profile from "../Screens/BuyerScreens/Profile";
import About from "../Screens/BuyerScreens/About";
import PrivacyPolicy from "../Screens/BuyerScreens/PrivacyPolicy";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen
            name="home"
            component={Home}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Register"
            component={Register}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="footer" component={BuyerFooter} />
        </>
      ) : (
        <>
          {user.role === "admin" ? (
            <>
              <Stack.Screen
                name="admindashboard"
                component={AdminDashboard}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="alluser"
                component={AllUser}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="allshop"
                component={AllShops}
                options={{ headerShown: false }}
              />
            </>
          ) : user.userField === "buyer" ? (
            <>
              <Stack.Screen
                name="buyerdashboard"
                component={BuyerDashboard}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="order"
                component={Order}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="account"
                component={UserAccount}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="profile"
                component={Profile}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="about"
                component={About}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="policy"
                component={PrivacyPolicy}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="productdetail"
                component={ProductDetail}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="getall"
                component={GetAllProduct}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="buy"
                component={UserBuy}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="cart"
                component={Cart}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="buyerorder"
                component={BuyrOrderPage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="test"
                component={Test}
                options={{ headerShown: false }}
              />
            </>
          ) : user.userField === "seller" ? (
            <>
              <Stack.Screen
                name="sellerdashboard"
                component={SellerDashboard}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="createshop"
                component={CreateShop}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="productmanage"
                component={ProductManage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="product"
                component={AddProduct}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="sales"
                component={Sales}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="profile"
                component={Profile}
                options={{ headerShown: false }}
              />
            </>
          ) : null}
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
