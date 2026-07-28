/**
 * Backend Google Apps Script para o sistema de gestão da igreja.
 * v54.5.1 — histórico anual e comparação do Avante Evangelho.
 */
const CONFIG = {
  SHEETS: {
    RAW: 'Raw_JSON',
    SUBMISSIONS: 'Submissoes',
    MEMBERS: 'Membros',
    USERS: 'Utilizadores',
    SESSIONS: 'Sessoes',
    AUDIT: 'Auditoria',
    CHURCHES: 'Igrejas',
    AVANTE_GROUPS: 'Avante_Grupos',
    AVANTE_CHURCHES: 'Avante_Igrejas',
    AVANTE_CONTRIBUTIONS: 'Avante_Contribuicoes',
    AVANTE_CONFIG: 'Avante_Configuracao',
    AVANTE_HISTORY: 'Avante_Historico_Anual'
  },
  MODULE_SHEETS: {
    plano_cultos_escalas: 'Plano_Cultos_Escalas',
    relatorio_cultos: 'Relatorio_Cultos',
    visitantes: 'Visitantes_Membros',
    registo_financeiro: 'Registo_Financeiro',
    sem_modulo: 'Sem_Modulo'
  },
  MODULE_AREA: {
    plano_cultos_escalas: 'PLANO',
    relatorio_cultos: 'CULTOS',
    registo_financeiro: 'FINANCAS',
    visitantes: 'MEMBROS',
    sem_modulo: 'GERAL'
  },
  AREA_MODULES: {
    PLANO: ['plano_cultos_escalas'],
    CULTOS: ['relatorio_cultos'],
    FINANCAS: ['registo_financeiro'],
    MEMBROS: ['visitantes']
  },
  PIN_BY_MODULE: {}
};


function doGet(e) {
  try {
    const action = (e.parameter.action || 'health').toLowerCase();
    if (action === 'bootstrap') {
      const u = validateToken_(e.parameter.token, { allowPasswordChange: true });
      return jsonOutput({
        ok: true,
        mustChangePassword: !!u.mustChangePassword,
        members: u.mustChangePassword ? [] : getMembersForUser_(u),
        memberScope: u.mustChangePassword ? { churchId: '', churchName: '', loading: false, loaded: false, unassignedCount: 0 } : getMemberScopeForUser_(u),
        churches: u.mustChangePassword ? [] : getChurchesForUser_(u),
        user: u,
        permissions: getUserPermissions_(u)
      });
    }
    if (action === 'usersadmin') {
      const u = validateToken_(e.parameter.token);
      return jsonOutput(getUsersAdminData_(u));
    }
    if (action === 'membersbychurch') {
      const u = validateToken_(e.parameter.token);
      return jsonOutput(getMembersByChurchResponse_(u, e.parameter.igreja_id || e.parameter.churchId));
    }
    if (action === 'stats') {
      const u = validateToken_(e.parameter.token);
      validateCanViewArea_(u, 'GERAL');
      return jsonOutput(getStats_(u, e.parameter || {}));
    }
    if (action === 'report') {
      const u = validateToken_(e.parameter.token);
      validateCanViewArea_(u, 'FINANCAS');
      return jsonOutput(getFinancialReport_(e.parameter || {}, u));
    }
    if (action === 'approvals') {
      const u = validateToken_(e.parameter.token);
      return jsonOutput(getPendingApprovals_(u, e.parameter || {}));
    }
    if (action === 'resumodelegados') return jsonOutput({ ok: true, resumo: calcularResumoDelegados_() });
    if (action === 'delegadosdata') {
      const u = validateToken_(e.parameter.token);
      return jsonOutput(getDelegadosCertificationData_(u));
    }
    if (action === 'assembleiaconfig') return jsonOutput({ ok: true, config: getAssembleiaConfig_() });
    if (action === 'avantepublicdata') return jsonOutput(getAvantePublicData_());
    if (action === 'avantedata') {
      const u = validateToken_(e.parameter.token);
      validateCanViewArea_(u, 'FINANCAS');
      if (!isDistrictUser_(u)) throw new Error('A gestão do Avante Evangelho está reservada aos utilizadores distritais.');
      return jsonOutput(getAvanteAdminData_(u));
    }
    if (action === 'appdata') {
      const u = validateToken_(e.parameter.token);
      return jsonOutput(getAppData_(u, e.parameter || {}));
    }
    return jsonOutput({ ok: true, service: 'xlsform-webapp-backend', version: '54.5.1', time: new Date().toISOString() });
  } catch (err) {
    return jsonOutput({ ok: false, message: err.message });
  }
}


function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    if (payload.action === 'login') return jsonOutput(login_(payload));
    if (payload.action === 'logout') { revokeSession_(payload.authToken); return jsonOutput({ ok: true }); }
    if (payload.action === 'changeOwnPassword') {
      const u = validateToken_(payload.authToken, { allowPasswordChange: true });
      return jsonOutput(changeOwnPassword_(u, payload));
    }
    if (payload.action === 'saveUserAdmin') {
      const u = validateToken_(payload.authToken);
      return jsonOutput(saveUserAdmin_(u, payload));
    }
    if (payload.action === 'resetUserPassword') {
      const u = validateToken_(payload.authToken);
      return jsonOutput(resetUserPassword_(u, payload));
    }

    if (payload.action === 'saveAssembleiaDate') return jsonOutput(saveAssembleiaDate_(payload));
    if (payload.action === 'saveCertificacaoDelegados') { const u = validateToken_(payload.authToken); return jsonOutput(saveDelegadosCertification_(u, payload)); }
    if (payload.action === 'saveAvanteContribution') {
      const u = validateToken_(payload.authToken);
      return jsonOutput(saveAvanteContribution_(u, payload));
    }
    if (payload.action === 'deleteAvanteContribution') {
      const u = validateToken_(payload.authToken);
      return jsonOutput(deleteAvanteContribution_(u, payload));
    }
    if (payload.action === 'importMembersCsv') {
      const u = validateToken_(payload.authToken);
      return jsonOutput(importMembersCsv_(u, payload));
    }
    if (payload.action === 'approve') {
      const u = validateToken_(payload.authToken);
      return jsonOutput(approveSubmission_(u, payload));
    }
    if (payload.action !== 'submit') throw new Error('Acção inválida.');
    const sessionUser = validateToken_(payload.authToken);
    const normalizedPayload = normalizeAndValidateSubmissionV541_(payload, sessionUser);
    validateUserCanSubmit_(sessionUser, normalizedPayload.module, normalizedPayload.data || {});
    const result = saveSubmission_(normalizedPayload, sessionUser);
    return jsonOutput({ ok: true, ...result });
  } catch (err) {
    return jsonOutput({ ok: false, message: err.message });
  }
}

function setup() {
  ensureSheet_(CONFIG.SHEETS.SUBMISSIONS, ['submittedAt','uuid','module','area','moduleLabel','estado_aprovacao','submetido_por','submetido_por_nome','submetido_por_perfil','igreja_id','igreja_nome','departamento_utilizador','aprovado_por','aprovado_em','createdAt','payloadPreview']);
  ensureSheet_(CONFIG.SHEETS.RAW, ['createdAt','uuid','module','json']);
  const membersSheet = ensureSheet_(CONFIG.SHEETS.MEMBERS, ['id_membro','igreja_id','igreja_nome','name','label','Telefone','sexo','departamento','grupo','batizado','comunhao','celular_whatsapp','bairro','activo','origem_importacao','createdAt','updatedAt']);
  addMissingHeaders_(membersSheet, ['id_membro','igreja_id','igreja_nome','name','label','Telefone','sexo','departamento','grupo','batizado','comunhao','celular_whatsapp','bairro','activo','origem_importacao','createdAt','updatedAt']);
  ensureSheet_(CONFIG.SHEETS.SESSIONS, ['token_hash','createdAt','expiresAt','user_json','activo','revokedAt']);
  ensureSheet_(CONFIG.SHEETS.AUDIT, ['createdAt','actor','actorName','action','module','uuid','details']);
  ensureChurches_();
  ensureSheet_('Assembleia_Config', ['key','value','updatedAt','updatedBy']);
  ensureDelegadosSheets_();
  ensureAvanteSheets_();
  ensureUsers_();
  ensureOpeningBalances_();
  Object.values(CONFIG.MODULE_SHEETS).forEach(name => ensureSheet_(name, ['createdAt','submittedAt','uuid','module','area','estado_aprovacao','submetido_por','submetido_por_nome','submetido_por_perfil','igreja_id','igreja_nome','departamento_utilizador','aprovado_por','aprovado_em']));
  SpreadsheetApp.flush();
}


function ensureChurches_() {
  const headers = ['igreja_id','nome_igreja','distrito','zona','pastor','telefone','activo'];
  const sh = ensureSheet_(CONFIG.SHEETS.CHURCHES, headers);
  addMissingHeaders_(sh, headers);
  if (sh.getLastRow() > 1) return;
  const rows = [
    ['liberdade','Igreja do Nazareno de Liberdade','Distrito da Matola','Zona 1','','','SIM'],
    ['bairro_da_matola','Igreja do Nazareno do Bairro da Matola','Distrito da Matola','Zona 1','','','SIM'],
    ['ndlavela','Igreja do Nazareno de Ndlavela','Distrito da Matola','Zona 1','','','SIM'],
    ['fomento','Igreja do Nazareno de Fomento','Distrito da Matola','Zona 1','','','SIM'],
    ['infulene','Igreja do Nazareno de Infulene','Distrito da Matola','Zona 1','','','SIM'],
    ['t3','Igreja do Nazareno de T-3','Distrito da Matola','Zona 1','','','SIM'],
    ['boquisso','Igreja do Nazareno de Boquisso','Distrito da Matola','Zona 2','','','SIM'],
    ['djuba','Igreja do Nazareno de Djuba','Distrito da Matola','Zona 2','','','SIM'],
    ['khongolote_1','Igreja do Nazareno de Khongolote 1','Distrito da Matola','Zona 2','','','SIM'],
    ['khongolote_2','Igreja do Nazareno de Khongolote 2','Distrito da Matola','Zona 2','','','SIM'],
    ['km_15','Igreja do Nazareno de KM 15','Distrito da Matola','Zona 2','','','SIM'],
    ['licuacuanine','Igreja do Nazareno de Licuaçuanine','Distrito da Matola','Zona 2','','','SIM'],
    ['machava_sede','Igreja do Nazareno de Machava-Sede','Distrito da Matola','Zona 3','','','SIM'],
    ['sao_damanso_makhelene','Igreja do Nazareno de São Damanso/Makhelene','Distrito da Matola','Zona 3','','','SIM'],
    ['makopene','Igreja do Nazareno de Makopene','Distrito da Matola','Zona 3','','','SIM'],
    ['malhampsane','Igreja do Nazareno de Malhampsane','Distrito da Matola','Zona 3','','','SIM'],
    ['malhampsane_ii','Igreja do Nazareno de Malhampsane II','Distrito da Matola','Zona 3','','','SIM'],
    ['massinwane','Igreja do Nazareno de Massinwane','Distrito da Matola','Zona 3','','','SIM'],
    ['matola_a','Igreja do Nazareno de Matola A','Distrito da Matola','Zona 4','','','SIM'],
    ['matola_cidade','Igreja do Nazareno de Matola Cidade','Distrito da Matola','Zona 4','','','SIM'],
    ['xinyenpfana','Igreja do Nazareno de Xinyenpfana','Distrito da Matola','Zona 4','','','SIM'],
    ['moamba','Igreja do Nazareno de Moamba','Distrito da Matola','Zona 4','','','SIM'],
    ['mulotane','Igreja do Nazareno de Mulotane','Distrito da Matola','Zona 4','','','SIM'],
    ['mussumbuluco','Igreja do Nazareno de Mussumbuluco','Distrito da Matola','Zona 4','','','SIM'],
    ['matola_rio_b','Igreja do Nazareno de Matola Rio B','Distrito da Matola','Zona 5','','','SIM'],
    ['mutate','Igreja do Nazareno de Mutate','Distrito da Matola','Zona 5','','','SIM'],
    ['matola_gare','Igreja do Nazareno de Matola Gare','Distrito da Matola','Zona 5','','','SIM'],
    ['nkobe','Igreja do Nazareno de Nkobe','Distrito da Matola','Zona 5','','','SIM'],
    ['nwamatibyana','Igreja do Nazareno de Nwamatibyana','Distrito da Matola','Zona 5','','','SIM'],
    ['sabie','Igreja do Nazareno de Sabie','Distrito da Matola','Zona 5','','','SIM'],
    ['tchumene','Igreja do Nazareno de Tchumene','Distrito da Matola','Zona 6','','','SIM'],
    ['tenga','Igreja do Nazareno de Tenga','Distrito da Matola','Zona 6','','','SIM'],
    ['tsalala','Igreja do Nazareno de Tsalala','Distrito da Matola','Zona 6','','','SIM'],
    ['tchonissa','Igreja do Nazareno de Tchonissa','Distrito da Matola','Zona 6','','','SIM'],
    ['vale_infulene','Igreja do Nazareno de Vale Infulene','Distrito da Matola','Zona 6','','','SIM'],
    ['ressano_garcia','Igreja do Nazareno de Ressano Garcia','Distrito da Matola','Zona 6','','','SIM'],
    ['intaka','Igreja do Nazareno de Intaka','Distrito da Matola','Zona 7','','','SIM'],
    ['ndlavela_1','Igreja do Nazareno de Ndlavela 1','Distrito da Matola','Zona 7','','','SIM'],
    ['muhalazi','Igreja do Nazareno de Muhalazi','Distrito da Matola','Zona 7','','','SIM'],
    ['mulotane_bili','Igreja do Nazareno de Mulotane-Bili','Distrito da Matola','Zona 7','','','SIM']
  ];
  sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  formatHeader_(sh);
}

function getChurches_() {
  ensureChurches_();
  return readSheetObjects_(CONFIG.SHEETS.CHURCHES).map(r => ({
    igreja_id: String(r.igreja_id || '').trim(),
    nome_igreja: String(r.nome_igreja || r.label || r.igreja_id || '').trim(),
    distrito: String(r.distrito || '').trim(),
    zona: String(r.zona || '').trim(),
    pastor: String(r.pastor || '').trim(),
    telefone: String(r.telefone || '').trim(),
    activo: String(r.activo || 'SIM').trim().toUpperCase()
  })).filter(r => r.igreja_id && !['NAO','NÃO','NO'].includes(r.activo));
}

function getChurchById_(id) {
  const key = String(id || '').trim();
  if (!key || key === '*') return { igreja_id: '*', nome_igreja: 'Todas as igrejas', distrito: '', zona: '' };
  return getChurches_().find(c => c.igreja_id === key) || { igreja_id: key, nome_igreja: key, distrito: '', zona: '' };
}

function isDistrictUser_(user) {
  const id = String((user && (user.igreja_id || user.churchId)) || '*').trim();
  const level = String((user && (user.nivel_acesso || user.accessLevel)) || '').trim().toUpperCase();
  const role = String((user && user.role) || '').trim().toUpperCase();
  return id === '*' || level === 'DISTRITAL' || role === 'ADMIN_IT' || role === 'ADMIN' || role === 'ADMINISTRADOR';
}

function userChurchId_(user) {
  return String((user && (user.igreja_id || user.churchId)) || '*').trim() || '*';
}

function userChurchName_(user) {
  const id = userChurchId_(user);
  if (id === '*') return 'Todas as igrejas';
  return String((user && (user.igreja_nome || user.churchName)) || getChurchById_(id).nome_igreja || id);
}

function recordChurchId_(obj) {
  return String((obj && (obj.igreja_id || obj.igreja_local || obj.churchId)) || '').trim();
}

function userCanAccessRecord_(user, obj) {
  if (!user) return false;
  if (isDistrictUser_(user)) return true;
  const rec = recordChurchId_(obj);
  if (!rec) return false;
  return rec === userChurchId_(user);
}


function filterObjectsByChurch_(rows, user, requestedChurchId) {
  const scope = resolveReadScope_(user, requestedChurchId);
  return (rows || []).filter(r =>
    recordMatchesReadScope_(r, scope) &&
    recordMatchesUserDepartmentScope_(r, user)
  );
}

function resolveReadScope_(user, requestedChurchId) {
  if (!user) throw new Error('Sessão de utilizador inválida.');
  const assignedId = userChurchId_(user);

  if (!isDistrictUser_(user)) {
    if (!assignedId || assignedId === '*') throw new Error('O utilizador local não possui uma igreja válida atribuída.');
    const church = getChurches_().find(c => String(c.igreja_id) === assignedId);
    if (!church) throw new Error('A igreja atribuída ao utilizador não existe ou está inactiva.');
    return {
      igreja_id: church.igreja_id,
      igreja_nome: church.nome_igreja,
      mode: 'CHURCH',
      districtView: false,
      localUser: true
    };
  }

  const requested = String(requestedChurchId || '').trim();
  if (!requested || requested === '*') {
    return {
      igreja_id: '*',
      igreja_nome: 'Todas as igrejas',
      mode: 'DISTRICT',
      districtView: true,
      localUser: false
    };
  }

  const church = getChurches_().find(c => String(c.igreja_id) === requested);
  if (!church) throw new Error('A igreja seleccionada não existe ou está inactiva.');
  return {
    igreja_id: church.igreja_id,
    igreja_nome: church.nome_igreja,
    mode: 'CHURCH',
    districtView: false,
    localUser: false
  };
}

function recordMatchesReadScope_(obj, scope) {
  if (!scope) return false;
  if (scope.igreja_id === '*') return true;
  const recordId = recordChurchId_(obj);
  return !!recordId && recordId === scope.igreja_id;
}

function recordMatchesUserDepartmentScope_(obj, user) {
  const role = String((user && (user.role || user.perfil)) || '').trim().toUpperCase();
  if (role !== 'LIDER' && role !== 'LÍDER') return true;
  const userDepartment = String((user && (user.department || user.departamento)) || '').trim();
  if (!userDepartment || userDepartment === '*') return true;
  const recordDepartment = String(
    (obj && (obj.departamento_final || obj.departamento || obj.departamento_001 || obj.ministerio || obj.departamento_utilizador)) || ''
  ).trim();
  if (!recordDepartment) return false;
  return canonicalLeaderDepartmentV5431_(recordDepartment) === canonicalLeaderDepartmentV5431_(userDepartment);
}

function scopeResponse_(scope) {
  return {
    igreja_id: scope.igreja_id,
    igreja_nome: scope.igreja_nome,
    mode: scope.mode,
    districtView: !!scope.districtView,
    localUser: !!scope.localUser,
    label: scope.mode === 'DISTRICT'
      ? 'Visão distrital — todas as igrejas'
      : scope.igreja_nome
  };
}


function applyChurchToData_(data, user) {
  const out = data || {};
  const assignedId = userChurchId_(user);

  // Utilizadores locais gravam sempre na igreja atribuída ao seu perfil.
  if (!isDistrictUser_(user)) {
    const church = getChurchById_(assignedId);
    if (!assignedId || assignedId === '*') throw new Error('O utilizador não possui uma igreja válida atribuída.');
    out.igreja_id = assignedId;
    out.igreja_nome = church.nome_igreja;
    return out;
  }

  // Utilizadores distritais devem indicar expressamente a igreja de trabalho.
  const requestedId = String(out.igreja_id || '').trim();
  if (!requestedId || requestedId === '*') {
    throw new Error('Seleccione a igreja de trabalho antes de efectuar um novo registo.');
  }
  const church = getChurches_().find(c => String(c.igreja_id) === requestedId);
  if (!church) throw new Error('A igreja seleccionada não existe ou está inactiva.');
  out.igreja_id = church.igreja_id;
  out.igreja_nome = church.nome_igreja;
  return out;
}

function ensureUsers_() {
  const headers = [
    'id','nome','username','password_hash','perfil','departamento','igreja_id','igreja_nome','nivel_acesso',
    'pode_ver_plano','pode_lancar_plano','pode_aprovar_plano','pode_ver_cultos','pode_lancar_cultos','pode_aprovar_cultos',
    'pode_ver_financas','pode_lancar_financas','pode_aprovar_financas','pode_ver_membros','pode_lancar_membros','pode_aprovar_membros',
    'pode_ver_painel','pode_configurar','activo','deve_trocar_password','tentativas_falhadas','bloqueado_ate',
    'ultimo_login','password_alterada_em','actualizado_em','actualizado_por','criado_em'
  ];
  const sh = ensureSheet_(CONFIG.SHEETS.USERS, headers);
  addMissingHeaders_(sh, headers);
  if (sh.getLastRow() > 1) return;

  const now = new Date();
  const seeds = [
    { nome:'Pastor Distrital', username:'pastor', password:'pastor123', perfil:'PASTOR', departamento:'*', igreja_id:'*', igreja_nome:'Todas as igrejas', nivel_acesso:'DISTRITAL' },
    { nome:'Admin IT', username:'adminit', password:'it123', perfil:'ADMIN_IT', departamento:'*', igreja_id:'*', igreja_nome:'Todas as igrejas', nivel_acesso:'DISTRITAL' },
    { nome:'Secretário Distrital', username:'secretario', password:'sec123', perfil:'SECRETARIO', departamento:'*', igreja_id:'*', igreja_nome:'Todas as igrejas', nivel_acesso:'DISTRITAL' },
    { nome:'Tesoureiro Distrital', username:'tesoureiro', password:'tes123', perfil:'TESOUREIRO', departamento:'*', igreja_id:'*', igreja_nome:'Todas as igrejas', nivel_acesso:'DISTRITAL' },
    { nome:'Tesoureiro Infulene', username:'tes_infulene', password:'tes123', perfil:'TESOUREIRO', departamento:'*', igreja_id:'infulene', igreja_nome:'Igreja do Nazareno de Infulene', nivel_acesso:'LOCAL' },
    { nome:'Secretário Infulene', username:'sec_infulene', password:'sec123', perfil:'SECRETARIO', departamento:'*', igreja_id:'infulene', igreja_nome:'Igreja do Nazareno de Infulene', nivel_acesso:'LOCAL' },
    { nome:'Líder JNI Infulene', username:'liderjni', password:'lider123', perfil:'LIDER', departamento:'JNI', igreja_id:'infulene', igreja_nome:'Igreja do Nazareno de Infulene', nivel_acesso:'LOCAL' }
  ];

  seeds.forEach(function(seed) {
    const row = {
      id: Utilities.getUuid(),
      nome: seed.nome,
      username: seed.username,
      password_hash: sha256_(seed.password),
      perfil: seed.perfil,
      departamento: seed.departamento,
      igreja_id: seed.igreja_id,
      igreja_nome: seed.igreja_nome,
      nivel_acesso: seed.nivel_acesso,
      activo: 'SIM',
      deve_trocar_password: 'SIM',
      tentativas_falhadas: 0,
      bloqueado_ate: '',
      ultimo_login: '',
      password_alterada_em: '',
      actualizado_em: now,
      actualizado_por: 'SISTEMA',
      criado_em: now
    };
    Object.assign(row, permissionFieldsForRole_(seed.perfil));
    appendObject_(CONFIG.SHEETS.USERS, row);
  });
  formatHeader_(sh);
}

function login_(payload) {
  setup();
  const username = String(payload.username || '').trim();
  const password = String(payload.password || '');
  if (!username || !password) throw new Error('Informe o utilizador e a palavra-passe.');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const record = findUserRecord_(username);
    const user = record ? record.user : null;
    if (!record || !user || !yes_(user.activo || user.active)) {
      audit_({ username: username, name: '' }, 'LOGIN_FALHADO', 'AUTH', '', 'Utilizador inexistente ou inactivo');
      throw new Error('Utilizador ou palavra-passe incorrectos.');
    }

    const blockedUntil = parseUserDate_(user.bloqueado_ate);
    if (blockedUntil && blockedUntil.getTime() > Date.now()) {
      const minutes = Math.max(1, Math.ceil((blockedUntil.getTime() - Date.now()) / 60000));
      throw new Error('Conta temporariamente bloqueada. Tente novamente dentro de ' + minutes + ' minuto(s).');
    }

    if (!verifyPassword_(password, user)) {
      const result = registerFailedLogin_(record);
      audit_({ username: username, name: String(user.nome || '') }, 'LOGIN_FALHADO', 'AUTH', '', 'Tentativa ' + result.attempts + ' de ' + LOGIN_MAX_ATTEMPTS);
      if (result.blocked) throw new Error('Conta temporariamente bloqueada durante ' + LOGIN_BLOCK_MINUTES + ' minutos devido a várias tentativas falhadas.');
      throw new Error('Utilizador ou palavra-passe incorrectos. Restam ' + Math.max(0, LOGIN_MAX_ATTEMPTS - result.attempts) + ' tentativa(s).');
    }

    clearFailedLogin_(record);
    updateUserRecordFields_(record, { ultimo_login: new Date(), actualizado_em: new Date(), actualizado_por: username });
    const safeUser = sanitizeUser_(record.user);
    safeUser.lastLogin = new Date().toISOString();
    const token = createSession_(safeUser);
    audit_(safeUser, 'LOGIN', 'AUTH', '', 'Entrada no sistema');
    return {
      ok: true,
      token: token,
      user: safeUser,
      permissions: getUserPermissions_(safeUser),
      mustChangePassword: !!safeUser.mustChangePassword,
      members: safeUser.mustChangePassword ? [] : getMembersForUser_(safeUser),
      memberScope: safeUser.mustChangePassword ? { churchId: '', churchName: '', loading: false, loaded: false, unassignedCount: 0 } : getMemberScopeForUser_(safeUser),
      churches: safeUser.mustChangePassword ? [] : getChurchesForUser_(safeUser)
    };
  } finally {
    lock.releaseLock();
  }
}

function findUser_(username) {
  const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEETS.USERS);
  if (!sh || sh.getLastRow() < 2) return null;
  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);
  for (const row of values) {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    if (String(obj.username || '').trim().toLowerCase() === username.toLowerCase()) return obj;
  }
  return null;
}

function findUserRecord_(username) {
  const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEETS.USERS);
  if (!sh || sh.getLastRow() < 2) return null;
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(String);
  const needle = String(username || '').trim().toLowerCase();
  for (let i = 1; i < values.length; i++) {
    const obj = {};
    headers.forEach(function(h, c) { obj[h] = values[i][c]; });
    if (String(obj.username || '').trim().toLowerCase() === needle) {
      return { sh: sh, row: i + 1, headers: headers, user: obj };
    }
  }
  return null;
}

function updateUserRecordFields_(record, fields) {
  if (!record || !record.sh) throw new Error('Utilizador não encontrado.');
  addMissingHeaders_(record.sh, Object.keys(fields || {}));
  const headers = record.sh.getRange(1, 1, 1, record.sh.getLastColumn()).getValues()[0].map(String);
  Object.keys(fields || {}).forEach(function(key) {
    const col = headers.indexOf(key);
    if (col >= 0) {
      record.sh.getRange(record.row, col + 1).setValue(fields[key]);
      record.user[key] = fields[key];
    }
  });
  record.headers = headers;
}

function parseUserDate_(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_BLOCK_MINUTES = 15;

function registerFailedLogin_(record) {
  const current = Number(record.user.tentativas_falhadas || 0) || 0;
  const attempts = current + 1;
  const blocked = attempts >= LOGIN_MAX_ATTEMPTS;
  const fields = {
    tentativas_falhadas: blocked ? 0 : attempts,
    bloqueado_ate: blocked ? new Date(Date.now() + LOGIN_BLOCK_MINUTES * 60000) : '',
    actualizado_em: new Date(),
    actualizado_por: 'LOGIN'
  };
  updateUserRecordFields_(record, fields);
  return { attempts: attempts, blocked: blocked };
}

function clearFailedLogin_(record) {
  updateUserRecordFields_(record, { tentativas_falhadas: 0, bloqueado_ate: '' });
}

function sanitizeUser_(user) {
  const role = String(user.perfil || user.role || '').trim().toUpperCase();
  const defaults = defaultPermissionsForRole_(role);
  const out = {
    id: String(user.id || ''),
    username: String(user.username || ''),
    name: String(user.nome || user.name || user.username || ''),
    role,
    department: String(user.departamento || user.department || '*').trim() || '*',
    igreja_id: String(user.igreja_id || user.churchId || '*').trim() || '*',
    igreja_nome: String(user.igreja_nome || user.churchName || '').trim(),
    nivel_acesso: String(user.nivel_acesso || user.accessLevel || '').trim().toUpperCase(),
    canDashboard: valueOrDefault_(user.pode_ver_painel || user.canDashboard, defaults.canDashboard),
    canConfig: valueOrDefault_(user.pode_configurar || user.canConfig, defaults.canConfig),
    mustChangePassword: yes_(user.deve_trocar_password || user.mustChangePassword),
    lastLogin: formatDateTimeValue_(user.ultimo_login),
    active: yes_(user.activo || user.active)
  };

  if (!out.igreja_nome) out.igreja_nome = userChurchName_(out);
  if (!out.nivel_acesso) out.nivel_acesso = out.igreja_id === '*' ? 'DISTRITAL' : 'LOCAL';

  out.viewAreas = areasFromUserOrDefault_(user, 'pode_ver_', defaults.viewAreas);
  out.submitAreas = areasFromUserOrDefault_(user, 'pode_lancar_', defaults.submitAreas);
  out.approveAreas = areasFromUserOrDefault_(user, 'pode_aprovar_', defaults.approveAreas);

  // Regra institucional: líderes de departamentos/ministérios apenas lançam Finanças.
  // O lançamento fica sempre pendente porque líderes não têm área de aprovação.
  if (role === 'LIDER' || role === 'LÍDER') {
    out.viewAreas = ['FINANCAS'];
    out.submitAreas = ['FINANCAS'];
    out.approveAreas = [];
    out.canDashboard = false;
    out.canConfig = false;
  }

  out.allowedModules = modulesFromAreas_(out.submitAreas).join(',');
  out.viewModules = modulesFromAreas_(out.viewAreas).join(',');
  out.approvalModules = modulesFromAreas_(out.approveAreas).join(',');
  out.canForm = out.viewAreas.length > 0 || out.submitAreas.length > 0;
  out.canReport = out.viewAreas.includes('FINANCAS');
  out.canApprove = out.approveAreas.length > 0;
  out.isDistrict = isDistrictUser_(out);
  out.churchId = out.igreja_id;
  out.churchName = out.igreja_nome;
  out.accessLevel = out.nivel_acesso;
  return out;
}

function defaultPermissionsForRole_(role) {
  const all = ['PLANO','CULTOS','FINANCAS','MEMBROS'];
  const r = String(role || '').toUpperCase();
  if (r === 'PASTOR' || r === 'SUPERINTENDENTE') return { viewAreas: all, submitAreas: [], approveAreas: [], canDashboard: true, canConfig: false };
  if (r === 'ADMIN_IT' || r === 'ADMIN' || r === 'ADMINISTRADOR') return { viewAreas: all, submitAreas: all, approveAreas: all, canDashboard: true, canConfig: true };
  if (r === 'SECRETARIO' || r === 'SECRETÁRIO') return { viewAreas: all, submitAreas: ['PLANO','CULTOS','MEMBROS'], approveAreas: ['PLANO','CULTOS','MEMBROS'], canDashboard: true, canConfig: false };
  if (r === 'TESOUREIRO') return { viewAreas: all, submitAreas: ['FINANCAS'], approveAreas: ['FINANCAS'], canDashboard: true, canConfig: false };
  if (r === 'LIDER' || r === 'LÍDER') return { viewAreas: ['FINANCAS'], submitAreas: ['FINANCAS'], approveAreas: [], canDashboard: false, canConfig: false };
  if (r === 'VISUALIZADOR') return { viewAreas: all, submitAreas: [], approveAreas: [], canDashboard: true, canConfig: false };
  return { viewAreas: [], submitAreas: [], approveAreas: [], canDashboard: false, canConfig: false };
}

function valueOrDefault_(value, fallback) {
  if (value === undefined || value === null || String(value).trim() === '') return !!fallback;
  return yes_(value);
}

function areasFromUserOrDefault_(user, prefix, defaults) {
  const explicit = areasFromUser_(user, prefix);
  const fields = ['plano','cultos','financas','membros'].map(k => prefix + k);
  const hasAnyConfiguredField = fields.some(f => user[f] !== undefined && user[f] !== null && String(user[f]).trim() !== '');
  return hasAnyConfiguredField ? explicit : (defaults || []);
}

function areasFromUser_(user, prefix) {
  const map = { plano:'PLANO', cultos:'CULTOS', financas:'FINANCAS', membros:'MEMBROS' };
  return Object.keys(map).filter(k => yes_(user[prefix + k])).map(k => map[k]);
}

function modulesFromAreas_(areas) {
  const mods = [];
  (areas || []).forEach(a => (CONFIG.AREA_MODULES[a] || []).forEach(m => mods.push(m)));
  return mods;
}

function getUserPermissions_(user) {
  return {
    viewAreas: user.viewAreas || [],
    submitAreas: user.submitAreas || [],
    approveAreas: user.approveAreas || [],
    allowedModules: user.allowedModules || '',
    approvalModules: user.approvalModules || '',
    igreja_id: user.igreja_id || user.churchId || '*',
    igreja_nome: user.igreja_nome || user.churchName || 'Todas as igrejas',
    nivel_acesso: user.nivel_acesso || user.accessLevel || 'DISTRITAL'
  };
}

function verifyPassword_(password, user) {
  if (user.password_hash) return String(user.password_hash) === sha256_(password);
  if (user.password) return String(user.password) === String(password);
  return false;
}

const SESSION_TTL_SECONDS = 21600;

/**
 * Cria uma sessão em dois níveis: cache rápido e folha persistente.
 * O token em claro nunca é gravado na folha; apenas o respectivo hash SHA-256.
 */
function createSession_(user) {
  const token = Utilities.getUuid() + '-' + Utilities.getUuid();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  const userJson = JSON.stringify(user || {});
  CacheService.getScriptCache().put('session_' + token, userJson, SESSION_TTL_SECONDS);
  appendObject_(CONFIG.SHEETS.SESSIONS, {
    token_hash: sha256_(token),
    createdAt: now,
    expiresAt: expiresAt,
    user_json: userJson,
    activo: 'SIM',
    revokedAt: ''
  });
  return token;
}

function validateToken_(token, options) {
  options = options || {};
  const sessionUser = getSessionUser_(token);
  if (!sessionUser) throw new Error('Sessão expirada. Faça login novamente.');

  // Revalida o utilizador em cada pedido para aplicar imediatamente
  // desactivações, mudanças de perfil, igreja ou permissões.
  const current = findUser_(sessionUser.username || '');
  if (!current || !yes_(current.activo || current.active)) {
    revokeSession_(token);
    throw new Error('A conta foi desactivada. Faça login novamente.');
  }
  const user = sanitizeUser_(current);
  if (user.mustChangePassword && !options.allowPasswordChange) {
    throw new Error('Deve alterar a palavra-passe antes de continuar.');
  }
  return user;
}

function getSessionUser_(token) {
  token = String(token || '').trim();
  if (!token) return null;

  const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEETS.SESSIONS);
  if (!sh || sh.getLastRow() < 2) return null;
  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);
  const tokenHash = sha256_(token);
  const tokenCol = headers.indexOf('token_hash');
  const expiresCol = headers.indexOf('expiresAt');
  const userCol = headers.indexOf('user_json');
  const activeCol = headers.indexOf('activo');
  if (tokenCol < 0 || expiresCol < 0 || userCol < 0) return null;

  for (let i = values.length - 1; i >= 0; i--) {
    const row = values[i];
    if (String(row[tokenCol] || '') !== tokenHash) continue;
    if (activeCol >= 0 && !yes_(row[activeCol])) return null;
    const expiresAt = row[expiresCol] instanceof Date ? row[expiresCol] : new Date(row[expiresCol]);
    if (isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) return null;
    try { return JSON.parse(String(row[userCol] || '{}')); }
    catch (err) { return null; }
  }
  return null;
}

function revokeSession_(token) {
  token = String(token || '').trim();
  if (!token) return;
  CacheService.getScriptCache().remove('session_' + token);
  const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEETS.SESSIONS);
  if (!sh || sh.getLastRow() < 2) return;
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(String);
  const tokenCol = headers.indexOf('token_hash');
  const activeCol = headers.indexOf('activo');
  const revokedCol = headers.indexOf('revokedAt');
  if (tokenCol < 0) return;
  const tokenHash = sha256_(token);
  for (let r = values.length - 1; r >= 1; r--) {
    if (String(values[r][tokenCol] || '') !== tokenHash) continue;
    if (activeCol >= 0) sh.getRange(r + 1, activeCol + 1).setValue('NAO');
    if (revokedCol >= 0) sh.getRange(r + 1, revokedCol + 1).setValue(new Date());
    return;
  }
}


function requireConfigAdmin_(user) {
  const role = String(user && user.role || '').toUpperCase();
  if (!user || (!user.canConfig && role !== 'ADMIN_IT' && role !== 'ADMIN' && role !== 'ADMINISTRADOR')) {
    throw new Error('A gestão de utilizadores está reservada ao Administrador de IT.');
  }
  return true;
}

function formatDateTimeValue_(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return String(value || '');
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss");
}

function getUsersAdminData_(actor) {
  requireConfigAdmin_(actor);
  ensureUsers_();
  const users = readSheetObjects_(CONFIG.SHEETS.USERS).map(sanitizeAdminUser_);
  users.sort(function(a, b) { return String(a.name).localeCompare(String(b.name), 'pt'); });
  return {
    ok: true,
    users: users,
    churches: getChurches_(),
    profiles: [
      { value: 'ADMIN_IT', label: 'Administrador de IT' },
      { value: 'SUPERINTENDENTE', label: 'Superintendente' },
      { value: 'PASTOR', label: 'Pastor' },
      { value: 'SECRETARIO', label: 'Secretário' },
      { value: 'TESOUREIRO', label: 'Tesoureiro' },
      { value: 'LIDER', label: 'Líder de Departamento/Ministério' },
      { value: 'VISUALIZADOR', label: 'Visualizador' }
    ],
    departments: ['*','ADMIN','JNI','MNI','DNI','PAIS','SENHORAS','ACTIVISTAS','CRIANCAS'],
    audit: getUserAdminAudit_()
  };
}

function sanitizeAdminUser_(user) {
  const blocked = parseUserDate_(user.bloqueado_ate);
  return {
    id: String(user.id || ''),
    name: String(user.nome || user.name || ''),
    username: String(user.username || ''),
    role: String(user.perfil || user.role || '').toUpperCase(),
    department: String(user.departamento || '*'),
    igreja_id: String(user.igreja_id || '*'),
    igreja_nome: String(user.igreja_nome || ''),
    accessLevel: String(user.nivel_acesso || '').toUpperCase(),
    active: yes_(user.activo),
    mustChangePassword: yes_(user.deve_trocar_password),
    failedAttempts: Number(user.tentativas_falhadas || 0) || 0,
    blockedUntil: blocked ? formatDateTimeValue_(blocked) : '',
    isBlocked: !!(blocked && blocked.getTime() > Date.now()),
    lastLogin: formatDateTimeValue_(user.ultimo_login),
    createdAt: formatDateTimeValue_(user.criado_em),
    updatedAt: formatDateTimeValue_(user.actualizado_em),
    updatedBy: String(user.actualizado_por || '')
  };
}

function getUserAdminAudit_() {
  return readSheetObjects_(CONFIG.SHEETS.AUDIT)
    .filter(function(r) {
      const action = String(r.action || '').toUpperCase();
      return action.indexOf('USER_') === 0 || action === 'PASSWORD_CHANGED' || action === 'LOGIN_FALHADO';
    })
    .sort(function(a, b) {
      return Number(parseUserDate_(b.createdAt) || 0) - Number(parseUserDate_(a.createdAt) || 0);
    })
    .slice(0, 100)
    .map(function(r) {
      return {
        createdAt: formatDateTimeValue_(r.createdAt),
        actor: String(r.actorName || r.actor || ''),
        action: String(r.action || ''),
        details: String(r.details || '')
      };
    });
}

function normalizeUsername_(value) {
  return String(value || '').trim().toLowerCase();
}

function validateUsername_(value) {
  const username = normalizeUsername_(value);
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    throw new Error('O utilizador deve ter 3 a 40 caracteres e usar apenas letras sem acento, números, ponto, hífen ou sublinhado.');
  }
  return username;
}

function validateNewPassword_(password, username) {
  password = String(password || '');
  if (password.length < 8) throw new Error('A nova palavra-passe deve ter pelo menos 8 caracteres.');
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error('A nova palavra-passe deve conter letra maiúscula, letra minúscula e número.');
  }
  if (username && password.toLowerCase().indexOf(String(username).toLowerCase()) >= 0) {
    throw new Error('A palavra-passe não deve conter o nome de utilizador.');
  }
  return password;
}

function permissionFieldsForRole_(role) {
  const defaults = defaultPermissionsForRole_(role);
  const has = function(list, area) { return (list || []).indexOf(area) >= 0 ? 'SIM' : 'NAO'; };
  return {
    pode_ver_plano: has(defaults.viewAreas, 'PLANO'),
    pode_lancar_plano: has(defaults.submitAreas, 'PLANO'),
    pode_aprovar_plano: has(defaults.approveAreas, 'PLANO'),
    pode_ver_cultos: has(defaults.viewAreas, 'CULTOS'),
    pode_lancar_cultos: has(defaults.submitAreas, 'CULTOS'),
    pode_aprovar_cultos: has(defaults.approveAreas, 'CULTOS'),
    pode_ver_financas: has(defaults.viewAreas, 'FINANCAS'),
    pode_lancar_financas: has(defaults.submitAreas, 'FINANCAS'),
    pode_aprovar_financas: has(defaults.approveAreas, 'FINANCAS'),
    pode_ver_membros: has(defaults.viewAreas, 'MEMBROS'),
    pode_lancar_membros: has(defaults.submitAreas, 'MEMBROS'),
    pode_aprovar_membros: has(defaults.approveAreas, 'MEMBROS'),
    pode_ver_painel: defaults.canDashboard ? 'SIM' : 'NAO',
    pode_configurar: defaults.canConfig ? 'SIM' : 'NAO'
  };
}

function saveUserAdmin_(actor, payload) {
  requireConfigAdmin_(actor);
  ensureUsers_();
  const data = payload && payload.data ? payload.data : payload || {};
  const id = String(data.id || '').trim();
  const originalUsername = normalizeUsername_(data.originalUsername || data.username || '');
  const username = validateUsername_(data.username);
  const name = String(data.name || data.nome || '').trim();
  const role = String(data.role || data.perfil || '').trim().toUpperCase();
  let accessLevel = String(data.accessLevel || data.nivel_acesso || '').trim().toUpperCase();
  let churchId = String(data.igreja_id || '').trim();
  let churchName = '';
  const department = String(data.department || data.departamento || '*').trim().toUpperCase() || '*';
  const active = data.active === true || yes_(data.active) ? 'SIM' : 'NAO';

  if (!name) throw new Error('Indique o nome completo do utilizador.');
  if (['ADMIN_IT','SUPERINTENDENTE','PASTOR','SECRETARIO','TESOUREIRO','LIDER','VISUALIZADOR'].indexOf(role) < 0) {
    throw new Error('Seleccione um perfil válido.');
  }
  if (!accessLevel) accessLevel = churchId && churchId !== '*' ? 'LOCAL' : 'DISTRITAL';
  if (accessLevel === 'DISTRITAL') {
    churchId = '*';
    churchName = 'Todas as igrejas';
  } else {
    if (!churchId || churchId === '*') throw new Error('Seleccione a igreja do utilizador local.');
    const church = getChurches_().find(function(c) { return String(c.igreja_id) === churchId; });
    if (!church) throw new Error('A igreja seleccionada não existe ou está inactiva.');
    churchName = church.nome_igreja;
  }
  if (role === 'LIDER' && (accessLevel !== 'LOCAL' || !department || department === '*')) {
    throw new Error('O Líder deve estar ligado a uma igreja local e a um Departamento/Ministério específico.');
  }

  const duplicate = findUserRecord_(username);
  let record = null;
  if (id) {
    record = findUserRecordById_(id);
    if (!record) throw new Error('Utilizador não encontrado.');
    if (duplicate && duplicate.row !== record.row) throw new Error('Já existe outro utilizador com esse nome de acesso.');
    if (String(actor.username).toLowerCase() === String(record.user.username).toLowerCase()) {
      if (active !== 'SIM') throw new Error('Não pode desactivar a sua própria conta.');
      if (role !== String(record.user.perfil || '').toUpperCase() || accessLevel !== String(record.user.nivel_acesso || '').toUpperCase()) {
        throw new Error('Por segurança, não pode alterar o seu próprio perfil ou nível de acesso.');
      }
    }
  } else if (duplicate) {
    throw new Error('Já existe um utilizador com esse nome de acesso.');
  }

  const now = new Date();
  const fields = {
    id: id || Utilities.getUuid(),
    nome: name,
    username: username,
    perfil: role,
    departamento: department,
    igreja_id: churchId,
    igreja_nome: churchName,
    nivel_acesso: accessLevel,
    activo: active,
    actualizado_em: now,
    actualizado_por: actor.username
  };
  Object.assign(fields, permissionFieldsForRole_(role));

  if (!record) {
    const initialPassword = validateNewPassword_(data.initialPassword || data.password, username);
    fields.password_hash = sha256_(initialPassword);
    fields.deve_trocar_password = 'SIM';
    fields.tentativas_falhadas = 0;
    fields.bloqueado_ate = '';
    fields.ultimo_login = '';
    fields.password_alterada_em = '';
    fields.criado_em = now;
    appendObject_(CONFIG.SHEETS.USERS, fields);
    audit_(actor, 'USER_CREATED', 'USERS', fields.id, 'Criado utilizador ' + username + ' (' + role + ', ' + churchName + ')');
  } else {
    const previousUsername = String(record.user.username || '');
    updateUserRecordFields_(record, fields);
    revokeSessionsForUsername_(previousUsername);
    if (previousUsername.toLowerCase() !== username.toLowerCase()) revokeSessionsForUsername_(username);
    audit_(actor, 'USER_UPDATED', 'USERS', fields.id, 'Actualizado utilizador ' + username + ' (' + role + ', ' + churchName + ', activo=' + active + ')');
  }
  return getUsersAdminData_(actor);
}

function findUserRecordById_(id) {
  const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEETS.USERS);
  if (!sh || sh.getLastRow() < 2) return null;
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(String);
  const idCol = headers.indexOf('id');
  if (idCol < 0) return null;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol] || '') !== String(id || '')) continue;
    const obj = {};
    headers.forEach(function(h, c) { obj[h] = values[i][c]; });
    return { sh: sh, row: i + 1, headers: headers, user: obj };
  }
  return null;
}

function resetUserPassword_(actor, payload) {
  requireConfigAdmin_(actor);
  const id = String(payload.userId || payload.id || '').trim();
  const record = findUserRecordById_(id);
  if (!record) throw new Error('Utilizador não encontrado.');
  if (String(record.user.username).toLowerCase() === String(actor.username).toLowerCase()) {
    throw new Error('Use a opção Alterar palavra-passe para modificar a sua própria credencial.');
  }
  const password = validateNewPassword_(payload.newPassword, record.user.username);
  updateUserRecordFields_(record, {
    password_hash: sha256_(password),
    deve_trocar_password: 'SIM',
    tentativas_falhadas: 0,
    bloqueado_ate: '',
    password_alterada_em: new Date(),
    actualizado_em: new Date(),
    actualizado_por: actor.username
  });
  revokeSessionsForUsername_(record.user.username);
  audit_(actor, 'USER_PASSWORD_RESET', 'USERS', id, 'Palavra-passe redefinida para ' + record.user.username + '; alteração obrigatória no próximo acesso.');
  return { ok: true, message: 'Palavra-passe redefinida. O utilizador deverá alterá-la no próximo acesso.' };
}

function changeOwnPassword_(actor, payload) {
  const record = findUserRecord_(actor.username);
  if (!record) throw new Error('Utilizador não encontrado.');
  const currentPassword = String(payload.currentPassword || '');
  const newPassword = validateNewPassword_(payload.newPassword, actor.username);
  const confirmation = String(payload.confirmPassword || '');
  if (!verifyPassword_(currentPassword, record.user)) throw new Error('A palavra-passe actual está incorrecta.');
  if (newPassword !== confirmation) throw new Error('A confirmação da nova palavra-passe não coincide.');
  if (verifyPassword_(newPassword, record.user)) throw new Error('A nova palavra-passe deve ser diferente da palavra-passe actual.');

  updateUserRecordFields_(record, {
    password_hash: sha256_(newPassword),
    deve_trocar_password: 'NAO',
    tentativas_falhadas: 0,
    bloqueado_ate: '',
    password_alterada_em: new Date(),
    actualizado_em: new Date(),
    actualizado_por: actor.username
  });
  revokeSessionsForUsername_(actor.username);
  const safeUser = sanitizeUser_(record.user);
  safeUser.mustChangePassword = false;
  const token = createSession_(safeUser);
  audit_(safeUser, 'PASSWORD_CHANGED', 'AUTH', '', 'O utilizador alterou a própria palavra-passe.');
  return { ok: true, token: token, user: safeUser, permissions: getUserPermissions_(safeUser), churches: getChurchesForUser_(safeUser), members: getMembersForUser_(safeUser), memberScope: getMemberScopeForUser_(safeUser) };
}

function revokeSessionsForUsername_(username) {
  const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEETS.SESSIONS);
  if (!sh || sh.getLastRow() < 2) return 0;
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(String);
  const userCol = headers.indexOf('user_json');
  const activeCol = headers.indexOf('activo');
  const revokedCol = headers.indexOf('revokedAt');
  if (userCol < 0 || activeCol < 0) return 0;
  let count = 0;
  for (let i = 1; i < values.length; i++) {
    if (!yes_(values[i][activeCol])) continue;
    try {
      const u = JSON.parse(String(values[i][userCol] || '{}'));
      if (String(u.username || '').toLowerCase() !== String(username || '').toLowerCase()) continue;
      sh.getRange(i + 1, activeCol + 1).setValue('NAO');
      if (revokedCol >= 0) sh.getRange(i + 1, revokedCol + 1).setValue(new Date());
      count++;
    } catch (err) {}
  }
  return count;
}


function validateCanViewArea_(user, area) {
  if (area === 'GERAL') {
    if (user && user.canDashboard) return true;
    throw new Error('Este utilizador não tem permissão para consultar o painel geral.');
  }
  if ((user.viewAreas || []).includes(area)) return true;
  throw new Error('Este utilizador não tem permissão para consultar esta área.');
}


function validateUserCanSubmit_(user, module, data) {
  const area = CONFIG.MODULE_AREA[module] || 'GERAL';
  if (!(user.submitAreas || []).includes(area)) throw new Error('Este utilizador não tem permissão para efectuar lançamentos nesta área.');
  if (String(user.role).toUpperCase() === 'LIDER') validateLeaderDepartment_(user, data || {});
  return true;
}

function validateLeaderDepartment_(user, data) {
  const dep = String(user.department || '').trim();
  if (!dep || dep === '*') return true;
  const selected = String(data.departamento_final || data.departamento || data.departamento_001 || data.ministerio || '').trim();
  if (!selected) return true;
  const selectedCanonical = canonicalLeaderDepartmentV5431_(selected);
  const userCanonical = canonicalLeaderDepartmentV5431_(dep);
  if (selectedCanonical !== userCanonical) {
    throw new Error('O líder só pode lançar dados do seu próprio departamento/ministério: ' + dep + '.');
  }
  return true;
}

function userCanApproveModule_(user, module) {
  const area = CONFIG.MODULE_AREA[module] || 'GERAL';
  return (user.approveAreas || []).includes(area);
}

/**
 * v54.1 — recalcula e valida no servidor os dados críticos.
 * O backend nunca confia nos totais, câmbios ou horas enviados pelo navegador.
 */
function normalizeAndValidateSubmissionV541_(payload, sessionUser) {
  const out = JSON.parse(JSON.stringify(payload || {}));
  const module = String(out.module || 'sem_modulo').trim();
  if (!Object.prototype.hasOwnProperty.call(CONFIG.MODULE_SHEETS, module)) {
    throw new Error('Módulo de submissão inválido.');
  }

  out.module = module;
  out.data = out.data && typeof out.data === 'object' ? out.data : {};
  out.repeats = out.repeats && typeof out.repeats === 'object' ? compactRepeatsV541_(out.repeats) : {};
  out.uuid = String(out.uuid || out.data.submission_uuid || Utilities.getUuid());
  out.data.submission_uuid = out.uuid;
  out.data.instanceID = String(out.data.instanceID || Utilities.getUuid());
  out.data.timestamp = String(out.data.timestamp || new Date().toISOString());
  out.clientVersion = String(out.clientVersion || '54.1');

  validateCommonPhonesV541_(out.data, out.repeats);

  if (module === 'plano_cultos_escalas') normalizePlanV541_(out.data);
  if (module === 'relatorio_cultos') normalizeCultoReportV541_(out.data);
  if (module === 'registo_financeiro') normalizeFinanceV541_(out.data, out.repeats);
  if (module === 'visitantes') normalizeVisitorsV541_(out.data);

  return out;
}

function compactRepeatsV541_(repeats) {
  const derived = {
    upd_membro_label: true,
    upd_tel_atual_norm: true,
    upd_tel_novo_norm: true,
    upd_tel_atual: true,
    dizimista_nome_csv: true,
    dizimista_nome_final: true,
    moeda_ctx: true,
    cambio_ctx: true,
    diz_valor_mzn: true
  };
  const out = {};
  Object.keys(repeats || {}).forEach(function(repName) {
    const rows = Array.isArray(repeats[repName]) ? repeats[repName].filter(Boolean) : [];
    const meaningful = rows.filter(function(row) {
      return Object.keys(row || {}).some(function(key) {
        if (derived[key]) return false;
        return String(row[key] == null ? '' : row[key]).trim() !== '';
      });
    });
    if (meaningful.length) out[repName] = meaningful;
  });
  return out;
}

function normalizePlanV541_(data) {
  requireTextV541_(data.data_culto, 'Indique a data do culto.');
  requireTextV541_(data.hora_inicio, 'Indique a hora de início.');
  requireTextV541_(data.hora_fim, 'Indique a hora de término.');

  const start = timeMinutesV541_(data.hora_inicio);
  const end = timeMinutesV541_(data.hora_fim);
  if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error('Introduza horas válidas no plano de cultos.');
  if (end <= start) throw new Error('A hora de término deve ser posterior à hora de início.');

  data.hora_inicio_hhmm = String(data.hora_inicio).slice(0, 5);
  data.hora_fim_hhmm = String(data.hora_fim).slice(0, 5);
  data.culto_datetime = String(data.data_culto) + 'T' + data.hora_inicio_hhmm;
  data.culto_texto = formatDatePtV541_(data.data_culto) + ' às ' + data.hora_inicio_hhmm;
  data.dirigente_tel_final = String(data.dirigente_tel || data.dirigente_tel_manual || '');
  data.pregador_tel_final = String(data.pregador_tel || data.pregador_tel_manual || '');
}

function normalizeCultoReportV541_(data) {
  if (String(data.rel_hora_fim || '').trim()) {
    const start = timeMinutesV541_(data.rel_hora_inicio);
    const end = timeMinutesV541_(data.rel_hora_fim);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      throw new Error('A hora de término do relatório deve ser posterior à hora de início.');
    }
  }

  [
    ['rel_participantes_total','O total de participantes'],
    ['rel_visitantes','O número de visitantes'],
    ['rel_decisoes','O número de decisões'],
    ['rel_baptismos','O número de baptismos'],
    ['rel_dizimos_valor','O valor dos dízimos'],
    ['rel_dizimistas_qtd','A quantidade de dizimistas'],
    ['rel_ofertas_valor','O valor das ofertas']
  ].forEach(function(item) {
    const value = data[item[0]];
    if (value === '' || value == null) return;
    const n = strictNumberV541_(value);
    if (!Number.isFinite(n) || n < 0) throw new Error(item[1] + ' deve ser igual ou superior a zero.');
    data[item[0]] = n;
  });

  const dizimos = finiteOrZeroV541_(data.rel_dizimos_valor);
  const ofertas = finiteOrZeroV541_(data.rel_ofertas_valor);
  data.rel_total_contribuicoes = roundMoneyV541_(dizimos + ofertas);
}


function financeDepartmentCatalogV5431_() {
  return {
  "Entrada": {
    "ENT_ADMIN_DIZIMOS": "Administração — Dízimos",
    "ENT_ADMIN_OFERTAS": "Administração — Ofertas",
    "ENT_ADMIN_DOACOES": "Administração — Doações",
    "ENT_ADMIN_CAMPANHAS": "Administração — Campanhas",
    "ENT_ADMIN_GRATIDAO": "Administração — Gratidão",
    "ENT_MIN_PAIS": "Ministérios — Pais",
    "ENT_MIN_SENHORAS": "Ministérios — Senhoras",
    "ENT_MIN_ACTIVISTAS": "Ministérios — Activistas",
    "ENT_MIN_CRIANCAS": "Ministérios — Crianças",
    "ENT_DEP_JNI": "Departamentos — JNI",
    "ENT_DEP_MNI": "Departamentos — MNI",
    "ENT_DEP_DNI": "Departamentos — DNI",
    "ENT_GRUPOS_ZONAS": "Grupos e Zonas de oração",
    "ENT_OUTROS": "Outros — Entrada"
  },
  "Saida": {
    "SAI_ADMIN_AGUA": "Despesas administrativas — Água",
    "SAI_ADMIN_ALUGUER": "Despesas administrativas — Aluguer",
    "SAI_ADMIN_TELEFONE_INTERNET": "Despesas administrativas — Telefone e internet",
    "SAI_ADMIN_ENERGIA": "Despesas administrativas — Energia eléctrica",
    "SAI_PESSOAL_BENEFICIOS": "Gastos com pessoal — Benefícios",
    "SAI_PESSOAL_ENCARGOS": "Gastos com pessoal — Encargos",
    "SAI_PESSOAL_SALARIO": "Gastos com pessoal — Salário",
    "SAI_PESSOAL_SUBSIDIO": "Gastos com pessoal — Subsídio",
    "SAI_MANUT_LIMPEZA": "Manutenção e limpeza — Limpeza",
    "SAI_MANUT_MANUTENCAO": "Manutenção e limpeza — Manutenção",
    "SAI_MATERIAIS_ESCRITORIO": "Materiais — Materiais de escritório",
    "SAI_MATERIAIS_LIMPEZA": "Materiais — Materiais de limpeza",
    "SAI_IMPOSTOS_INSS": "Impostos — INSS",
    "SAI_DISTRITO_AVANTE": "Despesas do Distrito — Avante Evangelho",
    "SAI_DISTRITO_ALABASTRO": "Despesas do Distrito — Alabastro",
    "SAI_DISTRITO_GRATIDAO": "Despesas do Distrito — Gratidão",
    "SAI_DISTRITO_RADIO": "Despesas do Distrito — Rádio",
    "SAI_DISTRITO_UNIV_QUENIA": "Despesas do Distrito — Universidade do Quénia",
    "SAI_DISTRITO_SEMINARIO": "Despesas do Distrito — Apoio ao seminário",
    "SAI_ORC_JNI": "Orçamento dos Departamentos — JNI",
    "SAI_ORC_MNI": "Orçamento dos Departamentos — MNI",
    "SAI_ORC_DNI": "Orçamento dos Departamentos — DNI",
    "SAI_ORC_NATAL_SUPERINTENDENTE": "Orçamento dos Departamentos — Natal do Superintendente Distrital",
    "SAI_OUTROS": "Outros — Saída"
  }
};
}

function normalizeFinanceDepartmentV5431_(data) {
  const tipo = String(data.tipo || '').trim() === 'Saída' ? 'Saida' : String(data.tipo || '').trim();
  const selected = String(data.departamento || '').trim();
  const catalog = financeDepartmentCatalogV5431_();
  const list = catalog[tipo] || {};
  if (!selected || !Object.prototype.hasOwnProperty.call(list, selected)) {
    throw new Error('Seleccione um Departamento / Conta do plano compatível com o tipo de movimento.');
  }

  let detail = '';
  if (selected === 'ENT_GRUPOS_ZONAS') {
    detail = String(data.departamento_grupo_zona || '').trim();
    if (!detail) throw new Error('Indique o grupo ou a zona de oração.');
    data.departamento_outro = '';
  } else if (selected === 'ENT_OUTROS' || selected === 'SAI_OUTROS') {
    detail = String(data.departamento_outro || '').trim();
    if (!detail) throw new Error('Especifique a natureza da entrada ou da saída em “Outros”.');
    data.departamento_grupo_zona = '';
  } else {
    data.departamento_grupo_zona = '';
    data.departamento_outro = '';
  }

  data.departamento_final = detail ? selected + '::' + detail : selected;
  data.departamento_final_label = detail ? list[selected] + ' — ' + detail : list[selected];
  return data.departamento_final;
}

function canonicalLeaderDepartmentV5431_(value) {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw || raw === '*') return raw;
  if (raw.indexOf('JNI') >= 0 || raw.indexOf('JUVENTUDE') >= 0) return 'JNI';
  if (raw.indexOf('MNI') >= 0 || raw.indexOf('MISSO') >= 0) return 'MNI';
  if (raw.indexOf('DNI') >= 0 || raw.indexOf('DISCIPUL') >= 0) return 'DNI';
  if (raw.indexOf('PAIS') >= 0) return 'PAIS';
  if (raw.indexOf('SENHOR') >= 0 || raw.indexOf('MÃE') >= 0 || raw.indexOf('MAE') >= 0) return 'SENHORAS';
  if (raw.indexOf('ACTIVIST') >= 0 || raw.indexOf('ATIVIST') >= 0) return 'ACTIVISTAS';
  if (raw.indexOf('CRIAN') >= 0) return 'CRIANCAS';
  return raw.replace(/[^A-Z0-9]+/g, '_');
}

function normalizeFinanceV541_(data, repeats) {
  requireTextV541_(data.data, 'Indique a data do movimento financeiro.');
  if (!validIsoDateV541_(data.data)) throw new Error('A data do movimento financeiro é inválida.');
  requireTextV541_(data.tipo, 'Seleccione o tipo de movimento.');
  requireTextV541_(data.rubrica, 'Seleccione a rubrica.');
  requireTextV541_(data.conta, 'Seleccione a conta.');
  requireTextV541_(data.metodo, 'Seleccione o método de pagamento.');
  requireTextV541_(data.moeda, 'Seleccione a moeda.');

  const tipo = String(data.tipo).trim();
  if (tipo !== 'Entrada' && tipo !== 'Saida' && tipo !== 'Saída') throw new Error('O tipo de movimento financeiro é inválido.');
  data.tipo = tipo === 'Saída' ? 'Saida' : tipo;

  const isTithe = data.tipo === 'Entrada' && String(data.rubrica).trim() === 'DIZ';
  normalizeFinanceDepartmentV5431_(data);

  const moeda = String(data.moeda).trim().toUpperCase();
  data.moeda = moeda;
  let cambio = strictNumberV541_(data.cambio);
  if (moeda === 'MZN') {
    cambio = 1;
  } else if (!Number.isFinite(cambio) || cambio < 1) {
    throw new Error('O câmbio deve ser igual ou superior a 1.');
  }
  data.cambio = cambio;

  if (isTithe) {
    const inputRows = Array.isArray(repeats.dizimistas) ? repeats.dizimistas.filter(Boolean) : [];
    const rows = inputRows.filter(function(row) {
      return row && Object.keys(row).some(function(k) { return String(row[k] == null ? '' : row[k]).trim() !== ''; });
    });
    if (!rows.length) throw new Error('Adicione pelo menos uma contribuição de dízimo.');

    let total = 0;
    rows.forEach(function(row, index) {
      const line = index + 1;
      const mode = String(row.modo_ident || '').trim();
      if (mode !== 'csv' && mode !== 'manual') throw new Error('Seleccione a forma de identificação do dizimista na linha ' + line + '.');
      if (mode === 'csv') requireTextV541_(row.dizimista_id, 'Seleccione o dizimista na linha ' + line + '.');
      if (mode === 'manual') requireTextV541_(row.dizimista_nome_manual, 'Indique o nome do dizimista na linha ' + line + '.');
      requireTextV541_(row.diz_metodo, 'Seleccione o método de pagamento do dízimo na linha ' + line + '.');

      const valor = strictNumberV541_(row.diz_valor);
      if (!Number.isFinite(valor) || valor <= 0) throw new Error('O valor do dízimo na linha ' + line + ' deve ser superior a zero.');

      row.moeda_ctx = moeda;
      row.cambio_ctx = cambio;
      row.diz_valor = roundMoneyV541_(valor);
      row.diz_valor_mzn = moeda === 'MZN' ? row.diz_valor : roundMoneyV541_(row.diz_valor * cambio);
      row.dizimista_nome_final = mode === 'csv'
        ? String(row.dizimista_nome_csv || row.dizimista_id || '')
        : String(row.dizimista_nome_manual || '');
      total += row.diz_valor_mzn;
    });

    repeats.dizimistas = rows;
    data.diz_total_mzn = roundMoneyV541_(total);
    data.diz_n_contribuicoes = rows.length;
    data.valor_mzn = data.diz_total_mzn;
    data.valor = '';
  } else {
    const valor = strictNumberV541_(data.valor);
    if (!Number.isFinite(valor) || valor < 0) throw new Error('O valor do movimento deve ser igual ou superior a zero.');
    data.valor = roundMoneyV541_(valor);
    data.valor_mzn = moeda === 'MZN' ? data.valor : roundMoneyV541_(data.valor * cambio);
    data.diz_total_mzn = '';
    data.diz_n_contribuicoes = 0;
    delete repeats.dizimistas;
  }

  const p = datePartsV541_(data.data);
  data.mes = p.month;
  data.trimestre = Math.ceil(p.month / 3);
  data.ano = p.year;
}

function normalizeVisitorsV541_(data) {
  if (String(data.telefone_whatsapp || '').trim() && !validMozPhoneV541_(data.telefone_whatsapp)) {
    throw new Error('O telefone/WhatsApp indicado é inválido.');
  }
  if (String(data.quer_contacto || '').trim() === 'sim') {
    requireTextV541_(data.telefone_para_contacto, 'Indique o telefone para contacto.');
    if (!validMozPhoneV541_(data.telefone_para_contacto)) throw new Error('O telefone para contacto é inválido.');
  }
}

function validateCommonPhonesV541_(data, repeats) {
  ['dirigente_tel_manual','pregador_tel_manual','upd_tel_novo'].forEach(function(name) {
    if (String(data[name] || '').trim() && !validMozPhoneV541_(data[name])) {
      throw new Error('Número de telefone inválido no campo ' + name + '.');
    }
  });

  [
    ['acolhimento_fora_rep','acolhimento_tel_fora'],
    ['louvor_fora_rep','louvor_tel_fora'],
    ['rep_actualizar_contactos','upd_tel_novo']
  ].forEach(function(pair) {
    const rows = Array.isArray(repeats[pair[0]]) ? repeats[pair[0]].filter(Boolean) : [];
    rows.forEach(function(row, idx) {
      const value = row[pair[1]];
      if (String(value || '').trim() && !validMozPhoneV541_(value)) {
        throw new Error('Número de telefone inválido na linha ' + (idx + 1) + '.');
      }
      if (pair[0] === 'rep_actualizar_contactos') {
        row.upd_tel_atual_norm = normalizeMozPhoneV541_(row.upd_tel_atual);
        row.upd_tel_novo_norm = normalizeMozPhoneV541_(row.upd_tel_novo);
      }
    });
  });
}

function requireTextV541_(value, message) {
  if (!String(value == null ? '' : value).trim()) throw new Error(message);
}

function strictNumberV541_(value) {
  if (value === '' || value == null) return NaN;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  let s = String(value).trim().replace(/\s+/g, '');
  if (!s) return NaN;
  if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else {
    s = s.replace(',', '.');
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function finiteOrZeroV541_(value) {
  const n = strictNumberV541_(value);
  return Number.isFinite(n) ? n : 0;
}

function roundMoneyV541_(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function timeMinutesV541_(value) {
  const m = String(value || '').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return NaN;
  return h * 60 + min;
}

function datePartsV541_(value) {
  const m = String(value || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new Error('Data inválida.');
  const year = Number(m[1]), month = Number(m[2]), day = Number(m[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() + 1 !== month || dt.getUTCDate() !== day) throw new Error('Data inválida.');
  return { year: year, month: month, day: day };
}

function validIsoDateV541_(value) {
  try { datePartsV541_(value); return true; } catch (err) { return false; }
}

function formatDatePtV541_(value) {
  const p = datePartsV541_(String(value || '').slice(0, 10));
  return String(p.day).padStart(2, '0') + '/' + String(p.month).padStart(2, '0') + '/' + p.year;
}

function normalizeMozPhoneV541_(value) {
  const s = String(value || '').replace(/[+\s()-]/g, '');
  if (/^8[2-7]\d{7}$/.test(s)) return '258' + s;
  return s;
}

function validMozPhoneV541_(value) {
  return /^(258)?8[2-7]\d{7}$/.test(String(value || '').replace(/[+\s()-]/g, ''));
}

function saveSubmission_(payload, sessionUser) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    setup();
    const uuid = payload.uuid || Utilities.getUuid();
    const module = payload.module || 'sem_modulo';
    const area = CONFIG.MODULE_AREA[module] || 'GERAL';
    const data = applyChurchToData_(payload.data || {}, sessionUser);
    const createdAt = new Date();
    const status = userCanApproveModule_(sessionUser, module) ? 'APROVADO' : 'PENDENTE';
    const approvalUser = status === 'APROVADO' ? sessionUser.username : '';
    const approvalDate = status === 'APROVADO' ? createdAt.toISOString() : '';

    data.estado_aprovacao = status;
    data.area = area;
    data.submetido_por = sessionUser.username || '';
    data.submetido_por_nome = sessionUser.name || '';
    data.submetido_por_perfil = sessionUser.role || '';
    data.departamento_utilizador = sessionUser.department || '';
    data.aprovado_por = approvalUser;
    data.aprovado_em = approvalDate;

    appendObject_(CONFIG.SHEETS.SUBMISSIONS, {
      submittedAt: payload.submittedAt || createdAt.toISOString(),
      uuid,
      module,
      area,
      moduleLabel: moduleLabel_(module),
      estado_aprovacao: status,
      submetido_por: sessionUser.username || '',
      submetido_por_nome: sessionUser.name || '',
      submetido_por_perfil: sessionUser.role || '',
      igreja_id: data.igreja_id || userChurchId_(sessionUser),
      igreja_nome: data.igreja_nome || userChurchName_(sessionUser),
      departamento_utilizador: sessionUser.department || '',
      aprovado_por: approvalUser,
      aprovado_em: approvalDate,
      createdAt,
      payloadPreview: JSON.stringify(data).slice(0, 45000)
    });
    appendObject_(CONFIG.SHEETS.RAW, { createdAt, uuid, module, json: JSON.stringify({ ...payload, user: sessionUser }) });

    const target = CONFIG.MODULE_SHEETS[module] || CONFIG.MODULE_SHEETS.sem_modulo;
    appendObject_(target, { createdAt, submittedAt: payload.submittedAt, uuid, module, area, igreja_id: data.igreja_id, igreja_nome: data.igreja_nome, ...data });

    const repeats = payload.repeats || {};
    Object.keys(repeats).forEach(repName => {
      const sheetName = sanitizeSheetName_('rep_' + repName);
      (repeats[repName] || []).filter(Boolean).forEach((row, idx) => {
        appendObject_(sheetName, { createdAt, submittedAt: payload.submittedAt, uuid, module, area, igreja_id: data.igreja_id, igreja_nome: data.igreja_nome, repeatName: repName, line: idx + 1, estado_aprovacao: status, ...row });
      });
    });
    audit_(sessionUser, 'SUBMIT_' + status, module, uuid, 'Lançamento submetido');
    return { uuid, module, sheet: target, estado_aprovacao: status };
  } finally {
    lock.releaseLock();
  }
}


function getPendingApprovals_(user, filters) {
  setup();
  filters = filters || {};
  const approvalModules = modulesFromAreas_(user.approveAreas || []);
  const requestedArea = String(filters.area || '').trim().toUpperCase();
  const requestedModule = String(filters.module || '').trim();
  const search = String(filters.search || '').trim().toLowerCase();
  const start = filters.start ? parseDate_(filters.start) : null;
  const end = filters.end ? parseDate_(filters.end) : null;
  if (end) end.setHours(23, 59, 59, 999);

  const scope = resolveReadScope_(user, filters.igreja_id || filters.churchId);
  const items = [];
  approvalModules.forEach(module => {
    if (requestedModule && requestedModule !== module) return;
    const moduleArea = CONFIG.MODULE_AREA[module] || 'GERAL';
    if (requestedArea && requestedArea !== moduleArea) return;
    const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.MODULE_SHEETS[module]);
    if (!sh || sh.getLastRow() < 2) return;
    const values = sh.getDataRange().getValues();
    const headers = values.shift().map(String);
    values.forEach((row, idx) => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      if (!recordMatchesReadScope_(obj, scope)) return;
      if (String(obj.estado_aprovacao || '').toUpperCase() !== 'PENDENTE') return;
      const churchId = recordChurchId_(obj);
      const submittedDate = parseDate_(obj.submittedAt || obj.createdAt);
      if (start && submittedDate && submittedDate < start) return;
      if (end && submittedDate && submittedDate > end) return;

      const resumo = approvalSummary_(obj, module);
      const searchable = [obj.igreja_nome, churchId, obj.submetido_por_nome, obj.submetido_por, obj.submetido_por_perfil, resumo, moduleLabel_(module), moduleArea].join(' ').toLowerCase();
      if (search && !searchable.includes(search)) return;

      items.push({
        rowNumber: idx + 2,
        uuid: String(obj.uuid || ''),
        module,
        moduleLabel: moduleLabel_(module),
        area: obj.area || moduleArea,
        areaLabel: approvalAreaLabel_(obj.area || moduleArea),
        submittedAt: formatApprovalDate_(obj.submittedAt || obj.createdAt),
        igreja_id: churchId,
        igreja_nome: String(obj.igreja_nome || getChurchById_(churchId).nome_igreja || churchId || ''),
        submetido_por: String(obj.submetido_por || ''),
        submetido_por_nome: String(obj.submetido_por_nome || obj.submetido_por || ''),
        submetido_por_perfil: String(obj.submetido_por_perfil || ''),
        departamento: String(obj.departamento_final || obj.departamento || obj.departamento_utilizador || ''),
        resumo,
        descricao: String(obj.descricao || obj.observacoes || obj.nome_completo || obj.tema || ''),
        valor: approvalValue_(obj),
        details: approvalDetails_(obj)
      });
    });
  });

  items.sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
  const summary = { total: items.length, PLANO: 0, CULTOS: 0, FINANCAS: 0, MEMBROS: 0 };
  items.forEach(item => { if (summary[item.area] !== undefined) summary[item.area] += 1; });
  return { ok: true, items, summary, scope: scopeResponse_(scope) };
}


function approvalAreaLabel_(area) {
  const map = { PLANO: 'Plano e escalas', CULTOS: 'Cultos', FINANCAS: 'Finanças', MEMBROS: 'Membros', GERAL: 'Geral' };
  return map[String(area || '').toUpperCase()] || String(area || 'Geral');
}

function approvalValue_(obj) {
  const value = obj.valor_mzn !== '' && obj.valor_mzn !== undefined ? obj.valor_mzn :
    (obj.valor !== '' && obj.valor !== undefined ? obj.valor :
    (obj.diz_total_mzn !== '' && obj.diz_total_mzn !== undefined ? obj.diz_total_mzn : ''));
  return value === '' ? '' : parseMoney_(value);
}

function approvalSummary_(obj, module) {
  if (module === 'registo_financeiro') {
    const type = String(obj.tipo_label || obj.tipo || 'Movimento');
    const description = String(obj.descricao || obj.observacoes || obj.rubrica || '');
    const value = approvalValue_(obj);
    return [type, description, value !== '' ? value + ' MT' : ''].filter(Boolean).join(' — ');
  }
  if (module === 'plano_cultos_escalas') {
    return [obj.data_culto || obj.data, obj.tipo_culto_plano_label || obj.tipo_culto_plano || obj.tipo, obj.espec_culto_plano || obj.especificacao].filter(Boolean).join(' — ');
  }
  if (module === 'relatorio_cultos') {
    return [obj.rel_data_culto || obj.data_culto || obj.data, obj.rel_tipo_culto_label || obj.rel_tipo_culto || obj.tema, obj.rel_participantes_total ? 'Participantes: ' + obj.rel_participantes_total : ''].filter(Boolean).join(' — ');
  }
  if (module === 'visitantes') {
    return [obj.nome_completo || obj.nome || obj.tipo_registo_label || obj.tipo_registo, obj.bairro, obj.telefone || obj.contacto].filter(Boolean).join(' — ');
  }
  return String(obj.descricao || obj.observacoes || obj.tema || obj.nome_completo || 'Lançamento pendente');
}

function approvalDetails_(obj) {
  const excluded = {
    createdAt: true, submittedAt: true, uuid: true, module: true, area: true,
    estado_aprovacao: true, submetido_por: true, submetido_por_nome: true,
    submetido_por_perfil: true, aprovado_por: true, aprovado_por_nome: true,
    aprovado_em: true, observacao_aprovacao: true, instanceID: true, submission_uuid: true
  };
  const preferred = [
    'igreja_nome','data','data_culto','rel_data_culto','tipo','tipo_label','descricao','observacoes',
    'rubrica','departamento_final','departamento_final_label','departamento_grupo_zona','departamento_outro','conta','metodo_pagamento','valor','valor_mzn','moeda',
    'nome_completo','telefone','bairro','tema','rel_participantes_total','rel_visitantes',
    'hora_inicio','hora_fim','rel_hora_inicio','rel_hora_fim'
  ];
  const keys = [];
  preferred.forEach(k => { if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '' && !keys.includes(k)) keys.push(k); });
  Object.keys(obj).forEach(k => {
    if (keys.length >= 32 || excluded[k] || keys.includes(k)) return;
    const value = obj[k];
    if (value === undefined || value === null || String(value).trim() === '') return;
    keys.push(k);
  });
  return keys.slice(0, 32).map(k => ({ key: k, label: humanizeApprovalKey_(k), value: formatApprovalValue_(obj[k]) }));
}

function humanizeApprovalKey_(key) {
  return String(key || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatApprovalValue_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value);
}

function formatApprovalDate_(value) {
  const date = parseDate_(value);
  return date ? Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') : String(value || '');
}

function approveSubmission_(user, payload) {
  const module = String(payload.module || '').trim();
  const uuid = String(payload.uuid || '').trim();
  const decision = String(payload.decision || 'APROVADO').toUpperCase();
  const notes = String(payload.notes || '').trim();
  if (!uuid || !module) throw new Error('Pedido de aprovação incompleto.');
  if (!userCanApproveModule_(user, module)) throw new Error('Este utilizador não tem permissão para aprovar este tipo de lançamento.');
  if (!['APROVADO','REJEITADO'].includes(decision)) throw new Error('Decisão inválida.');
  if (decision === 'REJEITADO' && !notes) throw new Error('Indique a razão da rejeição.');

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const target = CONFIG.MODULE_SHEETS[module];
    const sh = SpreadsheetApp.getActive().getSheetByName(target);
    if (!sh || sh.getLastRow() < 2) throw new Error('Não foi encontrada a folha do módulo.');
    const row = findRowByUuid_(sh, uuid);
    if (!row) throw new Error('Lançamento não encontrado.');
    const record = rowObject_(sh, row);
    const recordChurch = recordChurchId_(record);
    if (!recordChurch || recordChurch === '*') {
      throw new Error('Este lançamento não está associado a uma igreja e não pode ser aprovado. Corrija ou migre o registo antes da decisão.');
    }
    if (!userCanAccessRecord_(user, record)) throw new Error('Não tem acesso à igreja deste lançamento.');
    const currentStatus = String(record.estado_aprovacao || '').toUpperCase();
    if (currentStatus !== 'PENDENTE') throw new Error('Este lançamento já foi decidido por outro utilizador. Actualize a lista.');

    const decidedAt = new Date().toISOString();
    const fields = {
      estado_aprovacao: decision,
      aprovado_por: user.username,
      aprovado_por_nome: user.name,
      aprovado_em: decidedAt,
      observacao_aprovacao: notes
    };
    updateRowFields_(sh, row, fields);
    updateSubmissionStatus_(uuid, decision, user, notes);
    updateRepeatApprovalStatus_(uuid, fields);
    audit_(user, decision, module, uuid, notes || 'Decisão sem observação.');
    return { ok: true, uuid, module, estado_aprovacao: decision, aprovado_em: decidedAt };
  } finally {
    lock.releaseLock();
  }
}

function rowObject_(sh, rowNumber) {
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const values = sh.getRange(rowNumber, 1, 1, sh.getLastColumn()).getValues()[0];
  const obj = {};
  headers.forEach((h, i) => obj[h] = values[i]);
  return obj;
}

function updateRepeatApprovalStatus_(uuid, fields) {
  SpreadsheetApp.getActive().getSheets().forEach(sh => {
    if (!String(sh.getName()).startsWith('rep_') || sh.getLastRow() < 2) return;
    const values = sh.getDataRange().getValues();
    const headers = values[0].map(String);
    const uuidCol = headers.indexOf('uuid');
    if (uuidCol < 0) return;
    const rows = [];
    for (let i = 1; i < values.length; i++) if (String(values[i][uuidCol]) === String(uuid)) rows.push(i + 1);
    if (!rows.length) return;
    addMissingHeaders_(sh, Object.keys(fields));
    rows.forEach(row => updateRowFields_(sh, row, fields));
  });
}

function findRowByUuid_(sh, uuid) {
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(String);
  const idx = headers.indexOf('uuid');
  if (idx < 0) return null;
  for (let i = 1; i < values.length; i++) if (String(values[i][idx]) === uuid) return i + 1;
  return null;
}

function updateRowFields_(sh, row, fields) {
  addMissingHeaders_(sh, Object.keys(fields));
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  Object.keys(fields).forEach(k => {
    const col = headers.indexOf(k) + 1;
    if (col > 0) sh.getRange(row, col).setValue(fields[k]);
  });
}

function updateSubmissionStatus_(uuid, status, user, notes) {
  const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEETS.SUBMISSIONS);
  if (!sh) return;
  const row = findRowByUuid_(sh, uuid);
  if (!row) return;
  updateRowFields_(sh, row, { estado_aprovacao: status, aprovado_por: user.username, aprovado_por_nome: user.name, aprovado_em: new Date().toISOString(), observacao_aprovacao: notes });
}

function audit_(user, action, module, uuid, details) {
  appendObject_(CONFIG.SHEETS.AUDIT, { createdAt: new Date(), actor: user.username || '', actorName: user.name || '', action, module, uuid, details });
}

function addMissingHeaders_(sh, requiredHeaders) {
  let headers = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map(String);
  const missing = requiredHeaders.filter(h => !headers.includes(h));
  if (missing.length) {
    sh.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    formatHeader_(sh);
  }
}

function sha256_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text), Utilities.Charset.UTF_8);
  return bytes.map(b => ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2)).join('');
}

function yes_(v) {
  const s = String(v || '').trim().toUpperCase();
  return ['SIM','S','YES','TRUE','1','ACTIVO','ATIVO'].includes(s);
}


function ensureOpeningBalances_() {
  const headers = ['igreja_id','igreja_nome','conta','label','saldo_inicial','updatedAt'];
  const sh = ensureSheet_('Saldos_Iniciais', headers);
  addMissingHeaders_(sh, headers);
  if (sh.getLastRow() > 1) return;
  const now = new Date().toISOString();
  sh.getRange(2, 1, 4, headers.length).setValues([
    ['*', 'Saldo não atribuído / distrital', 'CAIXA_SEDE', 'Caixa (Dinheiro Físico)', 0, now],
    ['*', 'Saldo não atribuído / distrital', 'MPESA_SEDE', 'M-Pesa', 0, now],
    ['*', 'Saldo não atribuído / distrital', 'EMOLA_SEDE', 'E-Mola', 0, now],
    ['*', 'Saldo não atribuído / distrital', 'BIM_IGREJA', 'Conta BIM', 0, now]
  ]);
  const headersNow = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const saldoCol = headersNow.indexOf('saldo_inicial') + 1;
  if (saldoCol > 0) sh.getRange(2, saldoCol, 4, 1).setNumberFormat('#,##0.00');
}



function getFinancialReport_(params, user) {
  setup();
  params = params || {};
  const scope = resolveReadScope_(user, params.igreja_id || params.churchId);
  const start = params.start ? new Date(params.start + 'T00:00:00') : null;
  const end = params.end ? new Date(params.end + 'T23:59:59') : null;
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(CONFIG.MODULE_SHEETS.registo_financeiro);
  const accountMap = getAccountMap_();
  const role = String((user && (user.role || user.perfil)) || '').trim().toUpperCase();
  const departmentRestricted = role === 'LIDER' || role === 'LÍDER';
  const openingInfo = departmentRestricted
    ? { balances: {}, unassignedCount: 0 }
    : getInitialBalances_(scope);
  const openingBalances = openingInfo.balances;

  const byAccount = {};
  Object.keys(accountMap).forEach(k => {
    byAccount[k] = {
      key: k,
      code: accountMap[k].code,
      name: accountMap[k].label,
      saldoAnterior: Number(openingBalances[k] || 0),
      entradas: 0,
      saidas: 0,
      saldoPeriodo: 0,
      saldoFinal: Number(openingBalances[k] || 0)
    };
  });

  const byRubrica = {};
  const byDepartamento = {};
  const rows = [];

  if (sh && sh.getLastRow() > 1) {
    const values = sh.getDataRange().getValues();
    const headers = values.shift().map(String);
    values.forEach(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      if (!recordMatchesReadScope_(obj, scope)) return;
      if (!recordMatchesUserDepartmentScope_(obj, user)) return;

      const dt = parseDate_(obj.data || obj.submittedAt || obj.createdAt);
      if (end && dt && dt > end) return;

      const status = String(obj.estado_aprovacao || 'APROVADO').toUpperCase();
      if (status !== 'APROVADO') return;

      const tipo = normalizeMovementType_(obj.tipo);
      if (!tipo) return;

      const conta = String(obj.conta || 'CAIXA_SEDE').trim() || 'CAIXA_SEDE';
      const rubrica = String(obj.rubrica || '').trim() || 'SEM_RUBRICA';
      const departamento = String(obj.departamento_final || obj.departamento || '').trim() || 'SEM_DEPARTAMENTO';
      const departamentoLabel = String(obj.departamento_final_label || obj.departamento_label || departamento).trim() || departamento;
      const valor = parseMoney_(obj.valor_mzn || obj.valor || obj.diz_total_mzn || 0);

      ensureBucket_(byAccount, conta, {
        key: conta,
        code: conta,
        name: conta,
        saldoAnterior: Number(openingBalances[conta] || 0),
        entradas: 0,
        saidas: 0,
        saldoPeriodo: 0,
        saldoFinal: Number(openingBalances[conta] || 0)
      });
      ensureBucket_(byRubrica, rubrica, {
        key: rubrica,
        label: rubrica,
        saldoAnterior: 0,
        entradas: 0,
        saidas: 0,
        saldoPeriodo: 0,
        saldoFinal: 0
      });
      ensureBucket_(byDepartamento, departamento, {
        key: departamento,
        label: departamentoLabel,
        saldoAnterior: 0,
        entradas: 0,
        saidas: 0,
        saldoPeriodo: 0,
        saldoFinal: 0
      });

      const isBeforePeriod = !!start && dt && dt < start;
      const isInPeriod = (!start || !dt || dt >= start) && (!end || !dt || dt <= end);

      if (isBeforePeriod) {
        applyMovement_(byAccount[conta], tipo, valor, true);
        applyMovement_(byRubrica[rubrica], tipo, valor, true);
        applyMovement_(byDepartamento[departamento], tipo, valor, true);
        return;
      }

      if (!isInPeriod) return;

      applyMovement_(byAccount[conta], tipo, valor, false);
      applyMovement_(byRubrica[rubrica], tipo, valor, false);
      applyMovement_(byDepartamento[departamento], tipo, valor, false);
      rows.push({
        data: dt ? Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
        tipo,
        conta,
        rubrica,
        departamento,
        valor,
        descricao: obj.descricao || '',
        beneficiario: obj.beneficiario || '',
        igreja_id: recordChurchId_(obj),
        igreja_nome: String(obj.igreja_nome || getChurchById_(recordChurchId_(obj)).nome_igreja || '')
      });
    });
  }

  const accounts = finalizeBuckets_(byAccount);
  const rubricas = finalizeBuckets_(byRubrica);
  const departamentos = finalizeBuckets_(byDepartamento);

  const totals = {
    saldoAnterior: sumBy_(accounts, 'saldoAnterior'),
    entradas: sumBy_(accounts, 'entradas'),
    saidas: sumBy_(accounts, 'saidas'),
    saldoPeriodo: sumBy_(accounts, 'saldoPeriodo'),
    saldoFinal: sumBy_(accounts, 'saldoFinal')
  };

  const warnings = [];
  if (openingInfo.unassignedCount && scope.igreja_id !== '*') {
    warnings.push('Existem saldos iniciais sem igreja atribuída. Não foram incluídos neste relatório local.');
  }

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    period: { start: params.start || '', end: params.end || '' },
    scope: scopeResponse_(scope),
    accounts,
    rubricas,
    departamentos,
    totals,
    rows,
    warnings,
    restrictions: {
      departmentRestricted,
      department: departmentRestricted ? String(user.department || user.departamento || '') : ''
    }
  };
}


function getAccountMap_() {
  return {
    CAIXA_SEDE: { code: 'CNT-001', label: 'Caixa (Dinheiro Físico)' },
    MPESA_SEDE: { code: 'CNT-002', label: 'M-Pesa' },
    EMOLA_SEDE: { code: 'CNT-003', label: 'E-Mola' },
    BIM_IGREJA: { code: 'CNT-004', label: 'Conta BIM' }
  };
}


function getInitialBalances_(scope) {
  const out = {};
  let unassignedCount = 0;
  const sh = SpreadsheetApp.getActive().getSheetByName('Saldos_Iniciais');
  if (!sh || sh.getLastRow() < 2) return { balances: out, unassignedCount: 0 };
  addMissingHeaders_(sh, ['igreja_id','igreja_nome','conta','label','saldo_inicial','updatedAt']);
  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);
  const idxChurch = headers.indexOf('igreja_id');
  const idxConta = headers.indexOf('conta');
  const idxSaldo = headers.indexOf('saldo_inicial');

  values.forEach(r => {
    const churchId = idxChurch >= 0 ? String(r[idxChurch] || '').trim() : '';
    const conta = idxConta >= 0 ? String(r[idxConta] || '').trim() : '';
    if (!conta) return;
    if (!churchId || churchId === '*') unassignedCount++;

    if (scope && scope.igreja_id !== '*') {
      if (churchId !== scope.igreja_id) return;
    }
    out[conta] = Number(out[conta] || 0) + parseMoney_(idxSaldo >= 0 ? r[idxSaldo] : 0);
  });
  return { balances: out, unassignedCount };
}


function ensureBucket_(obj, key, defaults) {
  if (!obj[key]) obj[key] = defaults;
}

function applyMovement_(bucket, tipo, valor, isPreviousPeriod) {
  const signed = tipo === 'Entrada' ? valor : -valor;
  if (isPreviousPeriod) {
    bucket.saldoAnterior += signed;
  } else {
    if (tipo === 'Entrada') bucket.entradas += valor;
    else bucket.saidas += valor;
  }
}

function finalizeBuckets_(mapObj) {
  return Object.keys(mapObj).map(k => {
    const item = mapObj[k];
    item.saldoPeriodo = Number(item.entradas || 0) - Number(item.saidas || 0);
    item.saldoFinal = Number(item.saldoAnterior || 0) + Number(item.saldoPeriodo || 0);
    return item;
  }).sort((a, b) => String(a.label || a.name || a.key).localeCompare(String(b.label || b.name || b.key), 'pt'));
}

function sumBy_(arr, field) {
  return (arr || []).reduce((s, item) => s + Number(item[field] || 0), 0);
}

function normalizeMovementType_(v) {
  const t = String(v || '').trim().toLowerCase();
  if (t === 'entrada') return 'Entrada';
  if (t === 'saida' || t === 'saída') return 'Saída';
  return '';
}

function parseMoney_(v) {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (v instanceof Date) return 0;
  const n = Number(String(v || '0').replace(/MT|MZN/gi, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.'));
  return isFinite(n) ? n : 0;
}

function parseDate_(v) {
  if (v instanceof Date) return v;
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}



function getAppData_(user, params) {
  setup();
  params = params || {};
  const scope = resolveReadScope_(user, params.igreja_id || params.churchId);
  const scopeId = scope.igreja_id === '*' ? '' : scope.igreja_id;
  const data = {
    ok: true,
    generatedAt: new Date().toISOString(),
    overview: {},
    escalas: [],
    cultos: [],
    visitantes: [],
    dizimos: []
  };
  if (canViewAreaForData_(user, 'PLANO')) data.escalas = getEscalasData_(user, scopeId);
  if (canViewAreaForData_(user, 'CULTOS')) data.cultos = getCultosData_(user, scopeId);
  if (canViewAreaForData_(user, 'MEMBROS')) data.visitantes = getVisitantesData_(user, scopeId);
  if (canViewAreaForData_(user, 'FINANCAS')) data.dizimos = getDizimosData_(user, scopeId);
  data.overview = buildOverviewData_(data, user, scopeId);
  data.scope = scopeResponse_(scope);
  data.igrejas = isDistrictUser_(user) ? getChurches_() : [getChurchById_(userChurchId_(user))];
  return data;
}


function canViewAreaForData_(user, area) {
  return (user.viewAreas || []).includes(area) || (user.role === 'ADMIN_IT') || (user.role === 'ADMIN');
}

function readSheetObjects_(sheetName) {
  const sh = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);
  return values.filter(r => r.join('').trim()).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });
}

function rowValue_(obj, names) {
  for (const n of names) {
    if (obj[n] !== undefined && obj[n] !== null && String(obj[n]).trim() !== '') return obj[n];
  }
  return '';
}

function dateIso_(v) {
  const d = parseDate_(v);
  if (!d) return String(v || '');
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function timeText_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'HH:mm');
  return String(v || '');
}

function isUsableRow_(obj) {
  const st = String(obj.estado_aprovacao || '').trim().toUpperCase();
  // Registos antigos sem estado são tratados como válidos; novos registos
  // pendentes só entram nos módulos depois de aprovados.
  return !st || st === 'APROVADO';
}

function getEscalasData_(user, requestedChurchId) {
  const main = filterObjectsByChurch_(readSheetObjects_(CONFIG.MODULE_SHEETS.plano_cultos_escalas), user, requestedChurchId).filter(isUsableRow_);
  const reps = filterObjectsByChurch_(readSheetObjects_('rep_rep_escalas').concat(readSheetObjects_('rep_escalas')).concat(readSheetObjects_('rep_responsaveis')), user, requestedChurchId).filter(isUsableRow_);
  const out = [];
  main.forEach(obj => {
    const data = dateIso_(rowValue_(obj, ['data_culto','data','submittedAt','createdAt']));
    const hora = [timeText_(obj.hora_inicio), timeText_(obj.hora_fim)].filter(Boolean).join(' - ');
    const tipo = rowValue_(obj, ['tipo_culto_plano_label','tipo_culto_plano','tipo_culto_label','tipo']);
    const especificacao = rowValue_(obj, ['espec_culto_plano','especificacao','descricao']);
    const dia = rowValue_(obj, ['dia_meio_semana_plano_label','dia_meio_semana_plano','dia']);
    ['dirigente','pregador','intercessor','secretario','tesoureiro','musica'].forEach(fn => {
      if (obj[fn]) out.push({ data, hora, tipo, especificacao, dia, funcao: labelFunction_(fn), nome: memberLabel_(obj[fn], recordChurchId_(obj)), telefone: memberPhone_(obj[fn], recordChurchId_(obj)) });
    });
  });
  reps.forEach(obj => out.push({
    data: dateIso_(rowValue_(obj, ['data_culto','data','submittedAt','createdAt'])),
    hora: [timeText_(rowValue_(obj, ['hora_inicio','hora'])), timeText_(rowValue_(obj, ['hora_fim']))].filter(Boolean).join(' - '),
    tipo: rowValue_(obj, ['tipo_culto_plano_label','tipo_culto_plano','tipo_culto','tipo']),
    especificacao: rowValue_(obj, ['espec_culto_plano','especificacao','descricao']),
    dia: rowValue_(obj, ['dia_meio_semana_plano_label','dia_meio_semana_plano','dia']),
    funcao: rowValue_(obj, ['funcao_label','funcao','escala_funcao']),
    nome: memberLabel_(rowValue_(obj, ['membro','nome','responsavel','pessoa']), recordChurchId_(obj)),
    telefone: rowValue_(obj, ['telefone','tel','Telefone']) || memberPhone_(rowValue_(obj, ['membro','responsavel','pessoa']), recordChurchId_(obj))
  }));
  return out.filter(r => r.data || r.nome || r.funcao).sort((a,b)=>String(a.data).localeCompare(String(b.data)));
}

function labelFunction_(fn) {
  const map = { dirigente:'Dirigente', pregador:'Pregador', intercessor:'Intercessor', secretario:'Secretário', tesoureiro:'Tesoureiro', musica:'Música' };
  return map[fn] || fn;
}

function memberRecord_(id, churchId) {
  const v = String(id || '').trim();
  const c = String(churchId || '').trim();
  if (!v) return null;
  return getMembers_().find(x => {
    const sameMember = String(x.name || '').trim() === v || String(x.id_membro || '').trim() === v || String(x.label || '').trim() === v;
    const sameChurch = !c || String(x.igreja_id || '').trim() === c;
    return sameMember && sameChurch;
  }) || null;
}

function memberLabel_(id, churchId) {
  const v = String(id || '');
  const m = memberRecord_(v, churchId);
  return m ? String(m.label || m.name || v) : v;
}

function memberPhone_(id, churchId) {
  const m = memberRecord_(id, churchId);
  return m ? String(m.Telefone || m.telefone || m.celular_whatsapp || '') : '';
}

function getCultosData_(user, requestedChurchId) {
  return filterObjectsByChurch_(readSheetObjects_(CONFIG.MODULE_SHEETS.relatorio_cultos), user, requestedChurchId).filter(isUsableRow_).map(obj => {
    const diz = parseMoney_(rowValue_(obj, ['diz_total_mzn','dizimos_total','dizimos','total_dizimos_mzn']));
    const ofertas = parseMoney_(rowValue_(obj, ['ofertas_total_mzn','ofertas','total_ofertas_mzn','oferta_total']));
    return {
      data: dateIso_(rowValue_(obj, ['data','data_culto','submittedAt','createdAt'])),
      hora: [timeText_(rowValue_(obj, ['hora_inicio','hora'])), timeText_(rowValue_(obj, ['hora_fim']))].filter(Boolean).join(' - '),
      tipo: rowValue_(obj, ['tipo_culto_label','tipo_culto','tipo_culto_plano_label','tipo']),
      local: rowValue_(obj, ['local_culto','local','igreja','congregacao']),
      participantes: parseMoney_(rowValue_(obj, ['total_participantes','participantes','num_participantes','pax'])),
      visitantes: parseMoney_(rowValue_(obj, ['total_visitantes','visitantes','num_visitantes'])),
      baptismos: parseMoney_(rowValue_(obj, ['baptismos','batismos','total_baptismos'])),
      decisoes: parseMoney_(rowValue_(obj, ['decisoes','decisões','total_decisoes'])),
      santaCeia: rowValue_(obj, ['santa_ceia','sta_ceia','ceia']),
      dizimos: diz,
      ofertas: ofertas
    };
  }).sort((a,b)=>String(b.data).localeCompare(String(a.data)));
}

function getVisitantesData_(user, requestedChurchId) {
  return filterObjectsByChurch_(readSheetObjects_(CONFIG.MODULE_SHEETS.visitantes), user, requestedChurchId).filter(isUsableRow_).filter(obj => String(obj.registo_tipo || 'visitante').toLowerCase() !== 'membro_efectivo').map(obj => ({
    data: dateIso_(rowValue_(obj, ['data_visita','data','submittedAt','createdAt'])),
    nome: rowValue_(obj, ['nome_visitante','nome','nome_completo']),
    sexo: rowValue_(obj, ['sexo_visitante','sexo']),
    faixa: rowValue_(obj, ['faixa_etaria_label','faixa_etaria']),
    bairro: rowValue_(obj, ['bairro_localidade','bairro','localidade']),
    primeiraVez: normalSimNao_(rowValue_(obj, ['primeira_vez','primeira_visita','e_primeira_vez'])),
    comoConheceu: rowValue_(obj, ['como_conheceu_label','como_conheceu','origem']),
    contacto: normalSimNao_(rowValue_(obj, ['quer_contacto','contacto','deseja_contacto'])),
    telefone: rowValue_(obj, ['telefone_whatsapp','telefone','Telefone']),
    pedidoOracao: rowValue_(obj, ['pedido_oracao','pedido_de_oracao','oracao'])
  })).sort((a,b)=>String(b.data).localeCompare(String(a.data)));
}

function normalSimNao_(v) {
  const s = String(v || '').trim().toLowerCase();
  if (['sim','s','yes','true','1'].includes(s)) return 'sim';
  if (['nao','não','n','no','false','0'].includes(s)) return 'nao';
  return String(v || '');
}

function getDizimosData_(user, requestedChurchId) {
  const main = filterObjectsByChurch_(readSheetObjects_(CONFIG.MODULE_SHEETS.registo_financeiro), user, requestedChurchId).filter(isUsableRow_).filter(obj => String(rowValue_(obj, ['rubrica'])).trim() === 'DIZ' || String(rowValue_(obj, ['tipo'])).toLowerCase() === 'entrada' && String(rowValue_(obj, ['diz_total_mzn'])).trim());
  const rep = filterObjectsByChurch_(readSheetObjects_('rep_dizimos_repeat').concat(readSheetObjects_('rep_dizimistas')), user, requestedChurchId).filter(isUsableRow_);
  const out = [];
  rep.forEach(obj => out.push({
    data: dateIso_(rowValue_(obj, ['data','submittedAt','createdAt'])),
    nome: rowValue_(obj, ['dizimista_nome_final','dizimista_nome_manual','dizimista_nome_csv','nome']),
    modo: rowValue_(obj, ['modo_ident','modo']),
    valorOrig: rowValue_(obj, ['diz_valor','valor','valor_orig']),
    moeda: rowValue_(obj, ['moeda_ctx','moeda']) || 'MZN',
    valorMzn: parseMoney_(rowValue_(obj, ['diz_valor_mzn','valor_mzn','valor'])),
    metodo: rowValue_(obj, ['diz_metodo','metodo']),
    recibo: rowValue_(obj, ['diz_recibo','recibo'])
  }));
  main.forEach(obj => {
    if (!out.some(r => r.data === dateIso_(rowValue_(obj, ['data','submittedAt','createdAt'])) && Number(r.valorMzn) === parseMoney_(rowValue_(obj, ['diz_total_mzn','valor_mzn','valor'])))) {
      out.push({ data: dateIso_(rowValue_(obj, ['data','submittedAt','createdAt'])), nome: rowValue_(obj, ['registado_por','submetido_por_nome']) || 'Sessão de dízimos', modo:'Sessão', valorOrig: rowValue_(obj, ['diz_total_mzn','valor_mzn','valor']), moeda: rowValue_(obj, ['moeda']) || 'MZN', valorMzn: parseMoney_(rowValue_(obj, ['diz_total_mzn','valor_mzn','valor'])), metodo: rowValue_(obj, ['metodo','conta']), recibo: rowValue_(obj, ['recibo']) });
    }
  });
  return out.filter(r => r.valorMzn || r.nome).sort((a,b)=>String(b.data).localeCompare(String(a.data)));
}


function buildOverviewData_(data, user, requestedChurchId) {
  const cultos = data.cultos || [];
  const visitantes = data.visitantes || [];
  const dizimos = data.dizimos || [];
  const fin = getFinancialReport_({ igreja_id: requestedChurchId || '' }, user);
  const participantes = cultos.reduce((s,r)=>s+Number(r.participantes||0),0);
  return {
    cultos: cultos.length,
    visitantes: visitantes.length,
    movimentos: (fin.rows || []).length,
    mediaParticipantes: cultos.length ? Math.round(participantes / cultos.length) : 0,
    saldoGeral: fin.totals ? fin.totals.saldoFinal : 0,
    visitantesPorTipo: countPairs_(visitantes.map(v => v.primeiraVez === 'sim' ? '1ª visita' : (v.primeiraVez === 'nao' ? 'Retorno' : 'Sem indicação'))),
    comoConheceram: countPairs_(visitantes.map(v => v.comoConheceu || 'Sem indicação')),
    presenca: cultos.slice(-8).map((c, i) => ({ label: c.data || ('Culto ' + (i+1)), value: Number(c.participantes || 0) })),
    topRubricas: (fin.rubricas || []).filter(r => Number(r.entradas || 0) > 0).sort((a,b)=>Number(b.entradas||0)-Number(a.entradas||0)).slice(0,6).map(r => ({ label: r.label || r.key, value: Number(r.entradas||0) })),
    topDepartamentos: (fin.departamentos || []).filter(r => Number(r.entradas || 0) > 0).sort((a,b)=>Number(b.entradas||0)-Number(a.entradas||0)).slice(0,6).map(r => ({ label: r.label || r.key, value: Number(r.entradas||0) }))
  };
}


function countPairs_(items) {
  const map = {};
  items.forEach(x => { const k = String(x || 'Sem indicação'); map[k] = (map[k] || 0) + 1; });
  return Object.keys(map).map(k => ({ label:k, value:map[k] })).sort((a,b)=>b.value-a.value);
}


function getAssembleiaConfig_() {
  setup();
  const sh = SpreadsheetApp.getActive().getSheetByName('Assembleia_Config');
  const config = { assemblyDate: '', updatedAt: '', updatedBy: '' };
  if (!sh || sh.getLastRow() < 2) return config;
  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);
  const idxKey = headers.indexOf('key');
  const idxValue = headers.indexOf('value');
  const idxUpdatedAt = headers.indexOf('updatedAt');
  const idxUpdatedBy = headers.indexOf('updatedBy');
  values.forEach(r => {
    const key = String(r[idxKey] || '').trim();
    if (key === 'assemblyDate') {
      config.assemblyDate = r[idxValue] ? String(r[idxValue]).slice(0, 10) : '';
      config.updatedAt = r[idxUpdatedAt] instanceof Date ? r[idxUpdatedAt].toISOString() : String(r[idxUpdatedAt] || '');
      config.updatedBy = String(r[idxUpdatedBy] || '');
    }
  });
  return config;
}

function saveAssembleiaDate_(payload) {
  setup();
  const username = String(payload.username || '').trim();
  const password = String(payload.password || '').trim();
  const assemblyDate = String(payload.assemblyDate || '').trim();
  if (!username || !password) throw new Error('Informe utilizador e senha.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(assemblyDate)) throw new Error('Data da Assembleia inválida.');

  const user = findUser_(username);
  if (!user || !yes_(user.activo || user.active)) throw new Error('Utilizador inactivo ou inexistente.');
  if (!verifyPassword_(password, user)) throw new Error('Credenciais inválidas.');
  const safeUser = sanitizeUser_(user);
  if (!safeUser.canConfig && !['ADMIN_IT','ADMIN','ADMINISTRADOR'].includes(String(safeUser.role || '').toUpperCase())) {
    throw new Error('Este utilizador não tem permissão para alterar a data da Assembleia.');
  }

  const sh = ensureSheet_('Assembleia_Config', ['key','value','updatedAt','updatedBy']);
  ensureDelegadosSheets_();
  addMissingHeaders_(sh, ['key','value','updatedAt','updatedBy']);
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(String);
  const idxKey = headers.indexOf('key');
  let row = 0;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idxKey] || '').trim() === 'assemblyDate') { row = i + 1; break; }
  }
  if (!row) row = sh.getLastRow() + 1;
  const now = new Date();
  updateRowFields_(sh, row, {
    key: 'assemblyDate',
    value: assemblyDate,
    updatedAt: now,
    updatedBy: safeUser.username || username
  });
  audit_(safeUser, 'UPDATE_ASSEMBLY_DATE', 'ASSEMBLEIA', '', 'Data definida para ' + assemblyDate);
  return { ok: true, config: { assemblyDate: assemblyDate, updatedAt: now.toISOString(), updatedBy: safeUser.username || username } };
}


// ─────────────────────────────────────────────────────────────
// Certificação de Delegados à Assembleia Distrital
// Migração do XLSForm KoboToolbox para Google Sheets + Apps Script.
// ─────────────────────────────────────────────────────────────
function ensureDelegadosSheets_() {
  const currentYear = new Date().getFullYear();
  const igrejas = ensureSheet_('Igrejas_Delegados', ['ano','name','label','distrito_nome','membros_distrito','membros_igreja','activo']);
  ensureSheetColumns_(igrejas, ['ano','name','label','distrito_nome','membros_distrito','membros_igreja','activo']);
  normalizarIgrejasDelegadosAno_(igrejas, currentYear);
  sincronizarIgrejasDelegadosComCadastro_(igrejas, currentYear);
  ensureSheet_('Certificacao_Delegados', ['createdAt','uuid','igreja_id','igreja_nome','ano_assembleia','igreja_local','igreja_label','distrito_nome_calc','membros_distrito','membros_igreja','data_assembleia','regime_flag','descricao_regime','delegados_leigos_eleitos','num_exofficio','num_suplentes','total_delegados_sem_suplentes','total_geral_com_suplentes','visto_final','submetido_por','submetido_por_nome']);
  ensureSheet_('Delegados_Efectivos', ['createdAt','uuid','igreja_id','igreja_nome','igreja_local','igreja_label','linha','nome_delegado_efectivo','contacto_delegado_efectivo']);
  ensureSheet_('Delegados_ExOfficio', ['createdAt','uuid','igreja_id','igreja_nome','igreja_local','igreja_label','linha','nome_exofficio','contacto_exofficio','categoria_exofficio','categoria_exofficio_label']);
  ensureSheet_('Delegados_Suplentes', ['createdAt','uuid','igreja_id','igreja_nome','igreja_local','igreja_label','linha','nome_suplente','contacto_suplente']);
}


function ensureSheetColumns_(sh, columns) {
  let headers = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map(String);
  const missing = columns.filter(c => !headers.includes(c));
  if (missing.length) {
    sh.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    formatHeader_(sh);
  }
}

function normalizarIgrejasDelegadosAno_(sh, defaultYear) {
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return;
  const headers = values[0].map(String);
  const anoCol = headers.indexOf('ano');
  const activoCol = headers.indexOf('activo');
  for (let r = 2; r <= sh.getLastRow(); r++) {
    if (anoCol >= 0 && !sh.getRange(r, anoCol + 1).getValue()) sh.getRange(r, anoCol + 1).setValue(defaultYear);
    if (activoCol >= 0 && !sh.getRange(r, activoCol + 1).getValue()) sh.getRange(r, activoCol + 1).setValue('SIM');
  }
}


function normalizarChaveIgrejaDelegados_(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/igreja\s+do\s+nazareno\s+(de|da|do|em)?\s*/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function nomeCurtoIgrejaDelegados_(value) {
  return String(value || '')
    .replace(/^Igreja\s+do\s+Nazareno\s+(de|da|do|em)\s+/i, '')
    .replace(/^Igreja\s+do\s+Nazareno\s+/i, '')
    .trim();
}

function sincronizarIgrejasDelegadosComCadastro_(sh, year) {
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const col = {};
  headers.forEach((h, i) => col[h] = i);
  const values = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues() : [];
  const currentYearRows = values.map((row, index) => ({ row, sheetRow: index + 2 }))
    .filter(x => Number(x.row[col.ano] || year) === Number(year));

  const defaultDistrictMembers = currentYearRows.reduce((max, x) => {
    const n = Number(x.row[col.membros_distrito] || 0) || 0;
    return Math.max(max, n);
  }, 0);

  const aliases = { machava: 'machava_sede' };
  const master = getChurches_();
  const toAppend = [];

  master.forEach(church => {
    const churchId = String(church.igreja_id || '').trim();
    const shortLabel = nomeCurtoIgrejaDelegados_(church.nome_igreja || churchId);
    const idKey = normalizarChaveIgrejaDelegados_(churchId);
    const labelKey = normalizarChaveIgrejaDelegados_(shortLabel);

    let found = currentYearRows.find(x => {
      const rawName = String(x.row[col.name] || '').trim();
      const rawLabel = String(x.row[col.label] || '').trim();
      const nameKey = normalizarChaveIgrejaDelegados_(rawName);
      const rowLabelKey = normalizarChaveIgrejaDelegados_(rawLabel);
      const aliasedName = aliases[nameKey] || nameKey;
      return rawName === churchId || aliasedName === churchId || nameKey === idKey || rowLabelKey === labelKey;
    });

    if (found) {
      const changes = {};
      if (String(found.row[col.name] || '').trim() !== churchId) changes.name = churchId;
      if (!String(found.row[col.label] || '').trim()) changes.label = shortLabel;
      if (!String(found.row[col.distrito_nome] || '').trim()) changes.distrito_nome = church.distrito || 'Distrito da Matola';
      if (!String(found.row[col.activo] || '').trim()) changes.activo = 'SIM';
      if (Object.keys(changes).length) updateRowFields_(sh, found.sheetRow, changes);
      return;
    }

    const row = new Array(headers.length).fill('');
    row[col.ano] = Number(year);
    row[col.name] = churchId;
    row[col.label] = shortLabel;
    row[col.distrito_nome] = church.distrito || 'Distrito da Matola';
    row[col.membros_distrito] = defaultDistrictMembers;
    row[col.membros_igreja] = 0;
    row[col.activo] = 'SIM';
    toAppend.push(row);
  });

  if (toAppend.length) {
    sh.getRange(sh.getLastRow() + 1, 1, toAppend.length, headers.length).setValues(toAppend);
  }
}

function getDelegadosIgrejas_(user) {
  ensureDelegadosSheets_();
  return readSheetObjects_('Igrejas_Delegados').map(r => ({
    ano: Number(r.ano || new Date().getFullYear()) || new Date().getFullYear(),
    name: String(r.name || r.igreja_local || '').trim(),
    label: String(r.label || r.name || '').trim(),
    distrito_nome: String(r.distrito_nome || r.distrito || '').trim(),
    membros_distrito: Number(r.membros_distrito || 0) || 0,
    membros_igreja: Number(r.membros_igreja || 0) || 0,
    activo: String(r.activo || 'SIM').trim().toUpperCase()
  })).filter(r => r.name && r.activo !== 'NAO' && r.activo !== 'NÃO' && r.activo !== 'NO')
     .filter(r => !user || isDistrictUser_(user) || String(r.name) === userChurchId_(user))
     .sort((a, b) => String(a.label || a.name).localeCompare(String(b.label || b.name), 'pt', { sensitivity: 'base' }));
}

function calcularDelegadosLeigos_(membrosDistrito, membrosIgreja) {
  const md = Number(membrosDistrito || 0) || 0;
  const mi = Number(membrosIgreja || 0) || 0;
  const regime = md >= 5000 ? 2 : 1;
  const limit = regime === 1 ? 1975 : 2025;
  let inc = 0;
  for (let t = 75; t <= limit; t += 50) if (mi > t) inc++;
  const delegados = (regime === 1 ? 2 : 1) + inc;
  const descricao = regime === 1
    ? 'Distrito com menos de 5.000 membros: regra do §201.1'
    : 'Distrito com 5.000 ou mais membros: regra do §201.2';
  return { regime, descricao, delegados };
}

function categoriaExOfficioLabel_(v) {
  const map = {
    dni_pres: 'DNI — Presidente',
    dni_vice: 'DNI — Vice-presidente',
    jni_pres: 'JNI — Presidente',
    jni_vice: 'JNI — Vice-presidente',
    mni_pres: 'MNI — Presidente',
    mni_vice: 'MNI — Vice-presidente',
    ministerial: 'Cargo ministerial designado',
    outro: 'Outro'
  };
  return map[String(v || '')] || String(v || '');
}

function getDelegadosCertificationData_(user) {
  setup();
  const rows = filterObjectsByChurch_(readSheetObjects_('Certificacao_Delegados'), user).map(r => ({
    createdAt: dateIso_(r.createdAt),
    uuid: r.uuid || '',
    igreja_local: r.igreja_local || '',
    igreja_label: r.igreja_label || r.igreja_local || '',
    data_assembleia: dateIso_(r.data_assembleia),
    membros_igreja: Number(r.membros_igreja || 0) || 0,
    delegados_leigos_eleitos: Number(r.delegados_leigos_eleitos || 0) || 0,
    num_exofficio: Number(r.num_exofficio || 0) || 0,
    num_suplentes: Number(r.num_suplentes || 0) || 0,
    total_delegados_sem_suplentes: Number(r.total_delegados_sem_suplentes || 0) || 0,
    total_geral_com_suplentes: Number(r.total_geral_com_suplentes || 0) || 0,
    submetido_por_nome: r.submetido_por_nome || r.submetido_por || ''
  })).sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const resumo = rows.reduce((acc, r) => {
    acc.igrejas += 1;
    acc.membrosIgrejas += Number(r.membros_igreja || 0);
    acc.delegadosEleitos += Number(r.delegados_leigos_eleitos || 0);
    acc.exOfficio += Number(r.num_exofficio || 0);
    acc.suplentes += Number(r.num_suplentes || 0);
    acc.totalSemSuplentes += Number(r.total_delegados_sem_suplentes || 0);
    acc.totalGeral += Number(r.total_geral_com_suplentes || 0);
    return acc;
  }, { igrejas:0, membrosIgrejas:0, delegadosEleitos:0, exOfficio:0, suplentes:0, totalSemSuplentes:0, totalGeral:0 });
  return { ok: true, igrejas: getDelegadosIgrejas_(user), rows, resumo, scope: { igreja_id: userChurchId_(user), igreja_nome: userChurchName_(user), isDistrict: isDistrictUser_(user) } }; 
}

function saveDelegadosCertification_(user, payload) {
  setup();
  const data = payload.data || {};
  const repeats = payload.repeats || {};
  const igrejas = getDelegadosIgrejas_(user);
  const igreja = igrejas.find(i => String(i.name) === String(data.igreja_local));
  if (!igreja) throw new Error('Igreja local não encontrada na folha Igrejas_Delegados.');
  const calc = calcularDelegadosLeigos_(igreja.membros_distrito, igreja.membros_igreja);
  const uuid = Utilities.getUuid();
  const createdAt = new Date();
  const ano = Number(data.ano_assembleia || (data.data_assembleia ? String(data.data_assembleia).slice(0,4) : new Date().getFullYear())) || new Date().getFullYear();
  const ex = Number(data.num_exofficio || 0) || 0;
  const supl = Number(data.num_suplentes || 0) || 0;
  const main = {
    createdAt,
    uuid,
    igreja_id: igreja.name,
    igreja_nome: igreja.label || igreja.name,
    ano_assembleia: ano,
    igreja_local: igreja.name,
    igreja_label: igreja.label || igreja.name,
    distrito_nome_calc: igreja.distrito_nome || '',
    membros_distrito: Number(igreja.membros_distrito || 0) || 0,
    membros_igreja: Number(igreja.membros_igreja || 0) || 0,
    data_assembleia: data.data_assembleia || '',
    regime_flag: calc.regime,
    descricao_regime: calc.descricao,
    delegados_leigos_eleitos: calc.delegados,
    num_exofficio: ex,
    num_suplentes: supl,
    total_delegados_sem_suplentes: calc.delegados + ex,
    total_geral_com_suplentes: calc.delegados + ex,
    visto_final: data.visto_final || '',
    submetido_por: user.username || '',
    submetido_por_nome: user.name || ''
  };
  appendObject_('Certificacao_Delegados', main);
  (repeats.lista_efectivos || []).forEach((r, idx) => appendObject_('Delegados_Efectivos', {
    createdAt, uuid, igreja_id: igreja.name, igreja_nome: igreja.label || igreja.name, igreja_local: igreja.name, igreja_label: igreja.label || igreja.name, linha: idx + 1,
    nome_delegado_efectivo: r.nome || '', contacto_delegado_efectivo: r.contacto || ''
  }));
  (repeats.lista_exofficio || []).forEach((r, idx) => appendObject_('Delegados_ExOfficio', {
    createdAt, uuid, igreja_id: igreja.name, igreja_nome: igreja.label || igreja.name, igreja_local: igreja.name, igreja_label: igreja.label || igreja.name, linha: idx + 1,
    nome_exofficio: r.nome || '', contacto_exofficio: r.contacto || '', categoria_exofficio: r.categoria || '', categoria_exofficio_label: categoriaExOfficioLabel_(r.categoria)
  }));
  (repeats.lista_suplentes || []).forEach((r, idx) => appendObject_('Delegados_Suplentes', {
    createdAt, uuid, igreja_id: igreja.name, igreja_nome: igreja.label || igreja.name, igreja_local: igreja.name, igreja_label: igreja.label || igreja.name, linha: idx + 1,
    nome_suplente: r.nome || '', contacto_suplente: r.contacto || ''
  }));
  audit_(user, 'CERTIFICACAO_DELEGADOS', 'delegados', uuid, 'Certificação de delegados submetida');
  return { ok: true, uuid, sheet: 'Certificacao_Delegados', data: main };
}


function getChurchesForUser_(user) {
  if (isDistrictUser_(user)) return getChurches_();
  const church = getChurchById_(userChurchId_(user));
  return church && church.igreja_id && church.igreja_id !== '*' ? [church] : [];
}

function getMemberScopeForUser_(user) {
  if (isDistrictUser_(user)) return { churchId: '', churchName: '', requiresSelection: true, unassignedCount: getUnassignedMembersCount_() };
  const churchId = userChurchId_(user);
  return { churchId, churchName: userChurchName_(user), requiresSelection: false, unassignedCount: getUnassignedMembersCount_() };
}

function validateMemberChurchAccess_(user, requestedChurchId) {
  const requested = String(requestedChurchId || '').trim();
  const churchId = isDistrictUser_(user) ? requested : userChurchId_(user);
  if (!churchId || churchId === '*') throw new Error('Seleccione a Igreja de trabalho para carregar a lista nominal.');
  if (!isDistrictUser_(user) && requested && requested !== churchId) throw new Error('Não tem permissão para consultar os membros de outra igreja.');
  const church = getChurches_().find(c => String(c.igreja_id) === churchId);
  if (!church) throw new Error('A igreja seleccionada não existe ou está inactiva.');
  return church;
}

function getMembersByChurchResponse_(user, requestedChurchId) {
  const church = validateMemberChurchAccess_(user, requestedChurchId);
  const members = getMembersByChurch_(church.igreja_id);
  return { ok: true, church, members, count: members.length, unassignedCount: getUnassignedMembersCount_() };
}

function getMembersForUser_(user) {
  if (isDistrictUser_(user)) return [];
  return getMembersByChurch_(userChurchId_(user));
}

function getMembersByChurch_(churchId) {
  const id = String(churchId || '').trim();
  if (!id || id === '*') return [];
  return getMembers_().filter(r => String(r.igreja_id || '').trim() === id && memberIsActive_(r));
}

function memberIsActive_(row) {
  const raw = String((row && row.activo) || '').trim();
  return !raw || yes_(raw);
}

function getUnassignedMembersCount_() {
  return getMembers_().filter(r => !String(r.igreja_id || '').trim()).length;
}

function getMembers_() {
  const headersRequired = ['id_membro','igreja_id','igreja_nome','name','label','Telefone','sexo','departamento','grupo','batizado','comunhao','celular_whatsapp','bairro','activo','origem_importacao','createdAt','updatedAt'];
  const sh = ensureSheet_(CONFIG.SHEETS.MEMBERS, headersRequired);
  addMissingHeaders_(sh, headersRequired);
  if (sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);
  return values.filter(r => r.join('').trim()).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    obj.id_membro = obj.id_membro || obj.name || '';
    obj.name = obj.name || obj.id_membro || obj.label || '';
    obj.label = obj.label || obj.nome || obj.name;
    obj.igreja_id = String(obj.igreja_id || '').trim();
    obj.igreja_nome = String(obj.igreja_nome || '').trim();
    return obj;
  }).filter(obj => obj.name || obj.label);
}

function normalizeMemberHeaderV543_(value) {
  return String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function memberImportValueV543_(row, aliases) {
  const normalized = {};
  Object.keys(row || {}).forEach(k => normalized[normalizeMemberHeaderV543_(k)] = row[k]);
  for (const alias of aliases) {
    const value = normalized[normalizeMemberHeaderV543_(alias)];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

function memberSlugV543_(value) {
  const slug = normalizeMemberHeaderV543_(value).replace(/_/g, '-');
  return slug || Utilities.getUuid().slice(0, 8);
}

function sanitizeImportedMemberV543_(row, church, index, usedNames) {
  const label = memberImportValueV543_(row, ['label','nome','nome_completo','membro','nome_membro']);
  let name = memberImportValueV543_(row, ['name','id_membro','membro_id','id','codigo']);
  if (!label && !name) return null;
  if (!name) name = church.igreja_id + '_' + memberSlugV543_(label);
  let uniqueName = name;
  let suffix = 2;
  while (usedNames.has(uniqueName)) uniqueName = name + '_' + suffix++;
  usedNames.add(uniqueName);
  const now = new Date().toISOString();
  return {
    id_membro: memberImportValueV543_(row, ['id_membro','membro_id','id','codigo']) || uniqueName,
    igreja_id: church.igreja_id,
    igreja_nome: church.nome_igreja,
    name: uniqueName,
    label: label || uniqueName,
    Telefone: memberImportValueV543_(row, ['Telefone','telefone','telemovel','telefone_whatsapp','celular','contacto']),
    sexo: memberImportValueV543_(row, ['sexo','genero']),
    departamento: memberImportValueV543_(row, ['departamento','ministerio']),
    grupo: memberImportValueV543_(row, ['grupo','grupo_pequeno']),
    batizado: memberImportValueV543_(row, ['batizado','baptizado']),
    comunhao: memberImportValueV543_(row, ['comunhao','plena_comunhao']),
    celular_whatsapp: memberImportValueV543_(row, ['celular_whatsapp','whatsapp']),
    bairro: memberImportValueV543_(row, ['bairro','residencia']),
    activo: memberImportValueV543_(row, ['activo','ativo','estado']) || 'SIM',
    origem_importacao: 'CSV_' + new Date().getFullYear(),
    createdAt: now,
    updatedAt: now
  };
}

function validateCanImportMembers_(user) {
  const role = String(user.role || user.perfil || '').trim().toUpperCase();
  const approvals = user.approveAreas || [];
  if (role === 'ADMIN_IT' || role === 'ADMIN' || role === 'ADMINISTRADOR' || user.canConfig || approvals.includes('MEMBROS')) return;
  throw new Error('Este utilizador não tem permissão para importar listas nominais de membros.');
}

function importMembersCsv_(user, payload) {
  validateCanImportMembers_(user);
  const church = validateMemberChurchAccess_(user, payload.igreja_id || payload.churchId);
  const mode = String(payload.mode || 'UPSERT').trim().toUpperCase();
  if (!['UPSERT','REPLACE'].includes(mode)) throw new Error('Modo de importação inválido.');
  const incomingRows = Array.isArray(payload.rows) ? payload.rows : [];
  if (!incomingRows.length) throw new Error('O ficheiro CSV não contém membros para importar.');
  if (incomingRows.length > 5000) throw new Error('O ficheiro excede o limite de 5.000 membros por importação.');

  const headersRequired = ['id_membro','igreja_id','igreja_nome','name','label','Telefone','sexo','departamento','grupo','batizado','comunhao','celular_whatsapp','bairro','activo','origem_importacao','createdAt','updatedAt'];
  const sh = ensureSheet_(CONFIG.SHEETS.MEMBERS, headersRequired);
  addMissingHeaders_(sh, headersRequired);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const all = getMembers_();
  const otherChurches = all.filter(r => String(r.igreja_id || '').trim() !== church.igreja_id);
  const existingChurch = mode === 'REPLACE' ? [] : all.filter(r => String(r.igreja_id || '').trim() === church.igreja_id);
  const byKey = {};
  existingChurch.forEach(r => byKey[String(r.name || r.id_membro || '').trim()] = r);
  const usedNames = new Set(Object.keys(byKey));
  let imported = 0, updated = 0;

  incomingRows.forEach((raw, index) => {
    const member = sanitizeImportedMemberV543_(raw, church, index, usedNames);
    if (!member) return;
    const originalKey = memberImportValueV543_(raw, ['name','id_membro','membro_id','id','codigo']);
    const key = originalKey && byKey[originalKey] ? originalKey : member.name;
    if (byKey[key]) {
      member.name = key;
      member.id_membro = byKey[key].id_membro || member.id_membro || key;
      member.createdAt = byKey[key].createdAt || member.createdAt;
      byKey[key] = Object.assign({}, byKey[key], member, { updatedAt: new Date().toISOString() });
      updated++;
    } else {
      byKey[member.name] = member;
      imported++;
    }
  });

  const finalRows = otherChurches.concat(Object.keys(byKey).map(k => byKey[k]));
  const existingDataRows = Math.max(sh.getLastRow() - 1, 0);
  if (existingDataRows) sh.getRange(2, 1, existingDataRows, sh.getLastColumn()).clearContent();
  if (finalRows.length) {
    const matrix = finalRows.map(obj => headers.map(h => obj[h] !== undefined ? obj[h] : ''));
    sh.getRange(2, 1, matrix.length, headers.length).setValues(matrix);
  }
  SpreadsheetApp.flush();
  const total = Object.keys(byKey).length;
  audit_(user, 'IMPORTAR_MEMBROS_CSV', 'membros', church.igreja_id, JSON.stringify({ igreja_id: church.igreja_id, mode, imported, updated, total }));
  return { ok: true, church, mode, imported, updated, total, members: getMembersByChurch_(church.igreja_id) };
}

function migrarMembrosSemIgrejaParaIgreja(igrejaId) {
  const church = getChurches_().find(c => String(c.igreja_id) === String(igrejaId || '').trim());
  if (!church) throw new Error('Indique um igreja_id válido.');
  const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEETS.MEMBERS);
  if (!sh || sh.getLastRow() < 2) return { ok: true, actualizados: 0 };
  addMissingHeaders_(sh, ['igreja_id','igreja_nome','updatedAt']);
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  const churchCol = headers.indexOf('igreja_id') + 1;
  const churchNameCol = headers.indexOf('igreja_nome') + 1;
  const updatedCol = headers.indexOf('updatedAt') + 1;
  let count = 0;
  for (let row=2; row<=sh.getLastRow(); row++) {
    if (!String(sh.getRange(row,churchCol).getValue() || '').trim()) {
      sh.getRange(row,churchCol).setValue(church.igreja_id);
      sh.getRange(row,churchNameCol).setValue(church.nome_igreja);
      sh.getRange(row,updatedCol).setValue(new Date().toISOString());
      count++;
    }
  }
  SpreadsheetApp.flush();
  return { ok: true, igreja_id: church.igreja_id, igreja_nome: church.nome_igreja, actualizados: count };
}


function getStats_(user, params) {
  params = params || {};
  const scope = resolveReadScope_(user, params.igreja_id || params.churchId);
  const stats = {};
  const recent = [];

  Object.keys(CONFIG.MODULE_SHEETS).forEach(module => {
    const rows = readSheetObjects_(CONFIG.MODULE_SHEETS[module])
      .filter(r => recordMatchesReadScope_(r, scope))
      .filter(r => recordMatchesUserDepartmentScope_(r, user))
      .filter(isUsableRow_);
    stats[module] = rows.length;
  });

  const submissions = readSheetObjects_(CONFIG.SHEETS.SUBMISSIONS)
    .filter(r => recordMatchesReadScope_(r, scope))
    .sort((a, b) => {
      const ad = parseDate_(a.submittedAt || a.createdAt);
      const bd = parseDate_(b.submittedAt || b.createdAt);
      return Number(bd ? bd.getTime() : 0) - Number(ad ? ad.getTime() : 0);
    })
    .slice(0, 10);

  submissions.forEach(r => recent.push({
    submittedAt: formatApprovalDate_(r.submittedAt || r.createdAt),
    uuid: String(r.uuid || ''),
    module: String(r.module || ''),
    estado_aprovacao: String(r.estado_aprovacao || ''),
    igreja_id: recordChurchId_(r),
    igreja_nome: String(r.igreja_nome || '')
  }));

  return { ok: true, stats, recent, scope: scopeResponse_(scope) };
}


function appendObject_(sheetName, obj) {
  const sh = ensureSheet_(sheetName, Object.keys(obj));
  let headers = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map(String);
  const missing = Object.keys(obj).filter(k => !headers.includes(k));
  if (missing.length) {
    sh.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    headers = headers.concat(missing);
    formatHeader_(sh);
  }
  sh.appendRow(headers.map(h => obj[h] !== undefined ? obj[h] : ''));
}

function ensureSheet_(name, headers) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeader_(sh);
  }
  return sh;
}

function formatHeader_(sh) {
  sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold').setBackground('#e8f0fe');
  sh.setFrozenRows(1);
}

function moduleLabel_(module) {
  const map = {
    plano_cultos_escalas: 'Plano de cultos e escalas',
    relatorio_cultos: 'Relatório dos cultos',
    visitantes: 'Registo de visitantes / membros',
    registo_financeiro: 'Registo financeiro',
    sem_modulo: 'Sem módulo'
  };
  return map[module] || module;
}

function sanitizeSheetName_(name) {
  return String(name || 'Sheet').replace(/[\\/?*\[\]]/g, '_').slice(0, 99);
}


// ============================================================
// AVANTE EVANGELHO 2026 — metas, contribuições e exposição pública
// ============================================================
const AVANTE_ANO_PADRAO = 2026;
const AVANTE_META_HONORARIA_PADRAO = 112000;
const AVANTE_SETUP_CACHE_KEY = 'avante_setup_v5450';
const AVANTE_PUBLIC_CACHE_KEY = 'avante_public_data_v5450';

function executarPreparacaoAvanteV5413() {
  CacheService.getScriptCache().remove(AVANTE_SETUP_CACHE_KEY);
  ensureAvanteSheets_();
  const data = buildAvanteData_();
  Logger.log('Avante Evangelho preparado: ' + data.groups.length + ' grupos, ' + data.overall.igrejas + ' igrejas.');
  return data;
}

function ensureAvanteSheets_() {
  const cache = CacheService.getScriptCache();
  if (cache.get(AVANTE_SETUP_CACHE_KEY) === '1') return;

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const groupsHeaders = ['ano','grupo_id','nome_grupo','ordem','meta_individual','meta_grupo','activo'];
    const churchesHeaders = ['ano','grupo_id','ordem_grupo','igreja_id','igreja_nome','meta_individual','activo','origem'];
    const contributionHeaders = ['id_contribuicao','ano','grupo_id','igreja_id','igreja_nome','fase','data_contribuicao','valor','estado','referencia','observacoes','registado_por','registado_por_nome','confirmado_por','confirmado_em','createdAt','updatedAt','anulado_por','anulado_em'];
    const configHeaders = ['key','value','updatedAt','updatedBy'];
    const historyHeaders = ['ano','grupo_id','igreja_id','igreja_nome','total','estado','origem','observacoes','updatedAt','updatedBy'];

    const groupSheet = ensureSheet_(CONFIG.SHEETS.AVANTE_GROUPS, groupsHeaders);
    const churchSheet = ensureSheet_(CONFIG.SHEETS.AVANTE_CHURCHES, churchesHeaders);
    const contributionSheet = ensureSheet_(CONFIG.SHEETS.AVANTE_CONTRIBUTIONS, contributionHeaders);
    const configSheet = ensureSheet_(CONFIG.SHEETS.AVANTE_CONFIG, configHeaders);
    const historySheet = ensureSheet_(CONFIG.SHEETS.AVANTE_HISTORY, historyHeaders);
    addMissingHeaders_(groupSheet, groupsHeaders);
    addMissingHeaders_(churchSheet, churchesHeaders);
    addMissingHeaders_(contributionSheet, contributionHeaders);
    addMissingHeaders_(configSheet, configHeaders);
    addMissingHeaders_(historySheet, historyHeaders);

    if (groupSheet.getLastRow() < 2) {
      const groups = [
        [2026,'G1','Grupo 1',1,76650,383250,'SIM'],
        [2026,'G2','Grupo 2',2,63000,189000,'SIM'],
        [2026,'G3','Grupo 3',3,37800,189000,'SIM'],
        [2026,'G4','Grupo 4',4,25200,75600,'SIM'],
        [2026,'G5','Grupo 5',5,14700,102900,'SIM'],
        [2026,'G6','Grupo 6',6,6825,40950,'SIM'],
        [2026,'G7','Grupo 7',7,5250,31500,'SIM'],
        [2026,'G8','Grupo 8',8,2625,15750,'SIM']
      ];
      groupSheet.getRange(2,1,groups.length,groupsHeaders.length).setValues(groups);
      groupSheet.getRange(2,5,groups.length,2).setNumberFormat('#,##0.00');
    }

    if (churchSheet.getLastRow() < 2) {
      const churches = avanteInitialChurches_();
      churchSheet.getRange(2,1,churches.length,churchesHeaders.length).setValues(churches);
      churchSheet.getRange(2,6,churches.length,1).setNumberFormat('#,##0.00');
    }

    if (configSheet.getLastRow() < 2) {
      const now = new Date();
      const rows = [
        ['ano_activo','2026',now,'INSTALACAO_V54_1_3'],
        ['meta_honoraria','112000',now,'INSTALACAO_V54_1_3'],
        ['evento_activo','SIM',now,'INSTALACAO_V54_1_3'],
        ['actualizacao_publica_segundos','5',now,'INSTALACAO_V54_1_3'],
        ['titulo_publico','Avante Evangelho 2026',now,'INSTALACAO_V54_1_3'],
        ['subtitulo_publico','Contribuições financeiras das igrejas — Distrito da Matola',now,'INSTALACAO_V54_1_3']
      ];
      configSheet.getRange(2,1,rows.length,configHeaders.length).setValues(rows);
    }

    ensureAvanteHistoricalSeed_(historySheet);
    formatHeader_(groupSheet);
    formatHeader_(churchSheet);
    formatHeader_(configSheet);
    formatHeader_(historySheet);
    if (historySheet.getLastRow() > 1) historySheet.getRange(2,5,historySheet.getLastRow()-1,1).setNumberFormat('#,##0.00');
    SpreadsheetApp.flush();
    cache.put(AVANTE_SETUP_CACHE_KEY, '1', 21600);
  } finally {
    lock.releaseLock();
  }
}

function avanteInitialChurches_() {
  // As quatro igrejas assinaladas como RECONSTRUIDO_GRUPO_5 completam as
  // sete igrejas exigidas pela meta global do Grupo 5 (7 x 14.700 = 102.900).
  return [
    [2026,'G1',1,'matola_cidade','Igreja do Nazareno de Matola Cidade',76650,'SIM','EXCEL_2026'],
    [2026,'G1',2,'liberdade','Igreja do Nazareno de Liberdade',76650,'SIM','EXCEL_2026'],
    [2026,'G1',3,'bairro_da_matola','Igreja do Nazareno do Bairro da Matola',76650,'SIM','EXCEL_2026'],
    [2026,'G1',4,'fomento','Igreja do Nazareno de Fomento',76650,'SIM','EXCEL_2026'],
    [2026,'G1',5,'infulene','Igreja do Nazareno de Infulene',76650,'SIM','EXCEL_2026'],

    [2026,'G2',1,'massinwane','Igreja do Nazareno de Massinwane',63000,'SIM','EXCEL_2026'],
    [2026,'G2',2,'boquisso','Igreja do Nazareno de Boquisso',63000,'SIM','EXCEL_2026'],
    [2026,'G2',3,'khongolote_1','Igreja do Nazareno de Khongolote 1',63000,'SIM','EXCEL_2026'],

    [2026,'G3',1,'ndlavela','Igreja do Nazareno de Ndlavela',37800,'SIM','EXCEL_2026'],
    [2026,'G3',2,'t3','Igreja do Nazareno de T-3',37800,'SIM','EXCEL_2026'],
    [2026,'G3',3,'matola_a','Igreja do Nazareno de Matola A',37800,'SIM','EXCEL_2026'],
    [2026,'G3',4,'km_15','Igreja do Nazareno de KM 15',37800,'SIM','EXCEL_2026'],
    [2026,'G3',5,'nkobe','Igreja do Nazareno de Nkobe',37800,'SIM','EXCEL_2026'],

    [2026,'G4',1,'malhampsane','Igreja do Nazareno de Malhampsane',25200,'SIM','EXCEL_2026'],
    [2026,'G4',2,'tchumene','Igreja do Nazareno de Tchumene',25200,'SIM','EXCEL_2026'],
    [2026,'G4',3,'djuba','Igreja do Nazareno de Djuba',25200,'SIM','EXCEL_2026'],

    [2026,'G5',1,'tsalala','Igreja do Nazareno de Tsalala',14700,'SIM','EXCEL_2026'],
    [2026,'G5',2,'licuacuanine','Igreja do Nazareno de Licuaçuanine',14700,'SIM','EXCEL_2026'],
    [2026,'G5',3,'khongolote_2','Igreja do Nazareno de Khongolote 2',14700,'SIM','EXCEL_2026'],
    [2026,'G5',4,'machava_sede','Igreja do Nazareno de Machava-Sede',14700,'SIM','RECONSTRUIDO_GRUPO_5'],
    [2026,'G5',5,'matola_rio_b','Igreja do Nazareno de Matola Rio B',14700,'SIM','RECONSTRUIDO_GRUPO_5'],
    [2026,'G5',6,'mutate','Igreja do Nazareno de Mutate',14700,'SIM','RECONSTRUIDO_GRUPO_5'],
    [2026,'G5',7,'moamba','Igreja do Nazareno de Moamba',14700,'SIM','RECONSTRUIDO_GRUPO_5'],

    [2026,'G6',1,'mussumbuluco','Igreja do Nazareno de Mussumbuluco',6825,'SIM','EXCEL_2026'],
    [2026,'G6',2,'sao_damanso_makhelene','Igreja do Nazareno de São Damanso/Makhelene',6825,'SIM','EXCEL_2026'],
    [2026,'G6',3,'mulotane','Igreja do Nazareno de Mulotane',6825,'SIM','EXCEL_2026'],
    [2026,'G6',4,'muhalazi','Igreja do Nazareno de Muhalazi',6825,'SIM','EXCEL_2026'],
    [2026,'G6',5,'mulotane_bili','Igreja do Nazareno de Mulotane-Bili',6825,'SIM','EXCEL_2026'],
    [2026,'G6',6,'xinyenpfana','Igreja do Nazareno de Xinyenpfana',6825,'SIM','EXCEL_2026'],

    [2026,'G7',1,'vale_infulene','Igreja do Nazareno de Vale Infulene',5250,'SIM','EXCEL_2026'],
    [2026,'G7',2,'matola_gare','Igreja do Nazareno de Matola Gare',5250,'SIM','EXCEL_2026'],
    [2026,'G7',3,'intaka','Igreja do Nazareno de Intaka',5250,'SIM','EXCEL_2026'],
    [2026,'G7',4,'malhampsane_ii','Igreja do Nazareno de Malhampsane II',5250,'SIM','EXCEL_2026'],
    [2026,'G7',5,'nwamatibyana','Igreja do Nazareno de Nwamatibyana',5250,'SIM','EXCEL_2026'],
    [2026,'G7',6,'ndlavela_1','Igreja do Nazareno de Ndlavela 1',5250,'SIM','EXCEL_2026'],

    [2026,'G8',1,'tenga','Igreja do Nazareno de Tenga',2625,'SIM','EXCEL_2026'],
    [2026,'G8',2,'makopene','Igreja do Nazareno de Makopene',2625,'SIM','EXCEL_2026'],
    [2026,'G8',3,'sabie','Igreja do Nazareno de Sabie',2625,'SIM','EXCEL_2026'],
    [2026,'G8',4,'tchonissa','Igreja do Nazareno de Tchonissa',2625,'SIM','EXCEL_2026'],
    [2026,'G8',5,'ressano_garcia','Igreja do Nazareno de Ressano Garcia',2625,'SIM','EXCEL_2026'],
    [2026,'G8',6,'emmanuel_beluluana','Igreja do Nazareno Emmanuel Beluluana',2625,'SIM','EXCEL_2026']
  ];
}



function executarPreparacaoAvanteV5450() {
  CacheService.getScriptCache().remove(AVANTE_SETUP_CACHE_KEY);
  clearAvantePublicCache_();
  ensureAvanteSheets_();
  const data = buildAvanteData_();
  Logger.log('Histórico Avante preparado: ' + (data.comparison?.years || []).length + ' anos disponíveis.');
  return data;
}

function arquivarAnoActivoAvanteV5450() {
  ensureAvanteSheets_();
  const cfg = getAvanteConfig_();
  if (cfg.eventoActivo) {
    throw new Error('O evento ainda está activo. Altere evento_activo para NAO em Avante_Configuracao apenas depois de concluir a 2.ª contribuição.');
  }
  const data = buildAvanteData_();
  const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEETS.AVANTE_HISTORY);
  const existing = sh.getLastRow() > 1 ? sh.getDataRange().getValues() : [];
  const headers = existing.length ? existing[0].map(String) : [];
  const yi = headers.indexOf('ano'), ci = headers.indexOf('igreja_id');
  const rowByKey = {};
  if (existing.length > 1 && yi >= 0 && ci >= 0) {
    for (let i=1; i<existing.length; i++) rowByKey[String(existing[i][yi])+'|'+String(existing[i][ci])] = i+1;
  }
  const now = new Date();
  let inserted = 0, updated = 0;
  (data.groups || []).forEach(g => (g.churches || []).forEach(c => {
    const obj = {
      ano:data.year,
      grupo_id:g.id,
      igreja_id:c.id,
      igreja_nome:c.name,
      total:roundMoneyV541_(c.total),
      estado:'FINAL',
      origem:'FECHO_ANUAL_AVANTE',
      observacoes:'Total arquivado após encerramento do evento.',
      updatedAt:now,
      updatedBy:'ARQUIVO_V54_5_0'
    };
    const key=String(data.year)+'|'+String(c.id);
    if (rowByKey[key]) { updateRowFields_(sh,rowByKey[key],obj); updated++; }
    else { appendObject_(CONFIG.SHEETS.AVANTE_HISTORY,obj); inserted++; }
  }));
  clearAvantePublicCache_();
  return { ok:true, year:data.year, inserted, updated, message:'Ano '+data.year+' arquivado no histórico anual.' };
}

function avanteHistoricalSeedRows_() {
  // Dados anuais fornecidos pelo Distrito. 2024 e 2025 são totais finais.
  // O ano 2026 não é duplicado aqui: continua a ser calculado em directo
  // a partir da folha Avante_Contribuicoes.
  return [[2024,"G1","matola_cidade","Matola cidade",210062.71,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G1","matola_cidade","Matola cidade",449932.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G1","liberdade","B. Liberdade",79965.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G1","liberdade","B. Liberdade",123825.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G1","bairro_da_matola","B. Matola",96293.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G1","bairro_da_matola","B. Matola",120007.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G1","fomento","Fomento",84296.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G1","fomento","Fomento",82777.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G1","infulene","Infulene",95340.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G1","infulene","Infulene",159590.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G2","massinwane","Massinwane",62994.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G2","massinwane","Massinwane",65500.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G2","boquisso","Boquisso",24176.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G2","boquisso","Boquisso",67310.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G2","khongolote_1","Kongolote 1",61175.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G2","khongolote_1","Kongolote 1",63213.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G3","ndlavela","Ndlavela",41620.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G3","ndlavela","Ndlavela",41292.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G3","t3","T3",43422.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G3","t3","T3",47230.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G3","nkobe","Nkombe",54882.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G3","nkobe","Nkombe",48965.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G3","km_15","Km 15",42395.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G3","km_15","Km 15",40950.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G4","djuba","Djuba",29514.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G4","djuba","Djuba",32137.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G3","matola_a","Matola A",45080.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G3","matola_a","Matola A",26782.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G4","malhampsane","Malhampsene",27690.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G4","malhampsane","Malhampsene",28657.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G4","tchumene","Tchumene",25692.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G4","tchumene","Tchumene",27731.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G5","tsalala","Tsalala",16171.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G5","tsalala","Tsalala",16940.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G5","khongolote_2","Kongolote 2",16053.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G5","khongolote_2","Kongolote 2",15818.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G5","machava_sede","Machava Sede",15380.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G5","machava_sede","Machava Sede",21311.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G5","moamba","Moamba",14495.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G5","moamba","Moamba",14700.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G5","licuacuanine","Licuacuanine",16700.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G5","licuacuanine","Licuacuanine",16280.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G5","matola_rio_b","Matola Rio B",18540.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G5","matola_rio_b","Matola Rio B",18523.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G5","mutate","Mutatel",15120.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G5","mutate","Mutatel",16230.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G6","mussumbuluco","Mussumbuluko",7180.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G6","mussumbuluco","Mussumbuluko",5320.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G6","sao_damanso_makhelene","Makhelene",7690.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G6","mulotane","Mulotana",9460.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G6","mulotane","Mulotana",15674.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G6","muhalazi","Muhalaze",7881.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G6","muhalazi","Muhalaze",7700.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G6","mulotane_bili","Mulotana Bily",21090.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G6","mulotane_bili","Mulotana Bily",21657.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G6","xinyenpfana","Xinyepfana",10090.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G6","xinyenpfana","Xinyepfana",8200.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G7","vale_infulene","Vale de Infulene",6320.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G7","vale_infulene","Vale de Infulene",8438.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G7","matola_gare","Matola Gare",5870.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G7","matola_gare","Matola Gare",7060.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G7","intaka","Intaka",6445.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G7","intaka","Intaka",6770.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G7","nwamatibyana","Matibyana",8066.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G7","nwamatibyana","Matibyana",7845.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G7","ndlavela_1","Ndlavela 1",4000.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G7","ndlavela_1","Ndlavela 1",4686.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G7","malhampsane_ii","Malhampsene 2",5665.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G7","malhampsane_ii","Malhampsene 2",6505.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G8","tenga","Tenga",6880.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G8","tenga","Tenga",5125.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G8","makopene","Macopene",6100.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G8","makopene","Macopene",5950.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G8","sabie","Sabie",3015.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G8","sabie","Sabie",3020.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G8","tchonissa","Txonissa",2552.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G8","tchonissa","Txonissa",3120.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2024,"G8","ressano_garcia","Ressano Garcia",2700.0,"FINAL","avante evangelho resumos anuais.xlsx",""],[2025,"G8","ressano_garcia","Ressano Garcia",4375.0,"FINAL","avante evangelho resumos anuais.xlsx",""]];
}

function ensureAvanteHistoricalSeed_(historySheet) {
  if (!historySheet) return;
  const rows = avanteHistoricalSeedRows_();
  const existing = new Set();
  if (historySheet.getLastRow() > 1) {
    const values = historySheet.getDataRange().getValues();
    const headers = values[0].map(String);
    const yi = headers.indexOf('ano');
    const ci = headers.indexOf('igreja_id');
    for (let i = 1; i < values.length; i++) {
      const key = String(values[i][yi] || '') + '|' + String(values[i][ci] || '').trim();
      if (key !== '|') existing.add(key);
    }
  }
  const now = new Date();
  const missing = rows.filter(r => !existing.has(String(r[0]) + '|' + String(r[2])))
    .map(r => [r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],now,'INSTALACAO_V54_5_0']);
  if (missing.length) {
    historySheet.getRange(historySheet.getLastRow()+1,1,missing.length,10).setValues(missing);
  }
}

function avanteHistoricalRows_() {
  ensureAvanteSheets_();
  return readSheetObjects_(CONFIG.SHEETS.AVANTE_HISTORY)
    .map(r => ({
      year: Number(r.ano || 0),
      groupId: String(r.grupo_id || '').trim(),
      churchId: String(r.igreja_id || '').trim(),
      churchName: String(r.igreja_nome || '').trim(),
      total: roundMoneyV541_(parseMoney_(r.total)),
      status: String(r.estado || 'FINAL').trim().toUpperCase()
    }))
    .filter(r => r.year > 0 && r.churchId && Number.isFinite(r.total));
}

function avanteVariation_(baseValue, currentValue) {
  if (baseValue === null || baseValue === undefined || currentValue === null || currentValue === undefined) {
    return { comparable:false, delta:null, growthPct:null };
  }
  const base = Number(baseValue);
  const current = Number(currentValue);
  return {
    comparable:true,
    delta:roundMoneyV541_(current-base),
    growthPct:base !== 0 ? (current-base)/base*100 : null
  };
}

function buildAvanteComparison_(currentData) {
  const historical = avanteHistoricalRows_();
  const currentYear = Number(currentData.year);
  const yearSet = new Set(historical.map(r => r.year));
  yearSet.add(currentYear);
  const years = Array.from(yearSet).sort((a,b) => a-b);

  const churchMaster = {};
  const groupMaster = {};
  (currentData.groups || []).forEach(g => {
    groupMaster[g.id] = { id:g.id, name:g.name, order:Number(g.order||0) };
    (g.churches || []).forEach(c => {
      churchMaster[c.id] = { id:c.id, name:c.name, groupId:g.id, groupName:g.name, order:Number(c.order||0) };
    });
  });
  historical.forEach(r => {
    if (!groupMaster[r.groupId]) groupMaster[r.groupId] = { id:r.groupId, name:r.groupId, order:999 };
    if (!churchMaster[r.churchId]) churchMaster[r.churchId] = {
      id:r.churchId, name:r.churchName || r.churchId, groupId:r.groupId,
      groupName:(groupMaster[r.groupId]||{}).name || r.groupId, order:999
    };
  });

  const values = {};
  historical.forEach(r => {
    if (!values[r.churchId]) values[r.churchId] = {};
    values[r.churchId][r.year] = r.total;
  });
  (currentData.groups || []).forEach(g => (g.churches || []).forEach(c => {
    if (!values[c.id]) values[c.id] = {};
    values[c.id][currentYear] = roundMoneyV541_(c.total);
  }));

  const yearSummaries = years.map(year => {
    let total = 0, churchesWithData = 0;
    Object.keys(churchMaster).forEach(id => {
      const v = values[id] && Object.prototype.hasOwnProperty.call(values[id], year) ? values[id][year] : null;
      if (v !== null && v !== undefined) {
        total += Number(v || 0);
        if (Number(v || 0) > 0) churchesWithData++;
      }
    });
    return {
      year,
      total:roundMoneyV541_(total),
      churchesWithData,
      status:year === currentYear ? (currentData.eventoActivo ? 'PROVISORIO' : 'FINAL') : 'FINAL'
    };
  });

  const groups = Object.values(groupMaster).sort((a,b) => (a.order-b.order) || a.name.localeCompare(b.name,'pt')).map(g => {
    const annual = {};
    years.forEach(year => {
      let total = 0, has = false;
      Object.values(churchMaster).filter(c => c.groupId === g.id).forEach(c => {
        if (values[c.id] && Object.prototype.hasOwnProperty.call(values[c.id], year)) {
          total += Number(values[c.id][year] || 0);
          has = true;
        }
      });
      annual[year] = has ? roundMoneyV541_(total) : null;
    });
    return { id:g.id, name:g.name, values:annual };
  });

  const churches = Object.values(churchMaster).sort((a,b) => a.name.localeCompare(b.name,'pt')).map(c => {
    const annual = {};
    years.forEach(year => annual[year] = values[c.id] && Object.prototype.hasOwnProperty.call(values[c.id], year) ? values[c.id][year] : null);
    return { id:c.id, name:c.name, groupId:c.groupId, groupName:c.groupName, values:annual };
  });

  const previousYear = years.filter(y => y < currentYear).slice(-1)[0] || null;
  const districtBase = yearSummaries.find(x => x.year === previousYear);
  const districtCurrent = yearSummaries.find(x => x.year === currentYear);
  const districtVariation = avanteVariation_(districtBase ? districtBase.total : null, districtCurrent ? districtCurrent.total : null);

  const movements = previousYear ? churches.map(c => {
    const variation = avanteVariation_(c.values[previousYear], c.values[currentYear]);
    return { id:c.id, name:c.name, groupId:c.groupId, groupName:c.groupName, base:c.values[previousYear], current:c.values[currentYear], comparable:variation.comparable, delta:variation.delta, growthPct:variation.growthPct };
  }).filter(x => x.comparable && (!currentData.eventoActivo || Number(x.current||0) > 0)) : [];

  return {
    years:yearSummaries,
    yearNumbers:years,
    currentYear,
    previousYear,
    provisional:!!currentData.eventoActivo,
    district:{ baseYear:previousYear, currentYear, baseTotal:districtBase ? districtBase.total : null, currentTotal:districtCurrent ? districtCurrent.total : null, ...districtVariation },
    groups,
    churches,
    topIncreases:movements.slice().sort((a,b) => (b.delta-a.delta)).slice(0,8),
    topDeclines:movements.slice().sort((a,b) => (a.delta-b.delta)).slice(0,8),
    note:currentData.eventoActivo
      ? 'O ano ' + currentYear + ' está em curso. Os valores e as variações são provisórios até ao encerramento da 2.ª contribuição.'
      : 'O ano ' + currentYear + ' encontra-se encerrado e é apresentado como total final.'
  };
}

function getAvanteConfig_() {
  ensureAvanteSheets_();
  const cfg = {};
  readSheetObjects_(CONFIG.SHEETS.AVANTE_CONFIG).forEach(r => cfg[String(r.key || '').trim()] = r.value);
  return {
    ano: Number(cfg.ano_activo || AVANTE_ANO_PADRAO) || AVANTE_ANO_PADRAO,
    metaHonoraria: roundMoneyV541_(parseMoney_(cfg.meta_honoraria || AVANTE_META_HONORARIA_PADRAO)),
    eventoActivo: yes_(cfg.evento_activo || 'SIM'),
    refreshSeconds: Math.max(3, Number(cfg.actualizacao_publica_segundos || 5) || 5),
    title: String(cfg.titulo_publico || 'Avante Evangelho 2026'),
    subtitle: String(cfg.subtitulo_publico || 'Contribuições financeiras das igrejas — Distrito da Matola')
  };
}

function avanteActiveRows_(sheetName, year) {
  return readSheetObjects_(sheetName).filter(r => {
    const rowYear = Number(r.ano || year) || year;
    return rowYear === year && !['NAO','NÃO','NO','INACTIVO','INATIVO'].includes(String(r.activo || 'SIM').trim().toUpperCase());
  });
}

function normalizeAvantePhase_(value) {
  const s = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  if (['PRIMEIRA','1','1A','1ª','PRIMEIRA_CONTRIBUICAO','PRIMEIRACONTRIBUICAO'].includes(s)) return 'PRIMEIRA';
  if (['SEGUNDA','2','2A','2ª','SEGUNDA_CONTRIBUICAO','SEGUNDACONTRIBUICAO'].includes(s)) return 'SEGUNDA';
  return String(value || '').trim().toUpperCase();
}

function isAvanteConfirmedState_(value) {
  return ['CONFIRMADA','CONFIRMADO','APROVADA','APROVADO'].includes(String(value || '').trim().toUpperCase());
}

function avanteConfirmedContributions_(year) {
  return readSheetObjects_(CONFIG.SHEETS.AVANTE_CONTRIBUTIONS).filter(r =>
    (Number(r.ano || year) || year) === year && isAvanteConfirmedState_(r.estado)
  );
}

function buildAvanteData_() {
  ensureAvanteSheets_();
  const cfg = getAvanteConfig_();
  const groups = avanteActiveRows_(CONFIG.SHEETS.AVANTE_GROUPS, cfg.ano)
    .sort((a,b) => Number(a.ordem || 0) - Number(b.ordem || 0));
  const churches = avanteActiveRows_(CONFIG.SHEETS.AVANTE_CHURCHES, cfg.ano);
  const contributions = avanteConfirmedContributions_(cfg.ano);

  const sums = {};
  contributions.forEach(r => {
    const churchId = String(r.igreja_id || '').trim();
    const phase = normalizeAvantePhase_(r.fase);
    if (!churchId || !['PRIMEIRA','SEGUNDA'].includes(phase)) return;
    if (!sums[churchId]) sums[churchId] = { PRIMEIRA:0, SEGUNDA:0 };
    sums[churchId][phase] += roundMoneyV541_(parseMoney_(r.valor));
  });

  const groupData = groups.map(g => {
    const groupId = String(g.grupo_id || '').trim();
    const groupChurches = churches.filter(c => String(c.grupo_id || '').trim() === groupId).map(c => {
      const churchId = String(c.igreja_id || '').trim();
      const meta = roundMoneyV541_(parseMoney_(c.meta_individual || g.meta_individual));
      const primeira = roundMoneyV541_((sums[churchId] && sums[churchId].PRIMEIRA) || 0);
      const segunda = roundMoneyV541_((sums[churchId] && sums[churchId].SEGUNDA) || 0);
      const total = roundMoneyV541_(primeira + segunda);
      return {
        id: churchId,
        name: String(c.igreja_nome || churchId),
        groupId,
        groupName: String(g.nome_grupo || groupId),
        order: Number(c.ordem_grupo || 0),
        meta,
        primeira,
        segunda,
        total,
        segundaAberta: primeira >= meta,
        honoraria: total >= cfg.metaHonoraria,
        progress: meta ? total / meta * 100 : 0
      };
    }).sort((a,b) => (b.total - a.total) || (a.order - b.order) || a.name.localeCompare(b.name, 'pt'));

    const metaCalculada = roundMoneyV541_(groupChurches.reduce((s,c) => s + c.meta, 0));
    const metaConfigurada = roundMoneyV541_(parseMoney_(g.meta_grupo));
    return {
      id: groupId,
      name: String(g.nome_grupo || groupId),
      order: Number(g.ordem || 0),
      metaIndividual: roundMoneyV541_(parseMoney_(g.meta_individual)),
      metaGrupo: metaCalculada,
      metaGrupoConfigurada: metaConfigurada,
      metaConsistente: Math.abs(metaCalculada - metaConfigurada) < 0.01,
      primeiraTotal: roundMoneyV541_(groupChurches.reduce((s,c) => s + c.primeira, 0)),
      segundaTotal: roundMoneyV541_(groupChurches.reduce((s,c) => s + c.segunda, 0)),
      total: roundMoneyV541_(groupChurches.reduce((s,c) => s + c.total, 0)),
      churches: groupChurches
    };
  });

  const allChurches = groupData.reduce((a,g) => a.concat(g.churches), []);
  const honorarias = allChurches.filter(c => c.honoraria).sort((a,b) => (b.total - a.total) || a.name.localeCompare(b.name, 'pt'));
  const overall = {
    meta: roundMoneyV541_(groupData.reduce((s,g) => s + g.metaGrupo, 0)),
    primeira: roundMoneyV541_(groupData.reduce((s,g) => s + g.primeiraTotal, 0)),
    segunda: roundMoneyV541_(groupData.reduce((s,g) => s + g.segundaTotal, 0)),
    total: roundMoneyV541_(groupData.reduce((s,g) => s + g.total, 0)),
    igrejas: allChurches.length,
    honorarias: honorarias.length,
    elegiveisSegunda: allChurches.filter(c => c.segundaAberta).length
  };

  const result = {
    ok: true,
    backendVersion: '54.5.1',
    year: cfg.ano,
    title: cfg.title,
    subtitle: cfg.subtitle,
    metaHonoraria: cfg.metaHonoraria,
    eventoActivo: cfg.eventoActivo,
    refreshSeconds: cfg.refreshSeconds,
    updatedAt: new Date().toISOString(),
    groups: groupData,
    honorarias,
    overall
  };
  result.comparison = buildAvanteComparison_(result);
  return result;
}

function getAvantePublicData_() {
  const cache = CacheService.getScriptCache();
  const raw = cache.get(AVANTE_PUBLIC_CACHE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (_err) { cache.remove(AVANTE_PUBLIC_CACHE_KEY); }
  }
  const data = buildAvanteData_();
  cache.put(AVANTE_PUBLIC_CACHE_KEY, JSON.stringify(data), 3);
  return data;
}

function clearAvantePublicCache_() {
  CacheService.getScriptCache().remove(AVANTE_PUBLIC_CACHE_KEY);
}

function getAvanteAdminData_(user) {
  const data = buildAvanteData_();
  const contributions = readSheetObjects_(CONFIG.SHEETS.AVANTE_CONTRIBUTIONS)
    .filter(r => Number(r.ano || data.year) === data.year)
    .sort((a,b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  data.contributions = contributions.slice(0,100).map(r => ({
    id: String(r.id_contribuicao || ''),
    igrejaId: String(r.igreja_id || ''),
    igrejaNome: String(r.igreja_nome || ''),
    grupoId: String(r.grupo_id || ''),
    fase: normalizeAvantePhase_(r.fase),
    data: dateIso_(r.data_contribuicao),
    valor: roundMoneyV541_(parseMoney_(r.valor)),
    estado: isAvanteConfirmedState_(r.estado) ? 'CONFIRMADA' : String(r.estado || ''),
    referencia: String(r.referencia || ''),
    observacoes: String(r.observacoes || ''),
    registadoPor: String(r.registado_por_nome || r.registado_por || ''),
    updatedAt: r.updatedAt || r.createdAt || ''
  }));
  data.canManage = isDistrictUser_(user) && (user.approveAreas || []).includes('FINANCAS');
  return data;
}

function validateAvanteManager_(user) {
  if (!isDistrictUser_(user)) throw new Error('A gestão do Avante Evangelho está reservada aos utilizadores distritais.');
  if (!(user.approveAreas || []).includes('FINANCAS')) throw new Error('Apenas o Tesoureiro Distrital ou o Administrador de IT pode confirmar contribuições do Avante Evangelho.');
}

function findAvanteChurch_(year, churchId) {
  return avanteActiveRows_(CONFIG.SHEETS.AVANTE_CHURCHES, year)
    .find(r => String(r.igreja_id || '').trim() === String(churchId || '').trim()) || null;
}

function findAvanteContributionRow_(sh, year, churchId, phase) {
  if (!sh || sh.getLastRow() < 2) return null;
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(String);
  const y = headers.indexOf('ano'), c = headers.indexOf('igreja_id'), f = headers.indexOf('fase');
  if (y < 0 || c < 0 || f < 0) return null;
  for (let i=1; i<values.length; i++) {
    if (Number(values[i][y]) === Number(year) && String(values[i][c]) === String(churchId) && String(values[i][f]).toUpperCase() === String(phase).toUpperCase()) return i+1;
  }
  return null;
}

function saveAvanteContribution_(user, payload) {
  validateAvanteManager_(user);
  ensureAvanteSheets_();
  const cfg = getAvanteConfig_();
  if (!cfg.eventoActivo) throw new Error('O evento Avante Evangelho encontra-se encerrado para lançamentos.');
  const data = payload.data || {};
  const churchId = String(data.igreja_id || '').trim();
  const phase = normalizeAvantePhase_(data.fase);
  const value = roundMoneyV541_(parseMoney_(data.valor));
  if (!churchId) throw new Error('Seleccione a igreja.');
  if (!['PRIMEIRA','SEGUNDA'].includes(phase)) throw new Error('Seleccione a 1.ª ou a 2.ª contribuição.');
  if (!(value > 0)) throw new Error('O valor da contribuição deve ser superior a zero.');
  const church = findAvanteChurch_(cfg.ano, churchId);
  if (!church) throw new Error('A igreja seleccionada não consta da configuração do Avante Evangelho ' + cfg.ano + '.');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const confirmed = avanteConfirmedContributions_(cfg.ano);
    const currentFirst = confirmed
      .filter(r => String(r.igreja_id) === churchId && normalizeAvantePhase_(r.fase) === 'PRIMEIRA')
      .reduce((s,r) => s + parseMoney_(r.valor), 0);
    const currentSecond = confirmed
      .filter(r => String(r.igreja_id) === churchId && normalizeAvantePhase_(r.fase) === 'SEGUNDA')
      .reduce((s,r) => s + parseMoney_(r.valor), 0);
    const meta = roundMoneyV541_(parseMoney_(church.meta_individual));
    const candidateFirst = phase === 'PRIMEIRA' ? value : currentFirst;

    if (phase === 'SEGUNDA' && currentFirst < meta) {
      throw new Error('A 2.ª contribuição está vedada: a igreja não atingiu a meta de ' + meta.toFixed(2) + ' MT na 1.ª contribuição.');
    }
    if (phase === 'PRIMEIRA' && currentSecond > 0 && candidateFirst < meta) {
      throw new Error('Não é possível reduzir a 1.ª contribuição para valor inferior à meta porque já existe uma 2.ª contribuição confirmada.');
    }

    const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEETS.AVANTE_CONTRIBUTIONS);
    const row = findAvanteContributionRow_(sh, cfg.ano, churchId, phase);
    const now = new Date();
    const contributionDate = data.data_contribuicao ? new Date(String(data.data_contribuicao) + 'T12:00:00') : now;
    if (isNaN(contributionDate.getTime())) throw new Error('Data da contribuição inválida.');
    const id = row ? String(sh.getRange(row, 1).getValue() || Utilities.getUuid()) : Utilities.getUuid();
    const obj = {
      id_contribuicao: id,
      ano: cfg.ano,
      grupo_id: String(church.grupo_id || ''),
      igreja_id: churchId,
      igreja_nome: String(church.igreja_nome || churchId),
      fase: phase,
      data_contribuicao: contributionDate,
      valor: value,
      estado: 'CONFIRMADA',
      referencia: String(data.referencia || '').trim(),
      observacoes: String(data.observacoes || '').trim(),
      registado_por: String(user.username || ''),
      registado_por_nome: String(user.name || user.username || ''),
      confirmado_por: String(user.username || ''),
      confirmado_em: now,
      createdAt: row ? sh.getRange(row, Math.max(1, sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String).indexOf('createdAt')+1)).getValue() || now : now,
      updatedAt: now,
      anulado_por: '',
      anulado_em: ''
    };
    if (row) updateRowFields_(sh, row, obj); else appendObject_(CONFIG.SHEETS.AVANTE_CONTRIBUTIONS, obj);
    audit_(user, row ? 'AVANTE_ACTUALIZAR' : 'AVANTE_REGISTAR', 'avante_evangelho', id, JSON.stringify({igreja_id:churchId, fase, valor:value}));
    clearAvantePublicCache_();
    return getAvanteAdminData_(user);
  } finally {
    lock.releaseLock();
  }
}

function deleteAvanteContribution_(user, payload) {
  validateAvanteManager_(user);
  ensureAvanteSheets_();
  const id = String(payload.id_contribuicao || (payload.data && payload.data.id_contribuicao) || '').trim();
  if (!id) throw new Error('Identificador da contribuição não informado.');
  const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEETS.AVANTE_CONTRIBUTIONS);
  if (!sh || sh.getLastRow() < 2) throw new Error('Contribuição não encontrada.');
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(String);
  const idx = headers.indexOf('id_contribuicao');
  if (idx < 0) throw new Error('Estrutura da folha de contribuições inválida.');
  let row = null;
  let rowValues = null;
  for (let i=1; i<values.length; i++) if (String(values[i][idx]) === id) { row=i+1; rowValues=values[i]; break; }
  if (!row) throw new Error('Contribuição não encontrada.');
  const phaseCol = headers.indexOf('fase');
  const churchCol = headers.indexOf('igreja_id');
  const yearCol = headers.indexOf('ano');
  const phase = phaseCol >= 0 ? normalizeAvantePhase_(rowValues[phaseCol]) : '';
  const churchId = churchCol >= 0 ? String(rowValues[churchCol] || '') : '';
  const year = yearCol >= 0 ? Number(rowValues[yearCol] || AVANTE_ANO_PADRAO) : AVANTE_ANO_PADRAO;
  if (phase === 'PRIMEIRA') {
    const secondExists = avanteConfirmedContributions_(year).some(r => String(r.igreja_id || '') === churchId && normalizeAvantePhase_(r.fase) === 'SEGUNDA');
    if (secondExists) throw new Error('Anule primeiro a 2.ª contribuição. A 1.ª contribuição não pode ser anulada enquanto existir uma 2.ª contribuição confirmada.');
  }
  const now = new Date();
  updateRowFields_(sh, row, {
    estado:'ANULADA',
    observacoes:String(payload.motivo || 'Anulada pelo utilizador').trim(),
    anulado_por:String(user.username || ''),
    anulado_em:now,
    updatedAt:now
  });
  audit_(user, 'AVANTE_ANULAR', 'avante_evangelho', id, String(payload.motivo || ''));
  clearAvantePublicCache_();
  return getAvanteAdminData_(user);
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// GUIA DA ASSEMBLEIA DISTRITAL — Resumo de Delegados
// Lê a folha "Dados" e devolve os totais usados pelo cartão 2.6.
// ============================================================
function calcularResumoDelegados_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Dados');
  if (!sheet) throw new Error('Sheet "Dados" não encontrada. Importe os dados primeiro.');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) throw new Error('Sem dados na sheet. Importe os dados do KoboToolbox primeiro.');

  let membrosIgrejas = 0;
  let delegadosEleitos = 0;
  let exOfficio = 0;
  let suplentes = 0;
  let totalSemSuplentes = 0;
  let totalGeral = 0;
  let nIgrejas = 0;

  rows.slice(1).forEach(r => {
    if (!r[0]) return;
    nIgrejas++;
    membrosIgrejas += Number(r[2]) || 0;
    delegadosEleitos += Number(r[5]) || 0;
    exOfficio += Number(r[6]) || 0;
    suplentes += Number(r[7]) || 0;
    totalSemSuplentes += Number(r[8]) || 0;
    totalGeral += Number(r[9]) || 0;
  });

  return {
    igrejas: nIgrejas,
    membrosIgrejas,
    delegadosEleitos,
    exOfficio,
    suplentes,
    totalSemSuplentes,
    totalGeral
  };
}

// ============================================================
// CRIAÇÃO/ACTUALIZAÇÃO DE PERFIS TEMPORÁRIOS POR IGREJA
// Gera usernames e palavras-passe temporárias para cada igreja
// e grava o password_hash correcto na folha Utilizadores.
// Também cria a folha Credenciais_Temporarias para distribuição.
// ============================================================
function criarTodosPerfisTemporariosPorIgreja() {
  const ss = SpreadsheetApp.getActive();

  const shIgrejas = ss.getSheetByName('Igrejas');
  const shUsers = ss.getSheetByName('Utilizadores');

  if (!shIgrejas) throw new Error('Folha Igrejas não encontrada. Execute primeiro setup().');
  if (!shUsers) throw new Error('Folha Utilizadores não encontrada. Execute primeiro setup().');

  const requiredUserHeaders = [
    'id',
    'nome',
    'username',
    'password_hash',
    'perfil',
    'departamento',
    'igreja_id',
    'igreja_nome',
    'nivel_acesso',

    'pode_ver_plano',
    'pode_lancar_plano',
    'pode_aprovar_plano',

    'pode_ver_cultos',
    'pode_lancar_cultos',
    'pode_aprovar_cultos',

    'pode_ver_financas',
    'pode_lancar_financas',
    'pode_aprovar_financas',

    'pode_ver_membros',
    'pode_lancar_membros',
    'pode_aprovar_membros',

    'pode_ver_painel',
    'pode_configurar',
    'activo',
    'deve_trocar_password',
    'criado_em'
  ];

  ensureHeadersForTempProfiles_(shUsers, requiredUserHeaders);

  const userValues = shUsers.getDataRange().getValues();
  const userHeaders = userValues[0].map(String);

  const igrejaValues = shIgrejas.getDataRange().getValues();
  const igrejaHeaders = igrejaValues[0].map(String);

  const igrejaIdCol = getHeaderIndexForTempProfiles_(igrejaHeaders, 'igreja_id');
  const nomeIgrejaCol = getHeaderIndexForTempProfiles_(igrejaHeaders, 'nome_igreja');
  const activoIgrejaCol = igrejaHeaders.indexOf('activo');

  const usernameCol = getHeaderIndexForTempProfiles_(userHeaders, 'username');

  const existingUsers = {};
  for (let i = 1; i < userValues.length; i++) {
    const username = String(userValues[i][usernameCol] || '').trim().toLowerCase();
    if (username) existingUsers[username] = i + 1;
  }

  const credSheetName = 'Credenciais_Temporarias';
  let shCred = ss.getSheetByName(credSheetName);

  if (!shCred) {
    shCred = ss.insertSheet(credSheetName);
  } else {
    shCred.clearContents();
  }

  shCred.getRange(1, 1, 1, 8).setValues([[
    'igreja_id',
    'igreja_nome',
    'perfil',
    'nome_utilizador',
    'username',
    'palavra_passe_temporaria',
    'nivel_acesso',
    'observacoes'
  ]]);
  formatHeader_(shCred);

  const credRows = [];

  function setUserValue(row, colName, value) {
    const idx = userHeaders.indexOf(colName);
    if (idx >= 0) {
      shUsers.getRange(row, idx + 1).setValue(value);
    }
  }

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/igreja do nazareno em/g, '')
      .replace(/igreja do nazareno de/g, '')
      .replace(/igreja do nazareno da/g, '')
      .replace(/igreja do nazareno do/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function upsertUser(user) {
    const usernameKey = String(user.username || '').trim().toLowerCase();
    if (!usernameKey) return;

    let row = existingUsers[usernameKey];

    if (!row) {
      row = shUsers.getLastRow() + 1;
      existingUsers[usernameKey] = row;
      setUserValue(row, 'id', Utilities.getUuid());
      setUserValue(row, 'criado_em', new Date().toISOString());
    }

    setUserValue(row, 'nome', user.nome);
    setUserValue(row, 'username', user.username);
    setUserValue(row, 'password_hash', sha256_(user.password));
    setUserValue(row, 'perfil', user.perfil);
    setUserValue(row, 'departamento', user.departamento || '*');
    setUserValue(row, 'igreja_id', user.igreja_id);
    setUserValue(row, 'igreja_nome', user.igreja_nome);
    setUserValue(row, 'nivel_acesso', user.nivel_acesso || 'LOCAL');

    setUserValue(row, 'pode_ver_plano', user.pode_ver_plano || 'NAO');
    setUserValue(row, 'pode_lancar_plano', user.pode_lancar_plano || 'NAO');
    setUserValue(row, 'pode_aprovar_plano', user.pode_aprovar_plano || 'NAO');

    setUserValue(row, 'pode_ver_cultos', user.pode_ver_cultos || 'NAO');
    setUserValue(row, 'pode_lancar_cultos', user.pode_lancar_cultos || 'NAO');
    setUserValue(row, 'pode_aprovar_cultos', user.pode_aprovar_cultos || 'NAO');

    setUserValue(row, 'pode_ver_financas', user.pode_ver_financas || 'NAO');
    setUserValue(row, 'pode_lancar_financas', user.pode_lancar_financas || 'NAO');
    setUserValue(row, 'pode_aprovar_financas', user.pode_aprovar_financas || 'NAO');

    setUserValue(row, 'pode_ver_membros', user.pode_ver_membros || 'NAO');
    setUserValue(row, 'pode_lancar_membros', user.pode_lancar_membros || 'NAO');
    setUserValue(row, 'pode_aprovar_membros', user.pode_aprovar_membros || 'NAO');

    setUserValue(row, 'pode_ver_painel', user.pode_ver_painel || 'SIM');
    setUserValue(row, 'pode_configurar', user.pode_configurar || 'NAO');
    setUserValue(row, 'activo', 'SIM');
    setUserValue(row, 'deve_trocar_password', 'SIM');

    credRows.push([
      user.igreja_id,
      user.igreja_nome,
      user.perfil,
      user.nome,
      user.username,
      user.password,
      user.nivel_acesso || 'LOCAL',
      'Palavra-passe temporária. Deve ser alterada após o primeiro acesso.'
    ]);
  }

  function createLocalProfiles(igrejaId, igrejaNome) {
    const slug = slugify(igrejaId || igrejaNome);

    upsertUser({
      nome: 'Pastor Local - ' + igrejaNome,
      username: 'pastor_' + slug,
      password: 'Pastor@' + slug + '2026!',
      perfil: 'PASTOR',
      departamento: '*',
      igreja_id: igrejaId,
      igreja_nome: igrejaNome,
      nivel_acesso: 'LOCAL',
      pode_ver_plano: 'SIM',
      pode_lancar_plano: 'NAO',
      pode_aprovar_plano: 'SIM',
      pode_ver_cultos: 'SIM',
      pode_lancar_cultos: 'NAO',
      pode_aprovar_cultos: 'SIM',
      pode_ver_financas: 'SIM',
      pode_lancar_financas: 'NAO',
      pode_aprovar_financas: 'NAO',
      pode_ver_membros: 'SIM',
      pode_lancar_membros: 'NAO',
      pode_aprovar_membros: 'SIM',
      pode_ver_painel: 'SIM',
      pode_configurar: 'NAO'
    });

    upsertUser({
      nome: 'Secretário Local - ' + igrejaNome,
      username: 'sec_' + slug,
      password: 'Sec@' + slug + '2026!',
      perfil: 'SECRETARIO',
      departamento: '*',
      igreja_id: igrejaId,
      igreja_nome: igrejaNome,
      nivel_acesso: 'LOCAL',
      pode_ver_plano: 'SIM',
      pode_lancar_plano: 'SIM',
      pode_aprovar_plano: 'SIM',
      pode_ver_cultos: 'SIM',
      pode_lancar_cultos: 'SIM',
      pode_aprovar_cultos: 'SIM',
      pode_ver_financas: 'SIM',
      pode_lancar_financas: 'NAO',
      pode_aprovar_financas: 'NAO',
      pode_ver_membros: 'SIM',
      pode_lancar_membros: 'SIM',
      pode_aprovar_membros: 'SIM',
      pode_ver_painel: 'SIM',
      pode_configurar: 'NAO'
    });

    upsertUser({
      nome: 'Tesoureiro Local - ' + igrejaNome,
      username: 'tes_' + slug,
      password: 'Tes@' + slug + '2026!',
      perfil: 'TESOUREIRO',
      departamento: '*',
      igreja_id: igrejaId,
      igreja_nome: igrejaNome,
      nivel_acesso: 'LOCAL',
      pode_ver_plano: 'SIM',
      pode_lancar_plano: 'NAO',
      pode_aprovar_plano: 'NAO',
      pode_ver_cultos: 'SIM',
      pode_lancar_cultos: 'NAO',
      pode_aprovar_cultos: 'NAO',
      pode_ver_financas: 'SIM',
      pode_lancar_financas: 'SIM',
      pode_aprovar_financas: 'SIM',
      pode_ver_membros: 'SIM',
      pode_lancar_membros: 'NAO',
      pode_aprovar_membros: 'NAO',
      pode_ver_painel: 'SIM',
      pode_configurar: 'NAO'
    });

    const departments = [
      { code: 'jni', label: 'JNI', prefix: 'Jni', nome: 'Líder JNI' },
      { code: 'mni', label: 'MNI', prefix: 'Mni', nome: 'Líder MNI' },
      { code: 'dni', label: 'DNI', prefix: 'Dni', nome: 'Líder DNI' },
      { code: 'pais', label: 'PAIS', prefix: 'Pais', nome: 'Presidente de Pais' },
      { code: 'maes', label: 'MAES', prefix: 'Maes', nome: 'Presidente de Mães' },
      { code: 'activistas', label: 'ACTIVISTAS', prefix: 'Activistas', nome: 'Presidente de Activistas' }
    ];

    departments.forEach(dep => {
      upsertUser({
        nome: dep.nome + ' - ' + igrejaNome,
        username: dep.code + '_' + slug,
        password: dep.prefix + '@' + slug + '2026!',
        perfil: 'LIDER_DEPARTAMENTO',
        departamento: dep.label,
        igreja_id: igrejaId,
        igreja_nome: igrejaNome,
        nivel_acesso: 'LOCAL',
        pode_ver_plano: 'SIM',
        pode_lancar_plano: 'SIM',
        pode_ver_cultos: 'SIM',
        pode_lancar_cultos: 'SIM',
        pode_ver_financas: 'NAO',
        pode_lancar_financas: 'SIM',
        pode_ver_membros: 'SIM',
        pode_lancar_membros: 'SIM',
        pode_ver_painel: 'SIM',
        pode_configurar: 'NAO'
      });
    });

    upsertUser({
      nome: 'Operador Local - ' + igrejaNome,
      username: 'operador_' + slug,
      password: 'Operador@' + slug + '2026!',
      perfil: 'OPERADOR',
      departamento: '*',
      igreja_id: igrejaId,
      igreja_nome: igrejaNome,
      nivel_acesso: 'LOCAL',
      pode_ver_plano: 'NAO',
      pode_lancar_plano: 'NAO',
      pode_ver_cultos: 'SIM',
      pode_lancar_cultos: 'SIM',
      pode_ver_financas: 'NAO',
      pode_lancar_financas: 'NAO',
      pode_ver_membros: 'SIM',
      pode_lancar_membros: 'SIM',
      pode_ver_painel: 'NAO',
      pode_configurar: 'NAO'
    });

    upsertUser({
      nome: 'Visualizador Local - ' + igrejaNome,
      username: 'ver_' + slug,
      password: 'Ver@' + slug + '2026!',
      perfil: 'VISUALIZADOR',
      departamento: '*',
      igreja_id: igrejaId,
      igreja_nome: igrejaNome,
      nivel_acesso: 'LOCAL',
      pode_ver_plano: 'SIM',
      pode_lancar_plano: 'NAO',
      pode_ver_cultos: 'SIM',
      pode_lancar_cultos: 'NAO',
      pode_ver_financas: 'SIM',
      pode_lancar_financas: 'NAO',
      pode_ver_membros: 'SIM',
      pode_lancar_membros: 'NAO',
      pode_ver_painel: 'SIM',
      pode_configurar: 'NAO'
    });
  }

  for (let i = 1; i < igrejaValues.length; i++) {
    const igrejaId = String(igrejaValues[i][igrejaIdCol] || '').trim();
    const igrejaNome = String(igrejaValues[i][nomeIgrejaCol] || '').trim();
    const activo = activoIgrejaCol >= 0
      ? String(igrejaValues[i][activoIgrejaCol] || '').trim().toUpperCase()
      : 'SIM';

    if (!igrejaId || !igrejaNome || activo === 'NAO') continue;

    createLocalProfiles(igrejaId, igrejaNome);
  }

  upsertUser({
    nome: 'Superintendente Distrital',
    username: 'superintendente',
    password: 'Sup@distrito2026!',
    perfil: 'SUPERINTENDENTE',
    departamento: '*',
    igreja_id: '*',
    igreja_nome: 'Todas as igrejas',
    nivel_acesso: 'DISTRITAL',
    pode_ver_plano: 'SIM',
    pode_lancar_plano: 'NAO',
    pode_aprovar_plano: 'SIM',
    pode_ver_cultos: 'SIM',
    pode_lancar_cultos: 'NAO',
    pode_aprovar_cultos: 'SIM',
    pode_ver_financas: 'SIM',
    pode_lancar_financas: 'NAO',
    pode_aprovar_financas: 'NAO',
    pode_ver_membros: 'SIM',
    pode_lancar_membros: 'NAO',
    pode_aprovar_membros: 'SIM',
    pode_ver_painel: 'SIM',
    pode_configurar: 'NAO'
  });

  upsertUser({
    nome: 'Secretário Distrital',
    username: 'secretario_distrital',
    password: 'Sec@distrito2026!',
    perfil: 'SECRETARIO_DISTRITAL',
    departamento: '*',
    igreja_id: '*',
    igreja_nome: 'Todas as igrejas',
    nivel_acesso: 'DISTRITAL',
    pode_ver_plano: 'SIM',
    pode_lancar_plano: 'SIM',
    pode_aprovar_plano: 'SIM',
    pode_ver_cultos: 'SIM',
    pode_lancar_cultos: 'SIM',
    pode_aprovar_cultos: 'SIM',
    pode_ver_financas: 'SIM',
    pode_lancar_financas: 'NAO',
    pode_aprovar_financas: 'NAO',
    pode_ver_membros: 'SIM',
    pode_lancar_membros: 'SIM',
    pode_aprovar_membros: 'SIM',
    pode_ver_painel: 'SIM',
    pode_configurar: 'SIM'
  });

  upsertUser({
    nome: 'Tesoureiro Distrital',
    username: 'tesoureiro_distrital',
    password: 'Tes@distrito2026!',
    perfil: 'TESOUREIRO_DISTRITAL',
    departamento: '*',
    igreja_id: '*',
    igreja_nome: 'Todas as igrejas',
    nivel_acesso: 'DISTRITAL',
    pode_ver_plano: 'SIM',
    pode_lancar_plano: 'NAO',
    pode_aprovar_plano: 'NAO',
    pode_ver_cultos: 'SIM',
    pode_lancar_cultos: 'NAO',
    pode_aprovar_cultos: 'NAO',
    pode_ver_financas: 'SIM',
    pode_lancar_financas: 'SIM',
    pode_aprovar_financas: 'SIM',
    pode_ver_membros: 'SIM',
    pode_lancar_membros: 'NAO',
    pode_aprovar_membros: 'NAO',
    pode_ver_painel: 'SIM',
    pode_configurar: 'NAO'
  });

  if (credRows.length) {
    shCred.getRange(2, 1, credRows.length, 8).setValues(credRows);
    shCred.autoResizeColumns(1, 8);
  }

  Logger.log('Perfis locais e distritais criados/actualizados. Consulte a folha Credenciais_Temporarias para entregar os acessos.');
}

function ensureHeadersForTempProfiles_(sheet, headersNeeded) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  let currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);

  if (sheet.getLastRow() === 0 || currentHeaders.every(h => !h)) {
    sheet.getRange(1, 1, 1, headersNeeded.length).setValues([headersNeeded]);
    formatHeader_(sheet);
    return;
  }

  headersNeeded.forEach(h => {
    currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    if (!currentHeaders.includes(h)) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
    }
  });

  formatHeader_(sheet);
}

function getHeaderIndexForTempProfiles_(headers, name) {
  const idx = headers.indexOf(name);
  if (idx < 0) throw new Error('Coluna não encontrada: ' + name);
  return idx;
}

/**
 * v51 — preparação consolidada.
 * Executar esta função uma vez depois de substituir o Code.gs.
 * Mantém o setup original e corrige/cria os quatro utilizadores IT.
 */
function executarPreparacaoV51() {
  setup();
  corrigirUtilizadoresIT();
  Logger.log('Preparação v51 concluída: setup executado e utilizadores IT corrigidos.');
}

/**
 * Cria ou actualiza os quatro utilizadores IT com acesso distrital.
 * adminit1 e adminit2 podem configurar; adminit3 e adminit4 não podem configurar.
 */
function corrigirUtilizadoresIT() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(CONFIG.SHEETS.USERS || 'Utilizadores');

  if (!sh) {
    throw new Error('Folha Utilizadores não encontrada. Execute setup() primeiro.');
  }

  const requiredHeaders = [
    'id','nome','username','password_hash','perfil','departamento','igreja_id','igreja_nome','nivel_acesso',
    'pode_ver_plano','pode_lancar_plano','pode_aprovar_plano',
    'pode_ver_cultos','pode_lancar_cultos','pode_aprovar_cultos',
    'pode_ver_financas','pode_lancar_financas','pode_aprovar_financas',
    'pode_ver_membros','pode_lancar_membros','pode_aprovar_membros',
    'pode_ver_painel','pode_configurar','activo','deve_trocar_password','criado_em'
  ];

  addMissingHeaders_(sh, requiredHeaders);

  const values = sh.getDataRange().getValues();
  const headers = values[0].map(function(h) { return String(h).trim(); });

  function col(name) {
    return headers.indexOf(name);
  }

  function set(row, name, value) {
    const c = col(name);
    if (c >= 0) sh.getRange(row, c + 1).setValue(value);
  }

  function get(rowValues, name) {
    const c = col(name);
    return c >= 0 ? rowValues[c] : '';
  }

  const usernameCol = col('username');
  if (usernameCol < 0) throw new Error('Coluna username não encontrada.');

  const rowByUsername = {};
  for (let i = 1; i < values.length; i++) {
    const username = String(values[i][usernameCol] || '').trim().toLowerCase();
    if (username) rowByUsername[username] = i + 1;
  }

  const utilizadores = [
    { username: 'adminit1', nome: 'Administrador IT 1', password: 'IT1@Distrito2026!', pode_configurar: 'SIM' },
    { username: 'adminit2', nome: 'Administrador IT 2', password: 'IT2@Distrito2026!', pode_configurar: 'SIM' },
    { username: 'adminit3', nome: 'Administrador IT 3', password: 'IT3@Distrito2026!', pode_configurar: 'NAO' },
    { username: 'adminit4', nome: 'Administrador IT 4', password: 'IT4@Distrito2026!', pode_configurar: 'NAO' }
  ];

  utilizadores.forEach(function(user) {
    let row = rowByUsername[user.username.toLowerCase()];

    if (!row) {
      row = sh.getLastRow() + 1;
      rowByUsername[user.username.toLowerCase()] = row;
      set(row, 'id', Utilities.getUuid());
      set(row, 'criado_em', new Date().toISOString());
    }

    set(row, 'nome', user.nome);
    set(row, 'username', user.username);
    set(row, 'password_hash', sha256_(user.password));
    set(row, 'perfil', 'ADMIN_IT');
    set(row, 'departamento', '*');
    set(row, 'igreja_id', '*');
    set(row, 'igreja_nome', 'Todas as igrejas');
    set(row, 'nivel_acesso', 'DISTRITAL');

    set(row, 'pode_ver_plano', 'SIM');
    set(row, 'pode_lancar_plano', 'SIM');
    set(row, 'pode_aprovar_plano', 'SIM');

    set(row, 'pode_ver_cultos', 'SIM');
    set(row, 'pode_lancar_cultos', 'SIM');
    set(row, 'pode_aprovar_cultos', 'SIM');

    set(row, 'pode_ver_financas', 'SIM');
    set(row, 'pode_lancar_financas', 'SIM');
    set(row, 'pode_aprovar_financas', 'SIM');

    set(row, 'pode_ver_membros', 'SIM');
    set(row, 'pode_lancar_membros', 'SIM');
    set(row, 'pode_aprovar_membros', 'SIM');

    set(row, 'pode_ver_painel', 'SIM');
    set(row, 'pode_configurar', user.pode_configurar);

    // O login aceita SIM, mas TRUE evita incompatibilidades com versões antigas do Auth.
    set(row, 'activo', 'TRUE');
    set(row, 'deve_trocar_password', 'TRUE');

    Logger.log('Utilizador IT criado/actualizado: ' + user.username);
  });

  Logger.log('Quatro utilizadores IT corrigidos com sucesso.');
}


// ============================================================
// v54.4.0 — diagnóstico e migração segura do isolamento por igreja
// ============================================================
function diagnosticarIsolamentoPorIgrejaV5440() {
  setup();
  const validChurches = new Set(getChurches_().map(c => String(c.igreja_id)));
  const sheetNames = [
    CONFIG.SHEETS.SUBMISSIONS,
    CONFIG.SHEETS.MEMBERS,
    'Saldos_Iniciais',
    ...Object.values(CONFIG.MODULE_SHEETS),
    'rep_rep_escalas',
    'rep_escalas',
    'rep_responsaveis',
    'rep_dizimos_repeat',
    'rep_dizimistas'
  ];
  const result = [];
  [...new Set(sheetNames)].forEach(name => {
    const rows = readSheetObjects_(name);
    let semIgreja = 0;
    let igrejaInvalida = 0;
    rows.forEach(r => {
      const id = recordChurchId_(r);
      if (!id || id === '*') semIgreja++;
      else if (!validChurches.has(id)) igrejaInvalida++;
    });
    result.push({ folha: name, total: rows.length, semIgreja, igrejaInvalida });
  });
  Logger.log(JSON.stringify(result, null, 2));
  return { ok: true, resultado: result };
}

function migrarSaldosIniciaisSemIgrejaParaIgrejaV5440(igrejaId) {
  const church = getChurches_().find(c => String(c.igreja_id) === String(igrejaId || '').trim());
  if (!church) throw new Error('Indique um igreja_id válido e activo.');
  const sh = SpreadsheetApp.getActive().getSheetByName('Saldos_Iniciais');
  if (!sh || sh.getLastRow() < 2) return { ok: true, actualizados: 0 };
  addMissingHeaders_(sh, ['igreja_id','igreja_nome','conta','label','saldo_inicial','updatedAt']);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const churchCol = headers.indexOf('igreja_id') + 1;
  const churchNameCol = headers.indexOf('igreja_nome') + 1;
  const updatedCol = headers.indexOf('updatedAt') + 1;
  let count = 0;
  for (let row = 2; row <= sh.getLastRow(); row++) {
    const current = String(sh.getRange(row, churchCol).getValue() || '').trim();
    if (!current || current === '*') {
      sh.getRange(row, churchCol).setValue(church.igreja_id);
      sh.getRange(row, churchNameCol).setValue(church.nome_igreja);
      sh.getRange(row, updatedCol).setValue(new Date().toISOString());
      count++;
    }
  }
  SpreadsheetApp.flush();
  return { ok: true, igreja_id: church.igreja_id, igreja_nome: church.nome_igreja, actualizados: count };
}
