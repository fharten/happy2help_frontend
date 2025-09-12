// Holt das gespeicherte Access Token aus dem LocalStorage.
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// Gibt die gespeicherte User- oder NGO-ID zurück.
export const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userId');
};

// Gibt zurück, ob es sich um einen User oder eine NGO handelt.
export const getUserType = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userType');
};

// Prüft, ob ein Access Token vorhanden ist (also ob jemand eingeloggt ist).
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Löscht alle relevanten Daten aus dem LocalStorage (Logout).
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userType');
};

// Führt einen API-Request mit Authentifizierung durch und behandelt Fehler.
export const authenticatedFetcher = async (url: string) => {
  const token = getAuthToken();

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    type FetchError = Error & { info?: unknown; status?: number };
    const error: FetchError = new Error(
      'An error occurred while fetching the data.'
    );
    try {
      error.info = await res.json();
    } catch {}
    error.status = res.status;
    throw error;
  }

  return res.json();
};
