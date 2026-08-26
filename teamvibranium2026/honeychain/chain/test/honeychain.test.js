const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("HoneyChain", function () {
  async function deployFixture() {
    const [owner, beekeeper, fpo, lab, packer, outsider] = await ethers.getSigners();

    const HoneyChain = await ethers.getContractFactory("HoneyChain");
    const honeychain = await HoneyChain.deploy();
    await honeychain.waitForDeployment();

    await honeychain.connect(beekeeper).registerActor("Sundara Honey Farms", "beekeeper");
    await honeychain.connect(fpo).registerActor("Nilgiris FPO", "fpo");
    await honeychain.connect(lab).registerActor("PureHive Labs", "lab");
    await honeychain.connect(packer).registerActor("HivePack Pvt Ltd", "packer");

    return { honeychain, owner, beekeeper, fpo, lab, packer, outsider };
  }

  async function createBatchFixture() {
    const base = await loadFixture(deployFixture);
    await base.honeychain
      .connect(base.beekeeper)
      .createBatch("B-1042", "APIARY-07", 250, "wildflower", "QmPhotoHash123");
    return base;
  }

  describe("deployment", function () {
    it("sets the deployer as owner and admin actor", async function () {
      const { honeychain, owner } = await loadFixture(deployFixture);

      expect(await honeychain.owner()).to.equal(owner.address);
      const [role, registered] = await honeychain.isActor(owner.address);
      expect(role).to.equal("admin");
      expect(registered).to.equal(true);
    });
  });

  describe("actor registration", function () {
    it("registers beekeeper, fpo and lab actors with their roles", async function () {
      const { honeychain, beekeeper, fpo, lab } = await loadFixture(deployFixture);

      let result = await honeychain.isActor(beekeeper.address);
      expect(result[0]).to.equal("beekeeper");
      expect(result[1]).to.equal(true);

      result = await honeychain.isActor(fpo.address);
      expect(result[0]).to.equal("fpo");
      expect(result[1]).to.equal(true);

      result = await honeychain.isActor(lab.address);
      expect(result[0]).to.equal("lab");
      expect(result[1]).to.equal(true);
    });

    it("returns empty role and false for unknown addresses", async function () {
      const { honeychain, outsider } = await loadFixture(deployFixture);

      const [role, registered] = await honeychain.isActor(outsider.address);
      expect(role).to.equal("");
      expect(registered).to.equal(false);
    });

    it("reverts when an already registered actor registers again", async function () {
      const { honeychain, beekeeper } = await loadFixture(deployFixture);

      await expect(
        honeychain.connect(beekeeper).registerActor("Duplicate Farm", "beekeeper")
      ).to.be.revertedWithCustomError(honeychain, "AlreadyRegistered");
    });

    it("reverts on an unsupported role", async function () {
      const { honeychain, outsider } = await loadFixture(deployFixture);

      await expect(
        honeychain.connect(outsider).registerActor("Mystery Actor", "wizard")
      ).to.be.revertedWithCustomError(honeychain, "InvalidRole");
    });
  });

  describe("batch creation", function () {
    it("lets a beekeeper create a batch in created status", async function () {
      const { honeychain, beekeeper } = await loadFixture(deployFixture);

      await expect(
        honeychain
          .connect(beekeeper)
          .createBatch("B-1042", "APIARY-07", 250, "wildflower", "QmPhotoHash123")
      ).to.emit(honeychain, "BatchCreated").withArgs("B-1042");

      const batch = await honeychain.getBatch("B-1042");
      expect(batch.id).to.equal("B-1042");
      expect(batch.apiaryId).to.equal("APIARY-07");
      expect(batch.weightKg).to.equal(250n);
      expect(batch.floraType).to.equal("wildflower");
      expect(batch.photoHash).to.equal("QmPhotoHash123");
      expect(batch.status).to.equal(0n);
      expect(batch.creator).to.equal(beekeeper.address);
      expect(batch.createdAt).to.be.greaterThan(0n);
    });

    it("reverts when a non-beekeeper creates a batch", async function () {
      const { honeychain, lab } = await loadFixture(deployFixture);

      await expect(
        honeychain.connect(lab).createBatch("B-9999", "APIARY-01", 100, "litchi", "QmX")
      ).to.be.revertedWithCustomError(honeychain, "NotBeekeeper");
    });

    it("reverts on duplicate batch id", async function () {
      const { honeychain, beekeeper } = await createBatchFixture();

      await expect(
        honeychain
          .connect(beekeeper)
          .createBatch("B-1042", "APIARY-08", 50, "jamun", "QmY")
      ).to.be.revertedWithCustomError(honeychain, "BatchExists");
    });

    it("reverts when an unregistered address creates a batch", async function () {
      const { honeychain, outsider } = await loadFixture(deployFixture);

      await expect(
        honeychain.connect(outsider).createBatch("B-0001", "APIARY-01", 10, "acacia", "QmZ")
      ).to.be.revertedWithCustomError(honeychain, "NotRegistered");
    });
  });

  describe("custody transfer", function () {
    it("transfers custody to an fpo and marks the batch received", async function () {
      const { honeychain, beekeeper, fpo } = await createBatchFixture();

      await expect(
        honeychain.connect(beekeeper).transferCustody("B-1042", fpo.address, 250, "p25f8c")
      ).to.emit(honeychain, "CustodyTransferred");

      const batch = await honeychain.getBatch("B-1042");
      expect(batch.status).to.equal(2n);

      const history = await honeychain.getBatchHistory("B-1042");
      expect(history.length).to.equal(1);
      expect(history[0].fromActor).to.equal(beekeeper.address);
      expect(history[0].toActor).to.equal(fpo.address);
      expect(history[0].weightKg).to.equal(250n);
      expect(history[0].geoHash).to.equal("p25f8c");
      expect(history[0].timestamp).to.be.greaterThan(0n);
    });

    it("marks the batch in transit for non-fpo recipients", async function () {
      const { honeychain, fpo, packer } = await createBatchFixture();

      await honeychain.connect(fpo).transferCustody("B-1042", packer.address, 240, "p25f9a");

      const batch = await honeychain.getBatch("B-1042");
      expect(batch.status).to.equal(1n);
    });

    it("reverts when transferring to an unregistered recipient", async function () {
      const { honeychain, beekeeper, outsider } = await createBatchFixture();

      await expect(
        honeychain.connect(beekeeper).transferCustody("B-1042", outsider.address, 100, "p25f8d")
      ).to.be.revertedWithCustomError(honeychain, "RecipientNotRegistered");
    });

    it("reverts when the batch does not exist", async function () {
      const { honeychain, beekeeper, fpo } = await createBatchFixture();

      await expect(
        honeychain.connect(beekeeper).transferCustody("B-4040", fpo.address, 100, "p25f8e")
      ).to.be.revertedWithCustomError(honeychain, "BatchNotFound");
    });
  });

  describe("quality records", function () {
    it("lets a lab attach a quality record", async function () {
      const { honeychain, lab } = await createBatchFixture();

      await expect(
        honeychain.connect(lab).attachQuality("B-1042", "NMR", true, "QmCertHash456")
      ).to.emit(honeychain, "QualityAttached");

      const records = await honeychain.getQualityRecords("B-1042");
      expect(records.length).to.equal(1);
      expect(records[0].testType).to.equal("NMR");
      expect(records[0].passed).to.equal(true);
      expect(records[0].certificateHash).to.equal("QmCertHash456");
    });

    it("reverts when a non-lab actor attaches quality", async function () {
      const { honeychain, beekeeper } = await createBatchFixture();

      await expect(
        honeychain.connect(beekeeper).attachQuality("B-1042", "NMR", true, "QmCertHash456")
      ).to.be.revertedWithCustomError(honeychain, "NotLab");
    });
  });

  describe("packaging and flagging", function () {
    it("lets a packer mint jars and mark the batch packaged", async function () {
      const { honeychain, packer } = await createBatchFixture();

      await expect(
        honeychain.connect(packer).mintJars("B-1042", 500, "hc.in/b/B-1042")
      ).to.emit(honeychain, "JarsMinted").withArgs("B-1042");

      const batch = await honeychain.getBatch("B-1042");
      expect(batch.status).to.equal(4n);

      const packages = await honeychain.getPackages("B-1042");
      expect(packages.length).to.equal(1);
      expect(packages[0].jarCount).to.equal(500n);
      expect(packages[0].qrCode).to.equal("hc.in/b/B-1042");
    });

    it("lets an admin flag a batch", async function () {
      const { honeychain, owner } = await createBatchFixture();

      await expect(
        honeychain.connect(owner).flagBatch("B-1042", "suspected adulteration")
      ).to.emit(honeychain, "BatchFlagged").withArgs("B-1042");

      const batch = await honeychain.getBatch("B-1042");
      expect(batch.status).to.equal(5n);
    });

    it("reverts when a non-admin flags a batch", async function () {
      const { honeychain, beekeeper } = await createBatchFixture();

      await expect(
        honeychain.connect(beekeeper).flagBatch("B-1042", "self flag attempt")
      ).to.be.revertedWithCustomError(honeychain, "NotAdmin");
    });
  });

  describe("custody history", function () {
    it("tracks the full custody trail across multiple transfers", async function () {
      const { honeychain, beekeeper, fpo, packer } = await createBatchFixture();

      await honeychain.connect(beekeeper).transferCustody("B-1042", fpo.address, 250, "p25f8c");
      await honeychain.connect(fpo).transferCustody("B-1042", packer.address, 240, "p25f9a");

      const history = await honeychain.getBatchHistory("B-1042");
      expect(history.length).to.equal(2);
      expect(history[0].fromActor).to.equal(beekeeper.address);
      expect(history[0].toActor).to.equal(fpo.address);
      expect(history[1].fromActor).to.equal(fpo.address);
      expect(history[1].toActor).to.equal(packer.address);
      expect(history[1].timestamp).to.be.at.least(history[0].timestamp);
    });
  });
});
