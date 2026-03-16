// In-memory store (replace with MongoDB/PostgreSQL in production)
const store = {
  users: {},        // keyed by email: { email, passwordHash, username, createdAt }
  profiles: {},     // keyed by email: { ...profileData }
  logs: {},         // keyed by email_date: { ...logData }
};

module.exports = store;
