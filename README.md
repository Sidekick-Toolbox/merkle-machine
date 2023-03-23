# Merkle Machine - Merkle tree generator
Website for making merkle trees. Can be used to make whitelists/allowlists for NFT mints
<img width="1000" alt="merkle-machine" src="https://user-images.githubusercontent.com/18232310/227134340-512bcdd9-ca9d-4ebc-888d-fb06bb39f89b.png">

## How to use

1. Visit the [Merkle Machine](https://www.merklemachine.xyz) website.
2. Enter the addresses for which you want to create a Merkle tree.
3. Click "Create Merkle tree" to generate the Merkle root.
4. Copy or download the Merkle root as a TXT or JSON file, or as a TypeScript API for a Next.js project.

## Next.js API
To use with Next.js, setup your Next typescript project first
You can do that by following [this guide](https://nextjs.org/docs/getting-started)

Then download the TypeScript files from [Merkle Machine](https://www.merklemachine.xyz) website.
And place them into your project like this
```
/src
proofs.ts <-- here
  /pages
    /api
      merkle.ts <-- here
```
You can now retrieve merkle proofs from /merkle?address=YOUR_ADDRESS_HERE

Here is an [example](https://www.merklemachine.xyz/api/merkle?address=0x70804f88A50090770cBdA783d52160E7E95d7822)

## Solidity example
This is how the proof verified within solidity, making sure only allowed people can mint.
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract WhitelistMint is ERC721 {
    bytes32 merkleRoot;
    uint256 tokenIdCounter;

    constructor(bytes32 _merkleRoot) ERC721("WhitelistMint", "WM") {
        merkleRoot = _merkleRoot;
    }

    function mint(bytes32[] memory _merkleProof) public {
        // This is where the merkle proof verification happens
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "Incorrect proof");

        _mint(msg.sender, tokenIdCounter);
        tokenIdCounter++;
    }
}
```

## Contributing
Contributions are welcome! Please feel free to submit a pull request.

## License
This project is licensed under the MIT License.
