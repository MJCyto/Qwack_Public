import styled from "styled-components";
import { useTheme } from "react-native-paper";
import React from "react";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

const Wrapper = styled.View`
  background-color: ${props => props.color};
  position: relative;
  border-radius: 10px;
  padding: 30px;
  padding-top: 50px;
  width: 90%;
`;

export const Blackout = styled.TouchableOpacity`
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  height: 100%;
  width: 100%;
  z-index: 10;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const CloseWrapper = styled.TouchableOpacity`
  position: absolute;
  top: 15px;
  right: 15px;
`;

const Modal = props => {
  const { visible, children, onClose } = props;
  const { colors } = useTheme();

  if (visible) {
    return (
      <Blackout onPress={onClose}>
        <Wrapper color={colors.surface}>
          <CloseWrapper onPress={onClose}>
            <FontAwesomeIcon icon={faTimesCircle} size={40} color={colors.accent} />
          </CloseWrapper>
          {children}
        </Wrapper>
      </Blackout>
    );
  }
  return null;
};

export default Modal;
