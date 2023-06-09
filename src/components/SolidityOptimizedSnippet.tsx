import { CodeBlock, irBlack } from "react-code-blocks";

const SolidityOptimizedSnippet = () => {
  const codeString = `// SPDX-License-Identifier: MIT
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
}`;

  return (
    <div className="text-xs border pr-4">
      <CodeBlock
        text={codeString}
        language={"typescript"}
        showLineNumbers={true}
        theme={irBlack}
        startingLineNumber={1}
        wrapLines
      />
    </div>
  );
};

export default SolidityOptimizedSnippet;
