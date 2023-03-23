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

  const [percentageProgress, setPercentageProgress] = useState(0);
  const [creatingMerkleTree, setCreatingMerkleTree] = useState(false);

  const fillWithRandomAddresses = () => {
    const randomAddresses = [];

    for (let i = 0; i < 5000; i++) {
      let randomAddress = "0x";
      for (let j = 0; j < 40; j++) {
        randomAddress += Math.floor(Math.random() * 16).toString(16);
      }
      randomAddresses.push(randomAddress);
    }

    setAddressInput(randomAddresses.join("\n"));
    setAddresses(randomAddresses);
  };

  const onCopyRoot = () => {
    if (copied) return;
    navigator.clipboard.writeText(merkleRoot || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const getRootAndTree = () => {
    const leaves = addresses.map((addr) => keccak256(addr));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    setMerkleTree(tree);
    setMerkleRoot(root);
  };

  const createMerkleTree = async () => {
    setCreatingMerkleTree(true);
    setPercentageProgress(0);

    let proofs: { [address: string]: string[] } = {};

    const maxWorkers = 5;
    const desiredChunkSize = 1000;
    const workerCount = Math.min(
      Math.ceil(addresses.length / desiredChunkSize),
      maxWorkers
    );
    const chunkSize = Math.ceil(addresses.length / workerCount);

    let progress = 0;
    let finishedWorkers = 0;
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(new URL(".././worker.ts", import.meta.url));

      worker.postMessage({
        addresses,
        startingIndex: i * chunkSize,
        chunkSize,
      });
      worker.onmessage = (e) => {
        const { type } = e.data;

        if (type === "progress") {
          progress += 100;
          // Round to closest int
          setPercentageProgress(
            Math.round((progress / addresses.length) * 100)
          );
        } else if (type === "proofs") {
          const { proofs: generatedProofs } = e.data;
          proofs = { ...proofs, ...generatedProofs };
          finishedWorkers++;
          // Kill worker
          worker.terminate();
        }
      };
    }

    while (finishedWorkers < workerCount) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    getRootAndTree();
    setProofs(proofs);
    setCreatingMerkleTree(false);
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
            <p className="animate-spin">⚙️</p>
            <p className="animate-bounce">🌲</p>
          </div>
          <p>Generate merkle trees for ethereum smart contracts</p>
        </div>

        <Link
          href={process.env.NEXT_PUBLIC_GITHUB_URL || ""}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button onClick={() => {}}>
            <div className="flex gap-x-2 items-center">
              <p>View source on Github</p>

              <Image
                src="/github-mark-white.png"
                width={20}
                height={20}
                alt="Github logo"
              />
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
            <Button onClick={fillWithRandomAddresses}>
              Fill with random addresses
            </Button>
            <Button onClick={createMerkleTree}>
              {creatingMerkleTree
                ? `Creating tree ${percentageProgress}%`
                : "Create merkle tree"}
            </Button>
          </Section>

          <div
            className={`flex flex-col gap-y-16 ${
              !merkleRoot && "opacity-60 pointer-events-none"
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
              subtitle="The merkle proof verification happens at line 26."
            />
            <SolidityCodeSnippet />
          </div>
        </div>
      </main>
    </>
  );
}
