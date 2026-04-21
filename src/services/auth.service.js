const { createClerkClient } = require('@clerk/clerk-sdk-node');
const repo = require('../repositories/auth.repository');
const dicebear = require('./dicebear.service');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

class AuthService {
  #getClerkEmail(clerkUser) {
    const primary = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId && e.verification?.status === 'verified'
    );
    return primary?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null;
  }

  async registerUser(clerkUserId, bodyUsername, discordId) {
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const email = this.#getClerkEmail(clerkUser);
    if (!email) throw ApiError.badRequest('El usuario de Clerk no tiene un email verificado.');

    const username = clerkUser.username ?? bodyUsername ?? null;
    if (!username) throw ApiError.badRequest('Se requiere un nombre de usuario (username).');

    const existing = await repo.findByClerkId(clerkUserId);
    if (existing) return { jugador: existing, alreadyRegistered: true };

    const isDuplicate = await repo.findDuplicate(username, email);
    if (isDuplicate) throw ApiError.conflict('El nombre de usuario o correo ya está en uso.');

    const avatarUrl = dicebear.getAvatarUrl('pixel-art', username);
    const jugador = await repo.createPlayer({
      clerkUserId,
      username,
      email,
      discordId: discordId ?? `${username}#0000`,
      avatarUrl
    });

    return { jugador, alreadyRegistered: false };
  }

  async getMeStatus(reqJugador, clerkUserId) {
    if (!reqJugador) {
      return { clerkUserId, profileComplete: false, pendingRegister: true };
    }

    const { juegos, dias } = await repo.getProfileCompletionStats(reqJugador.id);
    const profileComplete = juegos > 0 && dias > 0;

    return {
      jugador: reqJugador,
      profileComplete,
      missingSteps: [
        ...(!juegos ? ['Agrega al menos un videojuego'] : []),
        ...(!dias ? ['Configura tu disponibilidad semanal'] : []),
      ]
    };
  }

  async isUsernameAvailable(username) {
    const available = await repo.checkUsernameAvailability(username);
    return {
      available,
      message: available ? 'Username disponible.' : 'Username ya en uso.'
    };
  }
}

module.exports = new AuthService();