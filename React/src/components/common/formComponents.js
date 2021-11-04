import styled from "styled-components";
import React from "react";
import { ActivityIndicator } from "react-native";

const Wrapper = styled.TouchableOpacity`
  background-color: ${props => props.backgroundColor};
  color: ${props => props.color || `white`};
  padding: 15px;
  position: relative;
`;

const InnerText = styled.Text`
  text-align: center;
  text-transform: uppercase;
  color: #fff;
`;

export const Button = props => {
  const { backgroundColor, color, label, onPress, loading, children, spinnerSize } = props;
  return (
    <Wrapper backgroundColor={backgroundColor} onPress={onPress} {...props}>
      {loading ? (
        <ActivityIndicator size={spinnerSize || 22} color={"#fff"} />
      ) : (
        <InnerText color={color}>{label || children}</InnerText>
      )}
    </Wrapper>
  );
};
