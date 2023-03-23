import Link from "next/link";

const NextJsGuide = () => {
  return (
    <div className="flex flex-col gap-y-12 p-4 border text-sm">
      <div className="flex flex-col gap-y-2">
        <p className="font-bold">The files go here in your Next.js project</p>
        <div className="flex flex-col">
          <p>/src</p>
          <p className="ml-4">
            proofs.ts <span className="text-blue-500">{`<-- here`}</span>
          </p>
          <p className="ml-4">/pages</p>
          <p className="ml-8">/api</p>
          <p className="ml-12">
            merkle.ts <span className="text-blue-500">{`<-- here`}</span>
          </p>
        </div>

        <p className="mt-4">
          The proofs.ts file will be huge if you have a big collection.
          <br />
          It doesn't matter, it is still faster than generating the proof on the
          fly.
        </p>

        <p className="mt-4">
          To get the proof call /api/merkle with a GET request
          <br /> and address as a query parameter.
          <br />
          <br />
          Example: <br />
          <Link
            href="/api/merkle?address=0x70804f88A50090770cBdA783d52160E7E95d7822"
            target={"_blank"}
          >
            <span className="text-blue-500">
              /api/merkle?address=0x70804f88A50090770cBdA783d52160E7E95d7822
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NextJsGuide;
