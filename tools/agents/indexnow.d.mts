export declare const INDEXNOW_ENDPOINT: string;
export declare const MAX_URLS_PER_REQUEST: number;
export declare function isValidKey(key: unknown): key is string;
export declare function submitUrls(options: {
  siteUrl: string;
  key: string | undefined;
  urls: string[];
  keyLocation?: string;
}): Promise<boolean>;
