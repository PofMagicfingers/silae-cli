import soap from "soap";

const _ = {
  getSoapClient: Symbol.for("_getSoapClient"),
  extractUserData: Symbol.for("_extractUserData"),
  extractBulletins: Symbol.for("_extractBulletins"),
  extractBulletin: Symbol.for("_extractBulletin")
};

class Silae {
  constructor() {
    this.domain = "www.silaexpert01.fr";
    this.endpoint = "/Silae/SWS/SWS.asmx?wsdl";
  }

  async login(username, password) {
    const client = await this[_.getSoapClient]();

    const [login] = await client.SWS_SiteLoginExAsync({
      SWSLogin: "",
      SWSPassword: "",
      USRLogin: username,
      USRPassword: password
    });

    if (typeof login === "object" && login != null) {
      const newHost = login.SWS_SiteLoginExResult.RepartiteurAdresse;
      if (typeof newHost === "string" && newHost.trim().length > 0) {
        delete this.soapClient;
        this.domain = newHost;
        return this.login(username, password);
      }

      return this[_.extractUserData](login.SWS_SiteLoginExResult);
    }

    return null;
  }

  [_.extractUserData](loginResult) {
    const userData = {};
    userData.Token = loginResult.Token;

    const scrappedData = loginResult.ListeOnglets.SWS_InformationsOnglet[0];
    Object.keys(scrappedData).forEach(key => {
      if (/^ID_/.test(key)) {
        userData[key] = scrappedData[key];
      }
    });

    return userData;
  }

  async getBulletins(userData = {}) {
    const client = await this[_.getSoapClient]();

    return this[_.extractBulletins](
      await client.SWS_UtilisateurSalarieListeBulletinsAsync({
        Token: userData.Token,
        ID_DOMAINE: userData.ID_DOMAINE,
        ID_PAISALARIE: userData.ID_PAISALARIE
      })
    );
  }

  [_.extractBulletins](bulletinsResult) {
    const dataResult =
      bulletinsResult[0].SWS_UtilisateurSalarieListeBulletinsResult;
    const resultArray =
      dataResult.Elements.CPAISWSUtilisateurSalarieListeBulletinsElement;

    return resultArray.map(bul => ({
      date: bul.BUL_Periode,
      id: bul.ID_PAIBULLETIN
    }));
  }

  async getBulletin(userData = {}, id) {
    const client = await this[_.getSoapClient]();

    return this[_.extractBulletin](
      await client.SWS_UtilisateurSalarieRecupererImageAsync({
        Token: userData.Token,
        ID_DOMAINE: userData.ID_DOMAINE,
        ID_PAISALARIE: userData.ID_PAISALARIE,
        NatureImage: 1,
        ID_IMAGE: id
      })
    );
  }

  [_.extractBulletin](bulletinResult) {
    const bulletin =
      bulletinResult[0].SWS_UtilisateurSalarieRecupererImageResult.Image;

    return Buffer.from(bulletin, "base64");
  }

  async [_.getSoapClient]() {
    if (this.soapClient) {
      return Promise.resolve(this.soapClient);
    }

    const url = `https://${this.domain}${this.endpoint}`;
    this.soapClient = await soap.createClientAsync(url);

    return this.soapClient;
  }
}

export default new Silae();
