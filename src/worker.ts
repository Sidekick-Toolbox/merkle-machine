import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

const getMerkleProof = (tree: MerkleTree, address: string) => {
  return tree.getHexProof(keccak256(address));
};

const getProofs = (
  addresses: string[],
  startingIndex: number,
  chunkSize: number
) => {
  const leaves = addresses.map((addr) => keccak256(addr));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  const proofs: { [address: string]: string[] } = {};

  for (let i = startingIndex; i < startingIndex + chunkSize; i++) {
    const address = addresses?.[i]?.toLowerCase();
    if (!address) {
      break;
    }
    proofs[address] = getMerkleProof(tree, address);

    // Report every 100 addresses
    if (i % 100 === 0) {
      postMessage({ type: "progress" });
    }
  }

  return proofs;
};

// Listen for messages from the main thread
addEventListener("message", (event) => {
  const { addresses, startingIndex, chunkSize } = event.data;

  const proofs = getProofs(addresses, startingIndex, chunkSize);

  console.log("Worker: Sending proofs back to main thread");
  // Send the proofs back to the main thread
  postMessage({ type: "proofs", proofs });
});
