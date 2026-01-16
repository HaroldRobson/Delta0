export type HedgeParams = {
  address: number;
  amount: number;
};

// success, failure for now
export function hedge({ address, amount }: HedgeParams): boolean {
  console.log(`hedge call made amount: ${amount}, address: ${address}`);
  /*
   * Be reponsible for calling the associated smart contract function
   * maybe poll for status or something?
   * */
  return false;
}
