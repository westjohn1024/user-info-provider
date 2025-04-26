import type { NextApiRequest, NextApiResponse } from 'next';

type IpResponse = {
  ipAddress: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<IpResponse>
) {
  // Get IP address from Cloudflare headers
  const ipAddress = 
    (req.headers['cf-connecting-ip'] as string) || // Cloudflare specific header (most reliable)
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] || // First IP in X-Forwarded-For
    req.socket.remoteAddress || ''; // Fallback
  
  res.status(200).json({ ipAddress });
}