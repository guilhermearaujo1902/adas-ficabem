/**
 * =============================================================================
 * FICA BEM — Camada de persistência (localStorage)
 * =============================================================================
 * Projeto acadêmico: simula um banco de dados no navegador usando
 * localStorage. Todas as telas leem e gravam dados por meio deste módulo.
 *
 * @namespace FicaBemDB
 */

const FicaBemDB = (function () {
  const STORAGE_KEY = "ficabem_app_v1";

  /**
   * Estrutura padrão do "banco" quando o app é aberto pela primeira vez.
   * @returns {Object} Estado inicial da aplicação
   */
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
          tags: ["Staff atencioso"],
          image: "",
        },
      ],
      reviews: [],
      invites: [
        { id: "inv-demo", code: "FICABEM2025", fromUserId: null, status: "pending", email: "" },
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

  /**
   * Carrega o estado completo do localStorage.
   * Se não existir, cria com dados iniciais.
   * @returns {Object} Estado atual da aplicação
   */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = getDefaultState();
        saveState(initial);
        return initial;
      }
      return { ...getDefaultState(), ...JSON.parse(raw) };
    } catch (error) {
      console.error("[FicaBemDB] Erro ao carregar:", error);
      return getDefaultState();
    }
  }

  /**
   * Persiste o estado completo no localStorage.
   * @param {Object} state - Objeto de estado da aplicação
   */
  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /**
   * Gera um identificador único simples (UUID simulado).
   * @param {string} prefix - Prefixo do id (ex: "user", "review")
   * @returns {string} Identificador único
   */
  function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Retorna o usuário logado ou null se não houver sessão.
   * @returns {Object|null} Usuário autenticado
   */
  function getCurrentUser() {
    const state = loadState();
    if (!state.currentUserId) return null;
    return state.users.find((u) => u.id === state.currentUserId) || null;
  }

  /**
   * Define qual usuário está autenticado (login simulado).
   * @param {string} userId - ID do usuário
   */
  function setCurrentUser(userId) {
    const state = loadState();
    state.currentUserId = userId;
    saveState(state);
  }

  /**
   * Encerra a sessão do usuário atual.
   */
  function logout() {
    const state = loadState();
    state.currentUserId = null;
    saveState(state);
  }

  /**
   * Cadastra um novo usuário no "banco".
   * @param {Object} userData - Dados do perfil (nome, email, senha, etc.)
   * @returns {Object} Usuário criado com id
   */
  function createUser(userData) {
    const state = loadState();
    const user = {
      id: generateId("user"),
      name: userData.name || "",
      email: userData.email || "",
      password: userData.password || "",
      avatar: userData.avatar || "",
      safeHours: userData.safeHours || [],
      avoidedCategories: userData.avoidedCategories || [],
      reviewsCount: 0,
      savedCount: 0,
      createdAt: new Date().toISOString(),
    };
    state.users.push(user);
    state.currentUserId = user.id;
    saveState(state);
    return user;
  }

  /**
   * Busca usuário por e-mail (login).
   * @param {string} email - E-mail informado
   * @returns {Object|undefined} Usuário encontrado
   */
  function findUserByEmail(email) {
    const state = loadState();
    return state.users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase().trim()
    );
  }

  /**
   * Valida um código de convite.
   * @param {string} code - Código digitado pela usuária
   * @returns {boolean} true se o convite for válido
   */
  function validateInvite(code) {
    const state = loadState();
    const normalized = String(code).trim().toUpperCase();
    return state.invites.some(
      (inv) => inv.code.toUpperCase() === normalized && inv.status === "pending"
    );
  }

  /**
   * Marca convite como utilizado após cadastro.
   * @param {string} code - Código do convite
   */
  function consumeInvite(code) {
    const state = loadState();
    const normalized = String(code).trim().toUpperCase();
    state.invites = state.invites.map((inv) =>
      inv.code.toUpperCase() === normalized ? { ...inv, status: "used" } : inv
    );
    saveState(state);
  }

  /**
   * Cria um novo convite pendente.
   * @param {string} fromUserId - Quem convidou
   * @returns {Object} Convite gerado
   */
  function createInvite(fromUserId) {
    const state = loadState();
    const code = "FB" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const invite = {
      id: generateId("inv"),
      code,
      fromUserId,
      status: "pending",
      email: "",
    };
    state.invites.push(invite);
    saveState(state);
    return invite;
  }

  /**
   * Lista convites pendentes.
   * @returns {Array} Convites com status pending
   */
  function getPendingInvites() {
    return loadState().invites.filter((i) => i.status === "pending");
  }

  /**
   * Retorna todos os locais cadastrados.
   * @param {string|null} category - Filtro opcional por categoria
   * @returns {Array} Lista de locais
   */
  function getPlaces(category) {
    const places = loadState().places;
    if (!category || category === "todos") return places;
    return places.filter((p) => p.category === category);
  }

  /**
   * Busca um local pelo identificador.
   * @param {string} placeId - ID do local
   * @returns {Object|undefined} Local encontrado
   */
  function getPlaceById(placeId) {
    return loadState().places.find((p) => p.id === placeId);
  }

  /**
   * Inicia ou retorna o rascunho da avaliação em andamento.
   * @returns {Object} Rascunho da avaliação
   */
  function getDraftReview() {
    const state = loadState();
    if (!state.draftReview) {
      state.draftReview = {
        placeId: null,
        placeName: "",
        step1: {},
        step2: {},
        step3: {},
        step4: { comment: "", visibility: "public" },
        step5: { photos: [], photoConsent: false },
        step6: { recommend: null, context: {} },
        skippedSteps: [],
      };
      saveState(state);
    }
    return state.draftReview;
  }

  /**
   * Atualiza parcialmente o rascunho da avaliação.
   * @param {Object} partial - Campos a mesclar no rascunho
   */
  function updateDraftReview(partial) {
    const state = loadState();
    state.draftReview = { ...getDraftReview(), ...partial };
    if (partial.step1) state.draftReview.step1 = { ...state.draftReview.step1, ...partial.step1 };
    if (partial.step2) state.draftReview.step2 = { ...state.draftReview.step2, ...partial.step2 };
    if (partial.step3) state.draftReview.step3 = { ...state.draftReview.step3, ...partial.step3 };
    if (partial.step4) state.draftReview.step4 = { ...state.draftReview.step4, ...partial.step4 };
    if (partial.step5) state.draftReview.step5 = { ...state.draftReview.step5, ...partial.step5 };
    if (partial.step6) state.draftReview.step6 = { ...state.draftReview.step6, ...partial.step6 };
    saveState(state);
  }

  /**
   * Limpa o rascunho após publicar a avaliação.
   */
  function clearDraftReview() {
    const state = loadState();
    state.draftReview = null;
    saveState(state);
  }

  /**
   * Publica a avaliação no "banco" e atualiza contadores do usuário.
   * @returns {Object|null} Avaliação publicada ou null se sem usuário
   */
  function publishReview() {
    const state = loadState();
    const user = getCurrentUser();
    const draft = state.draftReview;
    if (!user || !draft) return null;

    const review = {
      id: generateId("review"),
      userId: user.id,
      userName: user.name,
      placeId: draft.placeId,
      placeName: draft.placeName,
      data: { ...draft },
      anonymous: draft.step4?.visibility === "anonymous",
      createdAt: new Date().toISOString(),
    };

    state.reviews.unshift(review);
    const userIndex = state.users.findIndex((u) => u.id === user.id);
    if (userIndex >= 0) {
      state.users[userIndex].reviewsCount = (state.users[userIndex].reviewsCount || 0) + 1;
    }
    state.draftReview = null;
    saveState(state);
    return review;
  }

  /**
   * Lista avaliações para exibir no feed (mais recentes primeiro).
   * @returns {Array} Avaliações publicadas
   */
  function getReviews() {
    return loadState().reviews;
  }

  /**
   * Retorna alertas de segurança próximos.
   * @returns {Array} Alertas
   */
  function getAlerts() {
    return loadState().alerts;
  }

  /**
   * Reseta o banco (útil para demonstração em sala de aula).
   */
  function resetDatabase() {
    localStorage.removeItem(STORAGE_KEY);
    return loadState();
  }

  return {
    loadState,
    saveState,
    getCurrentUser,
    setCurrentUser,
    logout,
    createUser,
    findUserByEmail,
    validateInvite,
    consumeInvite,
    createInvite,
    getPendingInvites,
    getPlaces,
    getPlaceById,
    getDraftReview,
    updateDraftReview,
    clearDraftReview,
    publishReview,
    getReviews,
    getAlerts,
    resetDatabase,
    generateId,
  };
})();

if (typeof window !== "undefined") {
  window.FicaBemDB = FicaBemDB;
}
