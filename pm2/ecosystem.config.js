module.exports = {
  apps: [
    {
      name: "file-parser",
      cwd: "./file-parser",
      script: "npm start",
    },
    {
      name: "file-server",
      cwd: "./file-server",
      script: "npm start",
      ignore_watch: ["test-bucket"],
    },
    {
      name: "rym-data-server",
      cwd: "./rym-data-server",
      script: "npm start",
    },
    {
      name: "crawler",
      cwd: "./crawler",
      script: "npm start",
    },
    {
      name: "catalog-server",
      cwd: "./catalog-server",
      script: "npm start",
    },
    {
      name: "rym-lookup-server",
      cwd: "./rym-lookup-server",
      script: "npm start",
    },
  ],
};
