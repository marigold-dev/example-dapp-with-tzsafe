export async function getProposalIdOfCreatedProposal(txHash: string) {
  const [proposal] = await fetch(
    `https://api.ghostnet.tzkt.io/v1/operations/${txHash}`,
  ).then((r) => r.json());

  const [[_, id, __]] = await fetch(
    `https://api.ghostnet.tzkt.io/v1/contracts/events?select.values=id,payload,tag&transactionId=${proposal.id}&sort.desc=id`,
  ).then((r) => r.json());

  return id;
}
