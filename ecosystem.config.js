module.exports = {
    apps : [{
      name: "backend",
      script: "index.js",
      instances: "max",
      autorestart: true,
      watch: false, // Only for development
      env: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 5000 // Example dev port
      }
    }]
  };