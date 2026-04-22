const db = require('../config/database');
const repo = require('../repositories/matchRequests.repository');
const ApiError = require('../utils/ApiError');

const EXPIRATION_DAYS = 7;

class MatchRequestsService {
  
  async sendRequest(solicitanteId, requestData) {
    const { receptor_id, videojuego_id, mensaje } = requestData;

    if (solicitanteId === receptor_id) {
      throw ApiError.badRequest('No puedes enviarte una solicitud a ti mismo.');
    }

    const receptorExiste = await repo.checkReceptorExists(receptor_id);
    if (!receptorExiste) throw ApiError.notFound('El jugador receptor no existe.');

    const haySolicitudPendiente = await repo.checkPendingRequest(solicitanteId, receptor_id);
    if (haySolicitudPendiente) throw ApiError.conflict('Ya existe una solicitud pendiente con este jugador.');

    const hayMatchActivo = await repo.checkActiveMatch(solicitanteId, receptor_id);
    if (hayMatchActivo) throw ApiError.conflict('Ya tienes un match activo con este jugador.');

    const compatibilityScore = await repo.getCompatibilityScore(solicitanteId, receptor_id);
    
    const expiracion = new Date();
    expiracion.setDate(expiracion.getDate() + EXPIRATION_DAYS);

    return await repo.createRequest(solicitanteId, receptor_id, videojuego_id, mensaje, expiracion, compatibilityScore);
  }

  async getReceived(jugadorId) {
    return await repo.getReceived(jugadorId);
  }

  async getSent(jugadorId) {
    return await repo.getSent(jugadorId);
  }

  async acceptRequest(receptorId, solicitudId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const solicitud = await repo.getPendingRequestForReceptor(client, solicitudId, receptorId);
      if (!solicitud) throw ApiError.notFound('Solicitud no encontrada o ya procesada.');

      await repo.updateRequestStatus(client, solicitudId, 'aceptada');
      await repo.insertHistory(client, solicitudId, 'aceptada', receptorId, 'Aceptada por el receptor');
      
      const newMatch = await repo.createMatch(client, solicitud.jugador_solicitante_id, receptorId, solicitud.videojuego_id);

      await client.query('COMMIT');
      return newMatch;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async rejectRequest(receptorId, solicitudId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const solicitud = await repo.getPendingRequestForReceptor(client, solicitudId, receptorId);
      if (!solicitud) throw ApiError.notFound('Solicitud no encontrada o ya procesada.');

      await repo.updateRequestStatus(client, solicitudId, 'rechazada');
      await repo.insertHistory(client, solicitudId, 'rechazada', receptorId, 'Rechazada por el receptor');

      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async cancelRequest(solicitanteId, solicitudId) {
    const cancelled = await repo.cancelRequest(solicitudId, solicitanteId);
    if (!cancelled) throw ApiError.notFound('Solicitud no encontrada o no cancelable.');
    return true;
  }
}

module.exports = new MatchRequestsService();