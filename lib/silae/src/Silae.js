import soap from "soap";

class Silae {
  constructor() {
    this.domain = "www.silaexpert01.fr";
    this.endpoint = "/Silae/SWS/SWS.asmx?wsdl";
  }

  async login(username, password) {
    const client = await this.getSoapClient();

    const [login] = await client.SWS_SiteLoginExAsync({
      SWSLogin: "",
      SWSPassword: "",
      USRLogin: username,
      USRPassword: password
    });

    if (typeof login === "object" && login != null) {
      const newHost = login.SWS_SiteLoginExResult.RepartiteurAdresse;
      if (typeof newHost === "string" && newHost.trim().length > 0) {
        this.soapClient = undefined;
        this.domain = newHost;
        return this.login(username, password);
      }

      return login.SWS_SiteLoginExResult.Token;
    }

    return null;
  }

  async getDocuments() {}

  async getSoapClient() {
    if (this.soapClient) {
      return Promise.resolve(this.soapClient);
    }

    const url = `https://${this.domain}${this.endpoint}`;
    console.log(url);
    this.soapClient = await soap.createClientAsync(url);

    return this.soapClient;
  }
}

export default Silae;
