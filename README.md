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
pragma solidity ^0.8.13;

import "erc721a/contracts/ERC721A.sol";
import "vectorized/solady/src/utils/MerkleProofLib.sol";
import "vectorized/solady/src/auth/Ownable.sol";

contract WhitelistMint is ERC721A, Ownable {
    error InvalidProof();
    error AlreadyMinted();

    bytes32 merkleRoot;

    constructor(bytes32 _merkleRoot) ERC721A("WhitelistMint", "WM") {
        // Adds initial merkle root.
        merkleRoot = _merkleRoot; 

        // Initializes the owner directly without authorization guard.
        _initializeOwner(msg.sender); 
    }

    /// @dev Mints a token to the msg.sender, if the merkle proof is valid.
    /// @param _merkleProof The merkle proof that will be used for verification.
    function mint(bytes32[] calldata _merkleProof) external payable {
        // This is where the merkle proof verification happens
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProofLib.verifyCalldata(_merkleProof, merkleRoot, leaf)) revert InvalidProof(); 

        // We check if the proof has been used before.
        if (_getAux(msg.sender) != 0) revert AlreadyMinted(); 

        // We set the aux to 1, to indicate that the proof has been used.
        _setAux(msg.sender, 1); 
        _mint(msg.sender, 1);
    }

    /// @dev Sets the merkle root to a new value.
    /// @param _merkleRoot The new merkle root.
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }
}
```

## Contributing
Contributions are welcome! Please feel free to submit a pull request.

## License
This project is licensed under the MIT License.
