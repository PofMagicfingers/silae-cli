import Silae from "./Silae";

describe("Silae", () => {
  describe("login", () => {
    it("get data", async () => {
      jest.setTimeout(10000);
      const silae = new Silae();
      const token = await silae.login(
        process.env.SILAE_USERNAME,
        process.env.SILAE_PASSWORD
      );
      expect(typeof token).toBe("string");
      expect(token).toHaveLength(32);
    });
  });
});
