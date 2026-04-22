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
  "Picture2.png",
  "figure1.png",
  "figure2.png",
  "figure3.png",
  "figure4.png"
];

const STAGES = [
  {
    id: 1,
    title: "关卡一：雾里看花",
    task:
      "请根据病历摘要完成首诊判断：1) 先判断此时偏良性还是偏恶性；2) 填写《良恶性肿瘤鉴别表》前两行（分化程度、生长速度）；3) 说明你的判断依据。",
    keyPoints: ["良恶性判断", "分化程度", "生长速度"],
    passScore: 65
  },
  {
    id: 2,
    title: "关卡二：晴天霹雳",
    task:
      "请根据二次入院资料完成重评：1) 重新判断良恶性；2) 对比两次入院差异；3) 补充《良恶性肿瘤鉴别表》中的转移、复发、术后生存栏目。",
    keyPoints: ["重新诊断", "两次差异对比", "转移", "复发", "术后生存"],
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
    title: "第四幕 设身处地",
    task:
      "请围绕“第一次出院时，应如何与患者沟通？”完成情景对话：1) 回应家属焦虑与费用顾虑；2) 完成知情同意式解释；3) 给出可执行的随访医嘱。",
    keyPoints: ["人文关怀", "知情同意", "随访医嘱", "费用顾虑回应"],
    passScore: 75
  }
];

const DIMENSION_LABELS = {
  diagnosticReasoning: "诊断推理",
  evidenceIntegration: "证据整合",
  clinicalDecision: "临床决策",
  communication: "沟通能力",
  empathy: "人文关怀"
};

const DIMENSION_KEYWORDS = {
  diagnosticReasoning: ["良恶性", "恶性", "复发", "转移", "风险", "诊断", "恶变"],
  evidenceIntegration: ["病理", "活检", "证据", "临床", "切缘", "淋巴结", "标本"],
  clinicalDecision: ["手术", "切除", "清扫", "随访", "复诊", "评估", "处理"],
  communication: ["解释", "告知", "沟通", "理解", "复查", "随访", "知情"],
  empathy: ["理解", "担心", "放心", "焦虑", "家属", "费用", "压力", "一起"]
};

const STAGE_DIMENSION_WEIGHTS = {
  1: { diagnosticReasoning: 0.45, evidenceIntegration: 0.3, clinicalDecision: 0.15, communication: 0.05, empathy: 0.05 },
  2: { diagnosticReasoning: 0.3, evidenceIntegration: 0.25, clinicalDecision: 0.25, communication: 0.1, empathy: 0.1 },
  3: { diagnosticReasoning: 0.15, evidenceIntegration: 0.25, clinicalDecision: 0.3, communication: 0.15, empathy: 0.15 },
  4: { diagnosticReasoning: 0.05, evidenceIntegration: 0.1, clinicalDecision: 0.2, communication: 0.3, empathy: 0.35 }
};

const STAGE_CAPABILITY_BUCKETS = {
  1: { knowledge: 0.55, ability: 0.3, literacy: 0.15 },
  2: { knowledge: 0.35, ability: 0.45, literacy: 0.2 },
  3: { knowledge: 0.2, ability: 0.45, literacy: 0.35 },
  4: { knowledge: 0.1, ability: 0.35, literacy: 0.55 }
};

const STAGE_EVIDENCE = {
  1: {
    narrative:
      "",
    caseText: [
      "患者，男性，60 岁。因“发现右颊部肿物半年余”入院。",
      "半年余前因口腔扁平苔藓于我院门诊就诊，发现右颊部一“黄豆”大小肿物，无疼痛、出血等不适。一直行药物治疗，疗效不佳，且半年来肿物逐渐增大，现增大至“山核桃”大小。门诊行局部肿物切取活检，病理示“右颊部鳞状上皮乳头状瘤样增生”。",
      "体检：左右脸面部基本对称，双侧颞下颌关节区无红肿触痛，关节活动自如，右颊粘膜可及大小约 3cm 肿块，质中，界尚清，肿块表面多呈乳头状突起，粗糙，活检创口愈合好，右颊部肿胀明显，触痛（+）。左颊部、腭部、舌体及口底粘膜无异常，舌体活动好，双侧颈部及下颌区未及明显肿大淋巴结。",
      "入院后完善常规检查，于 2019 年 5 月 8 日行“右颊部病损切除术+颌面部局部皮瓣转移修复术”。",
      "因术前已行局部肿物切取活检，故完整切除标本未行病理检查。活检病理切片如图。"
    ],
    images: [
      { src: "Picture.png", caption: "局部肿物病理切片 HE 10X" },
      { src: "Picture2.png", caption: "局部肿物病理切片 HE 20X" }
    ],
    clues: [
      "学生任务：判断该患者此时是良性还是恶性肿瘤。",
      "任务点：填写《良恶性肿瘤鉴别表》前两行（分化程度、生长速度）。",
      "先完成投票与鉴别表，再在下方输入框写出判断依据。"
    ]
  },
  2: {
    narrative:
      "复诊阶段",
    caseText: [
      "患者，男性，61 岁。因“右颊部肿物切除术后半年余”入院。",
      "半年余前因右颊部肿物在外院行“右颊部病损切除术+颌面部局部皮瓣转移修复术”。术后发现原手术区又有肿物长出，并逐渐增大。",
      "体检：右前颊粘膜肿胀，可见大小约 3×2cm 隆起，表面有破溃，质较硬，活动度尚可。左颊部、腭部、舌体及口底粘膜无异常，舌体活动好，双侧颈部及下颌区未及明显肿大淋巴结。",
      "入院后完善常规检查，于 2020 年 1 月 6 日行“口咽部、颊部肿物局部扩大切除术+下颌骨部分切除术+颈淋巴结清扫术+复合组织游离移植术”。",
      "术中见：右颊部贯穿性肿瘤伴感染坏死，范围约 6×4cm，质地偏硬，累及口咽侧壁、臼后三角、右下后牙龈，前缘靠近右侧口角。右上颈部数枚淋巴结较饱满。"
    ],
    images: [
      { src: "figure1.png", caption: "肿瘤病理切片 HE 10X" },
      { src: "figure2.png", caption: "肿瘤病理切片 HE 20X" },
      { src: "figure3.png", caption: "肿瘤病理切片 HE 40X" },
      { src: "figure4.png", caption: "右上淋巴结病理切片 HE 20X" }
    ],
    clues: [
      "学生任务：重新评估诊断，并对比两次入院资料差异。",
      "补充鉴别表栏目：转移、复发、术后生存。",
      "请先完成任务组件，再提交文字说明。"
    ]
  },
  3: {
    narrative:
      "复盘阶段：二次病理与转移证据已经出现，请按诊断偏差、标本漏洞、手术范围三环节复盘。",
    caseText: [
      "首次诊断偏差根源分析：",
      "1. 诊断偏差点：首次活检显示为'乳头状增生'，被误读为低危病变，实则为分化良好的鳞状细胞癌的分化瘤样表现。",
      "2. 标本处理漏洞：首次手术未送完整病理，仅留活检创面无法深入评估底层组织，遗漏恶性信号。",
      "3. 临床决策缺陷：过度依赖单次活检结果，未考虑临床表现（半年快速生长）与病理的矛盾。",
      "4. 手术范围不足：首次手术范围限制、未行淋巴结清扫，致使潜在微转移未被清除。"
    ],
    images: [
      { src: "figure1.png", caption: "术后肿瘤病理切片 HE 10X" },
      { src: "figure2.png", caption: "术后肿瘤病理切片 HE 20X" },
      { src: "figure4.png", caption: "右上淋巴结转移证据 HE 20X" }
    ],
    clues: [
      "二次手术病理结果：鳞状细胞癌，分化程度改变",
      "淋巴结转移证据：右上颈部淋巴结已转移",
      "临床沟通要点：患者与家属的知情同意与心理干预"
    ]
  },
  4: {
    narrative:
      "沟通阶段：学生扮演出院医生，AI 扮演焦虑的患者家属，重点考查人文关怀、知情同意和随访交代。",
    caseText: [
      "情景：患者首次手术后准备出院，家属对病情是否严重、会不会复发以及复查费用十分焦虑。",
      "家属担忧：一是害怕花了钱却仍然复发；二是听不懂病理和风险解释；三是不清楚出院后该怎么复查、什么时候必须返院。",
      "学生任务：请以医生身份完成一次出院沟通，既要安抚情绪，又要讲清不确定性、复查必要性和具体随访安排。"
    ],
    images: [],
    clues: [
      "家属角色设定：担心复发，又怕花钱",
      "必答要点：人文关怀、知情同意、随访医嘱、费用顾虑回应",
      "建议结构：先共情，再解释，再交代复查与警示症状"
    ]
  }
};

const state = {
  knowledgeText: "",
  currentStageIndex: 0,
  stageResults: {},
  knowledgeLoaded: false,
  records: [],
  report: null
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
const stageTaskPanel = document.getElementById("stageTaskPanel");
const stageChecklist = document.getElementById("stageChecklist");
const imageLightbox = document.getElementById("imageLightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");
const reportPanel = document.getElementById("reportPanel");
const reportSummary = document.getElementById("reportSummary");
const stageScoreChart = document.getElementById("stageScoreChart");
const dimensionChart = document.getElementById("dimensionChart");
const capabilityChart = document.getElementById("capabilityChart");
const reportNarrative = document.getElementById("reportNarrative");

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
    stageTaskPanel.innerHTML = "";
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

  renderStageTaskPanel(stage);

  stageChecklist.innerHTML = "";
  (evidence.clues || []).forEach((clue) => {
    const li = document.createElement("li");
    li.textContent = clue;
    stageChecklist.appendChild(li);
  });
}

function renderStageTaskPanel(stage) {
  stageTaskPanel.innerHTML = "";
  if (stage.id !== 1 && stage.id !== 2 && stage.id !== 3 && stage.id !== 4) {
    return;
  }

  if (stage.id === 1) {
    stageTaskPanel.innerHTML = `
      <p class="task-title">第一幕任务组件</p>
      <div class="vote-row">
        <span>学生投票：</span>
        <label><input type="radio" name="tumorVote" value="良性" /> 良性</label>
        <label><input type="radio" name="tumorVote" value="恶性" /> 恶性</label>
      </div>
      <table class="task-table">
        <thead>
          <tr>
            <th>鉴别维度</th>
            <th>你的填写</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>分化程度</td>
            <td><textarea id="diffDegree" placeholder="例如：目前活检显示增生，分化看似较好，但不能排除局灶恶变"></textarea></td>
          </tr>
          <tr>
            <td>生长速度</td>
            <td><textarea id="growthSpeed" placeholder="例如：半年内黄豆到山核桃，生长偏快，应提高恶性警惕"></textarea></td>
          </tr>
        </tbody>
      </table>
    `;
    return;
  }

  if (stage.id === 3) {
    stageTaskPanel.innerHTML = `
      <p class="task-title">第三幕 PBL 讨论组件</p>
      <div class="pbl-main-question">
        <strong>🎯 核心问题：作为医生，你吸取了什么教训？</strong>
      </div>
      <div class="pbl-scaffolding">
        <p class="pbl-label">💡 AI助教提供的脚手架问题（供讨论参考）：</p>
        <div class="scaffold-list">
          <label class="scaffold-item">
            <input type="checkbox" name="scaffold" value="q1" />
            <span>Q1: 第一次手术是否切缘不足？</span>
          </label>
          <label class="scaffold-item">
            <input type="checkbox" name="scaffold" value="q2" />
            <span>Q2: 扁平苔藓与癌变的关系如何评估？</span>
          </label>
          <label class="scaffold-item">
            <input type="checkbox" name="scaffold" value="q3" />
            <span>Q3: 为什么没做完整病理标本检查？</span>
          </label>
        </div>
      </div>
      <div class="pbl-response">
        <label for="pblAnswer"><strong>请综合回答上述脚手架问题，提出你的复盘要点与改进方案：</strong></label>
        <textarea id="pblAnswer" placeholder="例如：（1）第一次活检虽显示低危特征，但应结合临床表现重新评估…（2）扁平苔藓是癌前病变，此患者活检已提示增生，应提高警惕…（3）首次手术缺少完整标本病理…（4）改进方案：建立诊疗规范、完整的标本处理流程、多学科协作机制…" style="min-height: 150px;"></textarea>
      </div>
    `;
    return;
  }

  if (stage.id === 4) {
    stageTaskPanel.innerHTML = `
      <p class="task-title">第四幕 AI 情景对话组件</p>
      <div class="dialogue-card family">
        <p class="dialogue-role">AI家属</p>
        <p>医生，手术不是已经做完了吗？为什么还要反复复查？我们家里现在经济压力也很大，我最担心的是以后还会不会复发。您能不能直接告诉我，这个病到底严不严重，后面还要花多少钱？</p>
      </div>
      <div class="dialogue-card followup">
        <p class="dialogue-role">追问提示</p>
        <p>如果你准备在回答中一并覆盖，可以顺带说明：回家后该观察什么症状？如果不按时复查会有什么风险？</p>
      </div>
      <div class="pbl-response">
        <label for="dischargeCommunication"><strong>请以医生身份作答：</strong></label>
        <textarea id="dischargeCommunication" placeholder="建议结构：先共情安抚，再解释当前情况与不确定性，然后明确复查时间、警示症状和费用沟通原则。" style="min-height: 180px;"></textarea>
      </div>
      <div class="care-checklist">
        <p class="pbl-label">建议覆盖的沟通动作：</p>
        <label class="scaffold-item"><input type="checkbox" name="careAction" value="emotion" /> <span>先回应焦虑情绪</span></label>
        <label class="scaffold-item"><input type="checkbox" name="careAction" value="consent" /> <span>讲清知情同意与不确定性</span></label>
        <label class="scaffold-item"><input type="checkbox" name="careAction" value="followup" /> <span>明确复查时间与警示症状</span></label>
        <label class="scaffold-item"><input type="checkbox" name="careAction" value="cost" /> <span>回应费用顾虑但不牺牲必要随访</span></label>
      </div>
    `;
    return;
  }

  stageTaskPanel.innerHTML = `
    <p class="task-title">第二幕任务组件</p>
    <div class="vote-row">
      <span>重评结论：</span>
      <label><input type="radio" name="reEvalVote" value="偏良性" /> 偏良性</label>
      <label><input type="radio" name="reEvalVote" value="偏恶性" /> 偏恶性</label>
    </div>
    <table class="task-table">
      <thead>
        <tr>
          <th>项目</th>
          <th>你的填写</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>两次入院差异</td>
          <td><textarea id="admissionDiff" placeholder="对比首次与二次入院：病灶表现、体征变化、手术范围变化"></textarea></td>
        </tr>
        <tr>
          <td>转移</td>
          <td><textarea id="metastasisField" placeholder="填写转移证据判断与依据"></textarea></td>
        </tr>
        <tr>
          <td>复发</td>
          <td><textarea id="recurrenceField" placeholder="填写复发表现与时间线"></textarea></td>
        </tr>
        <tr>
          <td>术后生存</td>
          <td><textarea id="survivalField" placeholder="填写对术后生存风险与预后的评估"></textarea></td>
        </tr>
      </tbody>
    </table>
  `;
}

function collectStageStructuredInput(stage) {
  if (stage.id !== 1 && stage.id !== 2 && stage.id !== 3 && stage.id !== 4) {
    return "";
  }

  if (stage.id === 4) {
    const dischargeCommunication = document.getElementById("dischargeCommunication")?.value.trim() || "";
    const careActions = Array.from(document.querySelectorAll('input[name="careAction"]:checked')).map((element) => element.value);

    if (!dischargeCommunication) {
      throw new Error("第四幕请先完成出院沟通回答。\n需要填写：对焦虑家属的完整沟通回应。");
    }

    const careActionLabels = {
      emotion: "先回应焦虑情绪",
      consent: "讲清知情同意与不确定性",
      followup: "明确复查时间与警示症状",
      cost: "回应费用顾虑"
    };

    return [
      "【AI家属情景】患者家属担心复发又怕花钱，要求医生解释病情与后续安排。",
      `【学生沟通回应】${dischargeCommunication}`,
      `【已覆盖沟通动作】${careActions.length > 0 ? careActions.map((item) => careActionLabels[item] || item).join("、") : "未勾选，按正文评估"}`
    ].join("\n");
  }

  if (stage.id === 3) {
    const pblAnswer = document.getElementById("pblAnswer")?.value.trim() || "";
    const scaffolds = Array.from(document.querySelectorAll('input[name="scaffold"]:checked')).map(e => e.value);
    
    if (!pblAnswer) {
      throw new Error("第三幕请先完成 PBL 讨论回答。\n需要填写：综合回答核心问题和脚手架问题。");
    }

    const scaffoldSummary = scaffolds.length > 0 
      ? `已参考脚手架问题：${scaffolds.map(s => {
          const questions = { q1: "Q1-切缘不足分析", q2: "Q2-扁平苔藓关系", q3: "Q3-病理标本漏洞" };
          return questions[s] || s;
        }).join("、")}`
      : "未勾选脚手架问题，建议参考所有脚手架问题进行讨论";

    return [
      `【PBL讨论回答】`,
      pblAnswer,
      ``,
      `【参考信息】`,
      scaffoldSummary
    ].join("\n");
  }

  if (stage.id === 2) {
    const vote = document.querySelector('input[name="reEvalVote"]:checked')?.value || "";
    const admissionDiff = document.getElementById("admissionDiff")?.value.trim() || "";
    const metastasisField = document.getElementById("metastasisField")?.value.trim() || "";
    const recurrenceField = document.getElementById("recurrenceField")?.value.trim() || "";
    const survivalField = document.getElementById("survivalField")?.value.trim() || "";

    if (!vote || !admissionDiff || !metastasisField || !recurrenceField || !survivalField) {
      throw new Error("第二幕请先完成重评结论与任务表。\n需要填写：重评结论、两次入院差异、转移、复发、术后生存。")
    }

    return [
      `重评结论：${vote}`,
      `两次入院差异：${admissionDiff}`,
      `良恶性肿瘤鉴别表-转移：${metastasisField}`,
      `良恶性肿瘤鉴别表-复发：${recurrenceField}`,
      `良恶性肿瘤鉴别表-术后生存：${survivalField}`
    ].join("\n");
  }

  const vote = document.querySelector('input[name="tumorVote"]:checked')?.value || "";
  const diffDegree = document.getElementById("diffDegree")?.value.trim() || "";
  const growthSpeed = document.getElementById("growthSpeed")?.value.trim() || "";

  if (!vote || !diffDegree || !growthSpeed) {
    throw new Error("第一幕请先完成学生投票和鉴别表前两行。\n需要填写：投票、分化程度、生长速度。")
  }

  return [
    `学生投票：${vote}`,
    `良恶性肿瘤鉴别表-分化程度：${diffDegree}`,
    `良恶性肿瘤鉴别表-生长速度：${growthSpeed}`
  ].join("\n");
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
    state.report = null;
    renderStageTimeline();
    renderReportDashboard();
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
      "先给出良恶性倾向判断",
      "在鉴别表中填写分化程度对比",
      "在鉴别表中填写生长速度对比",
      "说明为何“界清+乳头状+增生活检”可能误导"
    ],
    2: [
      "给出二次重评后的诊断倾向",
      "明确两次入院差异（病灶、体征、手术范围）",
      "补全转移、复发、术后生存三个栏目",
      "解释首次活检与二次病理结果为何会不一致"
    ],
    3: [
      "识别首次诊断偏差点（良恶性误判、活检危险）",
      "分析标本处理漏洞（未进行完整病理检查）",
      "阐述手术范围不足与淋巴结转移风险",
      "提出改进方案（多学科协作、诊疗规范、医患沟通）"
    ],
    4: [
      "先回应家属焦虑并体现人文关怀",
      "完成知情同意式解释，讲清当前不确定性",
      "给出明确的随访医嘱与警示症状",
      "回应费用顾虑但不弱化必要复查"
    ]
  };

  const contextBlock = state.knowledgeText
    ? `【案例资料】\n${state.knowledgeText}`
    : "【案例资料】尚未加载。请提醒用户先加载资料。";

  let systemPrompt = "你是医学教育评估官。请按任务引擎锁步规则评估学生作答。\n" +
        "只输出严格 JSON，不要输出额外文本。\n" +
        "JSON schema: {\"pass\":boolean,\"score\":0-100整数,\"missing\":[string],\"feedback\":string,\"next_hint\":string,\"teaching_note\":string}\n" +
        "评分必须严格，不满足必答要点不得通过。\n" +
        "必须在 teaching_note 中提醒：仅教学用途，不构成医疗建议。";

  // Stage 3特殊提示：支持PBL讨论与脚手架问题
  if (stage.id === 3) {
    systemPrompt += "\n\n【第三幕PBL讨论评估规则】\n" +
      "这是一个分组讨论（PBL）模式，学生应基于以下脚手架问题展开讨论：\n" +
      "- Q1: 第一次手术是否切缘不足？（关键词：切缘、边界、病理边界）\n" +
      "- Q2: 扁平苔藓与癌变的关系？（关键词：癌前病变、分化、恶变机制）\n" +
      "- Q3: 为什么没做完整病理标本检查？（关键词：标本处理、病理漏洞、风险）\n" +
      "评估学生是否能够：(1)系统复盘诊疗偏差；(2)识别关键环节漏洞；(3)提出可行改进方案。";
  }

  if (stage.id === 4) {
    systemPrompt += "\n\n【第四幕沟通评估规则】\n" +
      "这是出院沟通情景。学生扮演医生，面对担心复发又怕花钱的患者家属。\n" +
      "重点检查：\n" +
      "- 是否先回应情绪并体现共情\n" +
      "- 是否完成知情同意式解释，避免生硬或恐吓\n" +
      "- 是否明确复查时间、警示症状和返院条件\n" +
      "- 是否正面回应费用顾虑，但不牺牲必要的随访建议\n" +
      "如果学生只讲医学结论、不回应情绪或费用压力，不得高分通过。";
  }

  return [
    {
      role: "system",
      content: systemPrompt
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

function computeKeywordCoverage(text, keywords) {
  const normalized = String(text || "");
  const hits = keywords.filter((keyword) => normalized.includes(keyword)).length;
  return keywords.length === 0 ? 0 : Math.round((hits / keywords.length) * 100);
}

function deriveDimensionScores(stage, userText, stageScore) {
  const weights = STAGE_DIMENSION_WEIGHTS[stage.id] || STAGE_DIMENSION_WEIGHTS[1];
  const dimensionScores = {};

  Object.keys(DIMENSION_LABELS).forEach((dimensionKey) => {
    const keywordScore = computeKeywordCoverage(userText, DIMENSION_KEYWORDS[dimensionKey]);
    const emphasisBoost = Math.round((weights[dimensionKey] || 0) * 15);
    dimensionScores[dimensionKey] = Math.max(
      35,
      Math.min(100, Math.round(stageScore * 0.65 + keywordScore * 0.35 + emphasisBoost))
    );
  });

  return dimensionScores;
}

function aggregateDimensionScores(records) {
  const totals = {};
  const counts = {};

  Object.keys(DIMENSION_LABELS).forEach((dimensionKey) => {
    totals[dimensionKey] = 0;
    counts[dimensionKey] = 0;
  });

  records.forEach((record) => {
    Object.keys(DIMENSION_LABELS).forEach((dimensionKey) => {
      const value = record.dimensions?.[dimensionKey];
      if (typeof value === "number") {
        totals[dimensionKey] += value;
        counts[dimensionKey] += 1;
      }
    });
  });

  Object.keys(DIMENSION_LABELS).forEach((dimensionKey) => {
    totals[dimensionKey] = counts[dimensionKey] === 0 ? 0 : Math.round(totals[dimensionKey] / counts[dimensionKey]);
  });

  return totals;
}

function aggregateCapabilityScores(records) {
  const totals = { knowledge: 0, ability: 0, literacy: 0 };
  let count = 0;

  records.forEach((record) => {
    const bucket = STAGE_CAPABILITY_BUCKETS[record.stageId] || STAGE_CAPABILITY_BUCKETS[1];
    totals.knowledge += record.score * bucket.knowledge;
    totals.ability += record.score * bucket.ability;
    totals.literacy += record.score * bucket.literacy;
    count += 1;
  });

  if (count === 0) {
    return totals;
  }

  return {
    knowledge: Math.round(totals.knowledge / count),
    ability: Math.round(totals.ability / count),
    literacy: Math.round(totals.literacy / count)
  };
}

function buildNarrativeDiagnosis(records, dimensions) {
  if (records.length === 0) {
    return "尚无训练记录。";
  }

  const strongest = Object.entries(dimensions).sort((a, b) => b[1] - a[1])[0];
  const weakest = Object.entries(dimensions).sort((a, b) => a[1] - b[1])[0];
  const passedCount = records.filter((record) => record.pass).length;

  return [
    `已完成 ${passedCount} / ${STAGES.length} 幕，当前最强维度为“${DIMENSION_LABELS[strongest[0]]}”，最需补强的是“${DIMENSION_LABELS[weakest[0]]}”。`,
    `从过程看，学生已能从诊断判断逐步过渡到复盘与沟通，但围绕“${DIMENSION_LABELS[weakest[0]]}”仍需给出更具体、可执行的表达。`,
    "本报告仅用于教学反馈，不构成真实医疗建议或执业评价。"
  ].join("\n");
}

function buildReportState() {
  if (state.records.length === 0) {
    return null;
  }

  const averageScore = Math.round(state.records.reduce((sum, record) => sum + record.score, 0) / state.records.length);
  const passedCount = state.records.filter((record) => record.pass).length;
  const dimensions = aggregateDimensionScores(state.records);
  const capabilities = aggregateCapabilityScores(state.records);

  return {
    averageScore,
    passedCount,
    dimensions,
    capabilities,
    narrative: buildNarrativeDiagnosis(state.records, dimensions)
  };
}

function renderMetricBars(container, items) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "metric-row";

    const label = document.createElement("span");
    label.className = "metric-label";
    label.textContent = item.label;

    const bar = document.createElement("div");
    bar.className = "metric-bar";

    const fill = document.createElement("div");
    fill.className = "metric-fill";
    fill.style.width = `${Math.max(4, item.value)}%`;

    const value = document.createElement("span");
    value.className = "metric-value";
    value.textContent = `${item.value}`;

    bar.appendChild(fill);
    row.appendChild(label);
    row.appendChild(bar);
    row.appendChild(value);
    container.appendChild(row);
  });
}

function renderReportDashboard() {
  state.report = buildReportState();
  if (!reportPanel) {
    return;
  }

  if (!state.report) {
    reportPanel.hidden = true;
    return;
  }

  reportPanel.hidden = false;

  if (reportSummary) {
    reportSummary.innerHTML = `
      <article class="report-card"><strong>${state.report.averageScore}</strong><span>平均得分</span></article>
      <article class="report-card"><strong>${state.report.passedCount}/${STAGES.length}</strong><span>已通过幕次</span></article>
      <article class="report-card"><strong>${state.report.dimensions.empathy}</strong><span>人文关怀</span></article>
      <article class="report-card"><strong>${state.report.capabilities.literacy}</strong><span>素养维度</span></article>
    `;
  }

  renderMetricBars(stageScoreChart, state.records.map((record) => ({ label: record.stageTitle, value: record.score })));
  renderMetricBars(dimensionChart, Object.entries(DIMENSION_LABELS).map(([key, label]) => ({ label, value: state.report.dimensions[key] || 0 })));
  renderMetricBars(capabilityChart, [
    { label: "知识", value: state.report.capabilities.knowledge },
    { label: "能力", value: state.report.capabilities.ability },
    { label: "素养", value: state.report.capabilities.literacy }
  ]);

  if (reportNarrative) {
    reportNarrative.textContent = state.report.narrative;
  }
}

function buildMarkdownReport() {
  const report = buildReportState();
  if (!report) {
    return "# 临床思辨与沟通能力诊断报告\n\n尚无训练记录。";
  }

  return [
    "# 临床思辨与沟通能力诊断报告",
    "",
    `- 平均得分：${report.averageScore}`,
    `- 已通过幕次：${report.passedCount}/${STAGES.length}`,
    `- 诊断推理：${report.dimensions.diagnosticReasoning}`,
    `- 证据整合：${report.dimensions.evidenceIntegration}`,
    `- 临床决策：${report.dimensions.clinicalDecision}`,
    `- 沟通能力：${report.dimensions.communication}`,
    `- 人文关怀：${report.dimensions.empathy}`,
    "",
    "## 分幕记录",
    ...state.records.flatMap((record) => [
      `### ${record.stageTitle}`,
      `- 得分：${record.score}`,
      `- 判定：${record.pass ? "通过" : "未通过"}`,
      `- 缺失点：${(record.missing || []).join("、") || "无"}`,
      `- 反馈：${record.feedback || "无"}`,
      `- 维度：${Object.entries(record.dimensions || {}).map(([key, value]) => `${DIMENSION_LABELS[key]} ${value}`).join("；")}`,
      ""
    ]),
    "## 综合诊断",
    report.narrative,
    "",
    "仅教学用途，不构成医疗建议。"
  ].join("\n");
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

  const dimensions = deriveDimensionScores(stage, userText, result.score);

  state.records.push({
    stageId: stage.id,
    stageTitle: stage.title,
    submittedAt: new Date().toISOString(),
    answer: userText,
    score: result.score,
    pass: result.pass,
    missing: result.missing,
    feedback: result.feedback,
    source,
    dimensions
  });

  renderReportDashboard();

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
    `四幕全部完成。\n\n闭环总结：病例呈现 -> 初诊判断 -> 病情反转 -> 误诊暴露 -> 病理实锤 -> 复盘反思 -> 沟通与共情。\n\n综合诊断：\n${state.report ? state.report.narrative : "报告已生成。"}`
  );
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = userInput.value.trim();
  const stage = currentStage();
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

  let finalInput = input;
  try {
    if (stage) {
      const structured = collectStageStructuredInput(stage);
      if (structured) {
        finalInput = `${structured}\n\n学生补充说明：${input}`;
      }
    }
  } catch (err) {
    appendMessage("assistant", String(err.message || err));
    return;
  }

  appendMessage("user", finalInput);
  userInput.value = "";
  sendBtn.disabled = true;

  try {
    await evaluateCurrentStage(finalInput);
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
  state.report = null;
  knowledgeStatus.textContent = "流程已重置，请重新加载资料。";
  renderStageTimeline();
  renderReportDashboard();
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
  const mdName = `training-report-${stamp}.md`;

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
    "dimensions",
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
    Object.entries(r.dimensions || {}).map(([key, value]) => `${DIMENSION_LABELS[key]}:${value}`).join("|") || "",
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
  downloadBlob(buildMarkdownReport(), mdName, "text/markdown;charset=utf-8");
  appendMessage("assistant", "训练记录已导出为 JSON、CSV 与 Markdown 诊断报告。\n\n说明：仅教学用途，不构成医疗建议。");
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
