declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENTID: string;
      CLIENTSECRET: string;
      SCOPES: string;
      AUTH_TOKEN: string;
      READERID: string;
      TARGETID: string;
      INTERVAL: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
