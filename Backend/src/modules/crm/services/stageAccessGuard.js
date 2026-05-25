const ROLES = require('../../../constants/roles');

const VISIT_STAGE_ORDER = 3; // 'Visit Confirmed' = boundary

const getRoleName = (user) => {
  if (!user || !user.roleId) return null;
  return typeof user.roleId === 'object' ? user.roleId.name : null;
};

/**
 * Evaluate whether `user` can act on `lead` (comment / move stage / undo).
 * Returns { allowed, reason } — caller chooses how to surface.
 *
 * Rule (Tele Sales):
 *   - Only stages 1–3 (up to and including 'Visit Confirmed').
 *   - Cannot act when current stage > 3.
 *   - Cannot move TO a stage > 3 (so they can't push past the boundary).
 *
 * Rule (Sales Person — comment action only):
 *   - Lead owner: can comment on any stage.
 *   - Non-owner: can only comment AFTER the Visit stage (order > 3).
 *   - Stage moves are not restricted here (handled by RBAC permission).
 *
 * Administrator always bypasses.
 */
const evaluateLeadAccess = (user, lead, action = 'act', extra = {}) => {
  if (!user || !lead) return { allowed: true };

  const roleName = getRoleName(user);
  if (!roleName || roleName === ROLES.ADMINISTRATOR) {
    return { allowed: true };
  }

  const currentStageOrder =
    (lead.currentStageId && lead.currentStageId.order) || 0;

  if (roleName === ROLES.TELE_SALES) {
    if (currentStageOrder > VISIT_STAGE_ORDER) {
      return {
        allowed: false,
        reason: `Tele Sales cannot ${action} after the Visit stage`,
      };
    }
    if (extra.targetStageOrder && extra.targetStageOrder > VISIT_STAGE_ORDER) {
      return {
        allowed: false,
        reason: 'Tele Sales cannot move lead past the Visit stage',
      };
    }
  }

  // Sales Person — owner can comment any stage; non-owner only post-visit.
  // Applied only to 'comment' action (per spec). Stage moves stay under RBAC.
  if (roleName === ROLES.SALES_PERSON && action === 'comment') {
    const ownerId = lead.assignedTo && (lead.assignedTo._id || lead.assignedTo);
    const isOwner = ownerId && String(ownerId) === String(user._id);
    if (!isOwner && currentStageOrder <= VISIT_STAGE_ORDER) {
      return {
        allowed: false,
        reason: 'You can only comment on assigned leads or after the Visit stage',
      };
    }
  }

  return { allowed: true };
};

const assertLeadAccess = (user, lead, action = 'act', extra = {}) => {
  const result = evaluateLeadAccess(user, lead, action, extra);
  if (!result.allowed) {
    const ApiError = require('../../../utils/ApiError');
    throw ApiError.forbidden(result.reason);
  }
};

module.exports = { evaluateLeadAccess, assertLeadAccess, VISIT_STAGE_ORDER };
