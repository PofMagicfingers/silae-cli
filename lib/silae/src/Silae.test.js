import Silae from "./Silae";

const _getUserData = async () => {
  jest.setTimeout(15000);

  const userData = await Silae.login(
    process.env.SILAE_USERNAME,
    process.env.SILAE_PASSWORD
  );

  expect(userData).toMatchObject({
    Token: expect.any(String)
  });
  expect(userData.Token).toHaveLength(32);

  return userData;
};

describe("Silae", () => {
  describe("login", () => {
    it("get userData", _getUserData);
  });

  describe("as a logged in user", () => {
    let userData = null;

    beforeAll(async () => {
      userData = await _getUserData();
    });

    it("getListeBulletins", async () => {
      const bulletins = await Silae.getBulletins(userData);
      expect(bulletins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(Date),
            id: expect.any(Number)
          })
        ])
      );
    });

    it("getBulletin", async () => {
      const bulletins = await Silae.getBulletins(userData);
      const bulletin = await Silae.getBulletin(userData, bulletins[0].id);
      expect(bulletin).toBeInstanceOf(Buffer);
    });
  });
});
