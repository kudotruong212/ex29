const User = require('../models/user');

function normalizeEmail(email) {
  return email ? email.toLowerCase().trim() : undefined;
}

function getProviderIdField(provider) {
  if (provider === 'google') return 'googleId';
  if (provider === 'facebook') return 'facebookId';
  throw new Error(`Unsupported OAuth provider: ${provider}`);
}

function normalizeProviders(user, provider) {
  const existingProviders = Array.isArray(user.providers) ? user.providers : [];

  if (existingProviders.length === 0 && user.provider && user.provider !== 'multiple') {
    existingProviders.push(user.provider);
  }

  if (!existingProviders.includes(provider)) {
    existingProviders.push(provider);
  }

  user.providers = existingProviders;
  user.provider = existingProviders.length > 1 ? 'multiple' : existingProviders[0];
}

async function saveWithUniqueUsernameFallback(user, provider, providerId) {
  try {
    return await user.save();
  } catch (err) {
    const duplicatedUsername = err.code === 11000 && err.keyPattern && err.keyPattern.username;

    if (!duplicatedUsername) {
      throw err;
    }

    user.username = `${provider}_${providerId}`;
    return user.save();
  }
}

async function findOrCreateOAuthUser({ provider, providerId, email, username }) {
  const normalizedEmail = normalizeEmail(email);
  const providerIdField = getProviderIdField(provider);
  const cleanUsername = username || normalizedEmail || `${provider}_${providerId}`;

  const query = normalizedEmail
    ? { $or: [{ [providerIdField]: providerId }, { email: normalizedEmail }] }
    : { [providerIdField]: providerId };

  let user = await User.findOne(query);

  if (!user) {
    user = new User({
      username: cleanUsername,
      email: normalizedEmail,
      [providerIdField]: providerId,
      provider,
      providers: [provider]
    });

    return saveWithUniqueUsernameFallback(user, provider, providerId);
  }

  user[providerIdField] = providerId;

  if (normalizedEmail && !user.email) {
    user.email = normalizedEmail;
  }

  if (!user.username) {
    user.username = cleanUsername;
  }

  normalizeProviders(user, provider);
  return saveWithUniqueUsernameFallback(user, provider, providerId);
}

module.exports = {
  findOrCreateOAuthUser
};
