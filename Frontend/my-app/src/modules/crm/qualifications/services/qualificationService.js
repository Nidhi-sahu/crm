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

  async submit({ enquiry, requirement, payload, status, rejectionReason, holdUntil }) {
    // 1. update requirement on enquiry if changed
    if (
      typeof requirement === 'string' &&
      (requirement || '').trim() !== (enquiry?.requirement || '').trim()
    ) {
      await enquiryAPI.update(enquiry._id, { requirement: requirement.trim() });
    }

    // 2. create qualification (status='pending' on backend)
    const createRes = await qualificationAPI.create({
      enquiryId: enquiry._id,
      ...payload,
    });
    const created = extractQualification(unwrap(createRes));
    if (!created?._id) {
      throw new Error('Qualification create response missing _id');
    }

    // 3. action route based on selected status
    let finalRes = null;
    if (status === QUALIFICATION_STATUS.QUALIFIED) {
      finalRes = await qualificationAPI.qualify(created._id);
      // 4. auto-create Lead so it appears in Lead Assignment.
      // Silent failure on conflict (lead exists) or missing permission.
      try {
        await leadAPI.createFromEnquiry(enquiry._id);
      } catch (_) {
        // ignore — lead may already exist or user may lack lead:create
      }
    } else if (status === QUALIFICATION_STATUS.NOT_QUALIFIED) {
      finalRes = await qualificationAPI.reject(created._id, rejectionReason || '');
    } else if (status === QUALIFICATION_STATUS.HOLD) {
      finalRes = await qualificationAPI.hold(created._id, {
        holdUntil: holdUntil || null,
        remarks: payload.remarks || '',
      });
    } else if (status === QUALIFICATION_STATUS.FUTURE_PROSPECT) {
      finalRes = await qualificationAPI.futureProspect(created._id);
    }

    return extractQualification(unwrap(finalRes)) || created;
  },
};
