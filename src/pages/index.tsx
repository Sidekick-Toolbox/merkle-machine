import Head from "next/head";
import Image from "next/image";
import { IBM_Plex_Mono, IBM_Plex_Sans, Inter } from "next/font/google";
import { useEffect, useState } from "react";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";

import {
  downloadProofsAsJSON,
  downloadProofsTs,
  downloadRootAsTxt,
} from "../download";
import NextJsGuide from "@/components/NextJsGuide";
import SolidityOptimizedCodeSnippet from "@/components/SolidityOptimizedSnippet";
import SolidityCodeSnippet from "@/components/SoliditySnippet";
import SectionTitle from "@/components/SectionTitle";
import Button from "../components/Button";
import Section from "@/components/Section";
import Link from "next/link";
import { downloadMerkleTs } from "../download";

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
  const [snippetBeingShowed, setSnippetBeingShowed] = useState<
    "optimized" | "unoptimized"
  >("optimized");

  const [proofsPerSecond, setProofsPerSecond] = useState(0);
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
    if (creatingMerkleTree) return;

    setCreatingMerkleTree(true);
    setPercentageProgress(0);

    let proofs: { [address: string]: string[] } = {};

    const maxWorkers = 8;
    const desiredChunkSize = 500;
    const workerCount = Math.min(
      Math.ceil(addresses.length / desiredChunkSize),
      maxWorkers
    );
    const chunkSize = Math.ceil(addresses.length / workerCount);

    const timeBefore = Date.now();
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
          progress += e.data.progress;
          setPercentageProgress(
            Math.round((progress / addresses.length) * 100)
          );

          // Only use the first worker to calculate proofs per second
          if (i !== 0) return;
          // Calculate proofs per second
          const timeAfter = Date.now();
          const timeDiff = timeAfter - timeBefore;
          const proofsPerSecond = Math.round(progress / (timeDiff / 1000));
          setProofsPerSecond(proofsPerSecond);
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
        className={`${inter.variable} ${ibm.variable} ${ibmMono.variable} flex flex-col max-w-xl pb-96 gap-y-12 mx-auto py-20 antialiased`}
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
          className="mx-auto"
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
                ? `Creating proof ${percentageProgress}% ${proofsPerSecond} proofs/s`
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

              <textarea
                className="h-72 text-xs bg-black outline-none p-2 text-white border  font-ibm-mono"
                readOnly
                value={JSON.stringify(proofs, null, 2)}
              />

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
              <Button onClick={() => downloadMerkleTs()}>
                Download merkle.ts
              </Button>
              <Button onClick={() => downloadProofsTs(proofs)}>
                Download proofs.ts
              </Button>
            </Section>
          </div>

          <Section>
            <SectionTitle title="Solidity example" />

            <div className="flex gap-x-2">
              <button
                className={`p-2 px-4 ${
                  snippetBeingShowed === "optimized"
                    ? "border-blue-500"
                    : "border-gray-500"
                } border-2`}
                onClick={() => setSnippetBeingShowed("optimized")}
              >
                Optimized
              </button>
              <button
                className={`p-2  px-4 ${
                  snippetBeingShowed === "unoptimized"
                    ? "border-blue-500"
                    : "border-white"
                } border-2`}
                onClick={() => setSnippetBeingShowed("unoptimized")}
              >
                Unoptimized
              </button>
            </div>

            {snippetBeingShowed === "optimized" && (
              <>
                <p>
                  Use{" "}
                  <a
                    className="text-blue-500"
                    href="https://github.com/chiru-labs/ERC721A"
                  >
                    ERC721A
                  </a>{" "}
                  and{" "}
                  <a
                    className="text-blue-500"
                    href="https://github.com/Vectorized/solady/tree/main/src/utils"
                  >
                    Solady
                  </a>{" "}
                  instead of Open Zeppelin. <br />
                  They are more gas efficient.
                </p>
                <SolidityOptimizedCodeSnippet />
              </>
            )}

            {snippetBeingShowed === "unoptimized" && (
              <>
                <p>This is inefficient and not recommended.</p>
                <SolidityCodeSnippet />
              </>
            )}
          </Section>
        </div>
      </main>
    </>
  );
}
