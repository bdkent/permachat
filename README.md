# permachat

## What is permachat?
Great question! It's an experiment to make a permanent, decentralized chat app built using Web3 technology.

## OK, but what does any of that actually mean?
On one level, permachat is really a simple Twitter clone / blogging app. It differs in a few interesting ways though.

All posts are public and immutable. It is literally impossible to make an edit or delete a post. All content is written to one of those blockchains everyone is talking about (specifically [Ethereum](https://www.ethereum.org/)) and stored on the [InterPlanetary File System](https://ipfs.io) (IPFS).

That makes permachat decentralized in the sense that it is not controlled by one company. Unlike a company that can go out of business and shut down their servers, permachat lives as long as the Etherem blockchain and IPFS live!  (Such is the exciting promise of the decentralied web!)

## That sounds great! I want to try it!
[perma.chat](http://perma.chat) points to the latest version. (Currently permachat is only deployed to the `rinkeby` test network.)

But be warned! _Everything_ about Web3 is confusing. Seriously everything. In order to interact with permachat (or any Ethereum DApp) from the browser, you will need a weird plugin called [MetaMask](https://metamask.io/). Once you go through the tedium of making an account there, you will need to add some funds. Yes, everything on the blockchain costs money. Not a lot, but something. (That is the cost of decentralization I suppose.) So once you have the MetaMask account ready, go to the `rinkeby` network in the dropdown and click to [add funds](https://faucet.rinkeby.io). Because `rinkeby` is only a test network, it is free (albeit tedius).

Now you can connect to permachat, but you aren't done yet! You need to make an account on permachat! In order to use permachat you must have a "web presence" somewhere so we don't end up being a platform for randos to spout unattributed garbage! So you must associate your account with an profile from a different platform where you have a real picture and have "made content" in at least 8 of the last 12 months. Currently, the only platforms you can use for identification are: Twitter, GitHub. Click the little user icon in the upper right of permachat to get started.

Now you can use permachat! So easy and worth it, right?!

## Is this really decentralized?
Not really! Currently, permachat dependents on [infura](https://infura.io) to provide both the IPFS gateway and the Ethereum gateway (used by MetaMask).

With more effort on your part, you could enjoy the _full_ decentralized experience courtesy of the [Mist](https://github.com/ethereum/mist#installation) browser and running [IPFS](https://docs.ipfs.io/introduction/install/) locally!

# Releases
The permachat webapp is deployed to IPFS. `perma.chat` should always point to the latest release.
- latest: [QmabquXsuKUmQVtyb4S6rckABCCQrA3iW6mhKG5ZyytDmq](https://ipfs.io/ipfs/QmabquXsuKUmQVtyb4S6rckABCCQrA3iW6mhKG5ZyytDmq)

