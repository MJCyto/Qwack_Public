import { functions } from "../../conf/firebase";
import React, { useState } from "react";
import styled from "styled-components";
import { Dimensions } from "react-native";
import { Title, WarningText } from "../auth/authComponents";
import { TextInput, useTheme } from "react-native-paper";
import { Button } from "../common/formComponents";

let ScreenHeight = Dimensions.get("window").height;

const Wrapper = styled.View`
  background-color: ${props => props.backgroundColor};
  height: ${ScreenHeight}px;
  flex: 1;
  justify-content: center;
  padding: 40px;
`;

const JoinGameScreen = props => {
  const { navigation } = props;
  const { colors } = useTheme();
  const [gameCode, setGameCode] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isErrorTextActive, setErrorTextActive] = useState(false);
  const [isJoining, setJoining] = useState(false);

  const doError = message => {
    setErrorText(message);
    setErrorTextActive(true);
    setTimeout(() => setErrorTextActive(false), 7000);
  };

  const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

  const joinGame = () => {
    if (format.test(gameCode) || gameCode.length !== 4) {
      doError("Invalid Game code");
      return;
    }
    setJoining(true);
    const joinRequest = functions.httpsCallable("joinGame");
    joinRequest({ gameCode: gameCode })
      .then(() => {
        setTimeout(() => {
          setJoining(false);
        }, 1000);
        navigation.navigate("Lobby", { gameCode: gameCode.toUpperCase() });
      })
      .catch(error => {
        doError(error.toString());
        setJoining(false);
        console.log(error);
      });
  };

  return (
    <Wrapper backgroundColor={colors.background}>
      <Title>Join a Game</Title>
      <WarningText active={isErrorTextActive}>{errorText}</WarningText>
      <TextInput
        onChangeText={setGameCode}
        label="Code"
        value={gameCode}
        autoCapitalize="characters"
      />
      <Button
        onPress={joinGame}
        label={"Join Game"}
        backgroundColor={colors.primary}
        color={`#fff`}
        style={{ marginTop: 10, marginBottom: 20 }}
        loading={isJoining}
      />
    </Wrapper>
  );
};

export default JoinGameScreen;
