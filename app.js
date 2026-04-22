const FILES = [
  "患者初诊.pdf",
  "患者复诊.pdf",
  "肿瘤病例.pdf",
  "诊断复盘.pdf",
  "迁移应用.pdf",
  "任务引擎应用案例.docx",
  "肿瘤病例.docx",
  "附件1医学教育智能体及应用案例申报书docx.docx",
  "Picture.png",
  "Picture2.png"
];

const STAGES = [
  {
    id: 1,
    title: "第一幕 初诊导入",
    task:
      "请根据首诊资料完成初步判断：1) 当前偏良性还是偏恶性；2) 至少给出2条诊断依据；3) 给出初始处置建议。",
    keyPoints: ["良恶性判断", "诊断依据", "初始处置建议"],
    passScore: 65
  },
  {
    id: 2,
    title: "第二幕 复诊反转",
    task:
      "请根据复诊进展作答：1) 分析首次诊疗可能问题；2) 判断当前病变性质；3) 给出下一步检查建议。",
    keyPoints: ["复发原因", "当前良恶性判断", "检查建议"],
    passScore: 70
  },
  {
    id: 3,
    title: "第三幕 误诊复盘",
    task:
      "请完成4道核心复盘题：1) 良恶性最终判断；2) 证据链；3) 医患沟通要点；4) 主要教训与改进路径。",
    keyPoints: ["最终判断", "证据链", "沟通要点", "教训改进"],
    passScore: 75
  },
  {
    id: 4,
    title: "第四幕 迁移应用",
    task:
      "请给出可迁移方案：1) 诊疗规范清单；2) 沟通要点清单；3) 风险防范清单；4) 你的个人行动卡。",
    keyPoints: ["诊疗规范", "沟通要点", "风险防范", "个人行动卡"],
    passScore: 75
  }
];

const STAGE_EVIDENCE = {
  1: {
    narrative:
      "首诊阶段：请先查看病理图与相关信息，再完成初步诊断判断。",
    caseText: [
      "患者，男性，60岁。因发现右颊部肿物半年余入院。",
      "半年余前因口腔扁平苔藓于我院门诊就诊，发现右颊部一黄豆大小肿物，无疼痛、出血等不适。一直行药物治疗，疗效不佳，且半年来肿物逐渐增大，现增大至山核桃大小。门诊行局部肿物切取活检，病理示右颊部鳞状上皮乳头状瘤样增生。",
      "体检：左右脸面部基本对称，双侧颞下颌关节区无红肿触痛，关节活动自如。右颊粘膜可及大小约3cm肿块，质中，界尚清，肿块表面多呈乳头状突起，粗糙，活检创口愈合好，右颊部肿胀明显，触痛（+）。左颊部、腭部、舌体及口底粘膜无异常，舌体活动好，双侧颈部及下颌区未及明显肿大淋巴结。",
      "入院后完善常规检查，于2019年5月8日行右颊部病损切除术+颌面部局部皮瓣转移修复术。因术前已行局部肿物切取活检，故完整切除标本未行病理检查。"
    ],
    images: [
      { src: "Picture.png", caption: "局部肿物病理切片 HE 10X" },
      { src: "Picture2.png", caption: "局部肿物病理切片 HE 20X" }
    ],
    clues: [
      "核心判断1：当前偏良性还是偏恶性？",
      "核心判断2：给出至少2条证据依据",
      "核心判断3：是否需要进一步分期评估与扩大病理取材？"
    ]
  },
  2: {
    narrative:
      "复诊阶段：加入复发与病程反转信息，请重新评估首次决策是否存在低估风险。",
    images: [{ src: "Picture2.png", caption: "复诊外观图：术后复发、增大、破溃风险" }],
    clues: ["术后复发并增大", "局部破溃、质地变硬", "提示首次处置可能不足"]
  },
  3: {
    narrative:
      "复盘阶段：二次病理与转移证据已经出现，请按诊断偏差、标本漏洞、手术范围三环节复盘。",
    images: [],
    clues: ["二次手术病理结果", "淋巴结转移证据", "肺部转移证据"]
  },
  4: {
    narrative:
      "迁移阶段：请将本案教训转化为通用临床规则，形成可执行清单。",
    images: [],
    clues: ["诊疗规范清单", "沟通要点清单", "风险防范清单", "个人行动卡"]
  }
};

const state = {
  knowledgeText: "",
  currentStageIndex: 0,
  stageResults: {},
  knowledgeLoaded: false,
  records: []
};

const chat = document.getElementById("chat");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const loadKnowledgeBtn = document.getElementById("loadKnowledgeBtn");
const clearContextBtn = document.getElementById("clearContextBtn");
const knowledgeStatus = document.getElementById("knowledgeStatus");
const fileList = document.getElementById("fileList");
const sendBtn = document.getElementById("sendBtn");
const stageTimeline = document.getElementById("stageTimeline");
const stageStatus = document.getElementById("stageStatus");
const exportBtn = document.getElementById("exportBtn");
const stageTitle = document.getElementById("stageTitle");
const stageNarrative = document.getElementById("stageNarrative");
const stageCaseText = document.getElementById("stageCaseText");
const stageMedia = document.getElementById("stageMedia");
const stageChecklist = document.getElementById("stageChecklist");
const imageLightbox = document.getElementById("imageLightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

const FREE_MODEL_CANDIDATES = [
  { endpoint: "https://text.pollinations.ai/openai", model: "openai" },
  { endpoint: "https://text.pollinations.ai/openai", model: "mistral" }
];

function init() {
  FILES.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    fileList.appendChild(li);
  });

  appendMessage(
    "assistant",
    "你好，我是临床误诊复盘智能体。\n\n流程为四幕锁步推进：只有当前幕通过后，下一幕才会解锁。\n请先点击“加载目录资料”，系统将从第一幕开始。"
  );
  renderStageTimeline();
}

function appendMessage(role, content) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = content;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function renderStageTimeline() {
  const items = stageTimeline.querySelectorAll("li");
  items.forEach((li, idx) => {
    li.classList.remove("active", "done");
    if (idx < state.currentStageIndex) {
      li.classList.add("done");
    } else if (idx === state.currentStageIndex) {
      li.classList.add("active");
    }
  });

  if (state.currentStageIndex >= STAGES.length) {
    stageStatus.textContent = "全部幕次已完成：你已形成迁移应用清单。";
  } else {
    const stage = STAGES[state.currentStageIndex];
    stageStatus.textContent = `当前幕：${stage.title}。必须通过本幕后才能进入下一幕。`;
  }

  renderStageEvidence();
}

function currentStage() {
  return STAGES[state.currentStageIndex] || null;
}

function renderStageEvidence() {
  const stage = currentStage();
  if (!stage) {
    stageTitle.textContent = "训练完成";
    stageNarrative.textContent = "四幕流程已完成。可导出训练记录并复盘。";
    stageCaseText.innerHTML = "";
    stageMedia.innerHTML = "";
    stageChecklist.innerHTML = "";
    return;
  }

  const evidence = STAGE_EVIDENCE[stage.id] || { narrative: "", images: [], clues: [], caseText: [] };
  stageTitle.textContent = `${stage.title} 资料卡`;
  stageNarrative.textContent = evidence.narrative;

  stageCaseText.innerHTML = "";
  (evidence.caseText || []).forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    stageCaseText.appendChild(p);
  });

  stageMedia.innerHTML = "";
  (evidence.images || []).forEach((img) => {
    const fig = document.createElement("figure");
    const image = document.createElement("img");
    image.src = `./${encodeURIComponent(img.src)}`;
    image.alt = img.caption;
    image.loading = "lazy";
    image.onerror = () => {
      image.alt = "图片未加载，请检查静态资源是否存在";
    };
    image.addEventListener("click", () => {
      lightboxImg.src = image.src;
      lightboxCaption.textContent = img.caption;
      imageLightbox.classList.add("open");
      imageLightbox.setAttribute("aria-hidden", "false");
    });
    const cap = document.createElement("figcaption");
    cap.textContent = img.caption;
    fig.appendChild(image);
    fig.appendChild(cap);
    stageMedia.appendChild(fig);
  });

  stageChecklist.innerHTML = "";
  (evidence.clues || []).forEach((clue) => {
    const li = document.createElement("li");
    li.textContent = clue;
    stageChecklist.appendChild(li);
  });
}

function closeLightbox() {
  imageLightbox.classList.remove("open");
  imageLightbox.setAttribute("aria-hidden", "true");
  lightboxImg.removeAttribute("src");
  lightboxCaption.textContent = "";
}

function pushStageTask() {
  const stage = currentStage();
  if (!stage) {
    appendMessage("assistant", "四幕流程已全部完成。请点击“重置训练流程”可重新开始。\n\n说明：本应用为教学用途，不构成医疗建议。");
    return;
  }
  appendMessage(
    "assistant",
    `${stage.title}\n\n请先阅读上方“资料卡”（含图片/线索），再完成作答。\n\n任务要求：${stage.task}\n\n评分门槛：${stage.passScore} 分。\n必答要点：${stage.keyPoints.join("、")}。`
  );
}

async function fetchBinary(fileName) {
  const res = await fetch(`./${encodeURIComponent(fileName)}`);
  if (!res.ok) {
    throw new Error(`读取失败: ${fileName}`);
  }
  return await res.arrayBuffer();
}

async function extractPdfText(fileName) {
  const bytes = await fetchBinary(fileName);
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    const parts = text.items.map((it) => it.str).join(" ");
    out += `\n[${fileName} 第${i}页]\n${parts}\n`;
  }
  return out;
}

async function extractDocxText(fileName) {
  const bytes = await fetchBinary(fileName);
  const result = await mammoth.extractRawText({ arrayBuffer: bytes });
  return `\n[${fileName}]\n${result.value}\n`;
}

async function extractImageText(fileName) {
  const bytes = await fetchBinary(fileName);
  const blob = new Blob([bytes], { type: "image/png" });
  const url = URL.createObjectURL(blob);
  try {
    const res = await Tesseract.recognize(url, "chi_sim+eng", {
      logger: () => {}
    });
    return `\n[${fileName} OCR]\n${res.data.text}\n`;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function clipText(s, maxLen = 14000) {
  if (s.length <= maxLen) {
    return s;
  }
  return `${s.slice(0, maxLen)}\n\n[内容过长，已截断]`;
}

async function loadKnowledge() {
  loadKnowledgeBtn.disabled = true;
  knowledgeStatus.textContent = "正在加载并抽取资料，这可能需要几十秒...";

  const chunks = [];
  const failed = [];

  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    for (const f of FILES) {
      try {
        if (f.toLowerCase().endsWith(".pdf")) {
          chunks.push(await extractPdfText(f));
        } else if (f.toLowerCase().endsWith(".docx")) {
          chunks.push(await extractDocxText(f));
        } else if (f.toLowerCase().endsWith(".png")) {
          chunks.push(await extractImageText(f));
        }
      } catch (err) {
        failed.push(`${f}: ${err.message}`);
      }
    }

    state.knowledgeText = clipText(chunks.join("\n\n"));
    state.knowledgeLoaded = true;
    state.currentStageIndex = 0;
    state.stageResults = {};
    state.records = [];
    renderStageTimeline();
    const loadedCount = chunks.length;
    const failCount = failed.length;
    knowledgeStatus.textContent = `已加载 ${loadedCount} 份资料，失败 ${failCount} 份。`;

    if (failCount > 0) {
      appendMessage("assistant", `部分文件读取失败：\n${failed.join("\n")}`);
    }

    appendMessage("assistant", "资料已加载完成，四幕训练即将开始。\n\n说明：该原型仅用于教学和演示，不用于真实医疗决策。");
    pushStageTask();
  } finally {
    loadKnowledgeBtn.disabled = false;
  }
}

function buildEvaluationMessages(stage, userText) {
  const standardPoints = {
    1: [
      "识别病变增大趋势与潜在恶性风险",
      "结合病史与体征而非仅依赖单次活检",
      "提出进一步影像/病理复核与扩大评估"
    ],
    2: [
      "指出首次诊疗存在低估风险或手术范围不足",
      "复发加速、破溃、变硬提示恶性倾向提升",
      "建议完善分期检查与多学科评估"
    ],
    3: [
      "识别首次诊断偏差点",
      "指出活检与标本处理可能漏洞",
      "说明手术范围不足与转移风险管理缺失",
      "给出沟通与复盘改进策略"
    ],
    4: [
      "形成诊疗规范清单",
      "形成沟通要点清单",
      "形成风险防范清单",
      "形成个人行动卡并可执行"
    ]
  };

  const contextBlock = state.knowledgeText
    ? `【案例资料】\n${state.knowledgeText}`
    : "【案例资料】尚未加载。请提醒用户先加载资料。";

  return [
    {
      role: "system",
      content:
        "你是医学教育评估官。请按任务引擎锁步规则评估学生作答。\n" +
        "只输出严格 JSON，不要输出额外文本。\n" +
        "JSON schema: {\"pass\":boolean,\"score\":0-100整数,\"missing\":[string],\"feedback\":string,\"next_hint\":string,\"teaching_note\":string}\n" +
        "评分必须严格，不满足必答要点不得通过。\n" +
        "必须在 teaching_note 中提醒：仅教学用途，不构成医疗建议。"
    },
    {
      role: "user",
      content:
        `${contextBlock}\n\n` +
        `【当前幕】${stage.title}\n` +
        `【任务要求】${stage.task}\n` +
        `【必答要点】${stage.keyPoints.join("、")}\n` +
        `【标准参考点】${(standardPoints[stage.id] || []).join("；")}\n` +
        `【通过门槛】${stage.passScore} 分\n\n` +
        `【学生作答】${userText}`
    }
  ];
}

async function callOneModel(candidate, payload) {
  const res = await fetch(candidate.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`${candidate.model} HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error(`${candidate.model} 空响应`);
  }
  return text;
}

async function askFreeModel(messages, temperature = 0.2) {
  const errors = [];
  for (const candidate of FREE_MODEL_CANDIDATES) {
    try {
      const payload = {
        model: candidate.model,
        messages,
        temperature
      };
      return await callOneModel(candidate, payload);
    } catch (err) {
      errors.push(String(err.message || err));
    }
  }
  throw new Error(`免费模型暂不可用: ${errors.join(" | ")}`);
}

function localFallbackEvaluation(stage, userText) {
  const text = userText.trim();
  const lengthScore = Math.min(35, Math.floor(text.length / 12));
  const covered = stage.keyPoints.filter((p) =>
    text.includes(p.slice(0, 2)) || text.includes(p.slice(0, 3))
  );
  const coverageScore = Math.round((covered.length / stage.keyPoints.length) * 55);
  const structureBonus = /1|2|3|4|首先|其次|最后/.test(text) ? 10 : 0;
  const score = Math.max(0, Math.min(100, lengthScore + coverageScore + structureBonus));
  const missing = stage.keyPoints.filter((p) => !covered.includes(p));
  const pass = score >= stage.passScore && missing.length <= 1;

  return {
    pass,
    score,
    missing,
    feedback: pass
      ? "已覆盖大部分关键点，具备进入下一幕的条件。"
      : "关键点覆盖不足，建议补充证据链与可执行建议。",
    next_hint: `建议补充：${missing.join("、") || "进一步细化证据强度和风险分层"}`,
    teaching_note: "仅教学用途，不构成医疗建议。"
  };
}

function safeParseEvaluation(raw, stage) {
  let obj = null;
  try {
    obj = JSON.parse(raw);
  } catch (_) {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        obj = JSON.parse(m[0]);
      } catch (_) {
        obj = null;
      }
    }
  }

  if (!obj || typeof obj !== "object") {
    return {
      pass: false,
      score: 0,
      missing: stage.keyPoints,
      feedback: "评分模型未返回可解析结果，请补充更结构化作答后重试。",
      next_hint: `请至少覆盖：${stage.keyPoints.join("、")}`,
      teaching_note: "仅教学用途，不构成医疗建议。"
    };
  }

  const score = Number.isFinite(Number(obj.score)) ? Math.max(0, Math.min(100, Math.round(Number(obj.score)))) : 0;
  const missing = Array.isArray(obj.missing) ? obj.missing.map((it) => String(it)) : [];
  const passFlag = Boolean(obj.pass) && score >= stage.passScore;

  return {
    pass: passFlag,
    score,
    missing,
    feedback: String(obj.feedback || ""),
    next_hint: String(obj.next_hint || ""),
    teaching_note: String(obj.teaching_note || "仅教学用途，不构成医疗建议。")
  };
}

function applyLocalGate(stage, userText, evalResult) {
  const required = stage.keyPoints;
  const hitCount = required.filter((p) => userText.includes(p.slice(0, 2))).length;
  const localPass = hitCount >= Math.max(2, required.length - 1);
  if (evalResult.pass && localPass) {
    return evalResult;
  }

  return {
    ...evalResult,
    pass: false,
    score: Math.min(evalResult.score, stage.passScore - 5),
    missing: evalResult.missing.length > 0 ? evalResult.missing : required,
    feedback: evalResult.feedback || "当前作答覆盖不足，未达到本幕通关条件。",
    next_hint: evalResult.next_hint || `请围绕以下要点补答：${required.join("、")}`
  };
}

async function evaluateCurrentStage(userText) {
  const stage = currentStage();
  if (!stage) {
    return;
  }

  let result;
  let source = "model";
  try {
    const raw = await askFreeModel(buildEvaluationMessages(stage, userText));
    const parsed = safeParseEvaluation(raw, stage);
    result = applyLocalGate(stage, userText, parsed);
  } catch (_) {
    source = "local-fallback";
    result = localFallbackEvaluation(stage, userText);
    result = applyLocalGate(stage, userText, result);
  }

  state.stageResults[stage.id] = {
    score: result.score,
    pass: result.pass
  };

  state.records.push({
    stageId: stage.id,
    stageTitle: stage.title,
    submittedAt: new Date().toISOString(),
    answer: userText,
    score: result.score,
    pass: result.pass,
    missing: result.missing,
    feedback: result.feedback,
    source
  });

  appendMessage(
    "assistant",
    `${stage.title} 评分结果\n` +
      `得分：${result.score} / 100\n` +
      `评估来源：${source === "model" ? "免费模型" : "本地兜底规则"}\n` +
      `判定：${result.pass ? "通过，可进入下一幕" : "未通过，需补答本幕"}\n\n` +
      `评语：${result.feedback || "无"}\n` +
      `缺失点：${result.missing.length > 0 ? result.missing.join("、") : "无"}\n` +
      `补答提示：${result.next_hint || "无"}\n\n` +
      `${result.teaching_note}`
  );

  if (!result.pass) {
    return;
  }

  state.currentStageIndex += 1;
  renderStageTimeline();
  if (state.currentStageIndex < STAGES.length) {
    appendMessage("assistant", `已解锁下一幕：${STAGES[state.currentStageIndex].title}`);
    pushStageTask();
    return;
  }

  appendMessage(
    "assistant",
    "四幕全部完成。\n\n闭环总结：病例呈现 -> 初诊判断 -> 病情反转 -> 误诊暴露 -> 病理实锤 -> 复盘反思 -> 规范迁移。\n\n你已完成本次临床误诊复盘思辨训练。"
  );
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = userInput.value.trim();
  if (!input) {
    return;
  }

  if (!state.knowledgeLoaded) {
    appendMessage("assistant", "请先点击“加载目录资料”，系统才能启动四幕训练。\n\n说明：仅教学用途，不构成医疗建议。");
    return;
  }

  if (state.currentStageIndex >= STAGES.length) {
    appendMessage("assistant", "当前流程已完成。如需重新训练，请点击“重置训练流程”。");
    return;
  }

  appendMessage("user", input);
  userInput.value = "";
  sendBtn.disabled = true;

  try {
    await evaluateCurrentStage(input);
  } catch (err) {
    appendMessage("assistant", `调用失败：${err.message}\n请检查网络，或更换免费模型接口。`);
  } finally {
    sendBtn.disabled = false;
  }
});

loadKnowledgeBtn.addEventListener("click", loadKnowledge);
clearContextBtn.addEventListener("click", () => {
  state.knowledgeText = "";
  state.currentStageIndex = 0;
  state.stageResults = {};
  state.knowledgeLoaded = false;
  state.records = [];
  knowledgeStatus.textContent = "流程已重置，请重新加载资料。";
  renderStageTimeline();
  appendMessage("assistant", "已重置流程。请重新加载资料后，从第一幕开始作答。\n\n说明：该原型仅用于教学和演示，不用于真实医疗决策。");
});

function downloadBlob(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function exportRecords() {
  if (state.records.length === 0) {
    appendMessage("assistant", "当前没有可导出的训练记录。请先完成至少一次作答。");
    return;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonName = `training-records-${stamp}.json`;
  const csvName = `training-records-${stamp}.csv`;

  downloadBlob(JSON.stringify(state.records, null, 2), jsonName, "application/json");

  const header = [
    "stageId",
    "stageTitle",
    "submittedAt",
    "score",
    "pass",
    "source",
    "missing",
    "feedback",
    "answer"
  ];

  const rows = state.records.map((r) => [
    r.stageId,
    r.stageTitle,
    r.submittedAt,
    r.score,
    r.pass,
    r.source,
    (r.missing || []).join("|") || "",
    r.feedback || "",
    r.answer || ""
  ]);

  const csv = [header, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`)
        .join(",")
    )
    .join("\n");

  downloadBlob(csv, csvName, "text/csv;charset=utf-8");
  appendMessage("assistant", "训练记录已导出为 JSON 与 CSV 文件。\n\n说明：仅教学用途，不构成医疗建议。");
}

exportBtn.addEventListener("click", exportRecords);
lightboxClose.addEventListener("click", closeLightbox);
imageLightbox.addEventListener("click", (e) => {
  if (e.target === imageLightbox) {
    closeLightbox();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && imageLightbox.classList.contains("open")) {
    closeLightbox();
  }
});

init();
