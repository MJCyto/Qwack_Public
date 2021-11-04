import { TextInput, useTheme } from "react-native-paper";
import { Button } from "../common/formComponents";
import { ScrollView, View, KeyboardAvoidingView } from "react-native";
import React, { useState } from "react";
import { auth } from "../../conf/firebase";
import { ChangeContext, InnerWrap, Logo, Title, WarningText } from "../auth/authComponents";
import { ScreenWrapper } from "../common/screenComponents";

const SignUpPage = props => {
  const { navigation } = props;
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isErrorTextActive, setErrorTextActive] = useState(false);

  const doError = (message, error) => {
    console.warn(error);
    setErrorText(message);
    setErrorTextActive(true);
    setTimeout(() => setErrorTextActive(false), 5000);
  };

  const addUser = async () => {
    auth.createUserWithEmailAndPassword(email.toLowerCase(), password).catch(error => {
      doError("Could not create an account.", error);
    });
  };

  const signUp = () => {
    if (password !== passwordConfirm) {
      doError("Passwords don't match", "");
    } else {
      addUser().then(res => console.log(res));
    }
  };
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
            <Title>Sign Up</Title>
            <WarningText active={isErrorTextActive}>{errorText}</WarningText>
            <KeyboardAvoidingView>
              <InnerWrap>
                <View
                  style={{
                    width: "100%",
                  }}
                >
                  <TextInput
                    onChangeText={setEmail}
                    onSubmitEditing={() => console.log("hello!")}
                    label="Email"
                    value={email}
                    style={{ height: 50 }}
                  />
                  <TextInput
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    label="Password"
                    value={password}
                    style={{ height: 50 }}
                  />
                  <TextInput
                    secureTextEntry={true}
                    onChangeText={setPasswordConfirm}
                    label="Repeat Password"
                    value={passwordConfirm}
                    style={{ height: 50 }}
                  />
                  <Button
                    onPress={signUp}
                    backgroundColor={colors.primary}
                    label={"Create Account"}
                    style={{ marginTop: 10 }}
                  />
                </View>
              </InnerWrap>
            </KeyboardAvoidingView>

            <ChangeContext
              onPress={() => navigation.goBack()}
              buttonLabel={"Log In"}
              question={"Already have an account?"}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default SignUpPage;
