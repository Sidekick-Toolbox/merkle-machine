import { NextApiRequest, NextApiResponse } from 'next';
import { proofs } from '../../proofs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const address = req.query.address as string;

    const proof = proofs[address.toLowerCase()];
    if (proof) {
        res.status(200).json({ proof });
        return;
    }

    res.status(400).json({ error: 'Invalid address' });
}