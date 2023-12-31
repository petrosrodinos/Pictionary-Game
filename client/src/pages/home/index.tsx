import { FC, useState, useEffect } from "react";
import RoomActions from "./RoomActions";
import LeaderBoard from "./LeaderBoard";
import RecentGames from "./RecentGames";
import Modal from "../../components/ui/Modal";
import JoinRoom from "./JoinRoom";
import { useSearchParams } from "react-router-dom";
import WaitingRoom from "./WaitingRoom";
import Container from "../../components/Container";
import CreateRoom from "./CreateRoom";
import { authStore } from "../../store/authStore";
import { useSocket } from "../../hooks/socket";
import { GameSettings } from "../../interfaces/typing";
import NavBar from "../../components/NavBar";
import { useTranslation } from "react-i18next";
import "./style.scss";

export type ModalType = "join-room" | "create-room" | "waiting-room" | "";

const Home: FC = () => {
  const { t } = useTranslation();
  const { userId } = authStore((state) => state);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeModal, setActiveModal] = useState<ModalType>("");
  const { socket } = useSocket();

  //useEffect detects for searchParams change and opens the waiting room modal
  useEffect(() => {
    const waitingRoom = searchParams.get("room");
    if (waitingRoom) {
      setActiveModal("waiting-room");
    } else {
      setActiveModal("");
    }
  }, [searchParams]);

  //setting modal type for opening specific modal depending on the action
  const handleActionClick = (action: ModalType) => {
    setActiveModal(action);
  };

  //when code is entered we are adding search params in the url
  //the search param is ?waitingRoom=code
  const handleJoinRoom = (code: string) => {
    if (!code) return;
    setSearchParams({
      room: code,
    });
  };

  const handleCancelRoomCreation = () => {
    setActiveModal("");
  };

  const handleCreateRoom = (settings: GameSettings) => {
    socket?.emit("create-room", {
      ...settings,
      creator: userId,
    });
    setSearchParams({
      room: settings.code,
    });
  };

  const handleLeaveWaitingRoom = () => {
    setSearchParams({});
  };

  const ModalComponents: any = {
    ["join-room"]: {
      title: t("join-a-room"),
      component: <JoinRoom onJoinRoom={handleJoinRoom} />,
    },
    ["create-room"]: {
      title: t("create-a-room"),
      component: <CreateRoom onCancel={handleCancelRoomCreation} onCreate={handleCreateRoom} />,
    },
    ["waiting-room"]: {
      title: t("waiting-room"),
      component: <WaitingRoom />,
      onClose: handleLeaveWaitingRoom,
    },
  };

  const handleModalClose = (item: any) => {
    setActiveModal("");
    item?.onClose?.();
  };

  return (
    <Container>
      <div className="home-page-container">
        <NavBar />
        <Modal
          title={ModalComponents?.[activeModal]?.title}
          isOpen={!!activeModal}
          onClose={() => handleModalClose(ModalComponents?.[activeModal])}
        >
          {ModalComponents?.[activeModal]?.component}
        </Modal>
        <div className="home-page-content">
          <div className="first-row">
            <RoomActions onActionClick={handleActionClick} />
            <LeaderBoard />
          </div>
          <RecentGames />
        </div>
      </div>
    </Container>
  );
};

export default Home;
