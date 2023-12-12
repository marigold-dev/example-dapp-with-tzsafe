import { useEffect, useState } from "react";
import "./App.css";
import { TezosToolkit } from "@taquito/taquito";
import { RPC_URL } from "./config";
import { AccountInfo, NetworkType } from "@airgap/beacon-sdk";
import { BeaconWallet } from "./taquitoClient";
import { getProposalIdOfCreatedProposal } from "./utils";

const Tezos = new TezosToolkit(RPC_URL);
const beaconWallet = new BeaconWallet({
  name: "NFT example",
  preferredNetwork: NetworkType.GHOSTNET,
});
const CONTRACT_ADDRESS = "KT1MgFkiooUwjomkuFgqyxvAJhU3nwfWkAhx";
const TOKEN_ID = 1;
const TEZ = 1;

function App() {
  const [walletInfo, setWalletInfo] = useState<undefined | AccountInfo>();
  const [txHash, setTxHash] = useState<undefined | string>();
  const [waitingId, setWaitingId] = useState<undefined | string>();
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    beaconWallet.client.getActiveAccount().then((info) => {
      setWalletInfo(info);
      if (!!info) {
        Tezos.setWalletProvider(beaconWallet);
      }
    });
  }, []);

  useEffect(() => {
    if (!waitingId) return;
    const id = setInterval(() => {
      fetch(
        `https://api.ghostnet.tzkt.io/v1/contracts/events?contract=${walletInfo?.address}&tag=resolve_proposal&payload.proposal_id=${waitingId}`,
      )
        .then((r) => r.json())
        .then((v) => {
          const events = [...v];
          console.log(events);
          if (events.length === 0) return;

          if (events[0].payload.proposal_state.executed) {
            setClaimed(true);
          }

          clearInterval(id);
        });
    }, 5000);

    return () => {
      clearInterval(id);
    };
  }, [waitingId]);

  return (
    <>
      <h1>Test Dapp - {walletInfo ? walletInfo.address : "Not connected"}</h1>
      {!walletInfo ? (
        <div>
          <button
            style={{
              marginRight: "8px",
            }}
            onClick={async () => {
              await beaconWallet.requestPermissions({
                network: { type: NetworkType.GHOSTNET },
              });

              beaconWallet.client.getActiveAccount().then(setWalletInfo);

              Tezos.setWalletProvider(beaconWallet);
            }}
          >
            Connect
          </button>
          <button
            style={{
              marginLeft: "8px",
            }}
            onClick={async () => {
              await beaconWallet.disconnect();
              setWalletInfo(undefined);
              window.location = window.location;
            }}
          >
            Reset wallet
          </button>
        </div>
      ) : (
        <div>
          <button
            style={{
              marginRight: "8px",
            }}
            onClick={async () => {
              console.log(walletInfo);
              const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
              console.log(
                contract.methodsObject
                  .claim({
                    amount: 1,
                    burn_tokens: [],
                    condition_extra: undefined,
                    proxy_for: undefined,
                    token_id: TOKEN_ID,
                  })
                  .toTransferParams(),
              );
              const transaction = await contract.methodsObject
                .claim({
                  amount: 1,
                  burn_tokens: [],
                  condition_extra: undefined,
                  proxy_for: undefined,
                  token_id: TOKEN_ID,
                })
                .send({ amount: TEZ });
              await transaction.confirmation();
              setTxHash(transaction.opHash);
              getProposalIdOfCreatedProposal(transaction.opHash).then(
                setWaitingId,
              );
            }}
          >
            Buy an NFT
          </button>
          <button
            style={{
              marginLeft: "8px",
            }}
            onClick={async () => {
              await beaconWallet.disconnect();
              setWalletInfo(undefined);
              window.location = window.location;
            }}
          >
            Reset wallet
          </button>
        </div>
      )}
      {!!txHash && (
        <div style={{ marginTop: "16px" }}>
          <a href={`https://ghostnet.tzkt.io/${txHash}`} target="_blank">
            Transaction succeeded
          </a>
          <p>NFT will be claimed once proposal is validated in TzSafe</p>
        </div>
      )}
      {claimed && (
        <div style={{ marginTop: "16px" }}>
          <h2>NFT has been claimed!</h2>
        </div>
      )}
    </>
  );
}

export default App;
