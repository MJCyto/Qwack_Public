import { ScreenWrapper } from "../../common/screenComponents";
import React, { useState } from "react";
import { useTheme } from "react-native-paper";
import { auth, functions } from "../../../conf/firebase";
import styled from "styled-components";
import { getNormieStatusMessage, MessageBlock, whichTeamAmI } from "./helpers";
import { Text, ScrollView, ActivityIndicator, View } from "react-native";
import { faSkull } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import GameMenu from "./GameMenu";

const CardsWrapper = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const WordButtonWrapper = styled.TouchableOpacity`
  background-color: ${props => props.color};
  margin-bottom: 10px;
  margin-right: 5px;
  margin-left: 5px;
  width: 170px;
  position: relative;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  align-content: center;
`;

const WordButton = props => {
  const { isDeathWord, loading } = props;
  const { colors } = useTheme();

  return (
    <WordButtonWrapper {...props}>
      {loading ? (
        <View style={{ paddingTop: 14, paddingBottom: 14 }}>
          <ActivityIndicator size={22} color={"#fff"} />
        </View>
      ) : (
        <>
          {isDeathWord && <FontAwesomeIcon icon={faSkull} size={20} color={colors.white + 80} />}
          {props.children}
          {isDeathWord && <FontAwesomeIcon icon={faSkull} size={20} color={colors.white + 80} />}
        </>
      )}
    </WordButtonWrapper>
  );
};

const Word = styled.Text`
  color: ${props => props.color};

  padding: 10px;
  font-size: 20px;
`;

const NormieGameComponent = props => {
  const { colors } = useTheme();
  const { gameCode, game, returnToLobby, leaveGame, isHost, startGame } = props;

  const [turnEnding, setTurnEnding] = useState(false);

  const endTurn = () => {
    setTurnEnding(true);
    const endRequest = functions.httpsCallable("endTurn");
    endRequest({ gameCode: gameCode })
      .then(() => setTimeout(() => setTurnEnding(false), 1000))
      .catch(error => {
        // doError(error.toString());
        setTurnEnding(false);
        console.log(error);
      });
  };

  const [gameKey, setGameKey] = useState();
  const [wordBeingSent, setWordbeingSent] = useState();

  if (!gameKey) {
    const keyRequest = functions.httpsCallable("getKey");
    keyRequest({ gameCode })
      .then(keyRes => {
        setGameKey(keyRes.data);
      })
      .catch(error => {
        console.warn(error);
      });
    return null;
  }

  const doGuess = guess => {
    if (wordBeingSent) {
      return;
    }
    setWordbeingSent(guess);
    const guessRequest = functions.httpsCallable("guess");
    guessRequest({ gameCode: gameCode, guess })
      .then(() => {
        setTimeout(() => {
          setWordbeingSent(undefined);
        }, 100);
      })
      .catch(error => {
        setWordbeingSent(undefined);
        console.log(error);
      });
  };

  const team = whichTeamAmI(game);

  return (
    <View style={{ height: "100%", width: "100%", backgroundColor: colors.background }}>
      <GameMenu
        game={game}
        gameCode={gameCode}
        leaveGame={leaveGame}
        returnToLobby={returnToLobby}
        isHost={isHost}
        style={{ top: 27 }}
        startGame={startGame}
      />
      {gameKey && (
        <>
          <View
            style={{
              paddingTop: 50,
              backgroundColor: colors.surface,
              position: "relative",
            }}
          >
            <MessageBlock
              style={{
                padding: 10,
                height: 60,
                flexDirection: "column",
                position: "relative",
              }}
            >
              {getNormieStatusMessage(team, game)}
              {"\n"}
              {game.winReason}
            </MessageBlock>
          </View>
          <View
            style={{
              position: "relative",
              backgroundColor: colors[team],
              alignItems: "center",
              shadowColor: "#ffffff",
              width: "100%",
              bottom: 0,
            }}
          >
            <Text style={{ color: colors.white, fontSize: 15, padding: 10 }}>
              {team.charAt(0).toUpperCase() + team.slice(1) + " Team"}
            </Text>
          </View>
          <ScrollView persistentScrollbar={true} indicatorStyle={"white"}>
            <CardsWrapper style={{ backgroundColor: colors.background }}>
              {Object.keys(game.words).map(word => (
                <WordButton
                  color={
                    game.words[word] && game.words[word] !== "black"
                      ? colors[game.words[word]]
                      : colors.surface
                  }
                  onPress={() => {
                    if (game.gameState === team + "Normies") {
                      doGuess(word);
                    }
                  }}
                  key={word}
                  isDeathWord={game.words[word] === "black"}
                  loading={word === wordBeingSent}
                >
                  <Word color={game.words[word] === "white" ? colors.surface : colors.white}>
                    {word}
                  </Word>
                </WordButton>
              ))}
            </CardsWrapper>
          </ScrollView>
        </>
      )}

      {game.gameState === team + "Normies" && (
        <WordButton
          color={colors.warning}
          style={{ position: "absolute", top: 40 }}
          onPress={endTurn}
          loading={turnEnding}
        >
          <Word color={colors.white}>End Turn</Word>
        </WordButton>
      )}
    </View>
  );
};

export default NormieGameComponent;
