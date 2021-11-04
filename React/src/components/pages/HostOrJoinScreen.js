import React, { useState } from "react";
import styled from "styled-components";
import { Dimensions, View, Text } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import { Button } from "../common/formComponents";
import { auth, functions } from "../../conf/firebase";
import { connect } from "react-redux";
import { setGameCode } from "../../actions/gameActions";
import { getGameCode } from "../../selectors/gameSelectors";
import { ScreenWrapper } from "../common/screenComponents";
import { getUserName } from "../../selectors/userSelectors";
import { TouchableOpacity } from "react-native-web";
import Modal from "../common/modal/Modal";
import { setUserName } from "../../actions/userActions";
import { Logo } from "../auth/authComponents";

const HostOrJoinScreen = props => {
  const { navigation, gameCode, setGameCode, userName, setUsername } = props;
  const { colors } = useTheme();
  const joinGame = () => navigation.navigate("Join");
  const [newName, setNewName] = useState(userName);
  const [modalVisible, setModalVisible] = useState(false);
  const [hostLoading, setHostLoading] = useState(false);

  if (gameCode.length === 4) {
    const joinRequest = functions.httpsCallable("joinGame");
    joinRequest({ gameCode })
      .then(gameRef => {
        navigation.navigate("Lobby", { gameCode: gameCode.toUpperCase() });
      })
      .catch(() => {
        setGameCode("");
      });
  }

  const logout = async () => {
    console.log("Logging out");
    auth.signOut().catch(error => console.warn(error));
  };

  const startHostedGame = () => {
    const addRequest = functions.httpsCallable("setUpGame");
    addRequest({})
      .then(gameRef => {
        navigation.navigate("Lobby", { gameCode: gameRef.data });
        setTimeout(() => {
          setHostLoading(false);
        }, 1000);
      })
      .catch(error => {
        console.log(error);
        setHostLoading(false);
      });
  };

  const changeUsername = () => {
    const changeNameRequest = functions.httpsCallable("changeName");
    changeNameRequest({ name: newName })
      .then(() => {
        setUsername(newName);
      })
      .catch(error => {
        console.log(error);
      });
  };

  return (
    <ScreenWrapper backgroundColor={colors.background} style={{ justifyContent: "space-evenly" }}>
      <Logo />

      <Modal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setNewName(userName);
        }}
      >
        <View>
          <Text style={{ color: colors.white, marginBottom: 20, fontSize: 20 }}>
            Change your username
          </Text>
          <TextInput onChangeText={setNewName} label="Username" value={newName} />
          <Button
            onPress={() => {
              changeUsername();
              setModalVisible(false);
            }}
            label={"Set"}
            backgroundColor={colors.primary}
            color={`#fff`}
            style={{ marginTop: 30, marginBottom: 5 }}
          />
          <Button
            onPress={() => {
              setModalVisible(false);
              setNewName(userName);
            }}
            label={"Cancel"}
            backgroundColor={colors.accent}
            color={`#fff`}
            style={{ marginTop: 10, marginBottom: 20 }}
          />
        </View>
      </Modal>
      <View style={{ paddingTop: 50, width: "100%", alignItems: "center" }}>
        <Text style={{ color: colors.white, fontSize: 30 }}>
          Hello <Text style={{ color: colors.accent }}>{userName}</Text>
        </Text>
        <Button
          onPress={() => setModalVisible(true)}
          label="Change Name"
          backgroundColor={colors.surface}
          style={{ marginTop: 10 }}
        />
      </View>

      <View
        style={{
          width: "100%",
          justifyContent: "center",
          padding: 50,
        }}
      >
        <Button
          onPress={() => {
            if (!hostLoading) {
              setHostLoading(true);
              startHostedGame();
            }
          }}
          label="Host Game"
          backgroundColor={colors.primary}
          style={{ marginBottom: 10 }}
          loading={hostLoading}
          // loading={true}
        />
        <Button
          onPress={joinGame}
          label="Join Game"
          backgroundColor={colors.primary}
          style={{ marginBottom: 30 }}
        />
        <Button
          onPress={logout}
          label={"Log out"}
          backgroundColor={colors.accent}
          style={{ justifySelf: "flex-end" }}
        />
      </View>
    </ScreenWrapper>
  );
};

const mapStateToProps = state => ({
  gameCode: getGameCode(state),
  userName: getUserName(state),
});

const mapDispatchToProps = dispatch => ({
  setGameCode: gameCode => dispatch(setGameCode(gameCode)),
  setUsername: name => dispatch(setUserName(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HostOrJoinScreen);
