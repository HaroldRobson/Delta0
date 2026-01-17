import { MdOutlineArrowOutward } from "react-icons/md";
import { useConnectModal } from "thirdweb/react";
import Button from "@components/Button/Button";
import type { ThirdwebClient } from "thirdweb";

export default function ConnectButton({ client }: { client: ThirdwebClient }) {
  const { connect, isConnecting } = useConnectModal();
  const label = "Connect";
  return (
    <Button
      color="var(--bg-dark)"
      bgColor="var(--accent-green)"
      disabled={isConnecting}
      onClick={() => {
        void connect({ client });
      }}
      label={label}
      icon={<MdOutlineArrowOutward />}
      glow
    />
  );
}
