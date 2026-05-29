import { qualificationAPI } from './qualificationAPI';
import { configAPI } from './configAPI';
import { enquiryAPI } from '../../enquiries/services/enquiryAPI';
import { leadAPI } from '../../lead-assignments/services/leadAPI';
import {
  DEFAULT_QUALIFICATION_QUESTIONS,
  QUESTIONS_CONFIG_KEY,
} from '../constants/defaultQuestions';
import { QUALIFICATION_STATUS } from '../constants/qualificationStatuses';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

const extractQualification = (data) => data?.qualification ?? data ?? null;

export const qualificationService = {
  async loadQuestions() {
    try {
      const res = await configAPI.get(QUESTIONS_CONFIG_KEY);
      const data = unwrap(res);
      const value = data?.value ?? data?.configuration?.value;
      if (Array.isArray(value) && value.length > 0) return value;
      return DEFAULT_QUALIFICATION_QUESTIONS;
    } catch (_) {
      return DEFAULT_QUALIFICATION_QUESTIONS;
    }
  },

  async getExisting(enquiryId) {
    try {
      const res = await qualificationAPI.getByEnquiry(enquiryId);
      return extractQualification(unwrap(res));
    } catch (_) {
      return null;
    }
  },

  async submit({ enquiry, existing, requirement, payload, status, rejectionReason, holdUntil }) {
    // 1. update requirement on enquiry if changed
    if (
      typeof requirement === 'string' &&
      (requirement || '').trim() !== (enquiry?.requirement || '').trim()
    ) {
      await enquiryAPI.update(enquiry._id, { requirement: requirement.trim() });
    }

    // 2. create OR update qualification (re-qualify reuses the existing pending one)
    let qualif;
    if (existing?._id && existing.qualificationStatus === 'pending') {
      qualif = extractQualification(unwrap(await qualificationAPI.update(existing._id, payload)));
    } else {
      qualif = extractQualification(
        unwrap(await qualificationAPI.create({ enquiryId: enquiry._id, ...payload })),
      );
    }
    if (!qualif?._id) {
      throw new Error('Qualification response missing _id');
    }

    // 3. action route based on selected status
    if (status === QUALIFICATION_STATUS.QUALIFIED) {
      const qualified = extractQualification(unwrap(await qualificationAPI.qualify(qualif._id)));
      // No visit date → backend moved it back to Pending. Don't create a lead.
      if (qualified?.movedBack) {
        return { ...qualified, movedBack: true };
      }
      try {
        await leadAPI.createFromEnquiry(enquiry._id);
      } catch (_) {
        // ignore — lead may already exist or user may lack lead:create
      }
      return qualified || qualif;
    }

    let finalRes = null;
    if (status === QUALIFICATION_STATUS.NOT_QUALIFIED) {
      finalRes = await qualificationAPI.reject(qualif._id, rejectionReason || '');
    } else if (status === QUALIFICATION_STATUS.HOLD) {
      finalRes = await qualificationAPI.hold(qualif._id, {
        holdUntil: holdUntil || null,
        remarks: payload.remarks || '',
      });
    } else if (status === QUALIFICATION_STATUS.FUTURE_PROSPECT) {
      finalRes = await qualificationAPI.futureProspect(qualif._id);
    }

    return extractQualification(unwrap(finalRes)) || qualif;
  },
};
