import Head from "next/head";
import Image from "next/image";
import { IBM_Plex_Mono, IBM_Plex_Sans, Inter } from "next/font/google";
import { useEffect, useState } from "react";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";

import {
  downloadAsNextJsApi,
  downloadProofsAsJSON,
  downloadRootAsTxt,
} from "../download";
import NextJsGuide from "@/components/NextJsGuide";
import SolidityCodeSnippet from "@/components/SolidityCodeSnippet";
import SectionTitle from "@/components/SectionTitle";
import Button from "../components/Button";
import Section from "@/components/Section";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--inter-font",
});

const ibm = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--ibm-font",
  weight: ["400", "500", "600", "700"],
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--ibm-mono-font",
  weight: ["400", "500", "600", "700"],
});

export default function Home() {
  const [addressInput, setAddressInput] = useState("");
  const [addresses, setAddresses] = useState<string[]>([]);
  const [proofs, setProofs] = useState<{ [address: string]: string[] }>({});
  const [merkleTree, setMerkleTree] = useState<MerkleTree>();
  const [merkleRoot, setMerkleRoot] = useState<string>("");
  const [addressCount, setAddressCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const onCopyRoot = () => {
    if (copied) return;
    navigator.clipboard.writeText(merkleRoot || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const getMerkleProof = (tree: MerkleTree, address: string) => {
    return tree.getHexProof(keccak256(address));
  };

  const createMerkleTree = () => {
    const leaves = addresses.map(addr => keccak256(addr))
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    const proofs: { [address: string]: string[] } = {};

    addresses.forEach((address) => {
      proofs[address.toLowerCase()] = getMerkleProof(tree, address);
    });

    setProofs(proofs);
    setMerkleRoot(root);
    setMerkleTree(tree);
  };

  useEffect(() => {
    const newAddresses = addressInput.match(/0x[a-fA-F0-9]{40}/g);
    setAddresses(newAddresses || []);
    if (newAddresses) {
      setAddressCount(newAddresses.length);
    } else {
      setAddressCount(0);
    }
  }, [addressInput]);

  return (
    <>
      <Head>
        <title>Merkle Machine ⚙️🌲</title>
        <meta
          name="description"
          content="Generate merkle trees for ethereum smart contracts"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`${inter.variable} ${ibm.variable} ${ibmMono.variable} flex flex-col items-center max-w-5xl gap-y-12 mx-auto py-20 antialiased`}
      >
        <div className="flex flex-col justify-center items-center">
          <div className="flex gap-x-3 text-3xl">
            <h1 className="font-black ">Merkle Machine</h1>
            <p className="animate-spin">
              ⚙️
            </p>
            <p className="animate-bounce">
              🌲
            </p>
          </div>
          <p>Generate merkle trees for ethereum smart contracts</p>
        </div>

        <Link href={process.env.NEXT_PUBLIC_GITHUB_URL || ""} target="_blank" rel="noopener noreferrer">
          <Button onClick={() => { }}>
            <div className="flex gap-x-2 items-center">
              <p>
                View source on Github
              </p>

              <Image src="/github-mark-white.png" width={20} height={20} alt="Github logo" />
            </div>
          </Button>
        </Link>

        <div className="flex flex-col gap-y-16">
          <Section>
            <SectionTitle
              title={`Addresses (${addressCount})`}
              subtitle="Seperate with new line, comma, space, or emojis. It doesn't matter."
            />
            <textarea
              className="h-72 text-xs bg-black outline-none p-2 text-white border  font-ibm-mono"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              autoFocus
            />
            <Button onClick={createMerkleTree}>Create Merkle tree</Button>
          </Section>

          <div
            className={`flex flex-col gap-y-16 ${!merkleRoot && "opacity-60 pointer-events-none"
              }`}
          >
            <Section>
              <SectionTitle
                title="Merkle root"
                subtitle="This is the root that you use in the contract to verify the proofs against."
              />
              <p className="bg-black outline-none p-2 h-8 text-white border text-xs font-ibm-mono">
                {merkleRoot}
              </p>
              <Button onClick={onCopyRoot}>
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button onClick={() => downloadRootAsTxt(merkleRoot)}>
                Download as txt
              </Button>
            </Section>

            <Section>
              <SectionTitle
                title="Download as JSON"
                subtitle="In case you don't want to use the Next.js API."
              />

              <div className="p-4 overflow-x-auto bg-black border max-h-40">
                <p className="text-xs whitespace-pre-wrap font-ibm-mono">
                  {JSON.stringify(proofs, null, 2)}
                </p>
              </div>

              <Button onClick={() => downloadProofsAsJSON(proofs)}>
                Download as JSON
              </Button>
            </Section>

            <Section>
              <SectionTitle
                title="Download as Next.js API"
                subtitle="Ready to use typescript API for Next.js"
              />
              <NextJsGuide />
              <Button onClick={() => downloadAsNextJsApi(proofs)}>
                Download as Next.js API
              </Button>
            </Section>
          </div>

          <div className="flex flex-col gap-y-2">
            <SectionTitle
              title="Solidity example"
              subtitle="The merkle proof verification happens at line 18."
            />
            <SolidityCodeSnippet />
          </div>
        </div>
      </main>
    </>
  );
}
