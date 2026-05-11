# PM2 ecosystem file для production
# npm install -g pm2
# pm2 start deploy/pm2.config.js

module.exports = {
  apps: [
    {
      name: "cybersec-lab-trainer",
      script: "server.js",
      cwd: ".next/standalone",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "500M",
      error_file: "/var/log/pm2/cybersec-error.log",
      out_file: "/var/log/pm2/cybersec-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
