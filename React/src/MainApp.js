import HostOrJoinScreen from "./components/pages/HostOrJoinScreen";
import JoinGameScreen from "./components/pages/JoinGameScreen";
import LobbyScreen from "./components/pages/lobby/LobbyScreen";
import LoginPage from "./components/pages/LoginPage";
import SignUpPage from "./components/pages/SignUpPage";
import { NavigationContainer } from "@react-navigation/native";
import { auth, functions } from "./conf/firebase";
import { useEffect, useState } from "react";
import {
  createStackNavigator,
  TransitionPresets,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import React from "react";
import GameScreen from "./components/pages/game/GameScreen";
import { connect } from "react-redux";
import { setUserName } from "./actions/userActions";

const Stack = createStackNavigator();

const animConfig = {
  animation: "spring",
  config: {
    stiffness: 1000,
    damping: 50,
    mass: 3,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

const MainApp = props => {
  const [user, setUser] = useState();
  const { setUserName } = props;

  useEffect(() => {
    auth.onAuthStateChanged(authUser => {
      const nameRequest = functions.httpsCallable("whatsMyName");
      nameRequest()
        .then(res => {
          console.log(res.data);
          setUserName(res.data);
        })
        .catch(error => {
          // doError(error.toString());
          console.log(error);
        });

      setUser(authUser);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // transitionSpec: { open: animConfig, close: animConfig },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          // ...TransitionPresets.RevealFromBottomAndroid,
        }}
        animation={"fade"}
      >
        {user ? (
          <>
            <Stack.Screen name="GameChoice" component={HostOrJoinScreen} />
            <Stack.Screen name="Join" component={JoinGameScreen} />
            <Stack.Screen name="Lobby" component={LobbyScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="SignUp" component={SignUpPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const mapDispatchToProps = dispatch => ({
  setUserName: username => dispatch(setUserName(username)),
});

export default connect(null, mapDispatchToProps)(MainApp);
