export type WithdrawParams = {
  address: number;
  amount: number;
};

// success, failure for now
export function withdraw({ address, amount }: WithdrawParams): boolean {
  console.log(`withdraw call made amount: ${amount}, address: ${address}`);
  /*
   * Be reponsible for calling the associated smart contract function
   * maybe poll for status or something?
   * */
  return false;
}
