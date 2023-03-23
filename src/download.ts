import { generateAddressCode, generateNextJsApiCode, generateProofsCode } from "./codeGenration";

export const downloadMerkleTs = () => {
  const apiCode = generateNextJsApiCode();
  downloadTypescriptFile(apiCode, "merkle");
};

export const downloadProofsTs = (proofs: { [key: string]: string[] }) => {
  const proofsCode = generateProofsCode(proofs);
  downloadTypescriptFile(proofsCode, "proofs");
};

export const downloadAddressesTs = (addresses: string[]) => {
  const addressesCode = generateAddressCode(addresses);
  downloadTypescriptFile(addressesCode, "addresses");
};

const downloadTypescriptFile = (code: string, filename: string): void => {
  // Create a blob object from the code
  const blob = new Blob([code], { type: "text/typescript" });

  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a link element for the URL
  const link = document.createElement("a");

  link.href = url;
  link.download = `${filename}.ts`;
  link.click();

  // Clean up the URL object
  window.URL.revokeObjectURL(url);
};

export const downloadProofsAsJSON = (proofs: {
  [key: string]: string[];
}): void => {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(proofs));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "proofs.json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const downloadRootAsTxt = (root: string): void => {
  const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(root);
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "root.txt");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};