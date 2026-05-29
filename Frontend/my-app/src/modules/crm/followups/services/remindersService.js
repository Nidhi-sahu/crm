import { remindersAPI } from './remindersAPI';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;
const toArray = (data) =>
  Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

export const remindersService = {
  // All pending reminders for a user, sorted by due date.
  async myPending(userId) {
    const data = unwrap(
      await remindersAPI.list({
        assignedTo: userId,
        status: 'pending',
        limit: 100,
        sortBy: 'reminderAt',
        sortOrder: 'asc',
      }),
    );
    return toArray(data);
  },

  async complete(id) {
    return unwrap(await remindersAPI.complete(id));
  },
};
