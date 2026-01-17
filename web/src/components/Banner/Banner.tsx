import { ConnectButton } from "thirdweb/react";
import s from "./banner.module.css";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
import client from "@util/client";

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
      <NavLink to="/" className={s.logo}>
        Delta0
      </NavLink>
      <div className={s.rightSection}>
        <div className={s.bannerLinks}>
          <NavItem location={"/"} label={"Home"} />
          <NavItem location={"/Account"} label={"Account"} />
          <NavItem location={"/bridge"} label={"Bridge"} />
        </div>
        <ConnectButton client={client} />
      </div>
    </nav>
  );
}
