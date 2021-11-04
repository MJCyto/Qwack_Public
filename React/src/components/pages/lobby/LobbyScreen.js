import { LoadingScreen, ScreenWrapper } from "../../common/screenComponents";
import { Text, View, Alert, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import useDocument from "../../../hooks/useDocument";
import { useTheme } from "react-native-paper";
import { auth, functions } from "../../../conf/firebase";
import LeadersSection from "./LeadersSection";
import NormiesSection from "./NormiesSection";
import { Button } from "../../common/formComponents";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { connect } from "react-redux";
import { setGameCode } from "../../../actions/gameActions";
import { getIsLeader } from "../../../selectors/gameSelectors";
import GameScreen from "../game/GameScreen";
import { WarningText } from "../../auth/authComponents";

const LobbyScreen = props => {
  const { gameCode } = props.route.params;
  const { colors } = useTheme();
  const { navigation } = props;

  const [game, loading] = useDocument("games", gameCode);
  const [gameStarting, setGameStarting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isErrorTextActive, setErrorTextActive] = useState(false);

  const doError = message => {
    setErrorText(message.replace("Error: ", ""));
    setErrorTextActive(true);
    setTimeout(() => setErrorTextActive(false), 5000);
  };

  useEffect(
    () =>
      navigation.addListener("beforeRemove", e => {
        if (!game) {
          return;
        }
        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert("Leave Game?", "Are you sure you wish to leave this game?", [
          { text: "Cancel", style: "cancel", onPress: () => {} },
          {
            text: "Leave",
            style: "destructive",
            // If the user confirmed, then we dispatch the action we blocked earlier
            // This will continue the action that had triggered the removal of the screen
            onPress: () => {
              const leaveRequest = functions.httpsCallable("leaveGame");
              leaveRequest({ gameCode }).catch(error => {
                console.log(error);
              });
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      }),
    [navigation, game]
  );

  if (!game) {
    Alert.alert("", "Lobby Closed", [
      {
        text: "OK",
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
    return <ScreenWrapper backgroundColor={colors.background} />;
  }

  if (!game.teams) {
    return <LoadingScreen />;
  }

  const startGame = () => {
    setGameStarting(true);
    const startRequest = functions.httpsCallable("startGame");
    console.log("start button pressed");
    startRequest({ gameCode: gameCode })
      .then(() => setTimeout(() => setGameStarting(false), 1000))
      .catch(error => {
        // doError(error.toString());
        setGameStarting(false);
        doError(error.toString());
        console.log(error);
      });
  };

  const isHost = game && auth.currentUser.uid === game.hostUID;

  const returnToLobby = () => {
    return new Promise((resolve, reject) => {
      Alert.alert(
        "End current game?",
        "Returning to the lobby will end this game and bring all players back to the lobby.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              resolve(false);
            },
          },
          {
            text: "End Game",
            style: "destructive",
            onPress: () => {
              const endRequest = functions.httpsCallable("endGame");
              endRequest({ gameCode }).catch(error => {
                console.log(error);
              });
              resolve(true);
            },
          },
        ]
      );
    });
  };
  const leaveGame = () => {
    navigation.goBack();
  };

  if (game.gameState === "lobby") {
    return (
      <ScreenWrapper backgroundColor={colors.background}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
            maxWidth: "100%",
            flexWrap: "wrap",
            alignSelf: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 28,
              marginLeft: 20,
            }}
          >
            Game Code: {gameCode}
          </Text>
          {isHost && (
            <Button
              onPress={startGame}
              backgroundColor={colors.primary}
              color={`#fff`}
              style={{
                marginTop: 10,
                // marginBottom: 20,
                width: 55,
                borderRadius: 10,
                marginLeft: 20,
                marginRight: 20,
                alignContent: "center",
              }}
              loading={gameStarting}
              spinnerSize={20}
            >
              <FontAwesomeIcon icon={faPlay} size={20} color={colors.white} />
            </Button>
          )}
        </View>
        <WarningText active={isErrorTextActive} style={{ paddingLeft: 10, paddingRight: 10 }}>
          {errorText}
        </WarningText>
        <ScrollView>
          <LeadersSection isHost={isHost} teams={game.teams} gameCode={gameCode} />
          <NormiesSection isHost={isHost} teams={game.teams} gameCode={gameCode} />
        </ScrollView>
      </ScreenWrapper>
    );
  }
  return (
    <GameScreen
      gameCode={gameCode}
      game={game}
      loading={loading}
      returnToLobby={returnToLobby}
      leaveGame={leaveGame}
    />
  );
};
const mapStateToProps = state => ({
  isLeader: getIsLeader(state),
});

const mapDispatchToProps = dispatch => ({
  setGameCode: gameCode => dispatch(setGameCode(gameCode)),
});
export default connect(mapStateToProps, mapDispatchToProps)(LobbyScreen);
