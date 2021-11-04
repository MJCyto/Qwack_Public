import { TextInput, useTheme } from "react-native-paper";
import { Button } from "../common/formComponents";
import { View, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { auth } from "../../conf/firebase";
import {
  ChangeContext,
  InnerWrap,
  Logo,
  Title,
  WarningText,
  Wrapper,
} from "../auth/authComponents";
import { LoadingScreen, ScreenWrapper } from "../common/screenComponents";

const LoginPage = props => {
  const { navigation } = props;
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isErrorTextActive, setErrorTextActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const doError = (message, error) => {
    console.warn(error);
    setErrorText(message);
    setErrorTextActive(true);
    setTimeout(() => setErrorTextActive(false), 5000);
  };

  const login = async () => {
    auth.signInWithEmailAndPassword(email.toLowerCase(), password).catch(error => {
      doError("Incorrect Email or password.", error);
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "space-evenly",
            // backgroundColor: "red",
            height: "100%",
          }}
        >
          <Logo />
          <View style={{ marginBottom: 10 }}>
            <Title>Log In</Title>
            <WarningText active={isErrorTextActive}>{errorText}</WarningText>
            <InnerWrap>
              <View
                style={{
                  width: "100%",
                }}
              >
                <TextInput
                  onChangeText={setEmail}
                  label="Email"
                  value={email}
                  style={{ height: 50, marginBottom: 0 }}
                />
                <TextInput
                  secureTextEntry={true}
                  onChangeText={setPassword}
                  label="Password"
                  value={password}
                  style={{ height: 50 }}
                />
                <Button
                  onPress={login}
                  label={"Login"}
                  backgroundColor={colors.primary}
                  color={`#fff`}
                  style={{ marginTop: 10 }}
                />
              </View>
            </InnerWrap>

            <ChangeContext
              onPress={() => navigation.push("SignUp")}
              buttonLabel={"Sign Up"}
              question={"Dont have an account?"}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default LoginPage;
