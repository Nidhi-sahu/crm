const ROLES = require('../../../constants/roles');

const VISIT_STAGE_ORDER = 4; // 'Visit Confirmed' = boundary (position 4 after Whatsapp moved to 3)

const getRoleName = (user) => {
  if (!user || !user.roleId) return null;
  return typeof user.roleId === 'object' ? user.roleId.name : null;
};

const getRoleCommentMaxStage = (user) => {
  if (!user || !user.roleId || typeof user.roleId !== 'object') return null;
  const v = user.roleId.commentMaxStageOrder;
  return typeof v === 'number' && v > 0 ? v : null;
};

/**
 * Evaluate whether `user` can act on `lead` (comment / move stage / undo).
 * Returns { allowed, reason } — caller chooses how to surface.
 *
 * Rule (comment, all roles): role's commentMaxStageOrder caps the highest stage
 * a user can comment on. null = unlimited. Set by Admin via Roles page.
 *
 * Rule (Visit Team — comment): can comment only from Visit stage onwards,
 * and only by the assigned Visit Team member.
 *
 * Rule (Sales Person — comment): lead owner can comment any stage; non-owner
 * only after the Visit stage.
 *
 * Move/undo: no role-specific stage cap here — gated by RBAC permission only.
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

  // Per-role comment cap (admin-configurable on Role). null = unlimited.
  if (action === 'comment') {
    const cap = getRoleCommentMaxStage(user);
    if (cap && currentStageOrder > cap) {
      return {
        allowed: false,
        reason: `Your role can comment only up to stage ${cap}`,
      };
    }
  }

  // Visit Team — comment access only from Visit stage onwards,
  // and only the user this lead's visit is assigned to.
  if (roleName === ROLES.VISIT_TEAM && action === 'comment') {
    if (currentStageOrder < VISIT_STAGE_ORDER) {
      return {
        allowed: false,
        reason: 'Visit Team can comment only from the Visit stage onwards',
      };
    }
    const visitOwnerId =
      lead.visitAssignedTo && (lead.visitAssignedTo._id || lead.visitAssignedTo);
    const isVisitOwner =
      visitOwnerId && String(visitOwnerId) === String(user._id);
    if (!isVisitOwner) {
      return {
        allowed: false,
        reason: 'Only the assigned Visit Team member can comment on this lead',
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
