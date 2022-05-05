import fs from 'fs';

type ResolverListType = readonly [Function, ...Function[]];

export default <ResolverListType><unknown>fs.readdirSync(__dirname)
  .filter((n: string): boolean => n !== 'index.ts')
  .reduce(
    (accum: Function[], n: string): Function[] => [
      ...accum,
      ...<Function[]>Object.values(require(`./${n}`)),
    ],
    [],
  );
