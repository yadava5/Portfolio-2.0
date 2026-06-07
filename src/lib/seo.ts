import { siteMetadata } from "@/lib/data/personal";
import { basePath } from "@/lib/utils";

export function absoluteSiteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  const pathWithoutBase =
    basePath && normalized.startsWith(`${basePath}/`)
      ? normalized.slice(basePath.length)
      : normalized;
  const relativePath = pathWithoutBase.replace(/^\//, "");

  return new URL(relativePath, `${siteMetadata.url}/`).toString();
}
