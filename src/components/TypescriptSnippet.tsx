import { CodeBlock, irBlack } from "react-code-blocks";

const TypescriptSnippet = () => {
    const codeString =
`import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";
import { addresses } from "./addresses";

const makeProof = (address: string, tree: MerkleTree) => {
  const proof = tree.getHexProof(keccak256(address));

  return proof;
};

const makeTree = () => {
  const leaves = addresses.map((addr) => keccak256(addr));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree;
};

// Example usage making proof for first address
const tree = makeTree();
const proof = makeProof(addresses[0], tree);
console.log(proof);
`;

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

export default TypescriptSnippet;
