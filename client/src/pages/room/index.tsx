import { FC, useEffect, useState, useMemo } from "react";
import Canvas from "./Canvas";
import { authStore } from "../../store/authStore";
import Info from "./Info";
import Modal from "../../components/ui/Modal";
import WaitingWord from "./WaitingWord";
import ChoosingWord from "./ChoosingWord";
import GameFinished from "./GameFinished";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/socket";
import { useParams } from "react-router-dom";
import Chat from "./Chat";
import Container from "../../components/Container";
import NoRoom from "./Message";
import { RoomInfo } from "../../interfaces/typing";
import { useSound } from "../../hooks/sound";
import { useTranslation } from "react-i18next";
import "./style.scss";
import Spinner from "../../components/ui/Spinner";

const Room: FC = () => {
  const { t } = useTranslation();
  const { id: roomId } = useParams();
  const { userId, username, avatar, level } = authStore((state) => state);
  const [roomInfo, setRoomInfo] = useState<RoomInfo>({} as RoomInfo);
  const [activeModal, setActiveModal] = useState<keyof typeof ModalComponents | "">();
  const [message, setMessage] = useState<string | null>();
  const [joining, setJoining] = useState<boolean>(false);
  const { socket } = useSocket();
  const { play } = useSound();
  const navigate = useNavigate();

  useEffect(() => {
    const joinedUser = {
      userId,
      username,
      avatar,
      level,
    };
    setJoining(true);
    socket?.emit("join-room", roomId, joinedUser);
    setTimeout(() => {
      setJoining(false);
    }, 2000);
  }, [socket, roomId]);

  useEffect(() => {
    socket?.on("send-info", handleInfoSended);
    socket?.on("word-changed", handleWordChanged);
    socket?.on("round-finished", handleRoundFinished);
    socket?.on("choosing-word-time-finished", handleChoosingWordTimeFinished);
    socket?.on("artist-left", handleArtistLeft);
    socket?.on("all-users-left", handleAllUsersLeft);
    socket?.on("game-finished", handleGameFinished);

    return () => {
      socket?.off("send-info");
      socket?.off("word-changed");
      socket?.off("round-finished");
      socket?.off("choosing-word-time-finished");
      socket?.off("artist-left");
      socket?.off("all-users-left");
      socket?.off("game-finished");

      () => {
        return "Are you sure you want to leave?";
      };
    };
  }, [socket]);

  const handleInfoSended = (roomInfo: RoomInfo) => {
    setJoining(false);
    if (!roomInfo) return;
    if (roomInfo.status == "waiting-room") {
      navigate(`/home?room=${roomInfo.code}`);
      return;
    }
    console.log("get-info", roomInfo);
    setRoomInfo(roomInfo);
    if (roomInfo.status !== "playing" && roomInfo.status != "finished") {
      setActiveModal(chooseOption(roomInfo.currentArtist.username));
    }
  };

  const handleWordChanged = (roomInfo: RoomInfo) => {
    console.log("word-changed", roomInfo);
    setRoomInfo(roomInfo);
    play("game-starting");
    setMessage("");
    setActiveModal("");
  };

  const handleRoundFinished = (roomInfo: RoomInfo) => {
    console.log("round-finished", roomInfo);
    play("round-finished");
    setRoomInfo(roomInfo);
    if (roomInfo.message) {
      setMessage(roomInfo.message);
    } else {
      if (roomInfo.lastWord) {
        setMessage(t("the-word-was") + " " + roomInfo.lastWord);
      }
    }
    if (roomInfo.currentArtist) {
      setActiveModal(chooseOption(roomInfo.currentArtist.username));
    }
  };

  const handleChoosingWordTimeFinished = (roomInfo: RoomInfo) => {
    console.log("choosing-word-time-finished", roomInfo);
    setRoomInfo(roomInfo);
    setActiveModal(chooseOption(roomInfo.currentArtist.username));
    setMessage(`${roomInfo.players[roomInfo.round - 2].username} ${t("lost-his-turn")}`);
  };

  const handleArtistLeft = (roomInfo: RoomInfo) => {
    console.log("artist-left", roomInfo);
    setRoomInfo(roomInfo);
    if (roomInfo.currentArtist) {
      setActiveModal(chooseOption(roomInfo.currentArtist.username));
    }
    setMessage(`${roomInfo.players[roomInfo.round - 2].username} ${t("left-the-room")}`);
  };

  const handleAllUsersLeft = (roomInfo: RoomInfo) => {
    console.log("all-users-left", roomInfo);
    setRoomInfo({} as RoomInfo);
    setMessage(roomInfo.message);
  };

  const handleGameFinished = (roomInfo: RoomInfo) => {
    console.log("game-finished", roomInfo);
    setRoomInfo(roomInfo);
    if (roomInfo.lastWord) {
      setMessage(t("the-word-was") + " " + roomInfo.lastWord);
    }
    setActiveModal("game-finished");
  };

  const handleWordSelected = (word: string) => {
    socket?.emit("word-selected", roomId, word);
  };

  const handleExit = () => {
    navigate("/home");
  };

  const ModalComponents = {
    "choosing-word": (
      <ChoosingWord
        time={roomInfo.choosingWordTime}
        onWordSelected={handleWordSelected}
        players={roomInfo.players}
        category={roomInfo.category}
        difficalty={roomInfo.difficalty}
        customWords={roomInfo.customWords}
        message={message}
      />
    ),
    "waiting-word": (
      <WaitingWord
        message={message}
        time={roomInfo.choosingWordTime}
        artist={roomInfo.currentArtist}
        players={roomInfo?.players}
      />
    ),
    "game-finished": (
      <GameFinished message={message} onExit={handleExit} players={roomInfo?.players} />
    ),
  };

  function chooseTitle(): string {
    if (roomInfo.round >= roomInfo?.players?.length && activeModal === "game-finished")
      return t("game-finished");
    return `${t("round")} ${roomInfo?.round}/${roomInfo?.players?.length} ${t("is-starting")}`;
  }

  function chooseOption(player: string): keyof typeof ModalComponents {
    return player === username ? "choosing-word" : "waiting-word";
  }

  const takeTime = useMemo(() => {
    return roomInfo?.status === "playing" ? roomInfo?.roundTime : 0;
  }, [roomInfo?.status]);

  return (
    <>
      {Object.keys(roomInfo).length != 0 ? (
        <>
          <Modal title={chooseTitle()} isOpen={!!activeModal}>
            {ModalComponents[activeModal || "choosing-word"]}
          </Modal>
          <Container className="room-page-container">
            <Info timer={takeTime} artist={roomInfo?.currentArtist?.username || ""} />
            <div className="canvas-chat-container">
              <Canvas
                canvasData={roomInfo?.drawings}
                socket={socket}
                word={roomInfo?.word}
                currentUserIsPlaying={username == roomInfo?.currentArtist?.username}
              />
              <Chat
                chat={roomInfo?.chat}
                socket={socket}
                currentUserIsPlaying={username == roomInfo?.currentArtist?.username}
              />
            </div>
          </Container>
        </>
      ) : (
        <Modal
          title={message ? message : joining ? t("search-for-room") : t("no-room-found")}
          isOpen={true}
        >
          {joining ? (
            <Spinner style={{ padding: "20px", overflow: "hidden" }} loading={joining} />
          ) : (
            <NoRoom />
          )}
        </Modal>
      )}
    </>
  );
};

export default Room;
