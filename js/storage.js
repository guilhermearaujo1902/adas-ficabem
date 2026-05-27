/**
 * =============================================================================
 * FICA BEM — Camada de persistência (localStorage)
 * =============================================================================
 * @namespace FicaBemDB
 */

const FicaBemDB = (function () {
  const STORAGE_KEY = "ficabem_app_v1";
  const INVITE_CODE_KEY = "ficabem_pending_invite_code";

  function getDefaultState() {
    return {
      currentUserId: null,
      users: [],
      places: [
        {
          id: "place-1",
          name: "Café Botânico",
          category: "cafes",
          neighborhood: "Pinheiros",
          rating: 4.9,
          address: "Rua dos Pinheiros, 1234",
          tags: ["Iluminado", "Acolhedor"],
          image:
            "https://storage.googleapis.com/uxpilot-auth.appspot.com/01f2bd413b-5de1466befb3b2a2e26f.png",
        },
        {
          id: "place-2",
          name: "Espaço Co-Work",
          category: "coworking",
          neighborhood: "Vila Madalena",
          rating: 4.8,
          address: "R. Harmonia, 500",
          tags: ["Segurança 24h"],
          image:
            "https://storage.googleapis.com/uxpilot-auth.appspot.com/f8d1c9cd94-4d3a098e3ae74c699b5a.png",
        },
        {
          id: "place-3",
          name: "Bar da Esquina",
          category: "bares",
          neighborhood: "Consolação",
          rating: 4.2,
          address: "R. da Consolação, 900",
          tags: ["Staff atencioso"],
          image: "",
        },
        {
          id: "place-4",
          name: "Praça do Sol",
          category: "parques",
          neighborhood: "Centro",
          rating: 4.5,
          address: "Praça do Sol, s/n",
          tags: ["Policiamento"],
          image: "",
        },
        {
          id: "place-5",
          name: "Mercado Central",
          category: "lojas",
          neighborhood: "Centro",
          rating: 4.2,
          address: "Av. Central, 200",
          tags: ["Movimentado"],
          image: "",
        },
        {
          id: "place-6",
          name: "Bar do Centro",
          category: "bares",
          neighborhood: "Centro Histórico",
          rating: 4.0,
          address: "Centro Histórico",
          tags: [],
          image: "",
        },
        {
          id: "place-7",
          name: "Restaurante Jardim",
          category: "restaurantes",
          neighborhood: "Bela Vista",
          rating: 4.3,
          address: "Bela Vista",
          tags: [],
          image: "",
        },
      ],
      reviews: [],
      invites: [
        {
          id: "inv-demo",
          code: "FICABEM2025",
          fromUserId: null,
          status: "pending",
          email: "",
          label: "Convite demo",
          sentAt: new Date().toISOString(),
        },
        {
          id: "inv-p1",
          code: "MARIA92",
          fromUserId: null,
          status: "pending",
          email: "ana.clara@email.com",
          label: "ana.clara@email.com",
          sentAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
      ],
      draftReview: null,
      alerts: [
        {
          id: "alert-1",
          type: "danger",
          text: "Iluminação precária na R. Augusta (quarteirão 3).",
          author: "@carol_s",
          time: "Há 10 min",
        },
        {
          id: "alert-2",
          type: "warning",
          text: "Metrô Consolação com movimentação atípica hoje.",
          author: "@julia_m",
          time: "Há 45 min",
        },
      ],
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = getDefaultState();
        saveState(initial);
        return initial;
      }
      const parsed = JSON.parse(raw);
      const defaults = getDefaultState();
      return {
        ...defaults,
        ...parsed,
        places: mergePlaces(defaults.places, parsed.places || []),
        invites: parsed.invites?.length ? parsed.invites : defaults.invites,
        alerts: parsed.alerts?.length ? parsed.alerts : defaults.alerts,
      };
    } catch (error) {
      console.error("[FicaBemDB] Erro ao carregar:", error);
      return getDefaultState();
    }
  }

  function mergePlaces(defaults, stored) {
    const byId = new Map(stored.map((p) => [p.id, p]));
    defaults.forEach((p) => {
      if (!byId.has(p.id)) byId.set(p.id, p);
    });
    return Array.from(byId.values());
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function getCurrentUser() {
    const state = loadState();
    if (!state.currentUserId) return null;
    return state.users.find((u) => u.id === state.currentUserId) || null;
  }

  function setCurrentUser(userId) {
    const state = loadState();
    state.currentUserId = userId;
    saveState(state);
  }

  function logout() {
    const state = loadState();
    state.currentUserId = null;
    saveState(state);
  }

  function createUser(userData) {
    const state = loadState();
    const user = {
      id: userData.id || generateId("user"),
      name: userData.name || "",
      username: normalizeUsername(userData.username || ""),
      email: normalizeEmail(userData.email || ""),
      password: userData.password || "",
      avatar: userData.avatar || "",
      interests: userData.interests || [],
      safeHours: userData.safeHours || ["18h – 22h", "Fins de semana"],
      avoidedCategories: userData.avoidedCategories || [
        "Ruas desertas",
        "Pouca iluminação",
      ],
      reviewsCount: 0,
      savedCount: 0,
      routesCount: 0,
      favoritePlaceIds: userData.favoritePlaceIds || [],
      createdAt: new Date().toISOString(),
    };
    state.users.push(user);
    state.currentUserId = user.id;
    saveState(state);
    return user;
  }

  function updateUser(userId, partial) {
    const state = loadState();
    const idx = state.users.findIndex((u) => u.id === userId);
    if (idx < 0) return null;
    state.users[idx] = { ...state.users[idx], ...partial };
    saveState(state);
    return state.users[idx];
  }

  function normalizeEmail(email) {
    return String(email).toLowerCase().trim();
  }

  function normalizeUsername(username) {
    return String(username).replace(/^@+/, "").toLowerCase().trim();
  }

  function normalizeIdentifier(identifier) {
    const raw = String(identifier).trim();
    if (!raw) return { type: "empty", value: "" };
    if (raw.includes("@")) {
      return { type: "email", value: normalizeEmail(raw) };
    }
    return { type: "username", value: normalizeUsername(raw) };
  }

  function findUserByEmail(email) {
    const state = loadState();
    const norm = normalizeEmail(email);
    return state.users.find((u) => normalizeEmail(u.email) === norm) || null;
  }

  function findUserByUsername(username) {
    const state = loadState();
    const norm = normalizeUsername(username);
    return state.users.find((u) => normalizeUsername(u.username) === norm) || null;
  }

  function findUserByIdentifier(identifier) {
    const parsed = normalizeIdentifier(identifier);
    if (parsed.type === "email") return findUserByEmail(parsed.value);
    if (parsed.type === "username") return findUserByUsername(parsed.value);
    return null;
  }

  function loginWithEmail(email) {
    const user = findUserByEmail(email);
    if (user) {
      setCurrentUser(user.id);
      return user;
    }
    return null;
  }

  function loginWithCredentials(identifier, password) {
    const user = findUserByIdentifier(identifier);
    if (!user) return { ok: false, error: "Usuário não encontrado." };
    if (user.password !== password) return { ok: false, error: "Senha incorreta." };
    setCurrentUser(user.id);
    return { ok: true, user };
  }

  function registerUser({ name, email, username, password }) {
    const trimmedName = String(name || "").trim();
    const normEmail = normalizeEmail(email);
    const normUsername = normalizeUsername(username);
    const pwd = String(password || "");

    if (!trimmedName || !normEmail || !normUsername || !pwd) {
      return { ok: false, error: "Preencha todos os campos obrigatórios." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) {
      return { ok: false, error: "Informe um e-mail válido." };
    }

    if (pwd.length < 8) {
      return { ok: false, error: "A senha deve ter no mínimo 8 caracteres." };
    }

    if (normUsername.length < 3) {
      return { ok: false, error: "O usuário deve ter pelo menos 3 caracteres." };
    }

    if (!/^[a-z0-9._-]+$/.test(normUsername)) {
      return {
        ok: false,
        error: "Use apenas letras minúsculas, números, ponto, hífen ou underline.",
      };
    }

    if (findUserByEmail(normEmail)) {
      return { ok: false, error: "Este e-mail já está cadastrado." };
    }

    if (findUserByUsername(normUsername)) {
      return { ok: false, error: "Este nome de usuário já está em uso." };
    }

    const user = createUser({
      name: trimmedName,
      email: normEmail,
      username: normUsername,
      password: pwd,
    });

    return { ok: true, user };
  }

  function seedDemoUser() {
    const state = loadState();
    const demoEmail = "mariana@ficabem.app";
    const exists = state.users.some((u) => normalizeEmail(u.email) === demoEmail);
    if (!exists) {
      state.users.push({
        id: "user-demo-mariana",
        name: "Mariana",
        username: "mariana",
        email: demoEmail,
        password: "demo123",
        avatar: "",
        interests: [],
        safeHours: ["18h – 22h", "Fins de semana"],
        avoidedCategories: ["Ruas desertas", "Pouca iluminação"],
        reviewsCount: 0,
        savedCount: 0,
        routesCount: 0,
        favoritePlaceIds: [],
        createdAt: new Date().toISOString(),
      });
      saveState(state);
    }
    return findUserByEmail(demoEmail);
  }

  function getFavoritePlaceIds() {
    const user = getCurrentUser();
    return user?.favoritePlaceIds || [];
  }

  function isFavoritePlace(placeId) {
    return getFavoritePlaceIds().includes(placeId);
  }

  function toggleFavoritePlace(placeId) {
    const user = getCurrentUser();
    if (!user) return false;
    const ids = getFavoritePlaceIds();
    const idx = ids.indexOf(placeId);
    if (idx >= 0) {
      ids.splice(idx, 1);
      updateUser(user.id, {
        favoritePlaceIds: ids,
        savedCount: Math.max(0, (user.savedCount || 0) - 1),
      });
      return false;
    }
    ids.push(placeId);
    updateUser(user.id, {
      favoritePlaceIds: ids,
      savedCount: (user.savedCount || 0) + 1,
    });
    return true;
  }

  function validateInvite(code) {
    const state = loadState();
    const normalized = String(code).trim().toUpperCase();
    return state.invites.some(
      (inv) => inv.code.toUpperCase() === normalized && inv.status === "pending"
    );
  }

  function consumeInvite(code) {
    const state = loadState();
    const normalized = String(code).trim().toUpperCase();
    state.invites = state.invites.map((inv) =>
      inv.code.toUpperCase() === normalized ? { ...inv, status: "used" } : inv
    );
    saveState(state);
  }

  function createInvite(fromUserId, email = "") {
    const state = loadState();
    const code = "FB" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const invite = {
      id: generateId("inv"),
      code,
      fromUserId,
      status: "pending",
      email,
      label: email || `Convite ${code}`,
      sentAt: new Date().toISOString(),
    };
    state.invites.push(invite);
    saveState(state);
    return invite;
  }

  function getPendingInvites() {
    return loadState().invites.filter((i) => i.status === "pending");
  }

  function getPlaces(category) {
    const places = loadState().places;
    if (!category || category === "todos") return places;
    return places.filter((p) => p.category === category);
  }

  function getPlaceById(placeId) {
    return loadState().places.find((p) => p.id === placeId);
  }

  function getPlaceByName(name) {
    const norm = String(name).trim().toLowerCase();
    return loadState().places.find((p) => p.name.toLowerCase() === norm);
  }

  function ensurePlace(partial) {
    const state = loadState();
    const existing = state.places.find(
      (p) => p.name.toLowerCase() === String(partial.name).toLowerCase()
    );
    if (existing) return existing;
    const place = {
      id: generateId("place"),
      name: partial.name,
      category: partial.category || "outros",
      neighborhood: partial.neighborhood || "São Paulo",
      rating: partial.rating || 4.0,
      address: partial.address || "",
      tags: partial.tags || [],
      image: partial.image || "",
    };
    state.places.push(place);
    saveState(state);
    return place;
  }

  function getDraftReview() {
    const state = loadState();
    if (!state.draftReview) {
      state.draftReview = createEmptyDraft();
      saveState(state);
    }
    return state.draftReview;
  }

  function createEmptyDraft() {
    return {
      placeId: null,
      placeName: "",
      step1: {},
      step2: { sentiments: [] },
      step3: { ratings: {} },
      step4: { comment: "", visibility: "public" },
      step5: { photos: [], photoConsent: false },
      step6: { recommend: null, context: {} },
      skippedSteps: [],
    };
  }

  function startReviewForPlace(placeId) {
    const place = getPlaceById(placeId);
    const draft = createEmptyDraft();
    if (place) {
      draft.placeId = place.id;
      draft.placeName = place.name;
    }
    updateDraftReview(draft);
    return draft;
  }

  function updateDraftReview(partial) {
    const state = loadState();
    const current = state.draftReview || createEmptyDraft();
    state.draftReview = { ...current, ...partial };
    for (const key of ["step1", "step2", "step3", "step4", "step5", "step6"]) {
      if (partial[key]) {
        state.draftReview[key] = { ...current[key], ...partial[key] };
      }
    }
    saveState(state);
    return state.draftReview;
  }

  function clearDraftReview() {
    const state = loadState();
    state.draftReview = null;
    saveState(state);
  }

  function publishReview() {
    const state = loadState();
    const user = getCurrentUser();
    const draft = state.draftReview;
    if (!user || !draft) return null;

    if (!draft.placeId) {
      draft.placeId = "place-1";
      draft.placeName = draft.placeName || "Café Botânico";
    }

    const review = {
      id: generateId("review"),
      userId: user.id,
      userName: user.name,
      placeId: draft.placeId,
      placeName: draft.placeName,
      data: JSON.parse(JSON.stringify(draft)),
      anonymous: draft.step4?.visibility === "anonymous",
      comment: draft.step4?.comment || "",
      rating: draft.step3?.overall || draft.step3?.ratings?.overall || 5,
      createdAt: new Date().toISOString(),
    };

    state.reviews.unshift(review);
    const userIndex = state.users.findIndex((u) => u.id === user.id);
    if (userIndex >= 0) {
      state.users[userIndex].reviewsCount =
        (state.users[userIndex].reviewsCount || 0) + 1;
    }
    state.draftReview = null;
    saveState(state);
    return review;
  }

  function getReviews() {
    return loadState().reviews;
  }

  function getReviewsForPlace(placeId) {
    return getReviews().filter((r) => r.placeId === placeId);
  }

  function getAlerts() {
    return loadState().alerts;
  }

  function incrementSavedCount(userId) {
    const user = loadState().users.find((u) => u.id === userId);
    if (user) {
      updateUser(userId, { savedCount: (user.savedCount || 0) + 1 });
    }
  }

  function resetDatabase() {
    localStorage.removeItem(STORAGE_KEY);
    return loadState();
  }

  function storePendingInviteCode(code) {
    sessionStorage.setItem(INVITE_CODE_KEY, code.trim());
  }

  function getPendingInviteCode() {
    return sessionStorage.getItem(INVITE_CODE_KEY);
  }

  function clearPendingInviteCode() {
    sessionStorage.removeItem(INVITE_CODE_KEY);
  }

  return {
    loadState,
    saveState,
    getCurrentUser,
    setCurrentUser,
    logout,
    createUser,
    updateUser,
    findUserByEmail,
    findUserByUsername,
    findUserByIdentifier,
    registerUser,
    seedDemoUser,
    normalizeEmail,
    normalizeUsername,
    loginWithEmail,
    loginWithCredentials,
    getFavoritePlaceIds,
    isFavoritePlace,
    toggleFavoritePlace,
    validateInvite,
    consumeInvite,
    createInvite,
    getPendingInvites,
    getPlaces,
    getPlaceById,
    getPlaceByName,
    ensurePlace,
    getDraftReview,
    startReviewForPlace,
    updateDraftReview,
    clearDraftReview,
    publishReview,
    getReviews,
    getReviewsForPlace,
    getAlerts,
    incrementSavedCount,
    resetDatabase,
    generateId,
    storePendingInviteCode,
    getPendingInviteCode,
    clearPendingInviteCode,
  };
})();

if (typeof window !== "undefined") {
  window.FicaBemDB = FicaBemDB;
}
