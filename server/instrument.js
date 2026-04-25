import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://d5ef97a698940f204da3ff03e618359f@o4511281270095872.ingest.us.sentry.io/4511281272258560",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  environment: process.env.NODE_ENV || "development",
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  // Enable logs to be sent to Sentry
  enableLogs: true,
});
