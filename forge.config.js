module.exports = {
  packagerConfig: {
    asar: true,
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "electron_publish",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      platforms: ["win32"],
      config: {
        repository: {
          owner: "yutomiyoshi",
          name: "gint-chart",
        }
      }
    }
  ]
};
