"""会员中心静态配置（可后续接支付中台）"""
from fastapi import APIRouter

from .. import schemas

router = APIRouter(prefix="/api/vip", tags=["会员"])


@router.get("/plans", response_model=schemas.VipPlansResponse)
def get_plans():
    return schemas.VipPlansResponse(
        banner_title="解锁无限可能",
        banner_desc="无限次对话 · 深度批改 · 全真模考 · 专属课程",
        badges=["首月特惠", "买季送月"],
        plans=[
            schemas.VipPlanItem(
                id="free",
                price_display="¥0",
                price_sub="",
                name="免费版",
                note="5次/日",
                highlight=False,
            ),
            schemas.VipPlanItem(
                id="month",
                price_display="¥29",
                price_sub="/月",
                name="月卡",
                tag="热",
                highlight=True,
            ),
            schemas.VipPlanItem(
                id="season",
                price_display="¥79",
                price_sub="/季",
                name="季卡",
                note="省 ¥8",
                highlight=False,
            ),
            schemas.VipPlanItem(
                id="year",
                price_display="¥249",
                price_sub="/年",
                name="年卡",
                note="省 ¥99",
                highlight=False,
            ),
        ],
        features=[
            "无限次口语对话",
            "深度作文批改",
            "全真模考系统",
            "专属精品课程",
            "专项能力训练",
            "学习报告分析",
            "错题本无限容量",
            "无广告体验",
        ],
        addons=[
            {"icon": "user", "title": "1v1 外教", "price": "¥99/次"},
            {"icon": "book", "title": "冲刺课程", "price": "¥199/套"},
            {"icon": "building", "title": "企业定制", "price": "按需报价"},
        ],
    )
