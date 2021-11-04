import { Image, Text, View } from "react-native";
import styled from "styled-components";
import { Button } from "../common/formComponents";
import React from "react";
import { useTheme } from "react-native-paper";
import { ScreenWrapper } from "../common/screenComponents";

export const Wrapper = styled(ScreenWrapper)`
  padding-top: 10px;
`;

export const WarningText = styled.Text`
  color: red;
  font-size: 15px;
  opacity: ${props => (props.active ? 1 : 0)};

  align-self: center;
`;

const InnerWrapDiv = styled.View`
  align-self: center;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25px;
  width: 90%;
  border-radius: 15px;
`;

export const InnerWrap = props => {
  return (
    <InnerWrapDiv
      {...props}
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
      }}
      backgroundColor={useTheme().colors.surface}
    >
      {props.children}
    </InnerWrapDiv>
  );
};

export const Title = styled.Text`
  color: white;
  font-size: 25px;
  align-self: center;
`;

export const ChangeContext = props => {
  const { question, buttonLabel, onPress } = props;
  const { colors } = useTheme();

  return (
    <View style={{ width: "60%", alignSelf: "center" }}>
      <Text style={{ color: "white", textAlign: "center", marginTop: 20 }}>{question}</Text>
      <Button
        onPress={onPress}
        label={buttonLabel}
        backgroundColor={colors.accent}
        style={{ marginTop: 10 }}
      />
    </View>
  );
};

export const Logo = props => {
  return (
    <View style={{ alignItems: "center", marginTop: 20, ...props.style }}>
      {/*<Text style={{ color: "white", fontSize: 20 }}>Qwack</Text>*/}
      <Image
        source={require("../../res/images/WhiteQwackLogo.png")}
        style={{ height: 150, width: 150, margin: -20 }}
      />
    </View>
  );
};
