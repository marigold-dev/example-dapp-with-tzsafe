# Example Dapp with TzSafe

This repo demos how to create a Dapp that can connect with [TzSafe](https://github.com/marigold-dev/tzsafe-ui), and buy an NFT through [objkt](https://objkt.com/) contract.

## How to install and run the Dapp?

```bash
git clone https://github.com/marigold-dev/example-dapp-with-tzsafe
```

```bash
cd example-dapp-with-tzsafe && npm i
```

```bash
npm run dev
```

## How to connect the Dapp to TzSafe?

Once the dapp is launch, you can go to [localhost:5173](https://localhost:5173/), and click on `Connect` to launch beacon modal. Once it's opened, you can scroll down, and click on `Display QR code`, then `Beacon` and finally `Copy to clipboard`. Once it's done, you can head to TzSafe's `Connect Dapp` page, and paste the code you just copied. Follow the steps until you authorize your wallet to connect to the Dapp, and once it's done, you can go back to the Dapp side.

If you encounter any trouble with the wallet connection, click on `Reset` and connect TzSafe again.

## How to buy an NFT?

You can update those 3 variables to change the contract address, token id and tez amount you want to have for the contract call.

```ts
const CONTRACT_ADDRESS = "KT1...";
const TOKEN_ID = 1;
const TEZ = 1;
```

And once it's done, you can just click on `Buy an NFT`, and go on TzSafe to create a proposal, and once it'll be resolved, the NFT will be inside your TzSafe wallet.

## About Taquito

Currently Taquito doesn't support @airgap/beacon-sdk `4.0.13beta1`, so in order to make it works, we copied their version of the beacon wallet, and fixed the function that was causing a crash. So if you look inside `taquitoClient.ts` you'll see that the only difference is line 263 with this change: `return account.publicKey ?? "";`.
The reason of this fix is pretty simple: so far all the connected wallet had a public key, which is not the case anymore with abstracted account.
