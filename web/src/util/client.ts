import { createThirdwebClient } from "thirdweb";
import config from "../config/config";

const client = createThirdwebClient({
  clientId: config.thirdwebClientId,
});

export default client;
