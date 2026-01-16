import { ConnectButton } from "thirdweb/react";
import client from "../../util/client";
import s from "./banner.module.css";
import { NavLink } from "react-router-dom";
import classNames from "classnames";

type NavLinkProps = {
  location: string;
  label: string;
};

function NavItem({ location, label }: NavLinkProps) {
  return (
    <NavLink
      to={location}
      className={({ isActive }) =>
        classNames(s.navLink, { [s.active]: isActive })
      }
    >
      {label}
    </NavLink>
  );
}

export default function Banner() {
  return (
    <nav className={s.banner}>
      <div className={s.bannerLinks}>
        <NavItem location={"/"} label={"Home"} />
        <NavItem location={"/Trade"} label={"Trade"} />
      </div>
      <ConnectButton client={client} />
    </nav>
  );
}
