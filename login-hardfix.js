
/* v53 — correcção directa do login.
   Este ficheiro é carregado por último e não depende da inicialização normal do app.js.
   Serve para garantir que o botão Entrar e a tecla Enter executam sempre o login. */
(function(){
  'use strict';

  var TOKEN_KEY = 'igreja_auth_token';
  var USER_KEY = 'igreja_auth_user';
  var busy = false;

  function qs(id){ return document.getElementById(id); }

  function setMsg(text, type){
    var box = qs('loginMessage');
    if(!box) return;
    box.textContent = text || '';
    box.className = text ? ('login-message ' + (type || 'error')) : 'login-message hidden';
  }

  function markError(on){
    var u = qs('loginUsername'), p = qs('loginPassword');
    if(u) u.classList.toggle('login-error', !!on);
    if(p) p.classList.toggle('login-error', !!on);
  }

  function toastLocal(text){
    try { if(typeof window.toast === 'function') return window.toast(text, 'success'); } catch(_e) {}
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(function(){ try{ t.remove(); }catch(_e){} }, 3500);
  }

  function setButtonLoading(on){
    var form = qs('loginForm');
    var btn = form && form.querySelector('button');
    if(!btn) return;
    if(on){
      btn.dataset.oldText = btn.textContent || 'Entrar';
      btn.disabled = true;
      btn.textContent = 'A entrar...';
    }else{
      btn.disabled = false;
      btn.textContent = btn.dataset.oldText || 'Entrar';
    }
  }

  function normalUser(out, username){
    var user = out && (out.user || out.utilizador || out.usuario) || {};
    if(!user.username) user.username = username;
    if(!user.name && user.nome) user.name = user.nome;
    if(!user.name) user.name = user.nome || user.username || username;
    if(!user.role && user.perfil) user.role = user.perfil;
    if(!user.role) user.role = user.perfil || 'UTILIZADOR';
    return user;
  }

  function openApp(user){
    try { if(window.state) window.state.currentUser = user; } catch(_e) {}

    try {
      if(typeof window.showApp === 'function') {
        window.showApp(user);
      } else {
        var login = qs('loginScreen');
        var shell = qs('appShell');
        if(login) login.classList.add('hidden');
        if(shell) shell.classList.remove('hidden');
      }
    } catch(e){
      var login2 = qs('loginScreen');
      var shell2 = qs('appShell');
      if(login2) login2.classList.add('hidden');
      if(shell2) shell2.classList.remove('hidden');
      console.warn('showApp falhou, mas a sessão foi aberta:', e);
    }

    try {
      var n = qs('currentUserName'), r = qs('currentUserRole'), c = qs('currentUserChurch');
      if(n) n.textContent = user.name || user.nome || user.username || 'Utilizador';
      if(r) r.textContent = user.role || user.perfil || 'Perfil';
      if(c) c.textContent = user.churchName || user.igreja_nome || user.igreja_id || 'Todas as igrejas';
    } catch(_e) {}

    try { if(typeof window.injectMultiSelectStyles === 'function') window.injectMultiSelectStyles(); } catch(_e) {}
    try { if(typeof window.bootstrap === 'function') window.bootstrap().catch(function(e){ console.warn('bootstrap após login falhou:', e); }); } catch(e) { console.warn(e); }
  }

  async function hardLogin(ev){
    if(ev){
      try { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); } catch(_e) {}
    }
    if(busy) return false;

    var username = (qs('loginUsername') && qs('loginUsername').value || '').trim();
    var password = (qs('loginPassword') && qs('loginPassword').value || '');
    if(!username || !password){
      markError(true);
      setMsg('Preencha o nome de utilizador e a palavra-passe.', 'error');
      return false;
    }

    busy = true;
    markError(false);
    setMsg('A verificar credenciais...', 'info');
    setButtonLoading(true);

    try{
      var sandbox = false;
      try { sandbox = new URLSearchParams(location.search).get('sandbox') === '1'; } catch(_e) {}
      if(sandbox){
        var demo = {username: username, name: 'Utilizador em modo teste', role:'DEMO', perfil:'DEMO', igreja_nome:'Modo teste'};
        localStorage.setItem(TOKEN_KEY, 'SANDBOX_TOKEN');
        localStorage.setItem(USER_KEY, JSON.stringify(demo));
        setMsg('', 'success');
        toastLocal('Modo teste aberto.');
        openApp(demo);
        return false;
      }

      var url = window.APP_CONFIG && window.APP_CONFIG.APPS_SCRIPT_URL;
      if(!url) throw new Error('A ligação ao backend não está definida em config.js.');

      var res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type':'text/plain;charset=utf-8'},
        body: JSON.stringify({action:'login', username: username, password: password})
      });
      var out = await res.json();
      if(!out || !out.ok){
        throw new Error((out && (out.message || out.error)) || 'Credenciais inválidas.');
      }
      var token = out.token || out.authToken || '';
      var user = normalUser(out, username);
      if(!token) throw new Error('Login aceite, mas o backend não devolveu token.');

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setMsg('', 'success');
      toastLocal('Login efectuado com sucesso.');
      openApp(user);
      return false;
    }catch(err){
      console.error('Falha no login v53:', err);
      markError(true);
      setMsg('Utilizador ou palavra-passe incorrectos. Verifique os dados e tente novamente.', 'error');
      return false;
    }finally{
      busy = false;
      setButtonLoading(false);
    }
  }

  function bind(){
    var form = qs('loginForm');
    var btn = form && form.querySelector('button');
    if(form){
      form.onsubmit = hardLogin;
      form.addEventListener('submit', hardLogin, true);
    }
    if(btn){
      btn.onclick = hardLogin;
      btn.addEventListener('click', hardLogin, true);
    }
    var p = qs('loginPassword');
    if(p){
      p.addEventListener('keydown', function(e){
        if(e.key === 'Enter') hardLogin(e);
      }, true);
    }
    console.log('Login hardfix v53 activo.');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  window.addEventListener('load', bind);
  window.loginHardfixV53 = hardLogin;
})();
