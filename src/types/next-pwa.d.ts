declare module "next-pwa" {
  import type { NextConfig } from "next";

  type RuntimeCachingRule = {
    urlPattern: RegExp | string;
    handler: "CacheFirst" | "NetworkFirst" | "StaleWhileRevalidate";
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
      cacheableResponse?: {
        statuses?: number[];
      };
    };
  };

  type PwaOptions = {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: RuntimeCachingRule[];
    fallbacks?: {
      document?: string;
    };
  };

  export default function withPWA(options: PwaOptions): (config: NextConfig) => NextConfig;
}
