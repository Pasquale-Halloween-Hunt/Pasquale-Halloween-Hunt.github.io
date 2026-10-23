// Set this to a deployed Cloudflare Worker endpoint to enable real photo submissions.
export const PHOTO_API_URL = 'https://halloween-photo-upload.wangjason2004.workers.dev';

export const STORAGE_KEY = 'halloween-hunt-v1';
export const MASTER_TAG_TOKEN = 'master';
export const SUPERMASTER_TAG_TOKEN = 'supermaster';

// Keep these in challenge order. Each value is the token programmed into one NFC tag or QR code.
// ?tag=pYX8yQ6OQdhQReHX
export const TAG_TOKENS = [
  'pYX8yQ6OQdhQReHX',
  'VOKLStlhCdvqKbnK',
  '3EF-kxJeTfBUhuyP',
  'vWJXppXz0FbtN18U',
  'fHLJwSimAuHuSZ3p',
  'Lt8VAAh44V7omHnd',
  't45h0x5eZvv1Na0S',
  '1vZdf-IhOnavFGuG',
  'mRkpoeBQ75rladNU',
  'kZvucadPZEZj11RO',
  'LzhqjFiWZQyMNiCc',
  'iUjanFz0kay3BiSX',
];
