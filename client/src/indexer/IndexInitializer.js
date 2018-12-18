class IndexInitializer {
  constructor(ipfs) {
    this.ipfs = ipfs;
  }

  async bootstrapInitialize() {
    const ipfs = this.ipfs;
    try {
      await ipfs.files.mkdir("/root");
    } catch (e) {}

    const stat = await ipfs.files.stat("/root");
    console.log("stat", stat);

    const firstDBHash = stat.hash;
    console.log("firstDB", firstDBHash);

    return this.initialize(firstDBHash);
  }

  async nextInitialize(currentDBHash) {
    const ipfs = this.ipfs;
    const rootDir = "/root-" + currentDBHash;

    try {
      await ipfs.files.rm(rootDir, { recursive: true });
    } catch (e) {
      // console.error(e);
    }

    try {
      await ipfs.files.cp("/ipfs/" + currentDBHash, rootDir, {
        parents: true
      });
    } catch (e) {}

    return rootDir;
  }

  async initialize(currentDBHash) {
    console.log("initialize", "|", currentDBHash, "|");

    if (currentDBHash) {
      return this.nextInitialize(currentDBHash);
    } else {
      return this.bootstrapInitialize();
    }
  }
}

export default IndexInitializer;
