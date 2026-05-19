"""专项提升模块：返回用户的专项训练进度和内容"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..auth import get_current_user
from ..database import get_db
from ..ai_service import AIUnavailableError, get_client, require_ai
from ..config import settings
from ..stats_service import aggregate_radar_and_scores, record_study_session
import json

router = APIRouter(prefix="/api/improve", tags=["专项提升"])


@router.get("/modules")
def get_modules(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """返回专项模块列表，进度基于用户真实能力数据"""
    radar, _, _, _, _ = aggregate_radar_and_scores(db, current_user.id)

    modules = [
        {
            "id": "pronunciation",
            "icon": "volume",
            "title": "发音专项",
            "desc": "音标·连读·语调·口型",
            "color": "#e8f5e9",
            "iconColor": "#2e7d32",
            "progress": radar.pronunciation,
        },
        {
            "id": "grammar",
            "icon": "book-open",
            "title": "语法专项",
            "desc": "时态·从句·虚拟语气",
            "color": "#e3f2fd",
            "iconColor": "#1565c0",
            "progress": radar.grammar,
        },
        {
            "id": "vocabulary",
            "icon": "book",
            "title": "词汇专项",
            "desc": "学术词汇·搭配·替换",
            "color": "#f3e5f5",
            "iconColor": "#7b1fa2",
            "progress": radar.vocabulary,
        },
        {
            "id": "logic",
            "icon": "lightbulb",
            "title": "逻辑专项",
            "desc": "论点·论据·段落结构",
            "color": "#fff3e0",
            "iconColor": "#e65100",
            "progress": radar.logic,
        },
    ]
    return modules


@router.get("/exercise/{module_id}")
async def get_exercise(
    module_id: str,
    current_user: models.User = Depends(get_current_user),
):
    """从本地题库随机抽取练习题目，发音专项附带标准发音音频"""
    import base64
    import random
    from ..tts_service import text_to_speech

    # 本地题库（每个模块 10+ 道题，随机抽取）
    question_bank = {
        "pronunciation": [
            {"q": "跟读练习 · 连读", "content": "I'd like a cup of coffee and a piece of cake, please.", "hint": "注意 cup of 和 piece of 的连读"},
            {"q": "跟读练习 · 重音", "content": "The photographer took a photograph of the photography exhibition.", "hint": "注意 photograph 系列词的重音变化"},
            {"q": "跟读练习 · 语调", "content": "You're coming to the party tonight, aren't you?", "hint": "反义疑问句用升调表示不确定"},
            {"q": "跟读练习 · 弱读", "content": "I can see that he was going to the store for some bread and butter.", "hint": "注意 can, that, to, for, and 的弱读"},
            {"q": "跟读练习 · 爆破", "content": "The black cat sat on the red mat and looked at the big dog.", "hint": "注意相邻辅音的失去爆破现象"},
            {"q": "跟读练习 · 节奏", "content": "Despite the heavy rain, she decided to walk to the station instead of taking a taxi.", "hint": "注意英语的重音等时节奏"},
            {"q": "跟读练习 · 元音", "content": "The sheep on the ship were cheap but not asleep.", "hint": "区分长元音 /iː/ 和短元音 /ɪ/"},
            {"q": "跟读练习 · 辅音", "content": "She sells seashells by the seashore, and the shells she sells are seashells.", "hint": "注意 /ʃ/ 和 /s/ 的区别"},
            {"q": "跟读练习 · 连贯", "content": "What would you like to do this afternoon? I'd love to go for a walk in the park.", "hint": "注意 would you, like to, love to 的连读"},
            {"q": "跟读练习 · 语气", "content": "I absolutely cannot believe that he actually said that to her!", "hint": "注意强调词 absolutely, actually 的重读"},
        ],
        "grammar": [
            {"q": "时态填空", "content": "By the time she _____ (arrive), he had already left the building.", "hint": "过去完成时搭配一般过去时"},
            {"q": "语法改错", "content": "找出错误并改正：Everyone of the students have finished their homework on time.", "hint": "主谓一致问题"},
            {"q": "虚拟语气", "content": "If I _____ (be) you, I would accept the job offer without hesitation.", "hint": "与现在事实相反的虚拟语气"},
            {"q": "从句填空", "content": "The reason _____ he was late is that his car broke down on the highway.", "hint": "定语从句关系词选择"},
            {"q": "语态转换", "content": "将主动语态改为被动语态：The company will launch a new product next month.", "hint": "注意时态保持一致"},
            {"q": "时态选择", "content": "I _____ (study) English for five years by the time I graduate next June.", "hint": "将来完成进行时"},
            {"q": "语法改错", "content": "找出错误：Despite of the bad weather, we decided to go hiking in the mountains.", "hint": "despite 的用法"},
            {"q": "连词填空", "content": "_____ hard he tried, he couldn't solve the math problem.", "hint": "让步状语从句"},
            {"q": "非谓语动词", "content": "_____ (complete) the project, she felt a great sense of relief.", "hint": "分词作状语"},
            {"q": "倒装句", "content": "Not until midnight _____ he _____ (finish) writing the report.", "hint": "否定词前置引起的倒装"},
        ],
        "vocabulary": [
            {"q": "高级替换", "content": "用更高级的词替换：The movie was very good and I really liked it.", "hint": "good → outstanding/remarkable, liked → was captivated by"},
            {"q": "词汇搭配", "content": "选择正确搭配：make/do a decision, make/do homework, make/do progress", "hint": "make 和 do 的固定搭配"},
            {"q": "同义替换", "content": "用不同的表达改写：It is important to protect the environment.", "hint": "important → crucial/vital/essential"},
            {"q": "词汇辨析", "content": "区分使用：affect vs effect, principal vs principle, complement vs compliment", "hint": "写出每个词的含义和例句"},
            {"q": "学术词汇", "content": "用学术词汇改写：The study shows that people who exercise more are healthier.", "hint": "shows → demonstrates/indicates, people → individuals"},
            {"q": "短语动词", "content": "用合适的短语动词填空：The meeting was _____ (推迟) until next week due to the storm.", "hint": "put off / postponed / called off"},
            {"q": "语境选词", "content": "选择最合适的词：The government needs to _____ (address/speak/talk) the issue of climate change.", "hint": "address 在正式语境中表示'处理'"},
            {"q": "词根推测", "content": "根据词根推测词义：benevolent, malevolent, ambivalent", "hint": "bene=好, mal=坏, ambi=两者"},
            {"q": "高级表达", "content": "改写为更正式的表达：A lot of people think that social media is bad for kids.", "hint": "A lot of → A significant number of, bad → detrimental"},
            {"q": "近义词辨析", "content": "区分：journey, trip, travel, voyage 各自的使用场景", "hint": "从距离、目的、正式程度等角度区分"},
        ],
        "logic": [
            {"q": "论据补充", "content": "为以下观点写一个支持论据：Remote work increases employee productivity.", "hint": "从减少通勤、灵活时间、减少干扰等角度"},
            {"q": "反驳练习", "content": "写一个反驳论点：Social media brings people closer together.", "hint": "从表面联系vs深度关系、网络霸凌、信息茧房等角度"},
            {"q": "因果关系", "content": "补充因果链：Global warming → _____ → _____ → food shortage", "hint": "考虑冰川融化、海平面上升、极端天气等中间环节"},
            {"q": "段落组织", "content": "将以下句子排列成逻辑通顺的段落：A)However, there are also drawbacks. B)In conclusion, the benefits outweigh the risks. C)Technology has transformed education. D)For example, online courses provide flexibility.", "hint": "总-分-转-结的结构"},
            {"q": "论点提炼", "content": "从以下现象中提炼一个论点：越来越多年轻人选择自由职业而非传统工作。", "hint": "从价值观变化、技术赋能、工作生活平衡等角度"},
            {"q": "逻辑漏洞", "content": "找出逻辑漏洞：Because crime rates dropped after the new law was passed, the law must be the cause of the decrease.", "hint": "相关性≠因果性"},
            {"q": "对比论证", "content": "写一段对比论证：传统教育 vs 在线教育的优劣", "hint": "从互动性、灵活性、成本、学习效果等维度对比"},
            {"q": "举例论证", "content": "为以下观点举一个具体例子：Reading books improves critical thinking skills.", "hint": "用具体的书名或阅读经历作为例证"},
            {"q": "让步反驳", "content": "用让步反驳结构回应：Some argue that AI will replace all human jobs.", "hint": "先承认部分合理性，再指出局限性"},
            {"q": "结论总结", "content": "为以下讨论写一个总结段：讨论了城市化的利弊，包括经济发展、环境问题、生活质量等方面。", "hint": "总结要点+给出立场+展望未来"},
        ],
    }

    bank = question_bank.get(module_id, question_bank["grammar"])
    exercise = random.choice(bank)

    # 发音专项：生成标准发音音频
    if module_id == "pronunciation":
        try:
            audio_bytes = await text_to_speech(exercise["content"], "ielts")
            exercise["audio_base64"] = base64.b64encode(audio_bytes).decode("utf-8")
        except Exception:
            exercise["audio_base64"] = ""

    return exercise


@router.get("/pronunciation")
def get_pronunciation_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """返回发音练习子项，进度基于用户真实数据"""
    radar, _, _, _, _ = aggregate_radar_and_scores(db, current_user.id)
    base_pct = radar.pronunciation  # 0-100

    items = [
        {"icon": "type", "title": "音标入门", "desc": "48个国际音标系统学习", "tag": "基础", "progress": min(100, base_pct + 20)},
        {"icon": "link", "title": "连读技巧", "desc": "自然语流中的连读规则", "tag": "进阶", "progress": min(100, max(0, base_pct - 10))},
        {"icon": "music", "title": "语调训练", "desc": "升调降调与情感表达", "tag": "进阶", "progress": min(100, max(0, base_pct - 20))},
        {"icon": "smile", "title": "口型纠正", "desc": "难发音位置精准训练", "tag": "专项", "progress": min(100, max(0, base_pct - 30))},
    ]
    return items


@router.get("/courses")
def get_courses():
    """返回精品课程列表"""
    return [
        {"icon": "target", "title": "雅思口语\n7分冲刺", "color": "#e8f5e9", "tag": "VIP"},
        {"icon": "edit", "title": "高考作文\n满分技巧", "color": "#fff3e0", "tag": "VIP"},
        {"icon": "volume-2", "title": "美式发音\n精讲课", "color": "#e3f2fd", "tag": "免费"},
        {"icon": "book", "title": "语法零基础\n入门", "color": "#f3e5f5", "tag": "免费"},
    ]


@router.get("/daily")
async def get_daily_exercise(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """从本地题库随机抽取每日一练题目，基于用户弱项"""
    import random
    radar, _, _, _, _ = aggregate_radar_and_scores(db, current_user.id)

    dims = [
        ("vocabulary", radar.vocabulary, "词汇替换"),
        ("grammar", radar.grammar, "语法纠错"),
        ("logic", radar.logic, "逻辑论证"),
    ]
    dims.sort(key=lambda x: x[1])
    weakest = dims[0]

    daily_bank = {
        "vocabulary": [
            {"type": "词汇升级", "question": "Rewrite using advanced vocabulary: The food was very delicious and we had a great time.", "hints": [{"from": "very delicious", "to": "exquisite / delectable"}, {"from": "great time", "to": "wonderful / memorable experience"}]},
            {"type": "词汇替换", "question": "Replace informal words: I think this idea is really cool and we should totally do it.", "hints": [{"from": "really cool", "to": "innovative / compelling"}, {"from": "totally", "to": "certainly / undoubtedly"}]},
            {"type": "搭配练习", "question": "Fill in collocations: _____ a mistake, _____ an effort, _____ progress, _____ a decision", "hints": [{"from": "make", "to": "make a mistake, make an effort, make progress, make a decision"}]},
            {"type": "同义改写", "question": "Paraphrase: Many people believe that technology has a negative impact on children's development.", "hints": [{"from": "Many people", "to": "A considerable number of individuals"}, {"from": "negative impact", "to": "adverse/detrimental effect"}]},
            {"type": "词汇辨析", "question": "Choose the correct word: The new policy will (affect/effect) millions of people across the country.", "hints": [{"from": "affect", "to": "动词，表示'影响'"}, {"from": "effect", "to": "名词，表示'效果'"}]},
        ],
        "grammar": [
            {"type": "语法纠错", "question": "Find and correct errors: She don't know what happened yesterday, and neither do her friends.", "hints": [{"from": "don't", "to": "doesn't"}, {"from": "do her", "to": "did her"}]},
            {"type": "时态练习", "question": "Fill in the correct tense: By next year, I _____ (live) in this city for ten years.", "hints": [{"from": "答案", "to": "will have lived / will have been living"}]},
            {"type": "从句练习", "question": "Combine into one sentence: The book is on the table. I bought it yesterday.", "hints": [{"from": "定语从句", "to": "The book which/that I bought yesterday is on the table."}]},
            {"type": "语法改错", "question": "Correct: Despite of the rain, he went out without an umbrella and catched a cold.", "hints": [{"from": "Despite of", "to": "Despite (无需of)"}, {"from": "catched", "to": "caught"}]},
            {"type": "句型转换", "question": "Rewrite in passive voice: Scientists have discovered a new species in the Amazon rainforest.", "hints": [{"from": "被动语态", "to": "A new species has been discovered..."}]},
        ],
        "logic": [
            {"type": "论据补充", "question": "Write a supporting argument: Working from home is more productive than working in an office.", "hints": [{"from": "角度1", "to": "减少通勤时间"}, {"from": "角度2", "to": "更少社交干扰"}]},
            {"type": "反驳练习", "question": "Write a counter-argument: Social media makes people more connected.", "hints": [{"from": "反驳角度", "to": "表面联系vs深度关系、网络霸凌"}]},
            {"type": "因果分析", "question": "Explain the cause-effect chain: Why does deforestation lead to climate change?", "hints": [{"from": "步骤", "to": "树木减少→CO2吸收减少→温室效应加剧"}]},
            {"type": "观点表达", "question": "Express your opinion with reasons: Should university education be free for everyone?", "hints": [{"from": "支持", "to": "教育公平、减轻负担"}, {"from": "反对", "to": "财政压力、质量下降"}]},
            {"type": "总结概括", "question": "Summarize in 2-3 sentences: The article discusses how AI is changing healthcare through early diagnosis, personalized treatment, and drug discovery.", "hints": [{"from": "关键词", "to": "AI, healthcare, transformation"}]},
        ],
    }

    bank = daily_bank.get(weakest[0], daily_bank["vocabulary"])
    exercise = random.choice(bank)

    return {
        "focus_area": weakest[0],
        "focus_label": weakest[2],
        **exercise,
    }


@router.post("/submit")
async def submit_exercise(
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """提交专项练习答案，AI 评判并返回反馈"""
    module_id = data.get("module_id", "grammar")
    answer = (data.get("answer") or "").strip()
    question = data.get("question", "")

    if not answer:
        raise HTTPException(status_code=400, detail="请输入答案")

    # 使用 AI 评判答案
    try:
        require_ai()
        resp = await get_client().chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "你是英语教练。学生回答了一道练习题，请评判答案质量。"
                        "只输出 JSON：{\"correct\": true/false, \"score\": 0-10, \"feedback\": \"中文反馈\", \"reference\": \"参考答案\"}"
                    ),
                },
                {"role": "user", "content": f"题目类型：{module_id}\n题目：{question}\n学生答案：{answer}"},
            ],
            temperature=0.3,
            max_tokens=500,
            response_format={"type": "json_object"},
        )
        result = json.loads(resp.choices[0].message.content or "{}")
    except AIUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        result = {"correct": True, "score": 7, "feedback": "答案已提交", "reference": answer}

    # 记录学习会话
    record_study_session(
        db, current_user, "improve", 2,
        float(result.get("score", 5)) / 10 * 9,
        {"module_id": module_id, "correct": result.get("correct", False)},
    )
    db.commit()

    return {
        "correct": result.get("correct", True),
        "score": result.get("score", 5),
        "feedback": result.get("feedback", ""),
        "reference": result.get("reference", ""),
    }


@router.post("/daily/submit")
async def submit_daily(
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """提交每日一练答案"""
    answer = (data.get("answer") or "").strip()
    question = data.get("question", "")
    focus_area = data.get("focus_area", "vocabulary")

    if not answer:
        raise HTTPException(status_code=400, detail="请输入答案")

    try:
        require_ai()
        resp = await get_client().chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "你是英语教练。学生完成了每日一练，请评判答案。"
                        "只输出 JSON：{\"correct\": true/false, \"score\": 0-10, \"feedback\": \"中文反馈和改进建议\", \"reference\": \"完整参考答案\"}"
                    ),
                },
                {"role": "user", "content": f"练习类型：{focus_area}\n题目：{question}\n学生答案：{answer}"},
            ],
            temperature=0.3,
            max_tokens=500,
            response_format={"type": "json_object"},
        )
        result = json.loads(resp.choices[0].message.content or "{}")
    except AIUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        result = {"correct": True, "score": 7, "feedback": "答案已提交", "reference": answer}

    # 记录学习会话
    record_study_session(
        db, current_user, "improve", 3,
        float(result.get("score", 5)) / 10 * 9,
        {"type": "daily", "focus_area": focus_area, "correct": result.get("correct", False)},
    )
    db.commit()

    return {
        "correct": result.get("correct", True),
        "score": result.get("score", 5),
        "feedback": result.get("feedback", ""),
        "reference": result.get("reference", ""),
    }
