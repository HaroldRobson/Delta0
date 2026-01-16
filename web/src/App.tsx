import Banner from "./components/Banner/Banner";
import s from "./App.module.css";
import { Route, Routes } from "react-router-dom";
/*
 * Need:
 * Landing page
 * - tagline
 * - nav
 *   - connect to metamask tr
 *   - title tl
 * - display current yield
 *   - want some copy in middle with what the project is about
 * - probably want some reusable btn components
  a

  w.r.t. calling smart contracts
  on deploy we should get the deployed contract address and
  the functions as const

 * */

function Screen2() {
  return (
    <div>
      <p>screen 2</p>
    </div>
  );
}

function Home() {
  return (
    <div>
      <p>home</p>
    </div>
  );
}

function App() {
  return (
    <div className={s.main}>
      <Banner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/screen-2" element={<Screen2 />} />
      </Routes>
    </div>
  );
}

export default App;
