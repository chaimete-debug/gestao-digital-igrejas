const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const XLSFORM_FIELDS = [
  {
    "type": "calculate",
    "name": "submission_uuid",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "uuid()",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one menu_preencher",
    "name": "menu_preencher",
    "label": "O que deseja preencher?",
    "hint": "Seleccione uma opção",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "pin_esperado",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(${menu_preencher}='plano_cultos_escalas','1234', if(${menu_preencher}='relatorio_cultos','2345', if(${menu_preencher}='registo_financeiro','5678','')))",
    "appearance": "",
    "relevant": "${menu_preencher} = 'plano_cultos_escalas' or ${menu_preencher} = 'relatorio_cultos' or ${menu_preencher} = 'registo_financeiro'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "pin_acesso",
    "label": "PIN de acesso",
    "hint": "Apenas para responsáveis. (Plano de cultos e escalas / Relatório dos cultos)",
    "required": "true",
    "calculation": "",
    "appearance": "password",
    "relevant": "${menu_preencher} = 'plano_cultos_escalas' or ${menu_preencher} = 'relatorio_cultos' or ${menu_preencher} = 'registo_financeiro'",
    "constraint": ". = ${pin_esperado}",
    "constraint_message": "PIN inválido. Peça o PIN ao responsável.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "acesso_ok",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(${pin_acesso} = ${pin_esperado}, 1, 0)",
    "appearance": "",
    "relevant": "${menu_preencher} = 'plano_cultos_escalas' or ${menu_preencher} = 'relatorio_cultos' or ${menu_preencher} = 'registo_financeiro'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "grp_plano",
    "label": "Plano de cultos e escalas",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "field-list",
    "relevant": "(${menu_preencher} = 'plano_cultos_escalas' and ${acesso_ok} = 1)",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "plano_intro",
    "label": "PLANO DE CULTOS E ESCALAS",
    "hint": "Preencha os dados do próximo culto e as principais escalas.",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "date",
    "name": "data_culto",
    "label": "Data do culto",
    "hint": "Selecione a data do culto",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "time",
    "name": "hora_inicio",
    "label": "Hora de início",
    "hint": "Preencha: Hora de início",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "time",
    "name": "hora_fim",
    "label": "Hora de término",
    "hint": "Preencha: Hora de término",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "decimal-time(.) > decimal-time(${hora_inicio})",
    "constraint_message": "A hora de término deve ser posterior à hora de início.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one culto_evento",
    "name": "tipo_culto_plano",
    "label": "Tipo de culto",
    "hint": "Preencha: Tipo de culto",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "tipo_culto_plano_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "jr:choice-name(${tipo_culto_plano}, 'culto_evento')",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "espec_culto_plano",
    "label": "Especifique o culto especial",
    "hint": "Preencha: Especifique o culto especial",
    "required": "${tipo_culto_plano} = 'culto_especial'",
    "calculation": "",
    "appearance": "",
    "relevant": "${tipo_culto_plano} = 'culto_especial'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one dia_meio_semana",
    "name": "dia_meio_semana_plano",
    "label": "Selecione o dia",
    "hint": "Preencha: Selecione o dia",
    "required": "${tipo_culto_plano} = 'culto_meio_semana'",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "${tipo_culto_plano} = 'culto_meio_semana'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "dia_meio_semana_plano_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "jr:choice-name(${dia_meio_semana_plano}, 'dia_meio_semana')",
    "appearance": "",
    "relevant": "${tipo_culto_plano} = 'culto_meio_semana'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "plano_resp_note",
    "label": "Responsáveis",
    "hint": "Seleccione na lista nominal da Igreja de trabalho.",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one_from_file membros.csv",
    "name": "dirigente",
    "label": "Dirigente",
    "hint": "Preencha: Dirigente",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "value=name label=label",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "dirigente_tel",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros','Telefone','name', ${dirigente})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "dirigente_tel_manual",
    "label": "Telefone do Dirigente",
    "hint": "Preencha apenas se estiver em branco na lista.",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "string-length(${dirigente_tel})=0",
    "constraint": "regex(., '^(258)?8[234567][0-9]{7}$')",
    "constraint_message": "Número inválido. Use 84xxxxxxx ou 25884xxxxxxx.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "dirigente_tel_final",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(string-length(${dirigente_tel})>0, ${dirigente_tel}, ${dirigente_tel_manual})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one_from_file membros.csv",
    "name": "pregador",
    "label": "Pregador",
    "hint": "Preencha: Pregador",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "value=name label=label",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "pregador_tel",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros','Telefone','name', ${pregador})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "pregador_tel_manual",
    "label": "Telefone do Pregador",
    "hint": "Preencha apenas se estiver em branco na lista.",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "string-length(${pregador_tel})=0",
    "constraint": "regex(., '^(258)?8[234567][0-9]{7}$')",
    "constraint_message": "Número inválido. Use 84xxxxxxx ou 25884xxxxxxx.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "pregador_tel_final",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(string-length(${pregador_tel})>0, ${pregador_tel}, ${pregador_tel_manual})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "dirigente_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros','label','name',${dirigente})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "pregador_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros','label','name',${pregador})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "dirigente_tel_001",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros','Telefone','name',${dirigente})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "pregador_tel_001",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros','Telefone','name',${pregador})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "local_culto",
    "label": "Local do culto",
    "hint": "Preencha: Local do culto",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "anuncios_culto",
    "label": "Anúncios / Observações",
    "hint": "Separe por ponto e vírgula ou novas linhas.",
    "required": "false",
    "calculation": "",
    "appearance": "long-text",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "escala_acolhimento_note",
    "label": "Escala: Acolhimento",
    "hint": "Se for preciso, adicione nomes fora da lista.",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_multiple_from_file membros.csv",
    "name": "acolhimento_membros",
    "label": "Acolhedores (da lista)",
    "hint": "Preencha: Acolhedores (da lista)",
    "required": "false",
    "calculation": "",
    "appearance": "autocomplete",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "value=name label=label",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sim_nao",
    "name": "acolhimento_existe_fora",
    "label": "Existe acolhedor(a) que não consta da lista?",
    "hint": "Preencha: Existe acolhedor(a) que não consta da lista?",
    "required": "false",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_repeat",
    "name": "acolhimento_fora_rep",
    "label": "Acolhedores fora da lista",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "${acolhimento_existe_fora} = 'sim'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "acolhimento_nome_fora",
    "label": "Nome do(a) acolhedor(a)",
    "hint": "Preencha: Nome do(a) acolhedor(a)",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "acolhimento_tel_fora",
    "label": "Telefone/WhatsApp do(a) acolhedor(a)",
    "hint": "Ex.: 84xxxxxxx",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "regex(translate(., '+ ', ''), '^(258)?8[2-7][0-9]{7}$')",
    "constraint_message": "Formato inválido. Use 84xxxxxxx ou 25884xxxxxxx.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_repeat",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "escala_louvor_note",
    "label": "Escala: Louvor",
    "hint": "Se for preciso, adicione nomes fora da lista.",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_multiple_from_file membros.csv",
    "name": "louvor_membros",
    "label": "Líder(es) de louvor (da lista)",
    "hint": "Preencha: Líder(es) de louvor (da lista)",
    "required": "false",
    "calculation": "",
    "appearance": "autocomplete",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "value=name label=label",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sim_nao",
    "name": "louvor_existe_fora",
    "label": "Existe líder de louvor que não consta da lista?",
    "hint": "Preencha: Existe líder de louvor que não consta da lista?",
    "required": "false",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_repeat",
    "name": "louvor_fora_rep",
    "label": "Líderes de louvor fora da lista",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "${louvor_existe_fora} = 'sim'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "louvor_nome_fora",
    "label": "Nome do líder de louvor",
    "hint": "Preencha: Nome do líder de louvor",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "louvor_tel_fora",
    "label": "Telefone/WhatsApp do líder de louvor",
    "hint": "Ex.: 84xxxxxxx",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "regex(translate(., '+ ', ''), '^(258)?8[2-7][0-9]{7}$')",
    "constraint_message": "Formato inválido. Use 84xxxxxxx ou 25884xxxxxxx.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_repeat",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "coro_dia",
    "label": "Coro do dia",
    "hint": "Separe os nomes com ';' ou vírgula. Ex.: Alberto Mudumbe; Argentina Mudumbe",
    "required": "false",
    "calculation": "",
    "appearance": "long-text",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "obs_escala",
    "label": "Observações adicionais",
    "hint": "Preencha: Observações adicionais",
    "required": "false",
    "calculation": "",
    "appearance": "long-text",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "hora_inicio_hhmm",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(string-length(${hora_inicio})>=5,substr(${hora_inicio},1,5),'')",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "hora_fim_hhmm",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(string-length(${hora_fim})>=5,substr(${hora_fim},1,5),'')",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "culto_datetime",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "concat(${data_culto}, 'T', ${hora_inicio})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "culto_texto",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "concat(format-date(${data_culto}, '%d/%m/%Y'), ' às ', ${hora_inicio_hhmm})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "update_contacts_intro",
    "label": "ACTUALIZAÇÃO DE CONTACTOS (opcional)",
    "hint": "Use esta secção para preencher telefones em falta na lista de membros.",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sim_nao",
    "name": "quer_actualizar_contactos",
    "label": "Deseja actualizar telefones em falta?",
    "hint": "Preencha: Deseja actualizar telefones em falta?",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "grp_actualizar_contactos",
    "label": "Actualizar contactos",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "field-list",
    "relevant": "${quer_actualizar_contactos} = 'sim'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "update_contacts_hint",
    "label": "Adicione um ou mais membros para actualizar o telefone (apenas quando estiver em falta na lista).",
    "hint": "Preencha: Adicione um ou mais membros para actualizar o telefone (apenas quando estiver em falta na lista).",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_repeat",
    "name": "rep_actualizar_contactos",
    "label": "Membro para actualizar",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one_from_file membros.csv",
    "name": "upd_membro",
    "label": "Selecione o membro",
    "hint": "Preencha: Selecione o membro",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "upd_membro_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros','label','name', ${upd_membro})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "upd_tel_atual_norm",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(string-length(${upd_tel_atual})=0,'', if(starts-with(${upd_tel_atual},'258'), ${upd_tel_atual}, concat('258', ${upd_tel_atual})))",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "upd_tel_novo_norm",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(string-length(${upd_tel_novo})=0,'', if(starts-with(${upd_tel_novo},'258'), ${upd_tel_novo}, concat('258', ${upd_tel_novo})))",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "upd_tel_atual",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros','Telefone','name', ${upd_membro})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "upd_tel_show",
    "label": "Membro: ${upd_membro_label}\nTelefone actual na lista: ${upd_tel_atual_norm}",
    "hint": "Preencha: Membro: ${upd_membro_label}\nTelefone actual na lista: ${upd_tel_atual_norm}",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "upd_tel_novo",
    "label": "Telefone do membro",
    "hint": "Este número será registado para actualizar a lista de membros.",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "string-length(${upd_tel_atual})=0",
    "constraint": "regex(., '^(258)?8[234567][0-9]{7}$')",
    "constraint_message": "Número inválido. Use 84xxxxxxx ou 25884xxxxxxx.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "upd_export_note",
    "label": "Será registado para actualização: ID=${upd_membro} | Nome=${upd_membro_label} | Novo telefone=${upd_tel_novo_norm}",
    "hint": "Preencha: Será registado para actualização: ID=${upd_membro} | Nome=${upd_membro_label} | Novo telefone=${upd_tel_novo_norm}",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "string-length(${upd_tel_novo})>0",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_repeat",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "registo_financeiro",
    "label": "Registo Financeiro",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "field-list",
    "relevant": "(${menu_preencher} = 'registo_financeiro' and ${acesso_ok} = 1)",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "date",
    "name": "data",
    "label": "Data do movimento",
    "hint": "Preencha: Data do movimento",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one tipo",
    "name": "tipo",
    "label": "Tipo de movimento",
    "hint": "Preencha: Tipo de movimento",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one rubricas",
    "name": "rubrica",
    "label": "Rúbrica",
    "hint": "Filtrado pelo tipo (Entrada ou Saída)",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "tipo=${tipo}",
    "default": ""
  },
  {
    "type": "text",
    "name": "rubrica_outras_saidas",
    "label": "Especificar Rúbrica (quando 'Outras Saídas')",
    "hint": "Preencha: Especificar Rúbrica (quando 'Outras Saídas')",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "${rubrica} = 'Outr'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "Especificar_outras_entradas",
    "label": "Especificar Rúbrica (quando 'Outras entradas')",
    "hint": "Preencha: Especificar Rúbrica (quando 'Outras entradas')",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "${rubrica} = 'outras_entradas'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one fontes",
    "name": "fonte",
    "label": "Fonte",
    "hint": "Preencha: Fonte",
    "required": "false",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "fonte_outros",
    "label": "Especificar Fonte (quando 'Outras')",
    "hint": "Preencha: Especificar Fonte (quando 'Outras')",
    "required": "${fonte} = 'OUTROS'",
    "calculation": "",
    "appearance": "",
    "relevant": "${fonte} = 'OUTROS'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one departamentos",
    "name": "departamento",
    "label": "Departamento / Conta do plano",
    "hint": "A lista é filtrada automaticamente pelo tipo de movimento.",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "tipo=${tipo}",
    "default": ""
  },
  {
    "type": "text",
    "name": "departamento_grupo_zona",
    "label": "Indique o grupo ou a zona de oração",
    "hint": "Escreva o nome do grupo ou da zona de oração a que a receita pertence.",
    "required": "${departamento} = 'ENT_GRUPOS_ZONAS'",
    "calculation": "",
    "appearance": "",
    "relevant": "${departamento} = 'ENT_GRUPOS_ZONAS'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "departamento_outro",
    "label": "Especifique “Outros”",
    "hint": "Indique a natureza da entrada ou da saída.",
    "required": "${departamento} = 'ENT_OUTROS' or ${departamento} = 'SAI_OUTROS'",
    "calculation": "",
    "appearance": "",
    "relevant": "${departamento} = 'ENT_OUTROS' or ${departamento} = 'SAI_OUTROS'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "departamento_final",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "${departamento}",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "departamento_final_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "jr:choice-name(${departamento}, 'departamentos')",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one contas",
    "name": "conta",
    "label": "Conta",
    "hint": "Preencha: Conta",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one metodos",
    "name": "metodo",
    "label": "Método de pagamento",
    "hint": "Preencha: Método de pagamento",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one doc_tipos",
    "name": "documento_tipo",
    "label": "Tipo de documento",
    "hint": "Preencha: Tipo de documento",
    "required": "false",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "documento_numero",
    "label": "N.º do documento",
    "hint": "Preencha: N.º do documento",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "beneficiario",
    "label": "Beneficiário / Entidade",
    "hint": "Preencha: Beneficiário / Entidade",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "descricao",
    "label": "Descrição",
    "hint": "Preencha: Descrição",
    "required": "false",
    "calculation": "",
    "appearance": "multiline",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one moedas",
    "name": "moeda",
    "label": "Moeda",
    "hint": "Preencha: Moeda",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": "MZN"
  },
  {
    "type": "decimal",
    "name": "cambio",
    "label": "Câmbio",
    "hint": "Preencher se a moeda não for MZN",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "${moeda} != 'MZN'",
    "constraint": ". >= 1",
    "constraint_message": "O câmbio deve ser ≥ 1.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "decimal",
    "name": "valor",
    "label": "Valor",
    "hint": "Se Rúbrica=Dízimos, este campo não é usado (usa-se o total do repeat).",
    "required": "${rubrica} != 'DIZ'",
    "calculation": "",
    "appearance": "",
    "relevant": "not( ${rubrica} = 'DIZ' and ${tipo} = 'Entrada')",
    "constraint": ". >= 0",
    "constraint_message": "O valor deve ser ≥ 0.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "valor_mzn",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(${rubrica} = 'DIZ' and ${tipo} = 'Entrada', ${diz_total_mzn}, if(${moeda} = 'MZN', ${valor}, ${valor} * ${cambio}))",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "file",
    "name": "anexo",
    "label": "Anexo do documento",
    "hint": "Preencha: Anexo do documento",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "mes",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "number(format-date(${data}, '%n'))",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "trimestre",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(number(format-date(${data}, '%n')) <= 3, 1, if(number(format-date(${data}, '%n')) <= 6, 2, if(number(format-date(${data}, '%n')) <= 9, 3, 4)))",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "ano",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "number(format-date(${data}, '%Y'))",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "timestamp",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "now()",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "instanceID",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "uuid()",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "dizimos_repeat",
    "label": "Dízimos (linhas)",
    "hint": "Preencha apenas quando Rúbrica=Dízimos",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "(${menu_preencher} = 'registo_financeiro' and ${acesso_ok} = 1) and (${rubrica} = 'DIZ' and ${tipo} = 'Entrada')",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_repeat",
    "name": "dizimistas",
    "label": "Contribuições de Dízimos",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one modo_id",
    "name": "modo_ident",
    "label": "Como identificar o dizimista?",
    "hint": "Preencha: Como identificar o dizimista?",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": "csv"
  },
  {
    "type": "select_one_from_file membros.csv",
    "name": "dizimista_id",
    "label": "Dizimista (lista nominal)",
    "hint": "Pesquise por nome/código",
    "required": "${modo_ident} = 'csv'",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "${modo_ident} = 'csv'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "dizimista_nome_csv",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros','label','name', ${dizimista_id})",
    "appearance": "",
    "relevant": "${modo_ident} = 'csv'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "dizimista_nome_manual",
    "label": "Nome do dizimista",
    "hint": "Preencha: Nome do dizimista",
    "required": "${modo_ident} = 'manual'",
    "calculation": "",
    "appearance": "",
    "relevant": "${modo_ident} = 'manual'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "dizimista_nome_final",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(${modo_ident} = 'csv', ${dizimista_nome_csv}, ${dizimista_nome_manual})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "decimal",
    "name": "diz_valor",
    "label": "Valor do dízimo",
    "hint": "Preencha: Valor do dízimo",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": ". > 0",
    "constraint_message": "O valor deve ser > 0.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "moeda_ctx",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "${moeda}",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "cambio_ctx",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "${cambio}",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "diz_valor_mzn",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "if(${moeda_ctx} = 'MZN', ${diz_valor}, ${diz_valor} * ${cambio_ctx})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one metodos",
    "name": "diz_metodo",
    "label": "Método de pagamento (dízimo)",
    "hint": "Preencha: Método de pagamento (dízimo)",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "diz_recibo",
    "label": "N.º recibo (dízimo)",
    "hint": "Preencha: N.º recibo (dízimo)",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "file",
    "name": "diz_anexo",
    "label": "Anexo do dízimo",
    "hint": "Preencha: Anexo do dízimo",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_repeat",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "diz_total_mzn",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "sum(${diz_valor_mzn})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "diz_n_contribuicoes",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "count(${diz_valor})",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "diz_total_note",
    "label": "Total dos dízimos (MZN): ${diz_total_mzn}",
    "hint": "Preencha: Total dos dízimos (MZN): ${diz_total_mzn}",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "finalizacao",
    "label": "Finalização",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "(${menu_preencher} = 'registo_financeiro' and ${acesso_ok} = 1)",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "registrado_por",
    "label": "Registado por",
    "hint": "Escreva livremente o nome de quem está a fazer o lançamento.",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "grp_relatorio",
    "label": "Relatório dos cultos",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "field-list",
    "relevant": "(${menu_preencher} = 'relatorio_cultos' and ${acesso_ok} = 1)",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "relatorio_intro",
    "label": "RELATÓRIO DOS CULTOS",
    "hint": "Registe os dados do culto realizado.",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "date",
    "name": "rel_data_culto",
    "label": "Data do culto",
    "hint": "Preencha: Data do culto",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one culto_evento",
    "name": "tipo_culto_r",
    "label": "Tipo de culto",
    "hint": "Preencha: Tipo de culto",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "tipo_culto_r_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "jr:choice-name(${tipo_culto_r}, 'culto_evento')",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "espec_culto_r",
    "label": "Especifique o culto especial",
    "hint": "Preencha: Especifique o culto especial",
    "required": "${tipo_culto_r}='culto_especial'",
    "calculation": "",
    "appearance": "",
    "relevant": "${tipo_culto_r} = 'culto_especial'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one dia_meio_semana",
    "name": "dia_semana_r",
    "label": "Selecione o dia",
    "hint": "Preencha: Selecione o dia",
    "required": "${tipo_culto_r}='culto_meio_semana'",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "${tipo_culto_r} = 'culto_meio_semana'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "time",
    "name": "rel_hora_inicio",
    "label": "Hora de início",
    "hint": "Preencha: Hora de início",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "time",
    "name": "rel_hora_fim",
    "label": "Hora de término",
    "hint": "Preencha: Hora de término",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "(. = '' ) or decimal-time(.) > decimal-time(${rel_hora_inicio})",
    "constraint_message": "A hora de término deve ser posterior à hora de início.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "rel_local",
    "label": "Local do culto",
    "hint": "Preencha: Local do culto",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "integer",
    "name": "rel_participantes_total",
    "label": "Número total de participantes",
    "hint": "Preencha: Número total de participantes",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": ". >= 0",
    "constraint_message": "Insira um número igual ou superior a 0.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "integer",
    "name": "rel_visitantes",
    "label": "Número de visitantes",
    "hint": "Preencha: Número de visitantes",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": ". >= 0",
    "constraint_message": "Insira um número igual ou superior a 0.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "integer",
    "name": "rel_decisoes",
    "label": "Decisões / reconciliações (número)",
    "hint": "Preencha: Decisões / reconciliações (número)",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": ". >= 0",
    "constraint_message": "Insira um número igual ou superior a 0.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "integer",
    "name": "rel_baptismos",
    "label": "Baptismos (número)",
    "hint": "Preencha: Baptismos (número)",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": ". >= 0",
    "constraint_message": "Insira um número igual ou superior a 0.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sim_nao",
    "name": "rel_santa_ceia",
    "label": "Houve Santa Ceia?",
    "hint": "Preencha: Houve Santa Ceia?",
    "required": "false",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "decimal",
    "name": "rel_dizimos_valor",
    "label": "Total de dízimos (MZN)",
    "hint": "Preencha: Total de dízimos (MZN)",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": ". >= 0",
    "constraint_message": "Insira um valor igual ou superior a 0.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "integer",
    "name": "rel_dizimistas_qtd",
    "label": "Número de dizimistas",
    "hint": "Preencha: Número de dizimistas",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": ". >= 0",
    "constraint_message": "Insira um número igual ou superior a 0.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "decimal",
    "name": "rel_ofertas_valor",
    "label": "Total de ofertas (MZN)",
    "hint": "Preencha: Total de ofertas (MZN)",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": ". >= 0",
    "constraint_message": "Insira um valor igual ou superior a 0.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "rel_total_contribuicoes",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "(if(${rel_dizimos_valor}!='', ${rel_dizimos_valor}, 0)) + (if(${rel_ofertas_valor}!='', ${rel_ofertas_valor}, 0))",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "rel_observacoes",
    "label": "Observações do culto",
    "hint": "Preencha: Observações do culto",
    "required": "false",
    "calculation": "",
    "appearance": "long-text",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "grp_visitantes",
    "label": "Registo de visitantes e membros",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "field-list",
    "relevant": "${menu_preencher} = 'visitantes'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "visitantes_intro",
    "label": "Bem-vindo(a)!",
    "hint": "Escolha se pretende registar-se como visitante ou cadastrar-se como membro efectivo.",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "${menu_preencher} = 'visitantes'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one tipo_registo_pessoa",
    "name": "registo_tipo",
    "label": "Tipo de registo",
    "hint": "Escolha uma opção",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "${menu_preencher} = 'visitantes'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "registo_tipo_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "jr:choice-name(${registo_tipo}, 'tipo_registo_pessoa')",
    "appearance": "",
    "relevant": "${menu_preencher} = 'visitantes'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "nota_visitante",
    "label": "Está a preencher o registo de visitante.",
    "hint": "Por favor, continue com os campos abaixo.",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "nota_membro",
    "label": "Está a preencher o cadastro de membro efectivo.",
    "hint": "Por favor, continue com os campos abaixo.",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "${registo_tipo} = 'membro_efectivo'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "date",
    "name": "data_visita",
    "label": "Data da visita / registo",
    "hint": "Preencha: Data da visita / registo",
    "required": "${registo_tipo}='visitante'",
    "calculation": "",
    "appearance": "",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one culto_evento",
    "name": "tipo_culto_v",
    "label": "Tipo de culto",
    "hint": "Preencha: Tipo de culto",
    "required": "${registo_tipo}='visitante'",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "tipo_culto_v_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "jr:choice-name(${tipo_culto_v}, 'culto_evento')",
    "appearance": "",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "espec_culto_v",
    "label": "Especifique o culto especial",
    "hint": "Preencha: Especifique o culto especial",
    "required": "${tipo_culto_v}='culto_especial'",
    "calculation": "",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'visitante') and (${tipo_culto_v} = 'culto_especial')",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one dia_meio_semana",
    "name": "dia_semana_v",
    "label": "Selecione o dia",
    "hint": "Preencha: Selecione o dia",
    "required": "${tipo_culto_v}='culto_meio_semana'",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "(${registo_tipo} = 'visitante') and (${tipo_culto_v} = 'culto_meio_semana')",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "nome_visitante",
    "label": "Nome e apelido",
    "hint": "Preencha: Nome e apelido",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sexo",
    "name": "sexo_visitante",
    "label": "Sexo (opcional)",
    "hint": "Preencha: Sexo (opcional)",
    "required": "false",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one faixa_etaria",
    "name": "faixa_etaria",
    "label": "Faixa etária (opcional)",
    "hint": "Preencha: Faixa etária (opcional)",
    "required": "false",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "faixa_etaria_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "jr:choice-name(${faixa_etaria}, 'faixa_etaria')",
    "appearance": "",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "telefone_whatsapp",
    "label": "Telefone/WhatsApp (opcional)",
    "hint": "Ex.: 84/87/86/85/82xxxxxxx",
    "required": "false",
    "calculation": "",
    "appearance": "numbers",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "(. = '' ) or regex(translate(., '+ ', ''), '^(258)?8[2-7][0-9]{7}$')",
    "constraint_message": "Formato inválido. Use 84xxxxxxx ou 25884xxxxxxx.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "bairro_localidade",
    "label": "Bairro / Localidade (opcional)",
    "hint": "Preencha: Bairro / Localidade (opcional)",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sim_nao",
    "name": "primeira_vez",
    "label": "É a primeira vez que nos visita?",
    "hint": "Preencha: É a primeira vez que nos visita?",
    "required": "false",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "primeira_vez_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "jr:choice-name(${primeira_vez}, 'sim_nao')",
    "appearance": "",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one como_conheceu",
    "name": "como_conheceu",
    "label": "Como nos conheceu? (opcional)",
    "hint": "Preencha: Como nos conheceu? (opcional)",
    "required": "false",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "como_conheceu_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "jr:choice-name(${como_conheceu}, 'como_conheceu')",
    "appearance": "",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sim_nao",
    "name": "quer_contacto",
    "label": "Quer que entremos em contacto consigo?",
    "hint": "Preencha: Quer que entremos em contacto consigo?",
    "required": "true",
    "calculation": "",
    "appearance": "minimal",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "calculate",
    "name": "quer_contacto_label",
    "label": "",
    "hint": "",
    "required": "false",
    "calculation": "jr:choice-name(${quer_contacto}, 'sim_nao')",
    "appearance": "",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "telefone_para_contacto",
    "label": "Telefone para contacto",
    "hint": "Se escolheu \"Sim\", indique um número válido.",
    "required": "${quer_contacto}='sim'",
    "calculation": "",
    "appearance": "numbers",
    "relevant": "(${registo_tipo} = 'visitante') and (${quer_contacto} = 'sim')",
    "constraint": "regex(translate(., '+ ', ''), '^(258)?8[2-7][0-9]{7}$')",
    "constraint_message": "Formato inválido. Use 84xxxxxxx ou 25884xxxxxxx.",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "group_registo_membro_efectivo",
    "label": "Cadastro de membro efectivo",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "${registo_tipo} = 'membro_efectivo'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "note",
    "name": "aviso",
    "label": "⚠️ Para membro efectivo, seleccione primeiro o nome na lista. Se não encontrar, use o campo manual.",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "${registo_tipo} = 'membro_efectivo'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one_from_file membros.csv",
    "name": "membro",
    "label": "Selecione o seu nome na lista para actualizar / confirmar",
    "hint": "⚠️ Aqui neste lugar somente  nomes da lista são permitidos. Digite para filtrar.",
    "required": "true",
    "calculation": "",
    "appearance": "autocomplete",
    "relevant": "${registo_tipo} = 'membro_efectivo'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sim_nao",
    "name": "encontrou",
    "label": "Encontrou o nome na lista?",
    "hint": "",
    "required": "true",
    "calculation": "",
    "appearance": "",
    "relevant": "${registo_tipo} = 'membro_efectivo'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "Escreve_o_seu_nome_completo",
    "label": "😁Aqui <span style=\"color:green;font-style:Bold;font-family:Rounded MT Bold\">**SIM** </span>podes escrever o teu nome completo",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "${registo_tipo} = 'membro_efectivo' and ${encontrou} = 'nao'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one fz2qm26",
    "name": "Confirmou_o_nome_que_escreveu",
    "label": "Confirmou o nome que escreveu?",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "${registo_tipo} = 'membro_efectivo' and ${encontrou} = 'nao'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "group_br9vf91",
    "label": "Dados de membro",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "group_ao7in31",
    "label": "Perfil (na igreja)",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one tu47p80",
    "name": "faixa_etaria_membro",
    "label": "Qual é a sua faixa etária?",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros', 'faixa_etaria_membro', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sexo",
    "name": "sexo",
    "label": "Sexo",
    "hint": "",
    "required": "true",
    "calculation": "pulldata('membros', 'sexo', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim')) and ${membro} != ''",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "departamento_001",
    "label": "Departamento ou Ministério",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros', 'departamento', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "grupo",
    "label": "Pequeno Grupo de oração",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros', 'grupo', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sim_nao",
    "name": "batizado",
    "label": "Já foi Baptizado(a)?",
    "hint": "",
    "required": "true",
    "calculation": "pulldata('membros', 'batizado', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim')) and ${membro} != ''",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sim_nao",
    "name": "comunhao",
    "label": "Membro em Plena Comunhão?",
    "hint": "",
    "required": "true",
    "calculation": "pulldata('membros', 'comunhao', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim')) and ${membro} != ''",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "group_pq3nu53",
    "label": "Contactos",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "celular_whatsapp",
    "label": "Celular com whatsapp",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros', 'celular_whatsapp', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "outro_nr_celular",
    "label": "Outro número de celular",
    "hint": "Opcional",
    "required": "false",
    "calculation": "pulldata('membros', 'outro_nr_celular', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "email",
    "label": "email",
    "hint": "Opcional",
    "required": "false",
    "calculation": "pulldata('membros', 'email', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "group_ji3rd53",
    "label": "Residência",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "bairro",
    "label": "Bairro onde vive",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros', 'bairro', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "quarteirao",
    "label": "Quarteirão",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros', 'quarteirao', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "cidade",
    "label": "Cidade",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros', 'cnameade', 'bname', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "begin_group",
    "name": "group_pd5ke64",
    "label": "Opcional",
    "hint": "",
    "required": "false",
    "calculation": "",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "select_one sim_nao",
    "name": "casado",
    "label": "Casado(a)",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros', 'casado', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim')) and ${membro} != ''",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "nome_conjuge",
    "label": "Nome conjuge",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros', 'nome_conjuge', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "data_casamento_ou_uniao",
    "label": "Data casamento ou união",
    "hint": "",
    "required": "false",
    "calculation": "pulldata('membros', 'data_casamento_ou_uniao', 'name', ${membro})",
    "appearance": "",
    "relevant": "(${registo_tipo} = 'membro_efectivo') and ((${Confirmou_o_nome_que_escreveu} = 'sim__continuar') or (${encontrou} = 'sim'))",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "text",
    "name": "pedido_oracao_obs",
    "label": "Pedido de oração / Observações (opcional)",
    "hint": "Preencha: Pedido de oração / Observações (opcional)",
    "required": "false",
    "calculation": "",
    "appearance": "long-text",
    "relevant": "${registo_tipo} = 'visitante'",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  },
  {
    "type": "end_group",
    "name": "",
    "label": "",
    "hint": "",
    "required": "",
    "calculation": "",
    "appearance": "",
    "relevant": "",
    "constraint": "",
    "constraint_message": "",
    "parameters": "",
    "choice_filter": "",
    "default": ""
  }
];

const CHOICES = {
  "menu_preencher": [
    {
      "name": "plano_cultos_escalas",
      "label": "Plano de cultos e escalas",
      "order": "1",
      "tipo": ""
    },
    {
      "name": "relatorio_cultos",
      "label": "Relatório dos cultos",
      "order": "2",
      "tipo": ""
    },
    {
      "name": "visitantes",
      "label": "Registo de visitantes e membros",
      "order": "3",
      "tipo": ""
    },
    {
      "name": "registo_financeiro",
      "label": "Registo financeiro",
      "order": "4",
      "tipo": ""
    }
  ],
  "culto_evento": [
    {
      "name": "culto1_dominical",
      "label": "1º Culto Dominical",
      "order": "",
      "tipo": ""
    },
    {
      "name": "culto2_dominical",
      "label": "2º Culto Dominical",
      "order": "",
      "tipo": ""
    },
    {
      "name": "culto_oracao",
      "label": "Culto de Oração",
      "order": "",
      "tipo": ""
    },
    {
      "name": "culto_jovens",
      "label": "Culto de Jovens",
      "order": "",
      "tipo": ""
    },
    {
      "name": "culto_especial",
      "label": "Culto Especial (especifique)",
      "order": "",
      "tipo": ""
    },
    {
      "name": "culto_meio_semana",
      "label": "Culto do Meio da Semana (Quarta-feira / Quinta-feira)",
      "order": "",
      "tipo": ""
    }
  ],
  "dia_meio_semana": [
    {
      "name": "segunda",
      "label": "Segunda-feira",
      "order": "1",
      "tipo": ""
    },
    {
      "name": "terca",
      "label": "Terça-feira",
      "order": "2",
      "tipo": ""
    },
    {
      "name": "quarta",
      "label": "Quarta-feira",
      "order": "3",
      "tipo": ""
    },
    {
      "name": "quinta",
      "label": "Quinta-feira",
      "order": "4",
      "tipo": ""
    },
    {
      "name": "sexta",
      "label": "Sexta-feira",
      "order": "5",
      "tipo": ""
    },
    {
      "name": "sabado",
      "label": "Sábado",
      "order": "6",
      "tipo": ""
    },
    {
      "name": "domingo",
      "label": "Domingo",
      "order": "7",
      "tipo": ""
    }
  ],
  "sim_nao": [
    {
      "name": "sim",
      "label": "Sim",
      "order": "",
      "tipo": ""
    },
    {
      "name": "nao",
      "label": "Não",
      "order": "",
      "tipo": ""
    }
  ],
  "tipo": [
    {
      "name": "Entrada",
      "label": "Entrada",
      "order": "",
      "tipo": ""
    },
    {
      "name": "Saida",
      "label": "Saída",
      "order": "",
      "tipo": ""
    }
  ],
  "rubricas": [
    {
      "name": "OFE",
      "label": "Ofertas",
      "order": "1",
      "tipo": "Entrada"
    },
    {
      "name": "ofertas_1__culto",
      "label": "Ofertas 1º Culto",
      "order": "2",
      "tipo": "Entrada"
    },
    {
      "name": "oferas_2__culto",
      "label": "Oferas 2º Culto",
      "order": "3",
      "tipo": "Entrada"
    },
    {
      "name": "CONTRI",
      "label": "Contribuições",
      "order": "4",
      "tipo": "Entrada"
    },
    {
      "name": "MIS",
      "label": "MNI",
      "order": "5",
      "tipo": "Entrada"
    },
    {
      "name": "ED",
      "label": "Escola Dominical",
      "order": "6",
      "tipo": "Entrada"
    },
    {
      "name": "EVENT",
      "label": "Eventos",
      "order": "7",
      "tipo": "Entrada"
    },
    {
      "name": "DOAC",
      "label": "Doações",
      "order": "8",
      "tipo": "Entrada"
    },
    {
      "name": "Filadelfia",
      "label": "Filadelfia",
      "order": "9",
      "tipo": "Entrada"
    },
    {
      "name": "Jerico",
      "label": "Jerico",
      "order": "10",
      "tipo": "Entrada"
    },
    {
      "name": "Galileia",
      "label": "Galileia",
      "order": "11",
      "tipo": "Entrada"
    },
    {
      "name": "Jerusalem",
      "label": "Jerusalem",
      "order": "12",
      "tipo": "Entrada"
    },
    {
      "name": "Ngalava",
      "label": "Ngalava",
      "order": "13",
      "tipo": "Entrada"
    },
    {
      "name": "Betania",
      "label": "Betania",
      "order": "14",
      "tipo": "Entrada"
    },
    {
      "name": "Kanana",
      "label": "Kanana",
      "order": "15",
      "tipo": "Entrada"
    },
    {
      "name": "Incendiarios",
      "label": "Incendiarios",
      "order": "16",
      "tipo": "Entrada"
    },
    {
      "name": "Ebenezer",
      "label": "Ebenezer",
      "order": "17",
      "tipo": "Entrada"
    },
    {
      "name": "Especial",
      "label": "Grupo Especial",
      "order": "18",
      "tipo": "Entrada"
    },
    {
      "name": "criancas",
      "label": "Crianças",
      "order": "19",
      "tipo": "Entrada"
    },
    {
      "name": "pais",
      "label": "Pais",
      "order": "20",
      "tipo": "Entrada"
    },
    {
      "name": "activistas",
      "label": "Ativistas",
      "order": "21",
      "tipo": "Entrada"
    },
    {
      "name": "idosos",
      "label": "Idosos",
      "order": "22",
      "tipo": "Entrada"
    },
    {
      "name": "outros_min",
      "label": "Outros Ministérios",
      "order": "23",
      "tipo": "Entrada"
    },
    {
      "name": "maes",
      "label": "Mães",
      "order": "24",
      "tipo": "Entrada"
    },
    {
      "name": "especial",
      "label": "Culto Especial",
      "order": "25",
      "tipo": "Entrada"
    },
    {
      "name": "outras_entradas",
      "label": "Outras entradas",
      "order": "26",
      "tipo": "Entrada"
    },
    {
      "name": "treinamento",
      "label": "Treinamento",
      "order": "27",
      "tipo": "Saida"
    },
    {
      "name": "retiro",
      "label": "Retiro",
      "order": "28",
      "tipo": "Saida"
    },
    {
      "name": "avivamento",
      "label": "Avivamento",
      "order": "29",
      "tipo": "Saida"
    },
    {
      "name": "SOC",
      "label": "Ajuda Social",
      "order": "30",
      "tipo": "Saida"
    },
    {
      "name": "SERV",
      "label": "Serviços/Água/Luz/Internet",
      "order": "31",
      "tipo": "Saida"
    },
    {
      "name": "MANUT",
      "label": "Manutenção",
      "order": "32",
      "tipo": "Saida"
    },
    {
      "name": "CONST",
      "label": "Construção/Obras",
      "order": "33",
      "tipo": "Saida"
    },
    {
      "name": "MAT",
      "label": "Materiais/Consumíveis",
      "order": "34",
      "tipo": "Saida"
    },
    {
      "name": "TRANSF",
      "label": "Transferências/Remessas",
      "order": "35",
      "tipo": "Saida"
    },
    {
      "name": "OFEMIS",
      "label": "Ofertas Missionárias Enviadas",
      "order": "36",
      "tipo": "Saida"
    },
    {
      "name": "Outr",
      "label": "Outras saidas",
      "order": "37",
      "tipo": "Saida"
    },
    {
      "name": "DIZ",
      "label": "Dízimos",
      "order": "38",
      "tipo": "Entrada"
    },
    {
      "name": "samaria",
      "label": "Samaria",
      "order": "39",
      "tipo": "Entrada"
    },
    {
      "name": "jni",
      "label": "JNI",
      "order": "40",
      "tipo": "Entrada"
    }
  ],
  "fontes": [
    {
      "name": "MEMBROS",
      "label": "Membros",
      "order": "",
      "tipo": ""
    },
    {
      "name": "VISIT",
      "label": "Visitantes",
      "order": "",
      "tipo": ""
    },
    {
      "name": "PARC",
      "label": "Parceiros",
      "order": "",
      "tipo": ""
    },
    {
      "name": "CAMP",
      "label": "Campanhas Especiais",
      "order": "",
      "tipo": ""
    },
    {
      "name": "DOADORES",
      "label": "Doadores Externos",
      "order": "",
      "tipo": ""
    },
    {
      "name": "OUTROS",
      "label": "Outras",
      "order": "",
      "tipo": ""
    }
  ],
  "departamentos": [
    {
      "name": "ENT_ADMIN_DIZIMOS",
      "label": "Administração — Dízimos",
      "order": "1",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_ADMIN_OFERTAS",
      "label": "Administração — Ofertas",
      "order": "2",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_ADMIN_DOACOES",
      "label": "Administração — Doações",
      "order": "3",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_ADMIN_CAMPANHAS",
      "label": "Administração — Campanhas",
      "order": "4",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_ADMIN_GRATIDAO",
      "label": "Administração — Gratidão",
      "order": "5",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_MIN_PAIS",
      "label": "Ministérios — Pais",
      "order": "6",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_MIN_SENHORAS",
      "label": "Ministérios — Senhoras",
      "order": "7",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_MIN_ACTIVISTAS",
      "label": "Ministérios — Activistas",
      "order": "8",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_MIN_CRIANCAS",
      "label": "Ministérios — Crianças",
      "order": "9",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_DEP_JNI",
      "label": "Departamentos — JNI",
      "order": "10",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_DEP_MNI",
      "label": "Departamentos — MNI",
      "order": "11",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_DEP_DNI",
      "label": "Departamentos — DNI",
      "order": "12",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_GRUPOS_ZONAS",
      "label": "Grupos e Zonas de oração",
      "order": "13",
      "tipo": "Entrada"
    },
    {
      "name": "ENT_OUTROS",
      "label": "Outros — Entrada",
      "order": "14",
      "tipo": "Entrada"
    },
    {
      "name": "SAI_ADMIN_AGUA",
      "label": "Despesas administrativas — Água",
      "order": "101",
      "tipo": "Saida"
    },
    {
      "name": "SAI_ADMIN_ALUGUER",
      "label": "Despesas administrativas — Aluguer",
      "order": "102",
      "tipo": "Saida"
    },
    {
      "name": "SAI_ADMIN_TELEFONE_INTERNET",
      "label": "Despesas administrativas — Telefone e internet",
      "order": "103",
      "tipo": "Saida"
    },
    {
      "name": "SAI_ADMIN_ENERGIA",
      "label": "Despesas administrativas — Energia eléctrica",
      "order": "104",
      "tipo": "Saida"
    },
    {
      "name": "SAI_PESSOAL_BENEFICIOS",
      "label": "Gastos com pessoal — Benefícios",
      "order": "105",
      "tipo": "Saida"
    },
    {
      "name": "SAI_PESSOAL_ENCARGOS",
      "label": "Gastos com pessoal — Encargos",
      "order": "106",
      "tipo": "Saida"
    },
    {
      "name": "SAI_PESSOAL_SALARIO",
      "label": "Gastos com pessoal — Salário",
      "order": "107",
      "tipo": "Saida"
    },
    {
      "name": "SAI_PESSOAL_SUBSIDIO",
      "label": "Gastos com pessoal — Subsídio",
      "order": "108",
      "tipo": "Saida"
    },
    {
      "name": "SAI_MANUT_LIMPEZA",
      "label": "Manutenção e limpeza — Limpeza",
      "order": "109",
      "tipo": "Saida"
    },
    {
      "name": "SAI_MANUT_MANUTENCAO",
      "label": "Manutenção e limpeza — Manutenção",
      "order": "110",
      "tipo": "Saida"
    },
    {
      "name": "SAI_MATERIAIS_ESCRITORIO",
      "label": "Materiais — Materiais de escritório",
      "order": "111",
      "tipo": "Saida"
    },
    {
      "name": "SAI_MATERIAIS_LIMPEZA",
      "label": "Materiais — Materiais de limpeza",
      "order": "112",
      "tipo": "Saida"
    },
    {
      "name": "SAI_IMPOSTOS_INSS",
      "label": "Impostos — INSS",
      "order": "113",
      "tipo": "Saida"
    },
    {
      "name": "SAI_DISTRITO_AVANTE",
      "label": "Despesas do Distrito — Avante Evangelho",
      "order": "114",
      "tipo": "Saida"
    },
    {
      "name": "SAI_DISTRITO_ALABASTRO",
      "label": "Despesas do Distrito — Alabastro",
      "order": "115",
      "tipo": "Saida"
    },
    {
      "name": "SAI_DISTRITO_GRATIDAO",
      "label": "Despesas do Distrito — Gratidão",
      "order": "116",
      "tipo": "Saida"
    },
    {
      "name": "SAI_DISTRITO_RADIO",
      "label": "Despesas do Distrito — Rádio",
      "order": "117",
      "tipo": "Saida"
    },
    {
      "name": "SAI_DISTRITO_UNIV_QUENIA",
      "label": "Despesas do Distrito — Universidade do Quénia",
      "order": "118",
      "tipo": "Saida"
    },
    {
      "name": "SAI_DISTRITO_SEMINARIO",
      "label": "Despesas do Distrito — Apoio ao seminário",
      "order": "119",
      "tipo": "Saida"
    },
    {
      "name": "SAI_ORC_JNI",
      "label": "Orçamento dos Departamentos — JNI",
      "order": "120",
      "tipo": "Saida"
    },
    {
      "name": "SAI_ORC_MNI",
      "label": "Orçamento dos Departamentos — MNI",
      "order": "121",
      "tipo": "Saida"
    },
    {
      "name": "SAI_ORC_DNI",
      "label": "Orçamento dos Departamentos — DNI",
      "order": "122",
      "tipo": "Saida"
    },
    {
      "name": "SAI_ORC_NATAL_SUPERINTENDENTE",
      "label": "Orçamento dos Departamentos — Natal do Superintendente Distrital",
      "order": "123",
      "tipo": "Saida"
    },
    {
      "name": "SAI_OUTROS",
      "label": "Outros — Saída",
      "order": "124",
      "tipo": "Saida"
    }
  ],
  "contas": [
    {
      "name": "CAIXA_SEDE",
      "label": "Caixa",
      "order": "",
      "tipo": ""
    },
    {
      "name": "MPESA_SEDE",
      "label": "M-Pesa",
      "order": "",
      "tipo": ""
    },
    {
      "name": "EMOLA_SEDE",
      "label": "E-Mola",
      "order": "",
      "tipo": ""
    },
    {
      "name": "BIM_IGREJA",
      "label": "Conta BIM",
      "order": "",
      "tipo": ""
    }
  ],
  "metodos": [
    {
      "name": "DINHEIRO",
      "label": "Dinheiro",
      "order": "",
      "tipo": ""
    },
    {
      "name": "MPESA",
      "label": "M-Pesa",
      "order": "",
      "tipo": ""
    },
    {
      "name": "EMOLA",
      "label": "E-Mola",
      "order": "",
      "tipo": ""
    },
    {
      "name": "TRANSF",
      "label": "Transferência Bancária",
      "order": "",
      "tipo": ""
    },
    {
      "name": "CHEQUE",
      "label": "Cheque",
      "order": "",
      "tipo": ""
    },
    {
      "name": "POS",
      "label": "POS",
      "order": "",
      "tipo": ""
    },
    {
      "name": "CARTAO",
      "label": "Cartão",
      "order": "",
      "tipo": ""
    }
  ],
  "doc_tipos": [
    {
      "name": "factura",
      "label": "Factura",
      "order": "",
      "tipo": ""
    },
    {
      "name": "recibo",
      "label": "Recibo",
      "order": "",
      "tipo": ""
    },
    {
      "name": "guia",
      "label": "Guia",
      "order": "",
      "tipo": ""
    },
    {
      "name": "nota_credito",
      "label": "Nota de Crédito",
      "order": "",
      "tipo": ""
    },
    {
      "name": "outro",
      "label": "Outro",
      "order": "",
      "tipo": ""
    }
  ],
  "moedas": [
    {
      "name": "MZN",
      "label": "Metical Moçambicano",
      "order": "",
      "tipo": ""
    },
    {
      "name": "ZAR",
      "label": "Rand Sul-Africano",
      "order": "",
      "tipo": ""
    }
  ],
  "modo_id": [
    {
      "name": "csv",
      "label": "Escolher da lista nominal",
      "order": "",
      "tipo": ""
    },
    {
      "name": "manual",
      "label": "Escrever manualmente",
      "order": "",
      "tipo": ""
    }
  ],
  "usuarios": [
    {
      "name": "filipe",
      "label": "Filipe — Secretário",
      "order": "",
      "tipo": ""
    },
    {
      "name": "kelvin",
      "label": "Kelvin — IT",
      "order": "",
      "tipo": ""
    },
    {
      "name": "alfa",
      "label": "Alfa — Tesoureira",
      "order": "",
      "tipo": ""
    },
    {
      "name": "alanisse",
      "label": "Alanisse — IT",
      "order": "",
      "tipo": ""
    }
  ],
  "sexo": [
    {
      "name": "M",
      "label": "Masculino",
      "order": "",
      "tipo": ""
    },
    {
      "name": "F",
      "label": "Feminino",
      "order": "",
      "tipo": ""
    }
  ],
  "faixa_etaria": [
    {
      "name": "crianca",
      "label": "Criança",
      "order": "",
      "tipo": ""
    },
    {
      "name": "adolescente",
      "label": "Adolescente",
      "order": "",
      "tipo": ""
    },
    {
      "name": "jovem",
      "label": "Jovem",
      "order": "",
      "tipo": ""
    },
    {
      "name": "adulto",
      "label": "Adulto",
      "order": "",
      "tipo": ""
    },
    {
      "name": "idoso",
      "label": "Idoso",
      "order": "",
      "tipo": ""
    }
  ],
  "como_conheceu": [
    {
      "name": "amigo_familia",
      "label": "Amigo/Família",
      "order": "",
      "tipo": ""
    },
    {
      "name": "redes_sociais",
      "label": "Redes sociais",
      "order": "",
      "tipo": ""
    },
    {
      "name": "passou_aqui",
      "label": "Passei por aqui",
      "order": "",
      "tipo": ""
    },
    {
      "name": "convite",
      "label": "Convite",
      "order": "",
      "tipo": ""
    },
    {
      "name": "outro",
      "label": "Outro",
      "order": "",
      "tipo": ""
    }
  ],
  "tipo_registo_pessoa": [
    {
      "name": "visitante",
      "label": "Visitante",
      "order": "1",
      "tipo": ""
    },
    {
      "name": "membro_efectivo",
      "label": "Membro efectivo",
      "order": "2",
      "tipo": ""
    }
  ],
  "fz2qm26": [
    {
      "name": "sim__continuar",
      "label": "Sim, continuar",
      "order": "",
      "tipo": ""
    },
    {
      "name": "n_o",
      "label": "Não",
      "order": "",
      "tipo": ""
    }
  ],
  "tu47p80": [
    {
      "name": "menor_de_18_anos",
      "label": "Menor de 18 anos",
      "order": "",
      "tipo": ""
    },
    {
      "name": "18___24_anos",
      "label": "18 – 24 anos",
      "order": "",
      "tipo": ""
    },
    {
      "name": "25___34_anos",
      "label": "25 – 34 anos",
      "order": "",
      "tipo": ""
    },
    {
      "name": "35___44_anos",
      "label": "35 – 44 anos",
      "order": "",
      "tipo": ""
    },
    {
      "name": "45___54_anos",
      "label": "45 – 54 anos",
      "order": "",
      "tipo": ""
    },
    {
      "name": "55___64_anos",
      "label": "55 – 64 anos",
      "order": "",
      "tipo": ""
    },
    {
      "name": "65_anos_ou_mais",
      "label": "65 anos ou mais",
      "order": "",
      "tipo": ""
    }
  ]
};

const state = {
  values: {}, members: [], churches: [], repeats: {}, currentView: 'formView', stats: null, appData: null, currentUser: null,
  memberScope: { churchId:'', churchName:'', loading:false, loaded:false, requestId:0, unassignedCount:0 },
  avante: { data:null, selectedGroup:'', loading:false },
  approvals: { items: [], selected: null, loading: false }
};
const PIN_BY_MODULE = {}; // A autenticação por utilizador substitui os PINs por módulo.


// ─────────────────────────────────────────────────────────────
// Modo teste / sandbox
// Abre com: ?sandbox=1 ou ?demo=1 ou ?teste=1
// Neste modo, o utilizador pode navegar e preencher formulários,
// mas nada é gravado.
// ─────────────────────────────────────────────────────────────
const SANDBOX_MODE = (() => {
  const params = new URLSearchParams(window.location.search);
  return params.has('sandbox') || params.has('demo') || params.has('teste') || params.get('modo') === 'demo' || params.get('modo') === 'teste';
})();
const SANDBOX_TOKEN = 'sandbox-token-nao-grava';
const SANDBOX_SUBMISSIONS_KEY = 'igreja_sandbox_submissions_v1';

function sandboxUser(username){
  const name = String(username || 'visitante_demo').trim() || 'visitante_demo';
  return {
    username: name,
    name: 'Utilizador em modo teste',
    role: 'DEMO',
    perfil: 'DEMO',
    igreja_id: 'igreja_demo',
    igreja_nome: 'Igreja do Nazareno em Demonstração',
    churchName: 'Igreja do Nazareno em Demonstração',
    nivel_acesso: 'LOCAL',
    viewAreas: ['GERAL','PLANO','CULTOS','FINANCAS','MEMBROS'],
    submitAreas: ['PLANO','CULTOS','FINANCAS','MEMBROS'],
    approveAreas: [],
    canConfig: false,
    sandbox: true
  };
}

function sandboxRecent(){
  try { return JSON.parse(localStorage.getItem(SANDBOX_SUBMISSIONS_KEY) || '[]'); }
  catch(e){ return []; }
}

function saveSandboxRecent(rows){
  localStorage.setItem(SANDBOX_SUBMISSIONS_KEY, JSON.stringify((rows || []).slice(0, 30)));
}

function addSandboxSubmission(payload){
  const rows = sandboxRecent();
  rows.unshift({
    submittedAt: new Date().toLocaleString('pt-MZ'),
    module: payload.module || payload.action || 'registo_demo',
    uuid: payload.uuid || uuid(),
    sandbox: true
  });
  saveSandboxRecent(rows);
}

function sandboxStats(){
  const rows = sandboxRecent();
  const stats = { plano_cultos_escalas: 2, relatorio_cultos: 2, visitantes: 3, registo_financeiro: 3 };
  rows.forEach(r => { if(stats[r.module] !== undefined) stats[r.module] += 1; });
  return { stats, recent: rows };
}

function sandboxAppData(){
  return {
    overview: {
      cultos: 4,
      visitantes: 18,
      movimentos: 9,
      mediaParticipantes: 126,
      visitantesPorTipo: [
        {label:'1ª visita', value: 11},
        {label:'Retorno', value: 7}
      ],
      comoConheceram: [
        {label:'Convite de membro', value: 9},
        {label:'Família', value: 5},
        {label:'Redes sociais', value: 4}
      ],
      presenca: [
        {label:'2026-05-03', value: 118},
        {label:'2026-05-10', value: 132},
        {label:'2026-05-17', value: 127},
        {label:'2026-05-24', value: 141}
      ],
      topRubricas: [
        {label:'DIZ', value: 42500},
        {label:'OFERTA', value: 18600},
        {label:'MISSOES', value: 7400}
      ],
      topDepartamentos: [
        {label:'ADMIN', value: 42500},
        {label:'JNI', value: 9800},
        {label:'MNI', value: 7400}
      ]
    },
    escalas: [
      {data:'2026-05-03', hora:'09:00', tipo:'Culto Dominical', especificacao:'1.º Culto', dia:'Domingo', funcao:'Pregador', nome:'Pr. Daniel M.', telefone:'84xxxxxxx'},
      {data:'2026-05-03', hora:'09:00', tipo:'Culto Dominical', especificacao:'1.º Culto', dia:'Domingo', funcao:'Acolhimento', nome:'Equipa A', telefone:'85xxxxxxx'},
      {data:'2026-05-10', hora:'09:00', tipo:'Culto Dominical', especificacao:'2.º Culto', dia:'Domingo', funcao:'Louvor', nome:'Grupo de Louvor', telefone:'86xxxxxxx'}
    ],
    cultos: [
      {data:'2026-05-03', hora:'09:00', tipo:'Culto Dominical', local:'Templo Central', participantes:118, visitantes:4, baptismos:0, decisoes:1, santaCeia:'Não', dizimos:10500, ofertas:4200},
      {data:'2026-05-10', hora:'09:00', tipo:'Culto Dominical', local:'Templo Central', participantes:132, visitantes:6, baptismos:1, decisoes:2, santaCeia:'Sim', dizimos:12800, ofertas:5100},
      {data:'2026-05-17', hora:'09:00', tipo:'Culto Dominical', local:'Templo Central', participantes:127, visitantes:3, baptismos:0, decisoes:0, santaCeia:'Não', dizimos:9200, ofertas:3900}
    ],
    visitantes: [
      {data:'2026-05-03', nome:'Ana Demo', sexo:'F', faixa:'18–35', bairro:'Matola', primeiraVez:'sim', comoConheceu:'Convite de membro', contacto:'sim', telefone:'84xxxxxxx', pedidoOracao:'Família'},
      {data:'2026-05-10', nome:'Carlos Demo', sexo:'M', faixa:'36–55', bairro:'Boquisso', primeiraVez:'sim', comoConheceu:'Redes sociais', contacto:'nao', telefone:'85xxxxxxx'},
      {data:'2026-05-17', nome:'Marta Demo', sexo:'F', faixa:'18–35', bairro:'Infulene', primeiraVez:'nao', comoConheceu:'Família', contacto:'sim', telefone:'86xxxxxxx'}
    ],
    dizimos: [
      {data:'2026-05-03', nome:'Membro Demo 1', modo:'Membro registado', valorOrig:'2500', moeda:'MZN', valorMzn:2500, metodo:'M-Pesa', recibo:'REC-001'},
      {data:'2026-05-10', nome:'Membro Demo 2', modo:'Membro registado', valorOrig:'5000', moeda:'MZN', valorMzn:5000, metodo:'Caixa', recibo:'REC-002'}
    ]
  };
}

function sandboxFinancialReport(){
  return {
    ok:true,
    generatedAt:new Date().toISOString(),
    period:{start:'', end:''},
    totals:{saldoAnterior:12000, entradas:68500, saidas:21400, saldoPeriodo:47100, saldoFinal:59100},
    accounts:[
      {key:'CAIXA_SEDE', label:'Caixa (Dinheiro Físico)', saldoAnterior:8000, entradas:24500, saidas:9200, saldoPeriodo:15300, saldoFinal:23300},
      {key:'MPESA_SEDE', label:'M-Pesa', saldoAnterior:4000, entradas:44000, saidas:12200, saldoPeriodo:31800, saldoFinal:35800}
    ],
    rubricas:[
      {key:'DIZ', label:'Dízimos', saldoAnterior:0, entradas:42500, saidas:0, saldoPeriodo:42500, saldoFinal:42500},
      {key:'OFERTA', label:'Ofertas', saldoAnterior:0, entradas:18600, saidas:0, saldoPeriodo:18600, saldoFinal:18600},
      {key:'MANUT', label:'Manutenção', saldoAnterior:0, entradas:0, saidas:8700, saldoPeriodo:-8700, saldoFinal:-8700}
    ],
    departamentos:[
      {key:'ADMIN', label:'Administração', saldoAnterior:0, entradas:42500, saidas:13200, saldoPeriodo:29300, saldoFinal:29300},
      {key:'JNI', label:'JNI', saldoAnterior:0, entradas:9800, saidas:3200, saldoPeriodo:6600, saldoFinal:6600},
      {key:'MNI', label:'MNI', saldoAnterior:0, entradas:7400, saidas:2800, saldoPeriodo:4600, saldoFinal:4600}
    ]
  };
}

function sandboxDelegadosData(){
  return {
    ok:true,
    igrejas:[
      {ano:2026, name:'igreja_demo', label:'Igreja do Nazareno em Demonstração', distrito_nome:'Distrito da Matola', membros_distrito:4020, membros_igreja:126, activo:'SIM'}
    ],
    rows:[
      {data_assembleia:'2026-05-14', igreja_label:'Igreja do Nazareno em Demonstração', delegados_leigos_eleitos:4, num_exofficio:2, num_suplentes:1, total_geral_com_suplentes:6}
    ],
    resumo:{igrejas:1, membrosIgrejas:126, delegadosEleitos:4, exOfficio:2, suplentes:1, totalSemSuplentes:6}
  };
}

function setupSandboxBanner(){
  if(!SANDBOX_MODE || document.getElementById('sandboxBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'sandboxBanner';
  banner.className = 'sandbox-banner';
  banner.innerHTML = '<strong>Modo teste</strong> — pode preencher, submeter e explorar sem gravar dados.';
  document.body.prepend(banner);
  document.body.classList.add('sandbox-mode');
  const help = document.querySelector('.login-help');
  if(help) help.textContent = 'Modo teste activo: pode usar qualquer utilizador e palavra-passe para experimentar. Nada será gravado.';
}


const AUTH_TOKEN_KEY = 'igreja_auth_token';
const AUTH_USER_KEY = 'igreja_auth_user';
const WORK_CHURCH_KEY = 'igreja_work_church_v1';

// v54.3.2: mantém a autenticação por separador; hotfix visual da descrição lateral. Ao fechar o
// separador ou o navegador, a palavra-passe volta a ser obrigatória.
function getAuthToken(){
  if(SANDBOX_MODE) return sessionStorage.getItem(AUTH_TOKEN_KEY) || SANDBOX_TOKEN;
  return sessionStorage.getItem(AUTH_TOKEN_KEY) || '';
}

function getStoredUser(){
  try { return JSON.parse(sessionStorage.getItem(AUTH_USER_KEY) || 'null'); }
  catch(e){ return null; }
}

function saveAuthSession(token, user){
  sessionStorage.setItem(AUTH_TOKEN_KEY, token || '');
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user || {}));
  // Elimina tokens persistentes das versões anteriores.
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  state.currentUser = user || null;
}

function clearAuthSession(){
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(WORK_CHURCH_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  state.currentUser = null;
  state.churches = [];
  state.members = [];
  state.memberScope = { churchId:'', churchName:'', loading:false, loaded:false, requestId:(state.memberScope?.requestId||0)+1, unassignedCount:0 };
}

function setCurrentUserCard(user){
  const u = user || getStoredUser() || {};
  const nameEl = $('#currentUserName');
  const roleEl = $('#currentUserRole');
  const churchEl = $('#currentUserChurch');
  if(nameEl) nameEl.textContent = u.name || u.username || 'Utilizador';
  if(roleEl) roleEl.textContent = u.role || u.perfil || 'Perfil';
  if(churchEl){
    const churchName = u.churchName || u.igreja_nome || u.igreja_id || 'Igreja';
    churchEl.textContent = churchName;
    churchEl.title = churchName;
  }
  updateChurchScopeUi();
}

const MODULE_AREA = {
  plano_cultos_escalas: 'PLANO',
  relatorio_cultos: 'CULTOS',
  registo_financeiro: 'FINANCAS',
  visitantes: 'MEMBROS'
};

function arr(value){
  return Array.isArray(value) ? value : String(value || '').split(',').map(x=>x.trim()).filter(Boolean);
}

function currentUser(){
  return state.currentUser || getStoredUser() || {};
}

function isDistrictUserClient(user=currentUser()){
  const church = String(user.igreja_id || user.churchId || '').trim().toUpperCase();
  const level = String(user.nivel_acesso || user.accessLevel || '').trim().toUpperCase();
  const role = String(user.role || user.perfil || '').trim().toUpperCase();
  return !!user.isDistrict || church === '*' || church === 'TODAS' || church === 'TODAS AS IGREJAS' || level === 'DISTRITAL' || role === 'ADMIN_IT' || role === 'ADMIN' || role === 'ADMINISTRADOR' || role.includes('DISTRITAL');
}

function getSelectedWorkChurchId(){
  if(!isDistrictUserClient()) return String(currentUser().igreja_id || currentUser().churchId || '').trim();
  return String(sessionStorage.getItem(WORK_CHURCH_KEY) || '').trim();
}

function findStateChurch(id){
  const key=String(id||'').trim();
  return (state.churches||[]).find(c=>String(c.igreja_id||c.id||c.name||'').trim()===key) || null;
}

function getEffectiveWorkChurch(){
  const u=currentUser();
  if(!isDistrictUserClient(u)){
    return { id:String(u.igreja_id||u.churchId||'').trim(), name:String(u.igreja_nome||u.churchName||'').trim() };
  }
  const id=getSelectedWorkChurchId();
  const church=findStateChurch(id);
  return church ? {id:String(church.igreja_id||church.id||church.name), name:String(church.nome_igreja||church.label||church.name||church.igreja_id)} : null;
}

async function setSelectedWorkChurch(id){
  const key=String(id||'').trim();
  const previous=getSelectedWorkChurchId();
  if(key) sessionStorage.setItem(WORK_CHURCH_KEY,key); else sessionStorage.removeItem(WORK_CHURCH_KEY);
  if(previous !== key){
    state.members=[];
    state.memberScope={churchId:key,churchName:'',loading:false,loaded:false,requestId:(state.memberScope?.requestId||0)+1,unassignedCount:0};
    clearMemberLinkedSelections();
  }
  updateChurchScopeUi();
  updateMemberImportUi();
  if(key){
    await loadMembersForChurch(key,{clearSelections:false});
  }else{
    state.members=[];
    state.memberScope={churchId:'',churchName:'',loading:false,loaded:false,requestId:(state.memberScope?.requestId||0)+1,unassignedCount:0};
    refreshMemberControls();
    setMemberScopeStatus();
  }
}

function populateWorkChurchSelector(){
  const box=$('#workChurchBox'), select=$('#workChurchSelect');
  if(!box || !select) return;
  const district=isDistrictUserClient();
  box.classList.toggle('hidden',!district);
  if(!district){
    select.innerHTML='<option value="">Igreja atribuída ao utilizador</option>';
    updateChurchScopeUi();
    return;
  }
  const current=getSelectedWorkChurchId();
  const churches=(state.churches||[]).slice().sort((a,b)=>String(a.nome_igreja||a.label||a.name||'').localeCompare(String(b.nome_igreja||b.label||b.name||''),'pt'));
  select.innerHTML='<option value="">Seleccione uma igreja...</option>'+churches.map(c=>{
    const id=String(c.igreja_id||c.id||c.name||'');
    const name=String(c.nome_igreja||c.label||c.name||id);
    return `<option value="${approvalEscape(id)}">${approvalEscape(name)}</option>`;
  }).join('');
  if(current && churches.some(c=>String(c.igreja_id||c.id||c.name||'')===current)) select.value=current;
  else sessionStorage.removeItem(WORK_CHURCH_KEY);
  updateChurchScopeUi();
}

function updateChurchScopeUi(){
  const district=isDistrictUserClient();
  const church=getEffectiveWorkChurch();
  const churchEl=$('#currentUserChurch');
  const selectedNameEl=$('#workChurchSelectedName');
  const visibleChurchName = district
    ? (church ? church.name : 'Seleccione uma igreja')
    : (church?.name || currentUser().igreja_nome || currentUser().churchName || currentUser().igreja_id || 'Igreja não atribuída');
  if(churchEl){
    churchEl.textContent=visibleChurchName;
    churchEl.title=visibleChurchName;
  }
  if(selectedNameEl){
    selectedNameEl.textContent=church ? church.name : 'Nenhuma igreja seleccionada.';
    selectedNameEl.title=church ? church.name : '';
    selectedNameEl.classList.toggle('empty',!church);
  }
  const topChurchBar=$('#topWorkChurchBar');
  const topChurchName=$('#topWorkChurchName');
  if(topChurchBar && topChurchName){
    const hasChurch=!!church;
    topChurchName.textContent=hasChurch ? church.name : 'Igreja não seleccionada';
    topChurchName.title=hasChurch ? church.name : 'Seleccione a Igreja de trabalho no painel lateral';
    topChurchBar.classList.toggle('empty',!hasChurch);
    topChurchBar.setAttribute('aria-label',hasChurch
      ? `Igreja de trabalho: ${church.name}`
      : 'Igreja de trabalho não seleccionada');
  }
  const workSelect=$('#workChurchSelect');
  if(workSelect) workSelect.title=church ? church.name : 'Seleccione a igreja de trabalho';
  const formBtn=document.querySelector('.nav-btn[data-view="formView"]');
  if(formBtn) formBtn.classList.toggle('scope-disabled',district && !church);
  const guard=$('#formChurchGuard');
  if(guard){
    if(district && !church){
      guard.classList.remove('hidden');
      guard.textContent='Seleccione primeiro a Igreja de trabalho no painel lateral. Sem essa selecção, nenhum novo registo pode ser preenchido ou submetido.';
    }else{
      guard.classList.add('hidden');
      guard.textContent='';
    }
  }
  setMemberScopeStatus();
  updateMemberImportUi();
}

function ensureWorkChurchForSubmission(showMessage=true){
  if(!isDistrictUserClient()) return true;
  if(getEffectiveWorkChurch()) return true;
  if(showMessage) toast('Seleccione primeiro a Igreja de trabalho no painel lateral.', 'error');
  $('#workChurchSelect')?.focus();
  return false;
}


function memberScopeChurchId(){
  const church=getEffectiveWorkChurch();
  return church ? String(church.id||'').trim() : '';
}

function setMemberScopeStatus(){
  const el=$('#memberScopeStatus');
  if(!el) return;
  const church=getEffectiveWorkChurch();
  el.classList.remove('loading','ok','warn');
  if(!church){
    el.classList.add('hidden');
    el.textContent='';
    return;
  }
  el.classList.remove('hidden');
  if(state.memberScope?.loading){
    el.classList.add('loading');
    el.textContent=`A carregar a lista nominal de ${church.name}...`;
    return;
  }
  if(state.memberScope?.loaded && state.memberScope.churchId===church.id){
    if(state.members.length){
      el.classList.add('ok');
      el.textContent=`Lista nominal carregada: ${state.members.length} membro(s) de ${church.name}.`;
    }else{
      el.classList.add('warn');
      el.textContent=`Ainda não foi carregada a lista nominal de membros de ${church.name}. Pode introduzir manualmente os nomes permitidos pelo formulário ou importar o CSV em Configuração.`;
    }
    return;
  }
  el.classList.add('warn');
  el.textContent=`A lista nominal de ${church.name} ainda não foi carregada.`;
}

function clearMemberLinkedSelections(){
  const memberFields=new Set(['dirigente','pregador','acolhimento_membros','louvor_membros','upd_membro','membro','dizimista_id']);
  const derivedFields=new Set([
    'dirigente_nome','dirigente_tel','dirigente_tel_final','pregador_nome','pregador_tel','pregador_tel_final',
    'acolhimento_nomes','acolhimento_telefones','louvor_nomes','louvor_telefones','upd_nome_actual','upd_tel_actual',
    'dizimista_nome_csv','dizimista_nome_final'
  ]);
  [...memberFields,...derivedFields].forEach(name=>{ if(Object.prototype.hasOwnProperty.call(state.values,name)) state.values[name]=''; });
  Object.values(state.repeats||{}).forEach(rows=>(rows||[]).forEach(row=>{
    if(!row) return;
    [...memberFields,...derivedFields].forEach(name=>{ if(Object.prototype.hasOwnProperty.call(row,name)) row[name]=''; });
  }));
  refreshMemberControls();
  updateDerived();
}

function refreshMemberControls(){
  $$('select[data-from-file="members"]').forEach(el=>fillMemberOptions(el));
  $$('input[data-from-file="members"][data-is-multi="1"]').forEach(hidden=>{
    const allowed=new Set((state.members||[]).map(m=>String(m.name||'')));
    setMultiValues(hidden,selectedMultiValues(hidden).filter(v=>allowed.has(v)));
    renderMultiOptions(hidden);
  });
  applyPulldataToVisibleInputs();
  refreshVisibility();
}

async function loadMembersForChurch(churchId,{clearSelections=false}={}){
  const id=String(churchId||'').trim();
  if(!id){
    state.members=[];
    state.memberScope={churchId:'',churchName:'',loading:false,loaded:false,requestId:(state.memberScope?.requestId||0)+1,unassignedCount:0};
    refreshMemberControls();
    setMemberScopeStatus();
    return [];
  }
  if(clearSelections) clearMemberLinkedSelections();
  const church=findStateChurch(id) || getEffectiveWorkChurch();
  const requestId=(state.memberScope?.requestId||0)+1;
  state.memberScope={churchId:id,churchName:church?.name||church?.nome_igreja||id,loading:true,loaded:false,requestId,unassignedCount:0};
  state.members=[];
  refreshMemberControls();
  setMemberScopeStatus();
  if(SANDBOX_MODE){
    state.memberScope.loading=false;
    state.memberScope.loaded=true;
    setMemberScopeStatus();
    return [];
  }
  try{
    const token=getAuthToken();
    if(!token) throw new Error('Sessão expirada. Faça login novamente.');
    const params=new URLSearchParams({action:'membersbychurch',token,igreja_id:id});
    const res=await fetch(window.APP_CONFIG.APPS_SCRIPT_URL+'?'+params.toString(),{cache:'no-store'});
    const out=await res.json();
    if(!out.ok) throw new Error(out.message||'Não foi possível carregar os membros.');
    if(state.memberScope.requestId!==requestId || memberScopeChurchId()!==id) return [];
    state.members=Array.isArray(out.members)?out.members:[];
    state.memberScope={churchId:id,churchName:out.church?.nome_igreja||out.church?.name||church?.name||id,loading:false,loaded:true,requestId,unassignedCount:Number(out.unassignedCount||0)};
    refreshMemberControls();
    setMemberScopeStatus();
    return state.members;
  }catch(err){
    if(state.memberScope.requestId!==requestId) return [];
    state.members=[];
    state.memberScope={churchId:id,churchName:church?.name||id,loading:false,loaded:false,requestId,unassignedCount:0};
    refreshMemberControls();
    setMemberScopeStatus();
    const msg=String(err?.message||'Não foi possível carregar os membros.');
    if(/sess[aã]o|token/i.test(msg)){
      clearAuthSession();
      showLogin(msg);
    }else toast(msg,'error');
    return [];
  }
}

function ensureMembersForCurrentChurch(){
  const church=getEffectiveWorkChurch();
  if(!church){
    state.members=[];
    refreshMemberControls();
    setMemberScopeStatus();
    return;
  }
  if(state.memberScope?.loaded && state.memberScope.churchId===church.id) return;
  if(!isDistrictUserClient() && state.members.length){
    state.memberScope={churchId:church.id,churchName:church.name,loading:false,loaded:true,requestId:state.memberScope?.requestId||0,unassignedCount:0};
    refreshMemberControls();
    setMemberScopeStatus();
    return;
  }
  loadMembersForChurch(church.id);
}

function updateMemberImportUi(){
  const badge=$('#memberImportChurch');
  const button=$('#importMembersBtn');
  const church=getEffectiveWorkChurch();
  if(badge) badge.textContent=church ? church.name : 'Seleccione uma igreja';
  if(button) button.disabled=!church;
}

function parseCsvTextV543(text){
  const source=String(text||'').replace(/^\uFEFF/,'');
  const firstLine=(source.split(/\r?\n/,1)[0]||'');
  const counts={';':(firstLine.match(/;/g)||[]).length,',':(firstLine.match(/,/g)||[]).length,'\t':(firstLine.match(/\t/g)||[]).length};
  const delimiter=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
  const rows=[]; let row=[]; let field=''; let quoted=false;
  for(let i=0;i<source.length;i++){
    const ch=source[i];
    if(ch==='"'){
      if(quoted && source[i+1]==='"'){field+='"';i++;}
      else quoted=!quoted;
    }else if(ch===delimiter && !quoted){row.push(field.trim());field='';}
    else if((ch==='\n'||ch==='\r') && !quoted){
      if(ch==='\r'&&source[i+1]==='\n') i++;
      row.push(field.trim());field='';
      if(row.some(v=>String(v).trim())) rows.push(row);
      row=[];
    }else field+=ch;
  }
  row.push(field.trim()); if(row.some(v=>String(v).trim())) rows.push(row);
  if(rows.length<2) return [];
  const headers=rows.shift().map(h=>String(h||'').trim());
  return rows.map(values=>{
    const obj={}; headers.forEach((h,i)=>obj[h]=values[i]??''); return obj;
  }).filter(obj=>Object.values(obj).some(v=>String(v).trim()));
}

async function importMembersCsv(){
  const church=getEffectiveWorkChurch();
  const file=$('#membersCsvFile')?.files?.[0];
  const mode=$('#membersImportMode')?.value||'UPSERT';
  const result=$('#membersImportResult');
  if(!church) return toast('Seleccione primeiro a Igreja de trabalho.','error');
  if(!file) return toast('Seleccione o ficheiro CSV da igreja.','error');
  if(mode==='REPLACE' && !window.confirm(`Substituir toda a lista nominal de ${church.name}?`)) return;
  const button=$('#importMembersBtn');
  if(button){button.disabled=true;button.textContent='A importar...';}
  if(result){result.classList.add('hidden');result.classList.remove('error');result.textContent='';}
  try{
    const rows=parseCsvTextV543(await file.text());
    if(!rows.length) throw new Error('O ficheiro CSV não contém linhas de membros válidas.');
    const payload={action:'importMembersCsv',authToken:getAuthToken(),igreja_id:church.id,igreja_nome:church.name,mode,rows};
    const res=await fetch(window.APP_CONFIG.APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
    const out=await res.json();
    if(!out.ok) throw new Error(out.message||'Não foi possível importar os membros.');
    if(result){result.classList.remove('hidden');result.textContent=`Importação concluída: ${out.imported||0} membro(s); ${out.updated||0} actualizado(s). Total da igreja: ${out.total||0}.`;}
    toast('Lista nominal importada com sucesso.','success');
    await loadMembersForChurch(church.id,{clearSelections:true});
    if($('#membersCsvFile')) $('#membersCsvFile').value='';
  }catch(err){
    const msg=String(err?.message||'Falha na importação.');
    if(result){result.classList.remove('hidden');result.classList.add('error');result.textContent=msg;}
    toast(msg,'error');
  }finally{
    if(button){button.disabled=!getEffectiveWorkChurch();button.textContent='Importar membros';}
  }
}

function userCanViewArea(area){
  if(!area || area === 'GERAL') return true;
  const u = currentUser();
  return arr(u.viewAreas).includes(area) || String(u.role || '').toUpperCase().includes('ADMIN');
}

function userCanSubmitArea(area){
  const u = currentUser();
  return arr(u.submitAreas).includes(area) || String(u.role || '').toUpperCase().includes('ADMIN');
}

function userCanApprove(){
  const u = currentUser();
  return arr(u.approveAreas).length > 0 || String(u.role || '').toUpperCase().includes('ADMIN');
}

function userCanSubmitModule(module){
  const area = MODULE_AREA[module];
  return !!area && userCanSubmitArea(area);
}

function firstVisibleNav(){
  return $$('.nav-btn').find(b => !b.classList.contains('hidden'));
}

function openView(viewId){
  const btn = document.querySelector(`.nav-btn[data-view="${CSS.escape(viewId)}"]`);
  if(!btn || btn.classList.contains('hidden')) return;
  if(viewId === 'formView' && !ensureWorkChurchForSubmission()) return;
  $$('.nav-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  $$('.view').forEach(v=>v.classList.remove('active'));
  $('#' + viewId)?.classList.add('active');
  state.currentView = viewId;
  if(viewId === 'dashboardView') loadStats();
  if(viewId === 'reportView') loadFinancialReport();
  if(viewId === 'delegadosView') loadDelegadosModule();
  if(viewId === 'avanteView') loadAvanteModule();
  if(viewId === 'approvalView') loadApprovals();
  if(['overviewView','escalasView','cultosView','visitantesView','dizimosView'].includes(viewId)) loadAppData();
}

function applyPermissionsToUi(){
  const u = currentUser();
  $$('.nav-btn').forEach(btn => {
    const area = btn.dataset.area || '';
    const view = btn.dataset.view || '';
    let visible = true;
    if(area) visible = userCanViewArea(area);
    if(btn.dataset.districtOnly === 'true') {
      const role = String(u.role || u.perfil || '').trim().toUpperCase();
      const churchScope = String(u.igreja_id || u.churchId || '').trim().toUpperCase();
      const accessLevel = String(u.nivel_acesso || u.accessLevel || '').trim().toUpperCase();
      const district = !!u.isDistrict || churchScope === '*' || churchScope === 'TODAS' || churchScope === 'TODAS AS IGREJAS' || accessLevel === 'DISTRITAL' || role === 'ADMIN_IT' || role.includes('DISTRITAL');
      visible = visible && district;
    }
    if(view === 'formView') visible = arr(u.submitAreas).length > 0;
    if(view === 'approvalView') visible = userCanApprove();
    if(view === 'helpView') visible = !!u.canConfig || String(u.role || '').toUpperCase().includes('ADMIN');
    btn.classList.toggle('hidden', !visible);
  });

  const allowedModules = (CHOICES.menu_preencher || []).filter(o => userCanSubmitModule(o.name));
  const selected = getVal('menu_preencher');
  if(selected && !userCanSubmitModule(selected)) setVal('menu_preencher', '');
  if(!getVal('menu_preencher') && allowedModules.length === 1) setVal('menu_preencher', allowedModules[0].name);

  populateWorkChurchSelector();
  populateApprovalFilters();
  updateChurchScopeUi();

  const active = $('.nav-btn.active');
  if(!active || active.classList.contains('hidden') || (active.dataset.view === 'formView' && !ensureWorkChurchForSubmission(false))){
    const first = firstVisibleNav();
    if(first && first.dataset.view !== 'formView') openView(first.dataset.view);
  }
}

function showLogin(message=''){
  $('#loginScreen')?.classList.remove('hidden');
  $('#appShell')?.classList.add('hidden');
  if(message) toast(message, 'error');
}

function showApp(user){
  $('#loginScreen')?.classList.add('hidden');
  $('#appShell')?.classList.remove('hidden');
  state.currentUser = user || state.currentUser || getStoredUser();
  setCurrentUserCard(user);
  populateWorkChurchSelector();
  applyPermissionsToUi();
}


function injectMultiSelectStyles(){
  if(document.getElementById('multiSelectStyles')) return;
  const style=document.createElement('style');
  style.id='multiSelectStyles';
  style.textContent=`
    .multi-check-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-top:8px;max-height:260px;overflow:auto;border:1px solid #cbd5e1;border-radius:14px;padding:10px;background:#fff}
    .multi-check-option{display:flex;align-items:center;gap:9px;padding:9px 10px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;cursor:pointer;font-weight:600;line-height:1.25}
    .multi-check-option:hover{background:#eefcf8;border-color:#14b8a6}
    .multi-check-option input{width:18px;height:18px;accent-color:#0f766e;flex:0 0 auto}
    .multi-empty{padding:12px;color:#64748b}
  `;
  document.head.appendChild(style);
}


function setLoginMessage(message, type='error'){
  const box = $('#loginMessage');
  if(!box) return;
  if(!message){
    box.textContent = '';
    box.className = 'login-message hidden';
    return;
  }
  box.textContent = message;
  box.className = 'login-message ' + (type || 'error');
}

function markLoginFieldsError(active=true){
  $('#loginUsername')?.classList.toggle('login-error', !!active);
  $('#loginPassword')?.classList.toggle('login-error', !!active);
}

let loginSubmissionInProgress = false;

async function handleLoginSubmit(e){
  if(e && typeof e.preventDefault === 'function') e.preventDefault();
  if(e && typeof e.stopPropagation === 'function') e.stopPropagation();
  if(loginSubmissionInProgress) return false;
  loginSubmissionInProgress = true;

  const usernameEl = document.getElementById('loginUsername');
  const passwordEl = document.getElementById('loginPassword');
  const form = document.getElementById('loginForm');
  const btn = form ? form.querySelector('button[type="submit"], button') : null;

  const username = usernameEl ? String(usernameEl.value || '').trim() : '';
  const password = passwordEl ? String(passwordEl.value || '') : '';

  setLoginMessage('');
  markLoginFieldsError(false);

  if(!username || !password){
    markLoginFieldsError(true);
    setLoginMessage('Preencha o nome de utilizador e a palavra-passe.');
    toast('Informe o utilizador e a palavra-passe.', 'error');
    loginSubmissionInProgress = false;
    return false;
  }

  const oldText = btn ? btn.textContent : '';
  if(btn){ btn.disabled = true; btn.textContent = 'A entrar...'; }
  setLoginMessage('A verificar credenciais...', 'info');

  try{
    if(SANDBOX_MODE){
      const user = sandboxUser(username);
      saveAuthSession(SANDBOX_TOKEN, user);
      state.members = [];
      showApp(user);
      injectMultiSelectStyles();
      toast('Modo teste aberto. Nenhum dado será gravado.');
      try { await bootstrap(); } catch(_e) { console.warn(_e); }
      return false;
    }

    const url = window.APP_CONFIG && window.APP_CONFIG.APPS_SCRIPT_URL;
    if(!url){
      throw new Error('Erro de configuração: a ligação ao backend não está definida.');
    }

    const res = await fetch(url, {
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({ action:'login', username, password })
    });

    let out = null;
    try { out = await res.json(); }
    catch(jsonErr){ throw new Error('O backend respondeu, mas não devolveu JSON válido. Verifique o deployment do Apps Script.'); }

    if(!out || !out.ok){
      throw new Error((out && (out.message || out.error)) || 'Credenciais inválidas.');
    }

    const token = out.token || out.authToken || '';
    const user = out.user || out.utilizador || out.usuario || null;
    if(!token || !user){
      throw new Error('Login aceite, mas o backend não devolveu token/utilizador. Verifique o Code.gs publicado.');
    }

    saveAuthSession(token, user);
    state.members = out.members || [];
    state.churches = out.churches || [];
    const loginChurch=getEffectiveWorkChurch();
    state.memberScope={churchId:loginChurch?.id||'',churchName:loginChurch?.name||'',loading:false,loaded:!!loginChurch && !isDistrictUserClient(user),requestId:0,unassignedCount:Number(out.memberScope?.unassignedCount||0)};
    setLoginMessage('', 'success');
    markLoginFieldsError(false);
    showApp(user);
    injectMultiSelectStyles();
    toast('Login efectuado com sucesso.', 'success');

    // A resposta do login já contém utilizador e membros. Não executar um
    // segundo bootstrap bloqueante agora: uma falha transitória não deve
    // desfazer uma autenticação que o backend acabou de aceitar.
    state.members = out.members || [];
    applyPermissionsToUi();
    renderForm();
    ensureMembersForCurrentChurch();
    applyUrlModuleParam();
    setStatus('ok','Ligado','Sessão iniciada com sucesso');
    Promise.resolve().then(() => {
      loadStats();
      loadAppData();
    });
    return false;
  }catch(err){
    console.error('Falha no login:', err);
    markLoginFieldsError(true);
    const msg = err && err.message ? err.message : 'Credenciais inválidas.';
    const finalMsg = /credenciais|utilizador|senha|password|palavra|inactivo|inativo/i.test(msg)
      ? 'Utilizador ou palavra-passe incorrectos. Verifique os dados e tente novamente.'
      : msg;
    setLoginMessage(finalMsg, 'error');
    toast(finalMsg, 'error');
    return false;
  }finally{
    loginSubmissionInProgress = false;
    if(btn){ btn.disabled = false; btn.textContent = oldText || 'Entrar'; }
  }
}

function setupLoginHandlers(){
  const form = document.getElementById('loginForm');
  if(form && form.dataset.loginHandlerReady !== '1'){
    form.dataset.loginHandlerReady = '1';
    // Uma única origem de submissão. O clique no botão e a tecla Enter
    // disparam naturalmente o evento submit do formulário.
    form.addEventListener('submit', handleLoginSubmit);
  }

  ['#loginUsername','#loginPassword'].forEach(sel => {
    const el = $(sel);
    if(el && el.dataset.loginInputReady !== '1'){
      el.dataset.loginInputReady = '1';
      el.addEventListener('input', () => { setLoginMessage(''); markLoginFieldsError(false); });
    }
  });

  const logoutBtn = $('#logoutBtn');
  if(logoutBtn && logoutBtn.dataset.logoutHandlerReady !== '1'){
    logoutBtn.dataset.logoutHandlerReady = '1';
    logoutBtn.addEventListener('click', async () => {
      const token = getAuthToken();
      const url = window.APP_CONFIG && window.APP_CONFIG.APPS_SCRIPT_URL;
      if(token && url && !SANDBOX_MODE){
        try{
          await fetch(url, {
            method:'POST',
            headers:{'Content-Type':'text/plain;charset=utf-8'},
            body: JSON.stringify({action:'logout', authToken: token})
          });
        }catch(_e){ /* o logout local deve prosseguir mesmo sem rede */ }
      }
      clearAuthSession();
      state.values = {};
      state.repeats = {};
      showLogin('Sessão terminada.');
    });
  }
}


function toast(message, type='info'){
  const t = $('#toast'); t.textContent = message; t.className = `toast show ${type}`;
  setTimeout(()=> t.classList.remove('show'), 4200);
}
function setStatus(kind, title, text){
  const dot=$('#statusDot'); dot.className='status-dot '+(kind||'');
  $('#statusTitle').textContent=title; $('#statusText').textContent=text;
}
function cleanHtml(s){ return String(s||'').replace(/<[^>]*>/g,'').replace(/\*\*/g,''); }
function baseType(type){ return String(type||'').split(/\s+/)[0]; }
function listName(type){ return String(type||'').split(/\s+/)[1] || ''; }
function uuid(){ return (crypto.randomUUID ? crypto.randomUUID() : 'id-'+Date.now()+'-'+Math.random().toString(16).slice(2)); }

function getVal(name){ return state.values[name] ?? ''; }
function setVal(name, value){ state.values[name] = value ?? ''; }

const REPEAT_CALCULATED_FIELDS = new Set([
  'upd_membro_label','upd_tel_atual_norm','upd_tel_novo_norm','upd_tel_atual',
  'dizimista_nome_csv','dizimista_nome_final','moeda_ctx','cambio_ctx','diz_valor_mzn'
]);

function contextValue(name, context){
  if(context && Object.prototype.hasOwnProperty.call(context, name)) return context[name] ?? '';
  return getVal(name);
}

function jsExpr(expr){
  if(!expr) return 'true';
  let e = String(expr).trim();
  e = e.replace(/\$\{([^}]+)\}/g, (_, n)=>`ctxVal("${n}")`);
  e = e.replace(/string-length\((ctxVal\("[^"]+"\))\)/g, 'String($1 ?? "").length');
  e = e.replace(/\bnot\s*\(/g, '!(');
  e = e.replace(/\band\b/gi, '&&').replace(/\bor\b/gi, '||');
  e = e.replace(/(?<![!<>=])=(?![=])/g, '==');
  return e;
}

function evalExpr(expr, context={}){
  if(expr === true || expr === 'true') return true;
  if(expr === false || expr === 'false') return false;
  if(expr === '' || expr == null) return true;
  try {
    const ctxVal = name => contextValue(name, context);
    return !!Function('ctxVal', `return (${jsExpr(expr)});`)(ctxVal);
  } catch(err){
    console.error('Expressão não avaliada:', expr, err);
    return false;
  }
}

function isRequired(required, context={}){
  if(required === true || required === 'true') return true;
  if(!required || required === 'false') return false;
  return evalExpr(required, context);
}

function optionLabel(list, value){
  const item=(CHOICES[list]||[]).find(x=>String(x.name)===String(value));
  return item ? item.label : (value ?? '');
}

function financeDepartmentDetail(){
  const selected=String(getVal('departamento')||'').trim();
  if(selected==='ENT_GRUPOS_ZONAS') return String(getVal('departamento_grupo_zona')||'').trim();
  if(selected==='ENT_OUTROS' || selected==='SAI_OUTROS') return String(getVal('departamento_outro')||'').trim();
  return '';
}

function financeDepartmentFinalKey(){
  const selected=String(getVal('departamento')||'').trim();
  if(!selected) return '';
  const detail=financeDepartmentDetail();
  return detail ? `${selected}::${detail}` : selected;
}

function financeDepartmentFinalLabel(){
  const selected=String(getVal('departamento')||'').trim();
  if(!selected) return '';
  const base=optionLabel('departamentos',selected) || selected;
  const detail=financeDepartmentDetail();
  return detail ? `${base} — ${detail}` : base;
}

function numberValue(value){
  if(value === '' || value == null) return NaN;
  if(typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  let s=String(value).trim().replace(/\s+/g,'');
  if(!s) return NaN;
  if(s.includes(',') && s.includes('.')){
    if(s.lastIndexOf(',') > s.lastIndexOf('.')) s=s.replace(/\./g,'').replace(',','.');
    else s=s.replace(/,/g,'');
  } else {
    s=s.replace(',','.');
  }
  const n=Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function moneyValue(value){
  const n=numberValue(value);
  return Number.isFinite(n) ? Math.round((n + Number.EPSILON) * 100) / 100 : NaN;
}

function timeToMinutes(value){
  const m=String(value||'').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if(!m) return NaN;
  const h=Number(m[1]), min=Number(m[2]);
  if(h<0 || h>23 || min<0 || min>59) return NaN;
  return h*60+min;
}

function dateParts(value){
  const m=String(value||'').trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(!m) return null;
  return {year:Number(m[1]), month:Number(m[2]), day:Number(m[3])};
}

function formatDatePt(value){
  const p=dateParts(value);
  return p ? `${String(p.day).padStart(2,'0')}/${String(p.month).padStart(2,'0')}/${p.year}` : '';
}

function normalizeMozPhone(value){
  const s=String(value||'').replace(/[+\s()-]/g,'');
  if(!s) return '';
  if(/^8[2-7]\d{7}$/.test(s)) return '258'+s;
  return s;
}

function validMozPhone(value){
  const s=String(value||'').replace(/[+\s()-]/g,'');
  return /^(258)?8[2-7]\d{7}$/.test(s);
}

function memberField(name, field){
  const m = state.members.find(x => String(x.name)===String(name));
  if(!m) return '';
  const exact=m[field];
  if(exact !== undefined && exact !== null) return exact;
  const wanted=String(field||'').toLowerCase();
  const key=Object.keys(m).find(k=>String(k).toLowerCase()===wanted);
  return key ? (m[key] ?? '') : '';
}

function calculateMainField(field){
  const name=field.name;
  const c=String(field.calculation||'');

  const choiceMatch = c.match(/jr:choice-name\(\$\{([^}]+)\},\s*'([^']+)'\)/);
  if(choiceMatch) return optionLabel(choiceMatch[2], getVal(choiceMatch[1]));

  const pd = c.match(/pulldata\('membros',\s*'([^']+)'\s*,\s*'name'\s*,\s*\$\{([^}]+)\}\)/);
  if(pd) return memberField(getVal(pd[2]), pd[1]);

  switch(name){
    case 'submission_uuid': return getVal(name) || uuid();
    case 'pin_esperado': return '';
    case 'acesso_ok': return 1;
    case 'dirigente_tel_final': return getVal('dirigente_tel') || getVal('dirigente_tel_manual') || '';
    case 'pregador_tel_final': return getVal('pregador_tel') || getVal('pregador_tel_manual') || '';
    case 'hora_inicio_hhmm': return String(getVal('hora_inicio')||'').slice(0,5);
    case 'hora_fim_hhmm': return String(getVal('hora_fim')||'').slice(0,5);
    case 'culto_datetime': {
      const d=getVal('data_culto'), h=getVal('hora_inicio');
      return d && h ? `${d}T${h}` : '';
    }
    case 'culto_texto': {
      const d=formatDatePt(getVal('data_culto')), h=String(getVal('hora_inicio')||'').slice(0,5);
      return d && h ? `${d} às ${h}` : '';
    }
    case 'upd_tel_atual_norm': return normalizeMozPhone(getVal('upd_tel_atual'));
    case 'upd_tel_novo_norm': return normalizeMozPhone(getVal('upd_tel_novo'));
    case 'departamento_final': return financeDepartmentFinalKey();
    case 'departamento_final_label': return financeDepartmentFinalLabel();
    case 'valor_mzn': {
      if(getVal('rubrica')==='DIZ' && getVal('tipo')==='Entrada') return getVal('diz_total_mzn');
      const valor=moneyValue(getVal('valor'));
      if(!Number.isFinite(valor)) return '';
      if(getVal('moeda')==='MZN') return valor;
      const cambio=moneyValue(getVal('cambio'));
      return Number.isFinite(cambio) ? moneyValue(valor*cambio) : '';
    }
    case 'mes': {
      const p=dateParts(getVal('data')); return p ? p.month : '';
    }
    case 'trimestre': {
      const p=dateParts(getVal('data')); return p ? Math.ceil(p.month/3) : '';
    }
    case 'ano': {
      const p=dateParts(getVal('data')); return p ? p.year : '';
    }
    case 'timestamp': return getVal(name) || new Date().toISOString();
    case 'instanceID': return getVal(name) || uuid();
    case 'diz_total_mzn': {
      const rows=state.repeats.dizimistas||[];
      const values=rows.map(r=>moneyValue(r.diz_valor_mzn)).filter(Number.isFinite);
      return values.length ? moneyValue(values.reduce((a,b)=>a+b,0)) : '';
    }
    case 'diz_n_contribuicoes': {
      return (state.repeats.dizimistas||[]).filter(r=>Number.isFinite(numberValue(r.diz_valor)) && numberValue(r.diz_valor)>0).length;
    }
    case 'rel_total_contribuicoes': {
      const d=moneyValue(getVal('rel_dizimos_valor'));
      const o=moneyValue(getVal('rel_ofertas_valor'));
      return moneyValue((Number.isFinite(d)?d:0)+(Number.isFinite(o)?o:0));
    }
    default: {
      const direct=c.match(/^\$\{([^}]+)\}$/);
      return direct ? getVal(direct[1]) : getVal(name);
    }
  }
}

function calculateRepeatRows(){
  Object.keys(state.repeats||{}).forEach(repName=>{
    state.repeats[repName]=(state.repeats[repName]||[]).map(row=>{
      const r={...(row||{})};
      if(repName==='rep_actualizar_contactos'){
        r.upd_membro_label=memberField(r.upd_membro,'label');
        r.upd_tel_atual=memberField(r.upd_membro,'Telefone');
        r.upd_tel_atual_norm=normalizeMozPhone(r.upd_tel_atual);
        r.upd_tel_novo_norm=normalizeMozPhone(r.upd_tel_novo);
      }
      if(repName==='dizimistas'){
        r.dizimista_nome_csv=memberField(r.dizimista_id,'label');
        r.dizimista_nome_final=r.modo_ident==='csv' ? r.dizimista_nome_csv : (r.dizimista_nome_manual||'');
        r.moeda_ctx=getVal('moeda');
        r.cambio_ctx=getVal('cambio');
        const valor=moneyValue(r.diz_valor);
        const cambio=moneyValue(r.cambio_ctx);
        r.diz_valor_mzn=Number.isFinite(valor)
          ? (r.moeda_ctx==='MZN' ? valor : (Number.isFinite(cambio) ? moneyValue(valor*cambio) : ''))
          : '';
      }
      return r;
    });
  });
}

function syncCalculatedInputs(){
  $$('[data-repeat-name]').forEach(el=>{
    const rep=el.dataset.repeatName, idx=Number(el.dataset.repeatIndex), name=el.dataset.originalName;
    if(!REPEAT_CALCULATED_FIELDS.has(name)) return;
    const value=state.repeats?.[rep]?.[idx]?.[name] ?? '';
    if(el.value!==String(value)) el.value=value;
  });
}

function interpolateTemplate(template, context={}){
  return String(template||'').replace(/\$\{([^}]+)\}/g, (_,name)=>String(contextValue(name,context) ?? ''));
}

function contextForElement(el){
  const source = el?.matches?.('[data-repeat-name]') ? el : el?.querySelector?.('[data-repeat-name]');
  const ownRepeat=el?.dataset?.repeatName;
  const repeatName=ownRepeat || source?.dataset?.repeatName || '';
  const rawIndex=el?.dataset?.repeatIndex ?? source?.dataset?.repeatIndex;
  if(!repeatName || rawIndex==='' || rawIndex==null) return {};
  return state.repeats?.[repeatName]?.[Number(rawIndex)] || {};
}

function refreshDynamicText(){
  $$('[data-label-template]').forEach(el=>{
    const context=contextForElement(el);
    const strong=el.querySelector('strong');
    if(strong) strong.textContent=interpolateTemplate(el.dataset.labelTemplate,context);
    const small=el.querySelector('small');
    if(small && el.dataset.hintTemplate!==undefined) small.textContent=interpolateTemplate(el.dataset.hintTemplate,context);
  });
}

function updateDerived(){
  setVal('pin_esperado','');
  setVal('pin_acesso','');
  setVal('acesso_ok',1);

  if(getVal('moeda')==='MZN') setVal('cambio','1');

  XLSFORM_FIELDS.forEach(f=>{
    if(baseType(f.type)!=='calculate' || !f.calculation || REPEAT_CALCULATED_FIELDS.has(f.name)) return;
    setVal(f.name, calculateMainField(f));
  });

  calculateRepeatRows();

  XLSFORM_FIELDS.forEach(f=>{
    if(baseType(f.type)!=='calculate' || !f.calculation || REPEAT_CALCULATED_FIELDS.has(f.name)) return;
    setVal(f.name, calculateMainField(f));
  });

  // Terceira passagem: resolve dependências cuja definição aparece antes do total
  // no XLSForm (por exemplo, valor_mzn depende de diz_total_mzn).
  XLSFORM_FIELDS.forEach(f=>{
    if(baseType(f.type)!=='calculate' || !f.calculation || REPEAT_CALCULATED_FIELDS.has(f.name)) return;
    setVal(f.name, calculateMainField(f));
  });

  syncCalculatedInputs();
  refreshDynamicText();
}

function applyPulldataToVisibleInputs(){
  XLSFORM_FIELDS.forEach(f=>{
    if(!f.calculation || REPEAT_CALCULATED_FIELDS.has(f.name)) return;
    const pd = f.calculation.match(/pulldata\('membros',\s*'([^']+)'\s*,\s*'name'\s*,\s*\$\{([^}]+)\}\)/);
    if(!pd) return;
    const val = memberField(getVal(pd[2]), pd[1]);
    setVal(f.name, val);
    const el = document.querySelector(`[name="${CSS.escape(f.name)}"]`);
    if(el) el.value = val;
  });
}

function buildTree(){
  const root=[]; const stack=[{children:root}];
  XLSFORM_FIELDS.forEach((f, idx)=>{
    const t=baseType(f.type);
    if(t==='begin_group' || t==='begin_repeat'){
      const node={...f, id:f.name||('grp_'+idx), kind:t, children:[]};
      stack[stack.length-1].children.push(node); stack.push(node);
    } else if(t==='end_group' || t==='end_repeat') { if(stack.length>1) stack.pop(); }
    else { stack[stack.length-1].children.push({...f, id:f.name||('item_'+idx), kind:t}); }
  });
  return root;
}
function renderForm(){
  const form=$('#dynamicForm'); form.innerHTML='';
  const tree=buildTree();
  const grid=document.createElement('div'); grid.className='field-grid';
  tree.forEach(n=>grid.appendChild(renderNode(n)));
  form.appendChild(grid);
  const actions=document.createElement('div'); actions.className='actions';
  actions.innerHTML='<span class="pill" id="modulePill">Seleccione o módulo</span><button type="submit" class="primary-btn">Submeter</button>';
  form.appendChild(actions);
  form.addEventListener('input', onInput);
  form.addEventListener('change', onInput);
  form.addEventListener('submit', submitForm);
  refreshVisibility(); updateProgress();
}
function renderNode(n){
  const t=baseType(n.type);
  if(t==='begin_group'){
    const sec=document.createElement('section'); sec.className='section full'; sec.dataset.relevant=n.relevant||'';
    sec.innerHTML=`<h3>${cleanHtml(n.label||'Secção')}</h3>${n.hint?`<p class="hint">${cleanHtml(n.hint)}</p>`:''}<div class="field-grid"></div>`;
    n.children.forEach(c=>$('.field-grid',sec).appendChild(renderNode(c)));
    return sec;
  }
  if(t==='begin_repeat') return renderRepeater(n);
  if(t==='note'){
    const d=document.createElement('div'); d.className='note'; d.dataset.relevant=n.relevant||'';
    d.dataset.labelTemplate=n.label||'Nota';
    d.dataset.hintTemplate=n.hint||'';
    d.innerHTML=`<strong>${cleanHtml(n.label||'Nota')}</strong>${n.hint?`<small>${cleanHtml(n.hint)}</small>`:''}`; return d;
  }
  if(['pin_acesso','pin_esperado','acesso_ok'].includes(n.name || '')) return document.createComment('auth-field '+(n.name||''));
  if(t==='calculate') return document.createComment('calculate '+(n.name||''));
  return renderField(n);
}
function renderRepeater(n){
  const d=document.createElement('div'); d.className='repeater'; d.dataset.relevant=n.relevant||''; d.dataset.repeat=n.name;
  state.repeats[n.name]=state.repeats[n.name]||[];
  d.innerHTML=`<div class="repeat-head"><div><strong>${cleanHtml(n.label||'Linhas')}</strong><br><small>Adicione uma ou mais linhas, quando aplicável.</small></div><button type="button" class="ghost-btn">Adicionar</button></div><div class="repeat-list"></div>`;
  $('button',d).addEventListener('click',()=>addRepeatItem(d,n));
  if(!state.repeats[n.name].length) addRepeatItem(d,n);
  return d;
}
function addRepeatItem(container,n){
  const list=$('.repeat-list',container); const idx=(state.repeats[n.name]||[]).length;
  state.repeats[n.name][idx]=state.repeats[n.name][idx]||{};
  const item=document.createElement('div'); item.className='repeat-item';
  item.dataset.repeatName=n.name; item.dataset.repeatIndex=idx;
  item.innerHTML=`<div class="repeat-head"><strong>Linha ${idx+1}</strong><button type="button" class="danger-btn">Remover</button></div><div class="field-grid"></div>`;
  $('button',item).addEventListener('click',()=>{ item.remove(); collectRepeatValues(); updateDerived(); refreshVisibility(); updateProgress(); });
  n.children.forEach(c=> $('.field-grid',item).appendChild(renderRepeatChild(c, n.name, idx)) );
  list.appendChild(item); refreshVisibility();
}
function renderRepeatChild(f, repeatName, repeatIndex){
  const t=baseType(f.type);
  if(t==='calculate') return document.createComment(`calculate ${repeatName}[${repeatIndex}].${f.name||''}`);
  if(t==='note'){
    const d=document.createElement('div');
    d.className='note full';
    d.dataset.relevant=f.relevant||'';
    d.dataset.repeatName=repeatName;
    d.dataset.repeatIndex=repeatIndex;
    d.dataset.labelTemplate=f.label||'Nota';
    d.dataset.hintTemplate=f.hint||'';
    d.innerHTML=`<strong>${cleanHtml(f.label||'Nota')}</strong>${f.hint?`<small>${cleanHtml(f.hint)}</small>`:''}`;
    return d;
  }
  return renderField(f, repeatName, repeatIndex);
}
function renderField(f, repeatName='', repeatIndex=''){
  const t=baseType(f.type); const name=f.name||''; const forceMulti = ['acolhimento_membros','louvor_membros'].includes(name) || t==='select_multiple' || t==='select_multiple_from_file'; const full = (['text'].includes(t) && String(f.appearance||'').includes('long-text')) || forceMulti;
  const wrap=document.createElement('div'); wrap.className='field '+(full?'full':''); wrap.dataset.relevant=f.relevant||''; wrap.dataset.field=name; wrap.dataset.requiredExpr=String(f.required??'false');
  if(repeatName){ wrap.dataset.repeatName=repeatName; wrap.dataset.repeatIndex=repeatIndex; }
  const repeatContext=repeatName ? (state.repeats?.[repeatName]?.[Number(repeatIndex)] || {}) : {};
  const req=isRequired(f.required, repeatContext); const inputName=repeatName ? `${repeatName}__${repeatIndex}__${name}` : name;
  const label=cleanHtml(f.label||name);
  wrap.innerHTML=`<label for="${inputName}">${label}${req?'<span class="req"> *</span>':''}</label>${f.hint?`<small>${cleanHtml(f.hint)}</small>`:''}`;

  if(forceMulti){
    const hidden=document.createElement('input');
    hidden.type='hidden'; hidden.name=inputName; hidden.id=inputName; hidden.dataset.originalName=name; hidden.dataset.isMulti='1'; hidden.style.setProperty('display','none','important'); hidden.setAttribute('aria-hidden','true'); hidden.tabIndex=-1;
    if(t==='select_multiple'){ hidden.dataset.listName=listName(f.type); hidden.dataset.choiceFilter=f.choice_filter||''; }
    if(t==='select_multiple_from_file' || ['acolhimento_membros','louvor_membros'].includes(name)){ hidden.dataset.fromFile='members'; }
    if(repeatName) hidden.dataset.repeatName=repeatName, hidden.dataset.repeatIndex=repeatIndex;
    hidden.value = repeatName
      ? (state.repeats?.[repeatName]?.[Number(repeatIndex)]?.[name] ?? '')
      : (state.values[name] ?? '');
    wrap.appendChild(hidden);

    const group=document.createElement('div');
    group.className='multi-check-list';
    group.dataset.multiGroup=inputName;
    group.style.display='grid';
    group.style.gap='8px';
    group.style.maxHeight='240px';
    group.style.overflowY='auto';
    group.style.border='1px solid #cbd5e1';
    group.style.borderRadius='14px';
    group.style.padding='10px';
    group.style.background='#fff';
    wrap.appendChild(group);
    renderMultiOptions(hidden);
    return wrap;
  }

  let el;
  if(t==='select_one' || t==='select_one_from_file') el = document.createElement('select');
  else if(t==='text' && String(f.appearance||'').includes('long-text')) el=document.createElement('textarea');
  else { el=document.createElement('input'); el.type = t==='decimal'||t==='integer' ? 'number' : (t==='date'||t==='time'||t==='file' ? t : 'text'); if(t==='decimal') el.step='0.01'; }
  el.name=inputName; el.id=inputName; el.dataset.originalName=name;
  if(t==='select_one'){ el.dataset.listName=listName(f.type); el.dataset.choiceFilter=f.choice_filter||''; }
  if(repeatName) el.dataset.repeatName=repeatName, el.dataset.repeatIndex=repeatIndex;
  if(t==='select_one') fillChoiceOptions(el, listName(f.type), f.choice_filter || '');
  if(t==='select_one_from_file'){ el.dataset.fromFile='members'; fillMemberOptions(el); }
  if(f.default) el.value=f.default;
  if(repeatName && state.repeats?.[repeatName]?.[Number(repeatIndex)]?.[name] !== undefined) el.value=state.repeats[repeatName][Number(repeatIndex)][name];
  if(!repeatName && state.values[name] !== undefined) el.value=state.values[name];
  wrap.appendChild(el); return wrap;
}

function selectedMultiValues(hidden){
  return String(hidden.value || '').split(';').map(v=>v.trim()).filter(Boolean);
}

function setMultiValues(hidden, values){
  hidden.value = (values || []).filter(Boolean).join('; ');
  if(!hidden.dataset.repeatName) setVal(hidden.dataset.originalName || hidden.name, hidden.value);
}

function getMultiOptions(hidden){
  if(hidden.dataset.fromFile === 'members'){
    return (state.members || []).map(m => ({ name:String(m.name || ''), label:String(m.label || m.name || '') })).filter(o=>o.name);
  }
  let options = (CHOICES[hidden.dataset.listName] || []).filter(o => choicePassesFilter(o, hidden.dataset.choiceFilter || ''));
  return options.sort((a,b)=> Number(a.order||9999) - Number(b.order||9999));
}

function renderMultiOptions(hidden){
  const group = document.querySelector(`[data-multi-group="${CSS.escape(hidden.id)}"]`) || hidden.parentElement?.querySelector(`[data-multi-group="${CSS.escape(hidden.id)}"]`);
  if(!group) return;
  const selected = new Set(selectedMultiValues(hidden));
  const options = getMultiOptions(hidden);
  const summary = `<div class="multi-summary" style="font-size:12px;color:#475569;margin-bottom:2px;">Seleccione uma ou mais opções. Marcadas: ${selected.size}</div>`;
  const emptyMessage = state.memberScope?.loading
    ? 'A carregar a lista nominal da igreja...'
    : (!getEffectiveWorkChurch() ? 'Seleccione primeiro a Igreja de trabalho.' : 'Ainda não há membros cadastrados para esta igreja.');
  group.innerHTML = options.length ? summary + options.map((o, idx)=>{
    const id = `${hidden.id}__multi_${idx}`;
    const checked = selected.has(String(o.name)) ? 'checked' : '';
    return `<label class="multi-check-option" for="${id}" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;cursor:pointer;"><input id="${id}" type="checkbox" value="${cleanHtml(o.name)}" data-multi-for="${hidden.id}" ${checked} style="width:18px;height:18px;accent-color:#0f766e;"> <span>${cleanHtml(o.label || o.name)}</span></label>`;
  }).join('') : `<div class="multi-empty">${cleanHtml(emptyMessage)}</div>`;
}

function updateMultiFromCheckbox(checkbox){
  const hidden = document.getElementById(checkbox.dataset.multiFor);
  if(!hidden) return null;
  const boxes = $$(`input[type="checkbox"][data-multi-for="${CSS.escape(hidden.id)}"]`);
  const values = boxes.filter(b=>b.checked).map(b=>b.value);
  setMultiValues(hidden, values);
  const summary = hidden.parentElement?.querySelector('.multi-summary');
  if(summary) summary.textContent = `Seleccione uma ou mais opções. Marcadas: ${values.length}`;
  return hidden;
}

function fillChoiceOptions(el, list, choiceFilter=''){
  const previous = el.multiple ? Array.from(el.selectedOptions).map(o=>o.value) : el.value;
  el.innerHTML = '';
  if(!el.multiple) el.appendChild(new Option('Seleccione...', ''));

  let options = (CHOICES[list]||[])
    .filter(o => choicePassesFilter(o, choiceFilter));
  if(list === 'menu_preencher') options = options.filter(o => userCanSubmitModule(o.name));
  options = options.sort((a,b)=> Number(a.order||9999) - Number(b.order||9999));

  options.forEach(o=>el.appendChild(new Option(o.label, o.name)));

  if(el.multiple){
    Array.from(el.options).forEach(opt => { opt.selected = previous.includes(opt.value); });
  } else if(previous && options.some(o=>String(o.name)===String(previous))){
    el.value = previous;
  } else if(previous){
    el.value = '';
    if(!el.dataset.repeatName) setVal(el.dataset.originalName || el.name, '');
  }
}

function choicePassesFilter(option, choiceFilter){
  if(!choiceFilter) return true;

  // Suporta filtros do XLSForm como: tipo=${tipo}
  // Também suporta combinações simples com "and".
  const parts = String(choiceFilter).split(/\s+and\s+/i).map(x=>x.trim()).filter(Boolean);
  return parts.every(part=>{
    let m = part.match(/^([A-Za-z0-9_\-.]+)\s*=\s*\$\{([^}]+)\}$/);
    if(m){
      const choiceColumn = m[1];
      const fieldName = m[2];
      const selectedValue = getVal(fieldName);
      if(selectedValue === '' || selectedValue == null) return false;
      return String(option[choiceColumn] ?? '') === String(selectedValue);
    }

    m = part.match(/^([A-Za-z0-9_\-.]+)\s*=\s*'([^']*)'$/);
    if(m){
      return String(option[m[1]] ?? '') === String(m[2]);
    }

    // Se o filtro for complexo e não reconhecido, mostra a opção para não bloquear o formulário.
    console.warn('choice_filter não interpretado:', choiceFilter);
    return true;
  });
}

function refreshChoiceFilters(){
  $$('select[data-list-name]').forEach(el=>{
    if(!el.dataset.choiceFilter) return;
    fillChoiceOptions(el, el.dataset.listName, el.dataset.choiceFilter);
  });
  $$('input[data-is-multi="1"][data-list-name]').forEach(hidden=>{
    if(!hidden.dataset.choiceFilter) return;
    const before = new Set(selectedMultiValues(hidden));
    const allowed = new Set(getMultiOptions(hidden).map(o=>String(o.name)));
    setMultiValues(hidden, Array.from(before).filter(v=>allowed.has(v)));
    renderMultiOptions(hidden);
  });
}

function fillMemberOptions(el){
  const previous=String(el.value||'');
  el.innerHTML='';
  const church=getEffectiveWorkChurch();
  if(state.memberScope?.loading){
    el.appendChild(new Option('A carregar a lista nominal...', ''));
    el.disabled=true;
    return;
  }
  if(!church){
    el.appendChild(new Option('Seleccione primeiro a Igreja de trabalho...', ''));
    el.disabled=true;
    return;
  }
  el.disabled=false;
  el.appendChild(new Option(state.members.length ? 'Seleccione da lista nominal...' : 'Sem membros cadastrados nesta igreja', ''));
  state.members.forEach(m=>el.appendChild(new Option(m.label || m.name, m.name)));
  if(previous && state.members.some(m=>String(m.name)===previous)) el.value=previous;
  else el.value='';
}
function onInput(e){
  let el=e.target;
  if(el.dataset && el.dataset.multiFor){
    el = updateMultiFromCheckbox(el);
    if(!el) return;
  }
  if(!el.name) return;
  if(el.dataset.repeatName){ collectRepeatValues(); updateDerived(); refreshChoiceFilters(); applyPulldataToVisibleInputs(); refreshVisibility(); updateProgress(); return; }
  const val = el.multiple ? Array.from(el.selectedOptions).map(o=>o.value) : el.value;
  setVal(el.dataset.originalName || el.name, Array.isArray(val)?val.join('; '):val);
  updateDerived(); refreshChoiceFilters(); applyPulldataToVisibleInputs(); refreshVisibility(); updateProgress();
}
function collectMainValues(){
  $$('#dynamicForm input,#dynamicForm select,#dynamicForm textarea').forEach(el=>{
    if(el.dataset.repeatName || !el.name) return;
    const value=el.multiple ? Array.from(el.selectedOptions).map(o=>o.value).join('; ') : el.value;
    setVal(el.dataset.originalName||el.name, value);
  });
}

function collectRepeatValues(){
  const next={};
  $$('#dynamicForm [data-repeat-name][data-original-name]').forEach(el=>{
    const r=el.dataset.repeatName, i=Number(el.dataset.repeatIndex), n=el.dataset.originalName;
    if(!r || !n || !Number.isFinite(i)) return;
    next[r]=next[r]||[];
    next[r][i]={...(state.repeats?.[r]?.[i]||{})};
    next[r][i][n]=el.multiple ? Array.from(el.selectedOptions).map(o=>o.value).join('; ') : el.value;
  });
  Object.keys(state.repeats||{}).forEach(k=>{ if(!next[k]) next[k]=[]; });
  state.repeats=next;
  calculateRepeatRows();
}

function refreshRequiredMarkers(){
  $$('.field[data-required-expr]').forEach(wrap=>{
    const context=contextForElement(wrap);
    const required=isRequired(wrap.dataset.requiredExpr,context);
    const label=wrap.querySelector(':scope > label');
    if(!label) return;
    let marker=label.querySelector('.req');
    if(required && !marker){
      marker=document.createElement('span'); marker.className='req'; marker.textContent=' *'; label.appendChild(marker);
    } else if(!required && marker){
      marker.remove();
    }
  });
}

function refreshVisibility(){
  updateDerived();
  $$('[data-relevant]').forEach(el=>{
    const context=contextForElement(el);
    const ok=evalExpr(el.dataset.relevant,context);
    el.classList.toggle('hidden', !ok);
  });
  refreshRequiredMarkers();
  refreshDynamicText();
  const moduleLabel = optionLabel('menu_preencher', getVal('menu_preencher')) || 'Seleccione o módulo';
  const pill=$('#modulePill'); if(pill) pill.textContent = moduleLabel;
}

function updateProgress(){
  const visibleFields=$$('.field:not(.hidden) [name]').filter(el=>!el.closest('.hidden'));
  const filled=visibleFields.filter(el=> el.multiple ? el.selectedOptions.length : String(el.value||'').trim()).length;
  const pct=visibleFields.length ? Math.round((filled/visibleFields.length)*100) : 0;
  $('#progressBar').style.width=pct+'%';
}

function constraintPassed(field, value, context={}){
  if(!field.constraint) return true;
  const name=field.name;
  const text=String(value??'').trim();

  if(name==='pin_acesso') return true;

  if(name==='hora_fim'){
    const start=timeToMinutes(contextValue('hora_inicio',context));
    const end=timeToMinutes(value);
    return Number.isFinite(start) && Number.isFinite(end) && end>start;
  }
  if(name==='rel_hora_fim'){
    if(!text) return true;
    const start=timeToMinutes(contextValue('rel_hora_inicio',context));
    const end=timeToMinutes(value);
    return Number.isFinite(start) && Number.isFinite(end) && end>start;
  }

  const phoneFields=new Set([
    'dirigente_tel_manual','pregador_tel_manual','acolhimento_tel_fora','louvor_tel_fora',
    'upd_tel_novo','telefone_whatsapp','telefone_para_contacto'
  ]);
  if(phoneFields.has(name)) return !text ? name==='telefone_whatsapp' : validMozPhone(value);

  const nonNegative=new Set([
    'valor','rel_participantes_total','rel_visitantes','rel_decisoes','rel_baptismos',
    'rel_dizimos_valor','rel_dizimistas_qtd','rel_ofertas_valor'
  ]);
  if(nonNegative.has(name)){
    const n=numberValue(value);
    return Number.isFinite(n) && n>=0;
  }
  if(name==='cambio'){
    const n=numberValue(value);
    return Number.isFinite(n) && n>=1;
  }
  if(name==='diz_valor'){
    const n=numberValue(value);
    return Number.isFinite(n) && n>0;
  }

  console.error('Restrição ainda não implementada:', name, field.constraint);
  return false;
}

function visibleInputByField(name){
  return $$(`#dynamicForm [data-original-name="${CSS.escape(name)}"]`).find(el=>!el.closest('.hidden'))
    || document.querySelector(`#dynamicForm [name="${CSS.escape(name)}"]`);
}

function markError(el,msg){
  if(!el) return;
  el.classList.add('error');
  const host=el.closest?.('.field,.repeater') || el.parentElement || el;
  if(host.querySelector?.(':scope > .error-text')) return;
  const e=document.createElement('div'); e.className='error-text'; e.textContent=msg; host.appendChild(e);
}

function validateCrossFieldRules(){
  let ok=true;
  const module=getVal('menu_preencher');

  if(module==='plano_cultos_escalas'){
    const start=timeToMinutes(getVal('hora_inicio')), end=timeToMinutes(getVal('hora_fim'));
    if(Number.isFinite(start) && Number.isFinite(end) && end<=start){
      markError(visibleInputByField('hora_fim'),'A hora de término deve ser posterior à hora de início.');
      ok=false;
    }
  }

  if(module==='relatorio_cultos' && getVal('rel_hora_fim')){
    const start=timeToMinutes(getVal('rel_hora_inicio')), end=timeToMinutes(getVal('rel_hora_fim'));
    if(!Number.isFinite(start) || !Number.isFinite(end) || end<=start){
      markError(visibleInputByField('rel_hora_fim'),'A hora de término deve ser posterior à hora de início.');
      ok=false;
    }
  }

  if(module==='registo_financeiro'){
    const isTithe=getVal('tipo')==='Entrada' && getVal('rubrica')==='DIZ';
    if(getVal('moeda')!=='MZN'){
      const cambio=numberValue(getVal('cambio'));
      if(!Number.isFinite(cambio) || cambio<1){
        markError(visibleInputByField('cambio'),'O câmbio deve ser igual ou superior a 1.');
        ok=false;
      }
    }

    if(!getVal('departamento_final')){
      markError(visibleInputByField('departamento'),'Seleccione o Departamento / Conta do plano.');
      ok=false;
    }
    if(getVal('departamento')==='ENT_GRUPOS_ZONAS' && !String(getVal('departamento_grupo_zona')||'').trim()){
      markError(visibleInputByField('departamento_grupo_zona'),'Indique o grupo ou a zona de oração.');
      ok=false;
    }
    if(['ENT_OUTROS','SAI_OUTROS'].includes(getVal('departamento')) && !String(getVal('departamento_outro')||'').trim()){
      markError(visibleInputByField('departamento_outro'),'Especifique a natureza da entrada ou da saída.');
      ok=false;
    }

    if(isTithe){
      const rows=(state.repeats.dizimistas||[]).filter(Boolean);
      const validRows=rows.filter(r=>numberValue(r.diz_valor)>0 && Number.isFinite(numberValue(r.diz_valor_mzn)));
      if(!rows.length || validRows.length!==rows.length || !Number.isFinite(numberValue(getVal('diz_total_mzn'))) || numberValue(getVal('diz_total_mzn'))<=0){
        const rep=document.querySelector('[data-repeat="dizimistas"]');
        markError(rep,'Adicione pelo menos uma contribuição de dízimo válida e superior a zero.');
        ok=false;
      }
    } else {
      const valor=numberValue(getVal('valor')), valorMzn=numberValue(getVal('valor_mzn'));
      if(!Number.isFinite(valor) || valor<0 || !Number.isFinite(valorMzn) || valorMzn<0){
        markError(visibleInputByField('valor'),'Introduza um valor válido igual ou superior a zero.');
        ok=false;
      }
    }
  }

  return ok;
}

function validate(){
  collectMainValues();
  collectRepeatValues();
  updateDerived();
  refreshVisibility();

  let ok=true;
  $$('.error').forEach(x=>x.classList.remove('error'));
  $$('.error-text').forEach(x=>x.remove());

  $$('#dynamicForm input,#dynamicForm select,#dynamicForm textarea').forEach(el=>{
    if(el.closest('.hidden') || !el.name) return;
    const field=XLSFORM_FIELDS.find(f=>f.name === (el.dataset.originalName||el.name));
    if(!field || baseType(field.type)==='calculate') return;
    const context=contextForElement(el);
    const value=el.multiple ? Array.from(el.selectedOptions).map(o=>o.value).join('; ') : el.value;

    if(isRequired(field.required,context) && !String(value||'').trim()){
      markError(el,'Campo obrigatório.');
      ok=false;
      return;
    }
    if(field.constraint && String(value||'').trim() && !constraintPassed(field,value,context)){
      markError(el,field.constraint_message || 'Valor inválido.');
      ok=false;
    }
  });

  if(!validateCrossFieldRules()) ok=false;
  return ok;
}

function compactRepeatsForPayload(repeats){
  const out={};
  Object.keys(repeats||{}).forEach(repName=>{
    const rows=(repeats[repName]||[]).filter(Boolean).filter(row=>{
      return Object.keys(row||{}).some(key=>{
        if(REPEAT_CALCULATED_FIELDS.has(key)) return false;
        return String(row[key] == null ? '' : row[key]).trim()!=='';
      });
    });
    if(rows.length) out[repName]=rows;
  });
  return out;
}

function collectPayload(){
  collectMainValues();
  collectRepeatValues();
  updateDerived();
  const module=getVal('menu_preencher') || 'sem_modulo';
  const submissionUuid=getVal('submission_uuid') || uuid();
  setVal('submission_uuid',submissionUuid);
  const workChurch=getEffectiveWorkChurch();
  const payloadData={...state.values};
  if(workChurch){
    payloadData.igreja_id=workChurch.id;
    payloadData.igreja_nome=workChurch.name;
  }
  return {
    action:'submit',
    module,
    submittedAt:new Date().toISOString(),
    uuid:submissionUuid,
    data:payloadData,
    repeats:compactRepeatsForPayload(JSON.parse(JSON.stringify(state.repeats||{}))),
    userAgent:navigator.userAgent,
    clientVersion:'54.3.2'
  };
}

async function submitForm(e){
  e.preventDefault();
  if(!ensureWorkChurchForSubmission()) return;
  if(!validate()) return toast('Corrija os campos assinalados antes de submeter.', 'error');
  const url=window.APP_CONFIG.APPS_SCRIPT_URL;
  if(!url){
    setLoginMessage('Erro de configuração: a ligação ao backend não está definida.');
    return toast('Configure primeiro a URL do backend em config.js.', 'error');
  }
  const btn=$('button[type="submit"]'); btn.disabled=true; btn.textContent='A submeter...';
  try{
    const authToken = getAuthToken();
    if(!authToken){ showLogin('Sessão expirada. Faça login novamente.'); return; }
    const payload = collectPayload();
    payload.authToken = authToken;
    if(SANDBOX_MODE){
      addSandboxSubmission(payload);
      toast('Modo teste: registo simulado. Nada foi gravado.');
      resetForm(); loadStats(); loadAppData();
      return;
    }
    const res=await fetch(url, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(payload)});
    const out=await res.json(); if(!out.ok) throw new Error(out.message || 'Erro desconhecido');
    toast('Registo submetido com sucesso.'); resetForm(); loadStats();
  }catch(err){ console.error(err); toast('Falha ao submeter: '+err.message, 'error'); }
  finally{ btn.disabled=false; btn.textContent='Submeter'; }
}
function resetForm(){ state.values={submission_uuid:uuid()}; state.repeats={}; renderForm(); }
function applyUrlModuleParam(){
  const params = new URLSearchParams(window.location.search);
  const requested = (params.get('modulo') || params.get('module') || '').trim();
  if(!requested) return;

  const allowed = ['plano_cultos_escalas', 'relatorio_cultos', 'visitantes', 'registo_financeiro'];
  if(!allowed.includes(requested)){
    console.warn('Módulo indicado no link não existe:', requested);
    return;
  }
  if(!userCanSubmitModule(requested)){
    toast('Este utilizador não tem permissão para lançar neste módulo.', 'error');
    return;
  }
  if(!ensureWorkChurchForSubmission()) return;

  setVal('menu_preencher', requested);
  setVal('pin_acesso', '');
  updateDerived();
  renderForm();

  $$('.nav-btn').forEach(b=>b.classList.remove('active'));
  const formBtn = document.querySelector('.nav-btn[data-view="formView"]');
  if(formBtn) formBtn.classList.add('active');
  $$('.view').forEach(v=>v.classList.remove('active'));
  $('#formView')?.classList.add('active');

  setTimeout(()=>{
    const firstVisible = document.querySelector('#dynamicForm .field:not(.hidden) [name]:not([type="hidden"])');
    if(firstVisible) firstVisible.focus();
  }, 150);
}

async function bootstrap(){
  setVal('submission_uuid', getVal('submission_uuid') || uuid());
  renderForm();
  if(SANDBOX_MODE){
    setupSandboxBanner();
    const user = getStoredUser() || sandboxUser('visitante_demo');
    saveAuthSession(SANDBOX_TOKEN, user);
    state.currentUser = user;
    showApp(user);
    setStatus('ok','Modo teste','Sandbox activo: nada é gravado');
    applyPermissionsToUi();
    renderForm();
    ensureMembersForCurrentChurch();
    applyUrlModuleParam();
    loadStats();
    loadAppData();
    return;
  }
  const url=window.APP_CONFIG.APPS_SCRIPT_URL;
  if(!url){ setStatus('bad','Backend não configurado','Cole a URL do Apps Script em config.js'); showLogin(); return; }
  const token = getAuthToken();
  if(!token){ showLogin(); return; }
  try{
    const params = new URLSearchParams({action:'bootstrap', token});
    const res=await fetch(url+'?'+params.toString());
    const out=await res.json();
    if(!out.ok) throw new Error(out.message || 'Sessão inválida.');
    state.members=out.members || [];
    state.churches=out.churches || [];
    state.currentUser=out.user || getStoredUser();
    const bootChurch=getEffectiveWorkChurch();
    state.memberScope={churchId:bootChurch?.id||'',churchName:bootChurch?.name||'',loading:false,loaded:!!bootChurch && !isDistrictUserClient(state.currentUser),requestId:state.memberScope?.requestId||0,unassignedCount:Number(out.memberScope?.unassignedCount||0)};
    showApp(state.currentUser);
    setStatus('ok','Ligado','Backend disponível');
    applyPermissionsToUi();
    renderForm();
    ensureMembersForCurrentChurch();
    applyUrlModuleParam();
    loadStats();
    loadAppData();
  }catch(e){
    const message = String((e && e.message) || 'Não foi possível confirmar a sessão.');
    const authFailure = /sess[aã]o\s+(expirada|inv[aá]lida)|token\s+inv[aá]lido|faça\s+login/i.test(message);
    console.warn('Falha no bootstrap:', e);

    if(authFailure){
      setStatus('bad','Sessão inválida','Faça login novamente');
      clearAuthSession();
      showLogin(message);
      return;
    }

    // Por segurança, o sistema nunca abre apenas com dados guardados no
    // navegador. A sessão deve ser confirmada pelo backend antes de mostrar a aplicação.
    clearAuthSession();
    setStatus('bad','Não foi possível confirmar a sessão','Introduza novamente as credenciais.');
    showLogin('Não foi possível confirmar a sessão no backend. Faça login novamente.');
  }
}
async function loadStats(){
  const grid=$('#statsGrid'); grid.innerHTML='<div class="kpi"><span>A carregar...</span></div>';
  if(SANDBOX_MODE){
    const out = sandboxStats();
    const modules=['plano_cultos_escalas','relatorio_cultos','visitantes','registo_financeiro'];
    grid.innerHTML=modules.map(m=>`<div class="kpi"><b>${out.stats[m]||0}</b><span>${optionLabel('menu_preencher',m)}</span></div>`).join('');
    renderRecent(out.recent||[]);
    return;
  }
  const url=window.APP_CONFIG.APPS_SCRIPT_URL; if(!url){ grid.innerHTML='<div class="kpi"><span>Backend não configurado</span></div>'; return; }
  try{
    const token=getAuthToken();
    if(!token){ showLogin('Sessão expirada. Faça login novamente.'); return; }
    const res=await fetch(url+'?'+new URLSearchParams({action:'stats', token}).toString()); const out=await res.json();
    if(!out.ok) throw new Error(out.message || 'Não foi possível carregar o painel.');
    const stats=out.stats || {}; const modules=['plano_cultos_escalas','relatorio_cultos','visitantes','registo_financeiro'];
    grid.innerHTML=modules.map(m=>`<div class="kpi"><b>${stats[m]||0}</b><span>${optionLabel('menu_preencher',m)}</span></div>`).join('');
    renderRecent(out.recent||[]);
  }catch(e){ grid.innerHTML='<div class="kpi"><span>Não foi possível carregar o painel.</span></div>'; }
}
function renderRecent(rows){
  const thead=$('#recentTable thead'), tbody=$('#recentTable tbody');
  thead.innerHTML='<tr><th>Data</th><th>Módulo</th><th>UUID</th></tr>';
  tbody.innerHTML=rows.length ? rows.map(r=>`<tr><td>${r.submittedAt||''}</td><td>${optionLabel('menu_preencher',r.module)||r.module}</td><td>${r.uuid||''}</td></tr>`).join('') : '<tr><td colspan="3">Sem registos recentes.</td></tr>';
}

function money(n){
  return new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n || 0)) + ' MT';
}

function formatReportPeriod(period){
  if (!period || (!period.start && !period.end)) return 'Todos os lançamentos';
  return `${period.start || 'início'} a ${period.end || 'fim'}`;
}

function resolveRubricaLabel(code){
  return optionLabel('rubricas', code) || code || 'Sem rubrica';
}

function resolveDepartamentoLabel(code, item){
  if(item && item.label && String(item.label)!==String(code)) return item.label;
  const raw=String(code||'');
  const baseCode=raw.split('::')[0];
  const detail=raw.includes('::') ? raw.slice(raw.indexOf('::')+2) : '';
  const base=optionLabel('departamentos', baseCode) || baseCode || 'Sem departamento';
  return detail ? `${base} — ${detail}` : base;
}

function resolveAccountLabel(item){
  if (!item) return 'Sem conta';
  return item.name || item.label || item.key || 'Sem conta';
}

function reportTotals(items){
  return (items || []).reduce((acc, item) => {
    acc.saldoAnterior += Number(item.saldoAnterior || 0);
    acc.entradas += Number(item.entradas || 0);
    acc.saidas += Number(item.saidas || 0);
    acc.saldoPeriodo += Number(item.saldoPeriodo || 0);
    acc.saldoFinal += Number(item.saldoFinal || 0);
    return acc;
  }, { saldoAnterior:0, entradas:0, saidas:0, saldoPeriodo:0, saldoFinal:0 });
}

function buildReportTable(items, firstColumnTitle, labelResolver){
  const itemLabel = item => labelResolver(item.key || item.label || item.name || '', item);
  const sorted = [...(items || [])].sort((a, b) => String(itemLabel(a)).localeCompare(String(itemLabel(b)), 'pt'));
  const rows = sorted.map(item => `
    <tr>
      <td>${cleanHtml(itemLabel(item))}</td>
      <td class="money">${money(item.saldoAnterior)}</td>
      <td class="money">${money(item.entradas)}</td>
      <td class="money">${money(item.saidas)}</td>
      <td class="money">${money(item.saldoPeriodo)}</td>
      <td class="money">${money(item.saldoFinal)}</td>
    </tr>
  `).join('');
  const total = reportTotals(sorted);
  return `
    <table class="report-table">
      <thead>
        <tr>
          <th>${firstColumnTitle}</th>
          <th>Saldo anterior</th>
          <th>Entrada</th>
          <th>Saída</th>
          <th>Saldo Periodo</th>
          <th>Saldo final</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="6">Sem dados para o período seleccionado.</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td>TOTAL</td>
          <td class="money">${money(total.saldoAnterior)}</td>
          <td class="money">${money(total.entradas)}</td>
          <td class="money">${money(total.saidas)}</td>
          <td class="money">${money(total.saldoPeriodo)}</td>
          <td class="money">${money(total.saldoFinal)}</td>
        </tr>
      </tfoot>
    </table>
  `;
}


function buildAccountConciliationTable(accounts){
  const sorted = [...(accounts || [])].sort((a, b) => String(resolveAccountLabel(a)).localeCompare(String(resolveAccountLabel(b)), 'pt'));
  const rows = sorted.map(item => `
    <tr>
      <td>${cleanHtml(resolveAccountLabel(item))}</td>
      <td class="money">${money(item.saldoAnterior)}</td>
      <td class="money">${money(item.entradas)}</td>
      <td class="money">${money(item.saidas)}</td>
      <td class="money">${money(item.saldoPeriodo)}</td>
      <td class="money">${money(item.saldoFinal)}</td>
    </tr>
  `).join('');
  const total = reportTotals(sorted);
  return `
    <table class="report-table">
      <thead>
        <tr>
          <th>Conta / Canal de movimentação</th>
          <th>Saldo anterior</th>
          <th>Entrada</th>
          <th>Saída</th>
          <th>Saldo Periodo</th>
          <th>Saldo final</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="6">Sem contas para apresentar.</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td>TOTAL — Consolidado geral</td>
          <td class="money">${money(total.saldoAnterior)}</td>
          <td class="money">${money(total.entradas)}</td>
          <td class="money">${money(total.saidas)}</td>
          <td class="money">${money(total.saldoPeriodo)}</td>
          <td class="money">${money(total.saldoFinal)}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

function buildSummaryCards(totals){
  return `
    <div class="stats-grid report-summary-grid">
      <div class="kpi"><b>${money(totals.saldoAnterior)}</b><span>Saldo anterior</span></div>
      <div class="kpi"><b>${money(totals.entradas)}</b><span>Entradas</span></div>
      <div class="kpi"><b>${money(totals.saidas)}</b><span>Saídas</span></div>
      <div class="kpi"><b>${money(totals.saldoPeriodo)}</b><span>Saldo do período</span></div>
      <div class="kpi"><b>${money(totals.saldoFinal)}</b><span>Saldo final</span></div>
    </div>
  `;
}

function renderFinancialReport(report){
  const c = $('#reportContainer');
  const period = formatReportPeriod(report.period);
  const totals = report.totals || { saldoAnterior:0, entradas:0, saidas:0, saldoPeriodo:0, saldoFinal:0 };

  c.innerHTML = `
    <h2 class="report-title">Relatório Financeiro</h2>
    <div class="report-meta">
      <span>Período: <strong>${period}</strong></span>
      <span>Gerado em: <strong>${new Date(report.generatedAt || Date.now()).toLocaleString('pt-MZ')}</strong></span>
    </div>
    ${buildSummaryCards(totals)}

    <div class="report-section-title">Conciliação e resumo de contas</div>
    ${buildAccountConciliationTable(report.accounts || [])}

    <div class="report-section-title">Por Rubrica</div>
    ${buildReportTable(report.rubricas || [], 'Rubrica', resolveRubricaLabel)}

    <div class="report-section-title">Por Departamento/Ministério</div>
    ${buildReportTable(report.departamentos || [], 'Departamento', resolveDepartamentoLabel)}
  `;
}

async function loadFinancialReport(){
  if(SANDBOX_MODE){
    renderFinancialReport(sandboxFinancialReport());
    return;
  }
  const url = window.APP_CONFIG.APPS_SCRIPT_URL;
  if (!url) return toast('Configure primeiro a URL do backend em config.js.', 'error');
  const start = $('#reportStart')?.value || '';
  const end = $('#reportEnd')?.value || '';
  const token = getAuthToken();
  if(!token){ showLogin('Sessão expirada. Faça login novamente.'); return; }
  const params = new URLSearchParams({ action:'report', token });
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  $('#reportContainer').innerHTML = '<div class="empty-report">A gerar relatório...</div>';
  try {
    const res = await fetch(url + '?' + params.toString());
    const out = await res.json();
    if (!out.ok) throw new Error(out.message || 'Não foi possível gerar o relatório.');
    renderFinancialReport(out);
  } catch (e) {
    console.error(e);
    $('#reportContainer').innerHTML = '<div class="empty-report">Não foi possível carregar o relatório. Verifique o Apps Script e faça novo deploy do backend.</div>';
    toast(e.message, 'error');
  }
}


const APPROVAL_MODULES = {
  plano_cultos_escalas:'Plano de cultos e escalas',
  relatorio_cultos:'Relatório de cultos',
  registo_financeiro:'Registo financeiro',
  visitantes:'Visitantes e membros'
};

function approvalEscape(value){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

function populateApprovalFilters(){
  const church=$('#approvalChurchFilter'), module=$('#approvalModuleFilter');
  if(church){
    const selected=church.value;
    const list=isDistrictUserClient() ? (state.churches||[]) : [getEffectiveWorkChurch()].filter(Boolean).map(x=>({igreja_id:x.id,nome_igreja:x.name}));
    church.innerHTML='<option value="">Todas as igrejas</option>'+list.map(c=>{
      const id=String(c.igreja_id||c.id||''); const name=String(c.nome_igreja||c.label||c.name||id);
      return `<option value="${approvalEscape(id)}">${approvalEscape(name)}</option>`;
    }).join('');
    if(selected && list.some(c=>String(c.igreja_id||c.id||'')===selected)) church.value=selected;
  }
  if(module){
    const selected=module.value;
    const permitted=(currentUser().approvalModules||'').split(',').map(x=>x.trim()).filter(Boolean);
    const keys=permitted.length ? permitted : Object.keys(APPROVAL_MODULES);
    module.innerHTML='<option value="">Todos os módulos</option>'+keys.map(k=>`<option value="${approvalEscape(k)}">${approvalEscape(APPROVAL_MODULES[k]||k)}</option>`).join('');
    if(keys.includes(selected)) module.value=selected;
  }
}

function approvalFilterParams(){
  return {
    action:'approvals',
    token:getAuthToken(),
    igreja_id:$('#approvalChurchFilter')?.value||'',
    area:$('#approvalAreaFilter')?.value||'',
    module:$('#approvalModuleFilter')?.value||'',
    start:$('#approvalStartFilter')?.value||'',
    end:$('#approvalEndFilter')?.value||'',
    search:$('#approvalSearchFilter')?.value||''
  };
}

async function loadApprovals(){
  const tbody=$('#approvalTable tbody');
  if(!tbody) return;
  if(state.approvals.loading) return;
  const token=getAuthToken(), url=window.APP_CONFIG?.APPS_SCRIPT_URL;
  if(!token || !url) return showLogin('Sessão expirada. Faça login novamente.');
  state.approvals.loading=true;
  tbody.innerHTML='<tr><td colspan="7">A carregar lançamentos pendentes...</td></tr>';
  try{
    const res=await fetch(url+'?'+new URLSearchParams(approvalFilterParams()).toString(),{cache:'no-store'});
    const out=await res.json();
    if(!out.ok) throw new Error(out.message||'Não foi possível carregar as aprovações.');
    state.approvals.items=out.items||[];
    renderApprovalKpis(out.summary||{});
    renderApprovalTable(state.approvals.items);
  }catch(err){
    console.error(err);
    tbody.innerHTML=`<tr><td colspan="7">${approvalEscape(err.message)}</td></tr>`;
    toast(err.message,'error');
  }finally{ state.approvals.loading=false; }
}

function renderApprovalKpis(summary){
  renderKpis('approvalKpis',[
    {label:'Pendentes',value:Number(summary.total||state.approvals.items.length||0)},
    {label:'Finanças',value:Number(summary.FINANCAS||0)},
    {label:'Plano e escalas',value:Number(summary.PLANO||0)},
    {label:'Cultos',value:Number(summary.CULTOS||0)},
    {label:'Membros',value:Number(summary.MEMBROS||0)}
  ]);
}

function renderApprovalTable(items){
  const tbody=$('#approvalTable tbody'), count=$('#approvalResultCount');
  if(count) count.textContent=`${items.length} registo${items.length===1?'':'s'}`;
  if(!items.length){
    tbody.innerHTML='<tr><td colspan="7">Não existem registos pendentes para os filtros seleccionados.</td></tr>';
    return;
  }
  tbody.innerHTML=items.map((item,index)=>`<tr>
    <td>${approvalEscape(item.submittedAt||'—')}</td>
    <td><strong>${approvalEscape(item.igreja_nome||item.igreja_id||'Sem igreja')}</strong></td>
    <td><strong>${approvalEscape(item.areaLabel||item.area||'')}</strong><br><small>${approvalEscape(item.moduleLabel||APPROVAL_MODULES[item.module]||item.module)}</small></td>
    <td>${approvalEscape(item.submetido_por_nome||item.submetido_por||'—')}<br><small>${approvalEscape(item.submetido_por_perfil||'')}</small></td>
    <td class="approval-summary">${approvalEscape(item.resumo||item.descricao||'Sem descrição')}</td>
    <td>${item.valor!==''&&item.valor!==null&&item.valor!==undefined?money(item.valor):'—'}</td>
    <td><div class="approval-actions">
      <button type="button" class="approval-detail-btn" data-approval-index="${index}">Detalhes</button>
      <button type="button" class="approval-approve-btn" data-approval-index="${index}" data-decision="APROVADO">Aprovar</button>
      <button type="button" class="approval-reject-btn" data-approval-index="${index}" data-decision="REJEITADO">Rejeitar</button>
    </div></td>
  </tr>`).join('');
}

function openApprovalDialog(item, presetDecision=''){
  if(!item) return;
  state.approvals.selected=item;
  const dialog=$('#approvalDialog');
  $('#approvalDialogTitle').textContent=item.moduleLabel||APPROVAL_MODULES[item.module]||'Detalhes do lançamento';
  $('#approvalDialogMeta').innerHTML=[
    ['Igreja',item.igreja_nome||item.igreja_id||'Sem igreja'],
    ['Área',item.areaLabel||item.area||'—'],
    ['Submetido por',item.submetido_por_nome||item.submetido_por||'—'],
    ['Perfil',item.submetido_por_perfil||'—'],
    ['Data',item.submittedAt||'—'],
    ['UUID',item.uuid||'—']
  ].map(x=>`<div><span>${approvalEscape(x[0])}</span><strong>${approvalEscape(x[1])}</strong></div>`).join('');
  const details=Array.isArray(item.details)?item.details:[];
  $('#approvalDialogDetails').innerHTML=details.length?details.map(d=>`<div><span>${approvalEscape(d.label||d.key||'Campo')}</span><strong>${approvalEscape(d.value)}</strong></div>`).join(''):'<div><span>Detalhes</span><strong>Sem detalhes adicionais.</strong></div>';
  $('#approvalDecisionNotes').value='';
  dialog.dataset.presetDecision=presetDecision||'';
  if(typeof dialog.showModal==='function') dialog.showModal(); else dialog.setAttribute('open','open');
}

async function decideApproval(decision){
  const item=state.approvals.selected;
  if(!item) return;
  const notes=String($('#approvalDecisionNotes')?.value||'').trim();
  if(decision==='REJEITADO' && !notes){
    toast('Indique a razão da rejeição.','error');
    $('#approvalDecisionNotes')?.focus();
    return;
  }
  const actionLabel=decision==='APROVADO'?'aprovar':'rejeitar';
  if(!window.confirm(`Confirma que pretende ${actionLabel} este lançamento?`)) return;
  const url=window.APP_CONFIG?.APPS_SCRIPT_URL, token=getAuthToken();
  try{
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'approve',authToken:token,module:item.module,uuid:item.uuid,decision,notes})});
    const out=await res.json();
    if(!out.ok) throw new Error(out.message||'Não foi possível registar a decisão.');
    $('#approvalDialog')?.close();
    toast(decision==='APROVADO'?'Lançamento aprovado.':'Lançamento rejeitado.','success');
    await loadApprovals();
    loadStats(); loadAppData();
  }catch(err){ console.error(err); toast(err.message,'error'); }
}

function bindApprovalModule(){
  $('#refreshApprovalsBtn')?.addEventListener('click',loadApprovals);
  $('#clearApprovalFiltersBtn')?.addEventListener('click',()=>{
    ['approvalChurchFilter','approvalAreaFilter','approvalModuleFilter','approvalStartFilter','approvalEndFilter','approvalSearchFilter'].forEach(id=>{const el=$('#'+id);if(el)el.value='';});
    loadApprovals();
  });
  ['approvalChurchFilter','approvalAreaFilter','approvalModuleFilter','approvalStartFilter','approvalEndFilter'].forEach(id=>$('#'+id)?.addEventListener('change',loadApprovals));
  let searchTimer=null;
  $('#approvalSearchFilter')?.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(loadApprovals,350);});
  $('#approvalTable tbody')?.addEventListener('click',e=>{
    const btn=e.target.closest('[data-approval-index]'); if(!btn)return;
    const item=state.approvals.items[Number(btn.dataset.approvalIndex)];
    openApprovalDialog(item,btn.dataset.decision||'');
  });
  $('#approveApprovalBtn')?.addEventListener('click',()=>decideApproval('APROVADO'));
  $('#rejectApprovalBtn')?.addEventListener('click',()=>decideApproval('REJEITADO'));
}

function dash(v){ return (v === undefined || v === null || v === '' || Number.isNaN(v)) ? '—' : v; }
function monthMatches(dateText, monthValue){
  if(!monthValue) return true;
  return String(dateText || '').startsWith(monthValue);
}
function numberValue(v){ return Number(v || 0) || 0; }
function renderKpis(containerId, items){
  const el = $('#'+containerId); if(!el) return;
  el.innerHTML = items.map(x=>`<div class="legacy-kpi"><span>${x.label}</span><strong>${dash(x.value)}</strong></div>`).join('');
}
async function loadAppData(){
  if(SANDBOX_MODE){
    const out = sandboxAppData();
    state.appData = out;
    renderOverview(out);
    renderEscalas(out.escalas || []);
    renderCultos(out.cultos || []);
    renderVisitantes(out.visitantes || []);
    renderDizimos(out.dizimos || []);
    return;
  }
  const url = window.APP_CONFIG.APPS_SCRIPT_URL;
  const token = getAuthToken();
  if(!url || !token) return;
  try{
    const res = await fetch(url + '?' + new URLSearchParams({action:'appdata', token}).toString());
    const out = await res.json();
    if(!out.ok) throw new Error(out.message || 'Não foi possível carregar dados.');
    state.appData = out;
    renderOverview(out);
    renderEscalas(out.escalas || []);
    renderCultos(out.cultos || []);
    renderVisitantes(out.visitantes || []);
    renderDizimos(out.dizimos || []);
  }catch(e){ console.warn(e); }
}
function renderOverview(data){
  const o = data.overview || {};
  renderKpis('overviewKpis', [
    {label:'Cultos', value:o.cultos || 0},
    {label:'Visitantes', value:o.visitantes || 0},
    {label:'Movimentos', value:o.movimentos || 0},
    {label:'Média de participantes', value:o.mediaParticipantes || 0}
  ]);
  const vt=$('#overviewVisitantesTipo'); if(vt) vt.innerHTML=(o.visitantesPorTipo||[]).map(x=>`<div class="mini-row"><span>${x.label}</span><b>${x.value}</b></div>`).join('') || 'Sem dados';
  const cc=$('#overviewComoConheceram'); if(cc) cc.innerHTML=(o.comoConheceram||[]).map(x=>`<div class="mini-row"><span>${x.label}</span><b>${x.value}</b></div>`).join('') || 'Sem dados';
  const rb=$('#overviewRubricas'); if(rb) rb.innerHTML=(o.topRubricas||[]).map(x=>`<div class="mini-row"><span>${resolveRubricaLabel(x.label)}</span><b>${money(x.value)}</b></div>`).join('') || 'Sem dados';
  const dep=$('#overviewDepartamentos'); if(dep) dep.innerHTML=(o.topDepartamentos||[]).map(x=>`<div class="mini-row"><span>${resolveDepartamentoLabel(x.label)}</span><b>${money(x.value)}</b></div>`).join('') || 'Sem dados';
  const pres=$('#overviewPresenca');
  if(pres){
    const arr=(o.presenca||[]); const max=Math.max(1,...arr.map(x=>numberValue(x.value)));
    pres.innerHTML=arr.map(x=>`<div class="bar-item" title="${x.label}: ${x.value}"><span style="height:${Math.max(8, numberValue(x.value)/max*100)}%"></span><small>${String(x.label||'').slice(5)}</small></div>`).join('') || '<div class="legacy-empty">Sem dados</div>';
    const minEl=$('#overviewMin'), maxEl=$('#overviewMax'); if(minEl) minEl.textContent='Min: '+(arr.length?Math.min(...arr.map(x=>numberValue(x.value))):0); if(maxEl) maxEl.textContent='Máx: '+(arr.length?max:0);
  }
}
function renderEscalas(rows){
  const select=$('#escalaFuncao');
  if(select && !select.dataset.ready){
    select.innerHTML='<option value="">Todos</option><option value="Dirigente">Dirigente</option><option value="Pregador">Pregador</option><option value="Acolhimento">Acolhimento</option><option value="Louvor">Louvor</option>';
    select.dataset.ready='1';
    select.addEventListener('change',()=>renderEscalas(state.appData?.escalas||[]));
    $('#escalaMes')?.addEventListener('change',()=>renderEscalas(state.appData?.escalas||[]));
  }
  const month=$('#escalaMes')?.value||''; const func=$('#escalaFuncao')?.value||'';
  const filtered=rows.filter(r=>monthMatches(r.data,month)).filter(r=>!func || String(r.funcao||'').toLowerCase().includes(func.toLowerCase()));
  const tbody=$('#escalasTable tbody'); if(!tbody) return;
  tbody.innerHTML=filtered.map(r=>`<tr><td>${r.data||''}</td><td>${r.hora||''}</td><td>${r.tipo||''}</td><td>${r.especificacao||''}</td><td>${r.dia||''}</td><td>${r.funcao||''}</td><td>${r.nome||''}</td><td>${r.telefone||''}</td></tr>`).join('') || '<tr><td colspan="8">Sem escalas para o período</td></tr>';
}
function renderCultos(rows){
  const mes=$('#cultosMes')?.value || '';
  if($('#cultosMes') && !$('#cultosMes').dataset.ready){ $('#cultosMes').addEventListener('change',()=>renderCultos(state.appData?.cultos||[])); $('#cultosMes').dataset.ready='1'; }
  const filtered=rows.filter(r=>monthMatches(r.data,mes));
  renderKpis('cultosKpis', [
    {label:'Total participantes', value:filtered.reduce((s,r)=>s+numberValue(r.participantes),0)},
    {label:'Total visitantes', value:filtered.reduce((s,r)=>s+numberValue(r.visitantes),0)},
    {label:'Baptismos', value:filtered.reduce((s,r)=>s+numberValue(r.baptismos),0)},
    {label:'Decisões', value:filtered.reduce((s,r)=>s+numberValue(r.decisoes),0)}
  ]);
  const list=$('#cultosList'); if(!list) return;
  list.innerHTML=filtered.map(r=>`<article class="legacy-card culto-card"><div class="card-line"><h3>${r.tipo||'Culto'}</h3><span class="pill">${numberValue(r.participantes)} PAX</span></div><p>📅 ${r.data||''} ⏰ ${r.hora||''}</p><p><strong>Local:</strong> ${r.local||''}</p><div class="legacy-mini-grid"><span>Visitantes<br><b>${numberValue(r.visitantes)}</b></span><span>Baptismos<br><b>${numberValue(r.baptismos)}</b></span><span>Decisões<br><b>${numberValue(r.decisoes)}</b></span><span>Sta. Ceia<br><b>${r.santaCeia||'—'}</b></span></div><div class="legacy-mini-grid money-row"><span>Dízimos<br><b>${money(r.dizimos)}</b></span><span>Ofertas<br><b>${money(r.ofertas)}</b></span><span>Total<br><b>${money(numberValue(r.dizimos)+numberValue(r.ofertas))}</b></span></div></article>`).join('') || '<div class="legacy-empty">Sem relatórios de cultos para o período</div>';
}
function renderVisitantes(rows){
  const mes=$('#visitantesMes')?.value||'', prim=$('#visitantesPrimeira')?.value||'';
  if($('#visitantesMes') && !$('#visitantesMes').dataset.ready){ $('#visitantesMes').addEventListener('change',()=>renderVisitantes(state.appData?.visitantes||[])); $('#visitantesPrimeira')?.addEventListener('change',()=>renderVisitantes(state.appData?.visitantes||[])); $('#visitantesMes').dataset.ready='1'; }
  const filtered=rows.filter(r=>monthMatches(r.data,mes)).filter(r=>!prim || r.primeiraVez===prim);
  renderKpis('visitantesKpis', [
    {label:'Total', value:filtered.length},
    {label:'1ª visita', value:filtered.filter(r=>r.primeiraVez==='sim').length},
    {label:'Querem contacto', value:filtered.filter(r=>r.contacto==='sim').length},
    {label:'Pedidos de oração', value:filtered.filter(r=>String(r.pedidoOracao||'').trim()).length}
  ]);
  const tbody=$('#visitantesTable tbody'); if(!tbody) return;
  tbody.innerHTML=filtered.map(r=>`<tr><td>${r.data||''}</td><td>${r.nome||''}</td><td>${r.sexo||''}</td><td>${r.faixa||''}</td><td>${r.bairro||''}</td><td>${r.primeiraVez||''}</td><td>${r.comoConheceu||''}</td><td>${r.contacto||''}</td><td>${r.telefone||''}</td></tr>`).join('') || '<tr><td colspan="9">Sem visitantes para o período</td></tr>';
}
function renderDizimos(rows){
  const mes=$('#dizimosMes')?.value||'';
  if($('#dizimosMes') && !$('#dizimosMes').dataset.ready){ $('#dizimosMes').addEventListener('change',()=>renderDizimos(state.appData?.dizimos||[])); $('#dizimosMes').dataset.ready='1'; }
  const filtered=rows.filter(r=>monthMatches(r.data,mes));
  const total=filtered.reduce((s,r)=>s+numberValue(r.valorMzn),0);
  const nomes=new Set(filtered.map(r=>r.nome).filter(Boolean));
  renderKpis('dizimosKpis', [
    {label:'Total MZN', value:money(total)},
    {label:'Nº dizimistas', value:nomes.size || 0},
    {label:'Média por dizimista', value:nomes.size ? money(total/nomes.size) : '—'},
    {label:'Sessões registadas', value:filtered.length}
  ]);
  const tbody=$('#dizimosTable tbody'); if(!tbody) return;
  tbody.innerHTML=filtered.map(r=>`<tr><td>${r.data||''}</td><td>${r.nome||''}</td><td>${r.modo||''}</td><td>${r.valorOrig||''}</td><td>${r.moeda||''}</td><td>${money(r.valorMzn)}</td><td>${r.metodo||''}</td><td>${r.recibo||''}</td></tr>`).join('') || '<tr><td colspan="8">Sem dízimos para o período</td></tr>';
}




// ─────────────────────────────────────────────────────────────
// Módulo: Avante Evangelho 2026
// ─────────────────────────────────────────────────────────────
function avanteEscape(value){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}
function avanteLocalDate(){
  const d=new Date(), off=d.getTimezoneOffset()*60000;
  return new Date(d.getTime()-off).toISOString().slice(0,10);
}
function avanteData(){ return state.avante?.data || null; }
function avanteGroups(){ return avanteData()?.groups || []; }
function avanteAllChurches(){ return avanteGroups().flatMap(g => (g.churches||[]).map(c => ({...c, groupId:g.id, groupName:g.name}))); }
function avanteSelectedChurch(){
  const id=$('#avanteIgreja')?.value || '';
  return avanteAllChurches().find(c => c.id===id) || null;
}
function avanteCanManage(){ return !!avanteData()?.canManage; }
function avanteContribution(churchId, phase){
  return (avanteData()?.contributions || []).find(r => r.igrejaId===churchId && String(r.fase).toUpperCase()===phase && String(r.estado).toUpperCase()==='CONFIRMADA') || null;
}
function setAvanteFormEnabled(){
  const can=avanteCanManage();
  const note=$('#avantePermissionNote');
  if(note){
    note.classList.toggle('hidden',can);
    note.className='avante-rule-note bad'+(can?' hidden':'');
    note.textContent=can?'':'A consulta está disponível, mas apenas o Tesoureiro Distrital ou o Administrador de IT pode confirmar e corrigir contribuições.';
  }
  ['avanteGrupo','avanteIgreja','avanteMeta','avanteFase','avanteData','avanteValor','avanteReferencia','avanteObservacoes','saveAvanteBtn','clearAvanteBtn'].forEach(id=>{
    const el=$('#'+id); if(el) el.disabled=!can;
  });
}
function populateAvanteSelectors(){
  const data=avanteData(); if(!data) return;
  const groupSelect=$('#avanteGrupo'), churchSelect=$('#avanteIgreja');
  if(!groupSelect || !churchSelect) return;
  const priorGroup=groupSelect.value || state.avante.selectedGroup || data.groups[0]?.id || '';
  groupSelect.innerHTML=(data.groups||[]).map(g=>`<option value="${avanteEscape(g.id)}">${avanteEscape(g.name)}</option>`).join('');
  groupSelect.value=(data.groups||[]).some(g=>g.id===priorGroup)?priorGroup:(data.groups[0]?.id||'');
  state.avante.selectedGroup=groupSelect.value;
  const group=(data.groups||[]).find(g=>g.id===groupSelect.value);
  const priorChurch=churchSelect.value;
  churchSelect.innerHTML='<option value="">Seleccione...</option>'+((group?.churches)||[]).slice().sort((a,b)=>a.order-b.order).map(c=>`<option value="${avanteEscape(c.id)}">${avanteEscape(c.name)}</option>`).join('');
  if(priorChurch && (group?.churches||[]).some(c=>c.id===priorChurch)) churchSelect.value=priorChurch;
  renderAvanteTabs();
  syncAvanteForm(false);
}
function renderAvanteTabs(){
  const el=$('#avanteGroupTabs'), data=avanteData(); if(!el||!data) return;
  const selected=state.avante.selectedGroup || data.groups[0]?.id || '';
  el.innerHTML=(data.groups||[]).map(g=>`<button type="button" data-group="${avanteEscape(g.id)}" class="${g.id===selected?'active':''}">${avanteEscape(g.name)}</button>`).join('');
  $$('#avanteGroupTabs button').forEach(btn=>btn.addEventListener('click',()=>{
    state.avante.selectedGroup=btn.dataset.group;
    if($('#avanteGrupo')) $('#avanteGrupo').value=btn.dataset.group;
    populateAvanteSelectors();
    renderAvanteChurchTable();
  }));
}
function syncAvanteForm(prefill=true){
  const church=avanteSelectedChurch(), phase=String($('#avanteFase')?.value||'PRIMEIRA').toUpperCase();
  const meta=$('#avanteMeta'), rule=$('#avanteEligibility'), save=$('#saveAvanteBtn'), value=$('#avanteValor');
  if(!church){
    if(meta) meta.value='';
    if(rule){rule.className='avante-rule-note'; rule.textContent='Seleccione uma igreja.';}
    if(save) save.disabled=!avanteCanManage();
    return;
  }
  if(meta) meta.value=money(church.meta);
  const existing=avanteContribution(church.id,phase);
  if(prefill){
    if(value) value.value=existing?Number(existing.valor||0).toFixed(2):'';
    if($('#avanteReferencia')) $('#avanteReferencia').value=existing?.referencia||'';
    if($('#avanteObservacoes')) $('#avanteObservacoes').value=existing?.observacoes||'';
    if(existing?.data && $('#avanteData')) $('#avanteData').value=existing.data;
  }
  const allowed=phase==='PRIMEIRA' || church.segundaAberta;
  if(rule){
    if(church.honoraria){
      rule.className='avante-rule-note ok';
      rule.textContent=`Igreja Honorária: total acumulado de ${money(church.total)} (meta honorária: ${money(avanteData()?.metaHonoraria)}).`;
    }else if(phase==='SEGUNDA' && !church.segundaAberta){
      rule.className='avante-rule-note bad';
      rule.textContent=`2.ª contribuição vedada. A 1.ª contribuição é ${money(church.primeira)} e a meta individual é ${money(church.meta)}.`;
    }else if(church.segundaAberta){
      rule.className='avante-rule-note ok';
      rule.textContent=`A igreja atingiu a meta na 1.ª contribuição e está autorizada a fazer a 2.ª contribuição. Total actual: ${money(church.total)}.`;
    }else{
      rule.className='avante-rule-note';
      rule.textContent=`Meta individual: ${money(church.meta)}. Para ter acesso à 2.ª contribuição, este valor deve ser atingido na 1.ª contribuição.`;
    }
  }
  if(save) save.disabled=!avanteCanManage() || !allowed;
  if(value) value.disabled=!avanteCanManage() || !allowed;
}
function renderAvanteChurchTable(){
  const data=avanteData(), tbody=$('#avanteChurchTable tbody'); if(!data||!tbody) return;
  const group=(data.groups||[]).find(g=>g.id===(state.avante.selectedGroup||data.groups[0]?.id)) || data.groups[0];
  tbody.innerHTML=(group?.churches||[]).map(c=>{
    const pct=c.meta?Math.min(100,c.total/c.meta*100):0;
    let status=c.honoraria?'<span class="avante-status honorary">🏅 Honorária</span>':(c.segundaAberta?'<span class="avante-status open">2.ª aberta</span>':'<span class="avante-status locked">2.ª vedada</span>');
    return `<tr><td><strong>${avanteEscape(c.name)}</strong><div class="avante-mini-progress"><i style="width:${pct}%"></i></div></td><td>${money(c.meta)}</td><td>${money(c.primeira)}</td><td>${money(c.segunda)}</td><td><strong>${money(c.total)}</strong></td><td>${status}</td></tr>`;
  }).join('') || '<tr><td colspan="6">Sem igrejas configuradas neste grupo.</td></tr>';
}
function renderAvanteHistory(){
  const tbody=$('#avanteHistoryTable tbody'), rows=avanteData()?.contributions||[]; if(!tbody) return;
  tbody.innerHTML=rows.slice(0,30).map(r=>{
    const active=String(r.estado).toUpperCase()==='CONFIRMADA';
    const phase=String(r.fase).toUpperCase()==='SEGUNDA'?'2.ª':'1.ª';
    return `<tr><td>${avanteEscape(r.data||'')}</td><td>${avanteEscape(r.igrejaNome)}</td><td>${phase}</td><td>${money(r.valor)}</td><td>${avanteEscape(r.estado)}</td><td>${avanteEscape(r.registadoPor)}</td><td>${active&&avanteCanManage()?`<button type="button" class="avante-anular-btn" data-id="${avanteEscape(r.id)}">Anular</button>`:'—'}</td></tr>`;
  }).join('') || '<tr><td colspan="7">Ainda não existem contribuições registadas.</td></tr>';
  $$('#avanteHistoryTable .avante-anular-btn').forEach(btn=>btn.addEventListener('click',()=>deleteAvanteContribution(btn.dataset.id)));
}
function renderAvanteModule(data){
  state.avante.data=data;
  const o=data.overall||{};
  renderKpis('avanteKpis',[
    {label:'Meta distrital',value:money(o.meta)},
    {label:'1.ª contribuição',value:money(o.primeira)},
    {label:'2.ª contribuição',value:money(o.segunda)},
    {label:'Total acumulado',value:money(o.total)},
    {label:'Igrejas honorárias',value:o.honorarias||0}
  ]);
  const status=$('#avanteEventStatus'); if(status) status.textContent=`${data.year} · ${data.eventoActivo?'Activo':'Encerrado'}`;
  const updated=$('#avanteUpdatedAt'); if(updated) updated.textContent=data.updatedAt?`Actualizado: ${new Date(data.updatedAt).toLocaleTimeString('pt-MZ')}`:'—';
  populateAvanteSelectors();
  renderAvanteChurchTable();
  renderAvanteHistory();
  setAvanteFormEnabled();
  syncAvanteForm(false);
}
async function loadAvanteModule(){
  if(state.avante.loading) return;
  const url=window.APP_CONFIG.APPS_SCRIPT_URL, token=getAuthToken();
  if(!url||!token) return showLogin('Sessão expirada. Faça login novamente.');
  state.avante.loading=true;
  try{
    const res=await fetch(url+'?'+new URLSearchParams({action:'avantedata',token}).toString(),{cache:'no-store'});
    const out=await res.json();
    if(!out.ok) throw new Error(out.message||'Não foi possível carregar o Avante Evangelho.');
    renderAvanteModule(out);
  }catch(e){console.error(e);toast(e.message,'error');}
  finally{state.avante.loading=false;}
}
async function saveAvanteContribution(e){
  e.preventDefault();
  if(!avanteCanManage()) return toast('Este perfil não pode confirmar contribuições.','error');
  const church=avanteSelectedChurch(); if(!church) return toast('Seleccione a igreja.','error');
  const phase=String($('#avanteFase')?.value||'').toUpperCase();
  if(phase==='SEGUNDA'&&!church.segundaAberta) return toast('A 2.ª contribuição está vedada para esta igreja.','error');
  const value=Number($('#avanteValor')?.value||0); if(!(value>0)) return toast('Informe um valor superior a zero.','error');
  const payload={action:'saveAvanteContribution',authToken:getAuthToken(),data:{
    igreja_id:church.id,fase:phase,data_contribuicao:$('#avanteData')?.value||avanteLocalDate(),valor:value,
    referencia:$('#avanteReferencia')?.value||'',observacoes:$('#avanteObservacoes')?.value||''
  }};
  const btn=$('#saveAvanteBtn'), old=btn?.textContent; if(btn){btn.disabled=true;btn.textContent='A confirmar...';}
  try{
    const res=await fetch(window.APP_CONFIG.APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
    const out=await res.json(); if(!out.ok) throw new Error(out.message||'Não foi possível guardar.');
    renderAvanteModule(out); toast('Contribuição confirmada e publicada.');
  }catch(err){console.error(err);toast(err.message,'error');}
  finally{if(btn){btn.textContent=old||'Confirmar contribuição';syncAvanteForm(false);}}
}
async function deleteAvanteContribution(id){
  if(!id||!avanteCanManage()) return;
  const motivo=window.prompt('Indique o motivo da anulação/correcção:','Correcção do lançamento');
  if(motivo===null) return;
  if(!window.confirm('Confirma a anulação desta contribuição? A exibição pública será actualizada.')) return;
  try{
    const res=await fetch(window.APP_CONFIG.APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'deleteAvanteContribution',authToken:getAuthToken(),id_contribuicao:id,motivo})});
    const out=await res.json(); if(!out.ok) throw new Error(out.message||'Não foi possível anular.');
    renderAvanteModule(out); toast('Contribuição anulada.');
  }catch(err){console.error(err);toast(err.message,'error');}
}
function clearAvanteForm(){
  if($('#avanteValor')) $('#avanteValor').value='';
  if($('#avanteReferencia')) $('#avanteReferencia').value='';
  if($('#avanteObservacoes')) $('#avanteObservacoes').value='';
  if($('#avanteData')) $('#avanteData').value=avanteLocalDate();
  syncAvanteForm(false);
}
function bindAvanteModule(){
  const form=$('#avanteForm'); if(!form||form.dataset.ready==='1') return;
  form.dataset.ready='1';
  if($('#avanteData')&&!$('#avanteData').value) $('#avanteData').value=avanteLocalDate();
  $('#avanteGrupo')?.addEventListener('change',()=>{state.avante.selectedGroup=$('#avanteGrupo').value;populateAvanteSelectors();renderAvanteChurchTable();});
  $('#avanteIgreja')?.addEventListener('change',()=>syncAvanteForm(true));
  $('#avanteFase')?.addEventListener('change',()=>syncAvanteForm(true));
  $('#refreshAvanteBtn')?.addEventListener('click',loadAvanteModule);
  $('#clearAvanteBtn')?.addEventListener('click',clearAvanteForm);
  form.addEventListener('submit',saveAvanteContribution);
}

// ─────────────────────────────────────────────────────────────
// Módulo: Certificação de Delegados à Assembleia Distrital
// ─────────────────────────────────────────────────────────────
const DELEGADOS_CATEGORIAS_EXOFFICIO = [
  ['dni_pres','DNI — Presidente'],
  ['dni_vice','DNI — Vice-presidente'],
  ['jni_pres','JNI — Presidente'],
  ['jni_vice','JNI — Vice-presidente'],
  ['mni_pres','MNI — Presidente'],
  ['mni_vice','MNI — Vice-presidente'],
  ['ministerial','Cargo ministerial designado'],
  ['outro','Outro']
];

function delegadosNumber(v){ return Number(v || 0) || 0; }
function delegadosState(){ state.delegados = state.delegados || { igrejas: [], rows: [] }; return state.delegados; }
function delegadosSelectedYear(){
  const d = $('#delegadosDataAssembleia')?.value || '';
  const y = d ? Number(String(d).slice(0,4)) : new Date().getFullYear();
  return Number.isFinite(y) && y > 1900 ? y : new Date().getFullYear();
}
function delegadosAvailableIgrejas(){
  const year = delegadosSelectedYear();
  return (delegadosState().igrejas || []).filter(x => !x.ano || Number(x.ano) === year);
}
function delegadosChurch(){
  const key = $('#delegadosIgreja')?.value || '';
  return (delegadosState().igrejas || []).find(x => String(x._key) === String(key)) || null;
}
function calcularDelegadosLeigosWeb(membrosDistrito, membrosIgreja){
  const md = delegadosNumber(membrosDistrito);
  const mi = delegadosNumber(membrosIgreja);
  const regime = md >= 5000 ? 2 : 1;
  const limit = regime === 1 ? 1975 : 2025;
  let inc = 0;
  for(let t = 75; t <= limit; t += 50){ if(mi > t) inc++; }
  const delegados = (regime === 1 ? 2 : 1) + inc;
  const descricao = regime === 1
    ? 'Distrito com menos de 5.000 membros: regra do §201.1'
    : 'Distrito com 5.000 ou mais membros: regra do §201.2';
  return { regime, descricao, delegados };
}

function delegadosRegraAplicavel(calc){
  if(!calc) return '—';
  return Number(calc.regime) === 1 ? 'Distrito com menos de 5.000 membros' : 'Distrito com 5.000 ou mais membros';
}

function renderDelegadosKpis(calc, ex=0, supl=0){
  renderKpis('delegadosCalcKpis', [
    {label:'Regra aplicável', value: delegadosRegraAplicavel(calc)},
    {label:'Delegados efectivos', value: calc.delegados},
    {label:'Ex officio', value: ex},
    {label:'Suplentes', value: supl},
    {label:'Total de delegados credenciados', value: calc.delegados + ex},
    {label:'Suplentes para substituição', value: supl}
  ]);
}
function renderDelegadosBase(church, calc, ex=0, supl=0){
  const box = $('#delegadosBaseCalculo');
  const totals = $('#delegadosTotaisFinais');
  const hero = $('#delegadosHeroTotal');
  const totalSem = calc.delegados + ex;
  const totalCredenciados = totalSem;
  if(hero) hero.textContent = totalCredenciados || '—';
  if(box){
    if(!church){
      box.innerHTML = '<p>Seleccione uma igreja local para calcular automaticamente os delegados efectivos.</p>';
    }else{
      box.innerHTML = `
        <p>Os números abaixo são preenchidos automaticamente com base nos dados oficiais da igreja seleccionada para o ano ${cleanHtml(String(church.ano || delegadosSelectedYear()))}.</p>
        <p><strong>Regra aplicável:</strong> ${cleanHtml(calc.descricao)}</p>
        <p><strong>Número de delegados leigos eleitos da igreja local:</strong> ${calc.delegados}</p>
      `;
    }
  }
  if(totals){
    totals.innerHTML = `
      <div><span>Total de delegados credenciados</span><strong>${totalSem}</strong></div>
      <div><span>Suplentes registados para substituição</span><strong>${supl}</strong></div>
      <div><span>Total da representação da igreja</span><strong>${totalCredenciados}</strong></div>
    `;
  }
}
function categoriaOptions(selected=''){
  return DELEGADOS_CATEGORIAS_EXOFFICIO.map(([v,l]) => `<option value="${v}" ${v===selected?'selected':''}>${l}</option>`).join('');
}
function makeRepeatRows(containerId, prefix, count, type){
  const c = $('#'+containerId); if(!c) return;
  const n = Math.max(0, Math.min(80, Number(count || 0) || 0));
  const rows = [];
  for(let i=0;i<n;i++){
    const num = i + 1;
    if(type === 'exofficio'){
      rows.push(`<div class="repeat-row" data-i="${i}"><div class="repeat-index">${num}</div><label>Nome do delegado ex officio<input data-field="nome" placeholder="Nome completo"></label><label>Contacto<input data-field="contacto" placeholder="84/85/86/82/87xxxxxxx"></label><label>Categoria<select data-field="categoria">${categoriaOptions()}</select></label></div>`);
    }else if(type === 'suplente'){
      rows.push(`<div class="repeat-row two" data-i="${i}"><div class="repeat-index">${num}</div><label>Nome do suplente<input data-field="nome" placeholder="Nome completo"></label><label>Contacto<input data-field="contacto" placeholder="84/85/86/82/87xxxxxxx"></label></div>`);
    }else{
      rows.push(`<div class="repeat-row two" data-i="${i}"><div class="repeat-index">${num}</div><label>Nome do delegado efectivo <span class="req">*</span><input data-field="nome" placeholder="Nome completo" required></label><label>Contacto<input data-field="contacto" placeholder="84/85/86/82/87xxxxxxx"></label></div>`);
    }
  }
  c.innerHTML = rows.join('') || '<div class="legacy-empty">Nenhuma linha a preencher.</div>';
}

function isValidMozPhoneDelegados(value){
  const raw = String(value || '').trim();
  if (!raw) return true;
  const n = raw.replace(/\s+/g, '').replace(/-/g, '');
  return /^(84|85|86|82|87)\d{7}$/.test(n) || /^258(84|85|86|82|87)\d{7}$/.test(n);
}

function validateDelegadosContacts(){
  const fields = [
    ...$$('#delegadosEfectivosRows input[data-field="contacto"]'),
    ...$$('#delegadosExofficioRows input[data-field="contacto"]'),
    ...$$('#delegadosSuplentesRows input[data-field="contacto"]')
  ];
  for (const f of fields) {
    f.classList.remove('error');
    if (!isValidMozPhoneDelegados(f.value)) {
      f.classList.add('error');
      f.focus();
      toast('Contacto inválido. Use 84/85/86/82/87xxxxxxx ou 25884/25885/25886/25882/25887xxxxxxx.', 'error');
      return false;
    }
  }
  return true;
}

function collectRepeat(containerId){
  return $$('.repeat-row', $('#'+containerId) || document).map(row => {
    const obj = {};
    $$('[data-field]', row).forEach(el => obj[el.dataset.field] = el.value || '');
    return obj;
  });
}
function syncDelegadosForm(){
  const yearInput = $('#delegadosAnoBase'); if(yearInput) yearInput.value = delegadosSelectedYear();
  const church = delegadosChurch();
  const membrosDistrito = church ? delegadosNumber(church.membros_distrito) : 0;
  const membrosIgreja = church ? delegadosNumber(church.membros_igreja) : 0;
  if($('#delegadosDistrito')) $('#delegadosDistrito').value = church ? (church.distrito_nome || 'Matola') : '';
  if($('#delegadosMembrosDistrito')) $('#delegadosMembrosDistrito').value = membrosDistrito || '';
  if($('#delegadosMembrosIgreja')) $('#delegadosMembrosIgreja').value = membrosIgreja || '';
  const calc = calcularDelegadosLeigosWeb(membrosDistrito, membrosIgreja);
  const ex = Math.max(0, Number($('#delegadosNumExofficio')?.value || 0) || 0);
  const supl = Math.max(0, Number($('#delegadosNumSuplentes')?.value || 0) || 0);
  makeRepeatRows('delegadosEfectivosRows', 'efectivos', calc.delegados, 'efectivo');
  makeRepeatRows('delegadosExofficioRows', 'exofficio', ex, 'exofficio');
  makeRepeatRows('delegadosSuplentesRows', 'suplentes', supl, 'suplente');
  renderDelegadosKpis(calc, ex, supl);
  renderDelegadosBase(church, calc, ex, supl);
  const pill = $('#delegadosStatusPill'); if(pill) pill.textContent = church ? `${church.label || church.name}: ${calc.delegados} efectivo(s)` : 'Seleccione a igreja local';
}
function populateDelegadosIgrejas(){
  const sel = $('#delegadosIgreja'); if(!sel) return;
  const year = delegadosSelectedYear();
  const yearInput = $('#delegadosAnoBase'); if(yearInput) yearInput.value = year;
  const hint = $('#delegadosIgrejaHint');
  const igrejas = delegadosAvailableIgrejas();
  const current = sel.value;
  sel.innerHTML = '<option value="">Seleccione...</option>' + igrejas.map(i => `<option value="${i._key}">${i.label || i.name}</option>`).join('');
  if(current && igrejas.some(i => i._key === current)) sel.value = current;
  if(hint) hint.textContent = igrejas.length ? `Dados oficiais carregados para ${year}.` : `Não há igrejas cadastradas para ${year}. Actualize a folha Igrejas_Delegados.`;
}
function renderDelegadosResumo(rows, resumo){
  if(!$('#delegadosResumoKpis') && !$('#delegadosResumoTable')) return;
  renderKpis('delegadosResumoKpis', [
    {label:'Igrejas registadas', value: resumo?.igrejas || 0},
    {label:'Membros das igrejas', value: resumo?.membrosIgrejas || 0},
    {label:'Delegados eleitos', value: resumo?.delegadosEleitos || 0},
    {label:'Ex officio', value: resumo?.exOfficio || 0},
    {label:'Suplentes', value: resumo?.suplentes || 0},
    {label:'Total sem suplentes', value: resumo?.totalSemSuplentes || 0}
  ]);
  const tbody = $('#delegadosResumoTable tbody'); if(!tbody) return;
  tbody.innerHTML = (rows || []).slice(0,20).map(r => `<tr><td>${r.data_assembleia || ''}</td><td>${r.igreja_label || r.igreja_local || ''}</td><td>${r.delegados_leigos_eleitos || 0}</td><td>${r.num_exofficio || 0}</td><td>${r.num_suplentes || 0}</td><td>${r.total_geral_com_suplentes || 0}</td></tr>`).join('') || '<tr><td colspan="6">Sem certificações registadas.</td></tr>';
}
async function loadDelegadosModule(){
  if(SANDBOX_MODE){
    const out = sandboxDelegadosData();
    const d = delegadosState();
    d.igrejas = (out.igrejas || []).map(x => ({...x, ano: Number(x.ano || 0) || '', _key: `${x.ano || ''}::${x.name}`}));
    d.rows = out.rows || [];
    populateDelegadosIgrejas();
    renderDelegadosResumo(d.rows, out.resumo || {});
    syncDelegadosForm();
    return;
  }
  const url = window.APP_CONFIG.APPS_SCRIPT_URL;
  const token = getAuthToken();
  if(!url || !token) return;
  try{
    const res = await fetch(url + '?' + new URLSearchParams({action:'delegadosdata', token}).toString(), {cache:'no-store'});
    const out = await res.json();
    if(!out.ok) throw new Error(out.message || 'Não foi possível carregar certificações.');
    const d = delegadosState();
    d.igrejas = (out.igrejas || []).map(x => ({...x, ano: Number(x.ano || 0) || '', _key: `${x.ano || ''}::${x.name}`}));
    d.rows = out.rows || [];
    populateDelegadosIgrejas();
    renderDelegadosResumo(d.rows, out.resumo || {});
    syncDelegadosForm();
  }catch(e){ console.error(e); toast(e.message, 'error'); }
}
function bindDelegadosForm(){
  const form = $('#delegadosForm'); if(!form || form.dataset.ready) return;
  form.dataset.ready = '1';
  $('#delegadosIgreja')?.addEventListener('change', syncDelegadosForm);
  $('#delegadosDataAssembleia')?.addEventListener('change', () => { populateDelegadosIgrejas(); syncDelegadosForm(); });
  $('#delegadosNumExofficio')?.addEventListener('input', syncDelegadosForm);
  $('#delegadosNumSuplentes')?.addEventListener('input', syncDelegadosForm);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = window.APP_CONFIG.APPS_SCRIPT_URL;
    const token = getAuthToken();
    if(!url || !token) return showLogin('Sessão expirada. Faça login novamente.');
    const church = delegadosChurch();
    if(!church) return toast('Seleccione a igreja local.', 'error');
    const dataAssembleia = $('#delegadosDataAssembleia')?.value || '';
    if(!dataAssembleia) return toast('Indique a data da Assembleia.', 'error');
    if(!validateDelegadosContacts()) return;
    const calc = calcularDelegadosLeigosWeb(church.membros_distrito, church.membros_igreja);
    const totalCredenciados = calc.delegados + (Number($('#delegadosNumExofficio')?.value || 0) || 0);
    const payload = {
      action:'saveCertificacaoDelegados',
      authToken: token,
      data:{
        ano_assembleia: delegadosSelectedYear(),
        igreja_local: church.name,
        igreja_label: church.label || church.name,
        distrito_nome_calc: church.distrito_nome || '',
        membros_distrito: delegadosNumber(church.membros_distrito),
        membros_igreja: delegadosNumber(church.membros_igreja),
        data_assembleia: dataAssembleia,
        regime_flag: calc.regime,
        descricao_regime: calc.descricao,
        delegados_leigos_eleitos: calc.delegados,
        num_exofficio: Number($('#delegadosNumExofficio')?.value || 0) || 0,
        num_suplentes: Number($('#delegadosNumSuplentes')?.value || 0) || 0,
        total_delegados_sem_suplentes: totalCredenciados,
        total_geral_com_suplentes: totalCredenciados,
        visto_final: $('#delegadosVistoFinal')?.value || ''
      },
      repeats:{
        lista_efectivos: collectRepeat('delegadosEfectivosRows'),
        lista_exofficio: collectRepeat('delegadosExofficioRows'),
        lista_suplentes: collectRepeat('delegadosSuplentesRows')
      }
    };
    try{
      const btn = form.querySelector('button[type="submit"]'); const old = btn.textContent; btn.disabled = true; btn.textContent = 'A submeter...';
      if(SANDBOX_MODE){
        addSandboxSubmission({module:'certificacao_delegados', uuid: uuid()});
        toast('Modo teste: certificação simulada. Nada foi gravado.');
        $('#delegadosVistoFinal').value='';
        await loadDelegadosModule();
        btn.disabled = false; btn.textContent = old;
        return;
      }
      const res = await fetch(url, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(payload)});
      const out = await res.json();
      if(!out.ok) throw new Error(out.message || 'Não foi possível gravar.');
      toast('Certificação submetida com sucesso.');
      $('#delegadosVistoFinal').value='';
      await loadDelegadosModule();
      btn.disabled = false; btn.textContent = old;
    }catch(err){ console.error(err); toast(err.message, 'error'); const btn=form.querySelector('button[type="submit"]'); if(btn){ btn.disabled=false; btn.textContent='Submeter certificação'; } }
  });
}


$$('.nav-btn').forEach(btn => btn.addEventListener('click', () => openView(btn.dataset.view)));
bindDelegadosForm();
bindAvanteModule();
bindApprovalModule();
const workChurchSelect=$('#workChurchSelect');
if(workChurchSelect && workChurchSelect.dataset.bound!=='1'){
  workChurchSelect.dataset.bound='1';
  workChurchSelect.addEventListener('change',async()=>{
    try{ await setSelectedWorkChurch(workChurchSelect.value); }
    catch(err){ console.error(err); toast(err.message||'Não foi possível alterar a Igreja de trabalho.','error'); }
  });
}
$('#importMembersBtn')?.addEventListener('click',importMembersCsv);

$('#resetBtn').addEventListener('click', resetForm);
$('#refreshStatsBtn').addEventListener('click', loadStats);
$('#loadReportBtn')?.addEventListener('click', loadFinancialReport);
$('#printReportBtn')?.addEventListener('click', () => window.print());
injectMultiSelectStyles();
setupLoginHandlers();
setupSandboxBanner();

// v54.3.2 — membros por igreja e sessão segura por separador.
// A aplicação só é mostrada depois de o backend confirmar o token.
(function startAuthenticatedApp(){
  // Limpa a persistência insegura usada por versões anteriores.
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);

  if(SANDBOX_MODE){
    const u=$('#loginUsername'), p=$('#loginPassword');
    if(u && !u.value) u.value='visitante_demo';
    if(p && !p.value) p.value='teste123';
    setStatus('ok','Modo teste','Sandbox activo: nada é gravado');
    showLogin();
    return;
  }

  const token=getAuthToken();
  const user=getStoredUser();
  showLogin();
  if(token && user && Object.keys(user).length){
    state.currentUser=user;
    setStatus('','A confirmar sessão','A validar a sessão no backend...');
    bootstrap();
    return;
  }
  clearAuthSession();
  setStatus('bad','Aguardando login','Introduza as credenciais para entrar no sistema');
  showLogin();
})();
