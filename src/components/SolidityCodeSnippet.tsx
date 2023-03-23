import { CodeBlock, irBlack } from "react-code-blocks";

const SolidityCodeSnippet = () => {
    const codeString =
`// SPDX-License-Identifier: MIT
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
}

export default SolidityCodeSnippet;