import { MdOutlineArrowOutward } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useActiveWallet, useConnectModal } from "thirdweb/react";
import client from "../../../../util/client";
import Button from "../../../Button/Button";

export default function GetStarted() {
  const navigate = useNavigate();
  const wallet = useActiveWallet();
  const { connect, isConnecting } = useConnectModal();
  const handleClick = () => {
    if (!wallet) {
      void handleConnect();
      return;
    }
    navigate("/trade");
  };
  const handleConnect = async () => {
    const wallet = await connect({ client }); // opens the connect modal
    console.log("connected to", wallet);
  };

  const label = "Get Started";
  return (
    <Button
      color="var(--bg-dark)"
      bgColor="var(--accent-green)"
      disabled={isConnecting}
      onClick={handleClick}
      label={label}
      icon={<MdOutlineArrowOutward />}
      glow
    />
  );
}
