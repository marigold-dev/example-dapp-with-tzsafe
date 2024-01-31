#!bash

rm -r node_modules/@airgap/beacon-blockchain-substrate/dist
rm -r node_modules/@airgap/beacon-blockchain-tezos/dist
rm -r node_modules/@airgap/beacon-core/dist
rm -r node_modules/@airgap/beacon-dapp/dist
rm -r node_modules/@airgap/beacon-sdk/dist
rm -r node_modules/@airgap/beacon-transport-matrix/dist
rm -r node_modules/@airgap/beacon-transport-postmessage/dist
rm -r node_modules/@airgap/beacon-transport-walletconnect/dist
rm -r node_modules/@airgap/beacon-types/dist
rm -r node_modules/@airgap/beacon-ui/dist
rm -r node_modules/@airgap/beacon-utils/dist
rm -r node_modules/@airgap/beacon-wallet/dist

cp -r ../beacon-sdk/packages/beacon-blockchain-substrate/dist node_modules/@airgap/beacon-blockchain-substrate/dist
cp -r ../beacon-sdk/packages/beacon-blockchain-tezos/dist node_modules/@airgap/beacon-blockchain-tezos/dist
cp -r ../beacon-sdk/packages/beacon-core/dist node_modules/@airgap/beacon-core/dist
cp -r ../beacon-sdk/packages/beacon-dapp/dist node_modules/@airgap/beacon-dapp/dist
cp -r ../beacon-sdk/packages/beacon-sdk/dist node_modules/@airgap/beacon-sdk/dist
cp -r ../beacon-sdk/packages/beacon-transport-matrix/dist node_modules/@airgap/beacon-transport-matrix/dist
cp -r ../beacon-sdk/packages/beacon-transport-postmessage/dist node_modules/@airgap/beacon-transport-postmessage/dist
cp -r ../beacon-sdk/packages/beacon-transport-walletconnect/dist node_modules/@airgap/beacon-transport-walletconnect/dist
cp -r ../beacon-sdk/packages/beacon-types/dist node_modules/@airgap/beacon-types/dist
cp -r ../beacon-sdk/packages/beacon-ui/dist node_modules/@airgap/beacon-ui/dist
cp -r ../beacon-sdk/packages/beacon-utils/dist node_modules/@airgap/beacon-utils/dist
cp -r ../beacon-sdk/packages/beacon-wallet/dist node_modules/@airgap/beacon-wallet/dist
