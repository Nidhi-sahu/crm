import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStages,
  saveStages,
  addStep,
  editStep,
  deleteStep,
  moveStep,
  resetToDefault,
  clearSaveError,
} from '../redux/configurationSlice';

export function useConfiguration() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.configuration);

  useEffect(() => {
    if (state.status === 'idle') {
      dispatch(fetchStages());
    }
  }, [dispatch, state.status]);

  return {
    draft: state.draft,
    status: state.status,
    error: state.error,
    saving: state.saving,
    saveError: state.saveError,
    dirty: state.dirty,
    isLoading: state.status === 'loading' || state.status === 'idle',
    isError: state.status === 'failed',
    addStep: (name) => dispatch(addStep(name)),
    editStep: (key, name) => dispatch(editStep({ key, name })),
    deleteStep: (key) => dispatch(deleteStep(key)),
    moveStep: (key, dir) => dispatch(moveStep({ key, dir })),
    resetToDefault: () => dispatch(resetToDefault()),
    clearSaveError: () => dispatch(clearSaveError()),
    reload: () => dispatch(fetchStages()),
    save: (draft) => dispatch(saveStages(draft)).unwrap(),
  };
}
