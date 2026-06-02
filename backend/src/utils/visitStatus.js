const LEGACY_ENTERED = 'checked_in';
const LEGACY_EXITED = 'checked_out';

function normalizeStatus(status) {
  if (status === LEGACY_ENTERED) return 'entered';
  if (status === LEGACY_EXITED) return 'exited';
  return status;
}

function isEntered(status) {
  const s = normalizeStatus(status);
  return s === 'entered';
}

function isExited(status) {
  return normalizeStatus(status) === 'exited';
}

function canMarkEntry(status) {
  return normalizeStatus(status) === 'approved';
}

function canMarkExit(status) {
  return normalizeStatus(status) === 'entered';
}

module.exports = {
  normalizeStatus,
  isEntered,
  isExited,
  canMarkEntry,
  canMarkExit,
  LEGACY_ENTERED,
  LEGACY_EXITED,
};
