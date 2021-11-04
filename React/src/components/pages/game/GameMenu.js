import { faBars } from "@fortawesome/free-solid-svg-icons";
import { View, TouchableOpacity, Text } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, { useState } from "react";
import { useTheme } from "react-native-paper";
import styled from "styled-components";
import { Button } from "../../common/formComponents";
import { functions } from "../../../conf/firebase";

const MenuWrapper = styled.View`
  background-color: white;
  padding: 35px;
  padding-top: 25px;
  position: absolute;
  right: -10px;
  top: -10px;
  width: 300px;
  z-index: 4;
`;

const GameMenu = props => {
  const { colors } = useTheme();
  const { leaveGame, returnToLobby, isHost, getGameKey, isLeader } = props;
  const [loadingNewGame, setLoadingNewGame] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isEndingGame, setEndingGame] = useState(false);

  const newGame = () => {
    setLoadingNewGame(true);
    const startRequest = functions.httpsCallable("startGame");
    console.log("start button pressed");
    startRequest({ gameCode: gameCode })
      .then(() => {
        if (isLeader) {
          getGameKey();
        }
        setLoadingNewGame(false);
        setMenuOpen(false);
      })
      .catch(error => {
        setLoadingNewGame(false);
        console.log(error);
      });
  };

  const { gameCode } = props;

  return (
    <View style={{ padding: 10, position: "absolute", right: 10, top: 10, ...props.style }}>
      <View style={{ position: "relative" }}>
        <TouchableOpacity onPress={() => setMenuOpen(!isMenuOpen)} style={{ zIndex: 6 }}>
          <FontAwesomeIcon
            icon={faBars}
            size={30}
            color={isMenuOpen ? colors.background : colors.white}
          />
        </TouchableOpacity>
        {isMenuOpen && (
          <MenuWrapper style={{ backgroundColor: colors.popup }}>
            <Text style={{ color: colors.white, fontSize: 20, marginBottom: 20 }}>
              Game Code: {gameCode}
            </Text>
            <Button
              backgroundColor={colors.primary}
              color={colors.white}
              label={"Leave Game"}
              onPress={leaveGame}
              style={{ marginBottom: 10 }}
            />
            {isHost && (
              <>
                <Button
                  backgroundColor={colors.primary}
                  color={colors.white}
                  label={"End Game"}
                  onPress={async () => await returnToLobby().then(res => setEndingGame(res))}
                  style={{ marginBottom: 10 }}
                  loading={isEndingGame}
                />
                <Button
                  backgroundColor={colors.primary}
                  color={colors.white}
                  label={"New Game"}
                  onPress={newGame}
                  style={{ marginBottom: 10 }}
                  loading={loadingNewGame}
                />
              </>
            )}
          </MenuWrapper>
        )}
      </View>
    </View>
  );
};

export default GameMenu;
