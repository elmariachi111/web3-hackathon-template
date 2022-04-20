// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type ERC721Metadata = {
  name: string;
  description: string;
  image: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ERC721Metadata>
) {  
  const tokenId = req.query.tokenid;
  res.status(200).json({ 
    name: `this is token id ${tokenId} `,
    description: `this describes ${tokenId}`,
    image: "https://picsum.photos/300"
  });
}
