import Button from "./components/Button/Button";
import Banner from "./components/Banner/Banner";
import s from "./App.module.css";
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

  can just do useAccount from wagmi? -> makes call to metamask extension
  user can connect their wallet via this


  Routing -> React router
  Can just have something like

  <Route path={'/'}>
    <HomePage />
  </Route>



  }



 * */

function App() {
  return (
    <>
      <div className={s.main}>
        <Banner />
        <Button
          rounded={true}
          onClick={() => {
            console.log("clicked");
          }}
          size="S"
          label={"btn rounded S"}
        />
        <Button
          rounded={true}
          onClick={() => {
            console.log("clicked");
          }}
          size="M"
          label={"btn rounded M"}
        />

        <Button
          onClick={() => {
            console.log("clicked");
          }}
          size="S"
          label={"btn S"}
        />
        <Button
          onClick={() => {
            console.log("clicked");
          }}
          size="M"
          label={"btn M"}
        />
      </div>
    </>
  );
}

export default App;
