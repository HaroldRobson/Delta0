import Banner from "./components/Banner/Banner";
import Home from "./components/Home/Home";
import s from "./App.module.css";
import Account from "./components/Account/Account";
import Bridge from "./components/Bridge";
import { Route, Routes } from "react-router-dom";
import useGetUserTokensQuery from "./hooks/useGetUserTokensQuery";

function App() {
  useGetUserTokensQuery();
  return (
    <div className={s.main}>
      <Banner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/bridge" element={<Bridge />} />
      </Routes>
    </div>
  );
}

export default App;
