const ACCESS_KEY = 'langdi.accessToken';
const REMEMBER_KEY = 'langdi.rememberMe';

const pickStore = () => {
  const remember = localStorage.getItem(REMEMBER_KEY) === '1';
  return remember ? localStorage : sessionStorage;
};

export const tokenStorage = {
  setRemember(remember) {
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, '1');
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  },

  getAccessToken() {
    return localStorage.getItem(ACCESS_KEY) || sessionStorage.getItem(ACCESS_KEY) || null;
  },

  setAccessToken(token) {
    const store = pickStore();
    const other = store === localStorage ? sessionStorage : localStorage;
    other.removeItem(ACCESS_KEY);
    store.setItem(ACCESS_KEY, token);
  },

  clear() {
    localStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  },
};
