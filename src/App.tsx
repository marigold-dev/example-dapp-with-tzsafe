import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { TezosToolkit } from "@taquito/taquito";
import { RPC_URL } from "./config";
import { AccountInfo, NetworkType } from "@airgap/beacon-sdk";
import { BeaconWallet } from "./taquitoWallet";
import { getProposalIdOfCreatedProposal, omit } from "./utils";
import { stringToBytes } from "@taquito/utils";

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
  const [waitingChallenges, setWaitingChallenges] = useState<
    Record<string, string>
  >({});

  const storeWaitingChallenge = (payloadHash: string, payload: string) => {
    const payloadEncoded = stringToBytes(payload);
    setWaitingChallenges((old) => ({ ...old, [payloadHash]: payloadEncoded }));
  };

  const removeWaitingChallenge = useCallback(
    (payloadHash: string) => {
      setWaitingChallenges(omit(payloadHash, waitingChallenges));
    },
    [waitingChallenges]
  );

  const connectWithSimulatedProofOfEvent = async () => {
    const operationList = await beaconWallet.requestSimulatedProofOfEvent();

    console.log("Operations:", atob(operationList));

    const preapply = await Tezos.rpc.preapplyOperations(
      JSON.parse(atob(operationList))
    );

    console.log("Preapply response:", preapply);

    if (
      preapply[0].contents.every(
        (transaction) =>
          // @ts-expect-error - We know the type that'll be returned
          transaction.metadata.internal_operation_results[0].result.status ===
          "applied"
      )
    ) {
      console.log(
        "The emitted proof of event:",
        // @ts-expect-error - We know the type that'll be returned
        preapply[0].contents[2].metadata.internal_operation_results[2]
      );
      console.warn("Simulated Proof Of Event succeeded");
      return true;
    } else {
      console.warn("Simulated Proof Of Event failed");
      return false;
    }
  };

  useEffect(() => {
    beaconWallet.client.getActiveAccount().then((info) => {
      setWalletInfo(info);
      if (info) {
        Tezos.setWalletProvider(beaconWallet);
      }
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      Object.keys(waitingChallenges).forEach((payloadHash) => {
        return fetch(
          `https://api.ghostnet.tzkt.io/v1/contracts/events?contract=${walletInfo?.address}&tag=proof_of_event&payload=${waitingChallenges[payloadHash]}`
        )
          .then((r) => r.json())
          .then((eventChallenges) => {
            if (eventChallenges.length !== 0) {
              return removeWaitingChallenge(payloadHash);
            }
          });
      });
    }, 5000);

    return () => {
      clearInterval(id);
    };
  }, [waitingChallenges, walletInfo?.address, removeWaitingChallenge]);

  console.log(waitingChallenges);

  useEffect(() => {
    if (!waitingId) return;
    const id = setInterval(() => {
      fetch(
        `https://api.ghostnet.tzkt.io/v1/contracts/events?contract=${walletInfo?.address}&tag=resolve_proposal&payload.proposal_id=${waitingId}`
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
              marginRight: "8px",
            }}
            onClick={async () => {
              await beaconWallet.requestPermissions({
                network: { type: NetworkType.GHOSTNET },
              });

              const isVerified = await connectWithSimulatedProofOfEvent();
              if (!isVerified) return;
              beaconWallet.client.getActiveAccount().then(setWalletInfo);

              Tezos.setWalletProvider(beaconWallet);
            }}
          >
            Connect with Simulated Proof Of Event
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
                  .toTransferParams()
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
                setWaitingId
              );
            }}
          >
            Buy an NFT
          </button>
          <button
            style={{
              marginRight: "8px",
            }}
            onClick={async () => {
              const operationList =
                await beaconWallet.requestSimulatedProofOfEvent();

              console.log("Operations:", atob(operationList));

              const preapply = await Tezos.rpc.preapplyOperations(
                JSON.parse(atob(operationList))
              );

              console.log("Preapply response:", preapply);

              if (
                preapply[0].contents.every(
                  (transaction) =>
                    // @ts-expect-error - We know the type that'll be returned
                    transaction.metadata.internal_operation_results[0].result
                      .status === "applied"
                )
              ) {
                console.log(
                  "The emitted proof of event:",
                  preapply[0].contents[2].metadata.internal_operation_results[2]
                );
                alert("Simulated Proof Of Event succeeded");
              } else {
                alert("Simulated Proof Of Event failed");
              }
            }}
          >
            Simulated Proof of Event
          </button>

          <button
            style={{
              marginRight: "8px",
            }}
            onClick={async () => {
              const payload = new Date().toISOString();

              const poeResponse = await beaconWallet.requestProofOfEvent(
                payload
              );

              storeWaitingChallenge(poeResponse.payloadHash, payload);
            }}
          >
            Proof of Event
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
