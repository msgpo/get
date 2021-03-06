import debug from 'debug';
import envPaths from 'env-paths';
import * as filenamify from 'filenamify';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as url from 'url';

const d = debug('@electron/get:cache');

const defaultCacheRoot = envPaths('electron', {
  suffix: '',
}).cache;

export class Cache {
  constructor(private cacheRoot = defaultCacheRoot) {}

  public getCachePath(downloadUrl: string, fileName: string): string {
    const { search, hash, ...rest } = url.parse(downloadUrl);
    const strippedUrl = url.format(rest);

    const sanitizedUrl = filenamify(strippedUrl, { maxLength: 255, replacement: '' });
    return path.resolve(this.cacheRoot, sanitizedUrl, fileName);
  }

  public async getPathForFileInCache(url: string, fileName: string): Promise<string | null> {
    const cachePath = this.getCachePath(url, fileName);
    if (await fs.pathExists(cachePath)) {
      return cachePath;
    }

    return null;
  }

  public async putFileInCache(url: string, currentPath: string, fileName: string): Promise<string> {
    const cachePath = this.getCachePath(url, fileName);
    d(`Moving ${currentPath} to ${cachePath}`);
    if (await fs.pathExists(cachePath)) {
      d('* Replacing existing file');
      await fs.remove(cachePath);
    }

    await fs.move(currentPath, cachePath);

    return cachePath;
  }
}
