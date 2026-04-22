const matchRequestsService = require('../services/matchRequests.service');

const sendRequest = async (req, res, next) => {
  try {
    const solicitud = await matchRequestsService.sendRequest(req.jugador.id, req.body);
    res.status(201).json({ message: 'Solicitud enviada.', solicitud });
  } catch (err) {
    next(err);
  }
};

const getReceived = async (req, res, next) => {
  try {
    const solicitudes = await matchRequestsService.getReceived(req.jugador.id);
    res.json({ solicitudes });
  } catch (err) {
    next(err);
  }
};

const getSent = async (req, res, next) => {
  try {
    const solicitudes = await matchRequestsService.getSent(req.jugador.id);
    res.json({ solicitudes });
  } catch (err) {
    next(err);
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    const match = await matchRequestsService.acceptRequest(req.jugador.id, parseInt(req.params.id));
    res.json({ message: 'Solicitud aceptada. ¡Match creado!', match });
  } catch (err) {
    next(err);
  }
};

const rejectRequest = async (req, res, next) => {
  try {
    await matchRequestsService.rejectRequest(req.jugador.id, parseInt(req.params.id));
    res.json({ message: 'Solicitud rechazada.' });
  } catch (err) {
    next(err);
  }
};

const cancelRequest = async (req, res, next) => {
  try {
    await matchRequestsService.cancelRequest(req.jugador.id, parseInt(req.params.id));
    res.json({ message: 'Solicitud cancelada.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendRequest, getReceived, getSent, acceptRequest, rejectRequest, cancelRequest };