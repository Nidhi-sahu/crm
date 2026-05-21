import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadQuestions,
  loadExisting,
  submitQualification,
  resetSession,
  clearSaveError,
} from '../redux/qualificationSlice';

export function useQualification(enquiryId, open) {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.qualifications);

  useEffect(() => {
    if (!open) return undefined;
    if (state.questionsStatus === 'idle') {
      dispatch(loadQuestions());
    }
    if (enquiryId) {
      dispatch(loadExisting(enquiryId));
    }
    return () => {
      dispatch(resetSession());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiryId, open, dispatch]);

  const submit = (input) => dispatch(submitQualification(input)).unwrap();

  return {
    questions: state.questions,
    questionsLoading:
      state.questionsStatus === 'loading' || state.questionsStatus === 'idle',
    existing: state.existing,
    existingLoading:
      enquiryId && (state.existingStatus === 'loading' || state.existingStatus === 'idle'),
    saving: state.saving,
    saveError: state.saveError,
    submit,
    clearSaveError: () => dispatch(clearSaveError()),
  };
}
