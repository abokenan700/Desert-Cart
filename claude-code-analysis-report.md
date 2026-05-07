# تحليل مستودع anthropics/claude-code
**الرابط:** https://github.com/anthropics/claude-code  
**تاريخ التحليل:** مايو 2026

---

## نظرة عامة

| المعيار | القيمة |
|---------|--------|
| **النجوم** | 121,000 ⭐ (الأعلى في فئة coding assistants) |
| **الـ Forks** | 20,000 |
| **الإصدار الحالي** | 2.1.132 (تحديث قبل 9 ساعات من وقت التحليل) |
| **Commits** | 613 |
| **الفروع** | 159 branch |
| **الـ Tags** | 106 |
| **الرخصة** | غير محددة (مملوكة لـ Anthropic) |
| **النشاط** | نشط جداً — تحديثات يومية |

---

## ما هو هذا المستودع؟

هذا هو المستودع الرسمي لـ **Claude Code** من شركة Anthropic — وهو أداة الكود التلقائية التي تعمل في الـ terminal وتساعد المطورين على:

- كتابة وتعديل الكود بالأوامر النصية الطبيعية
- فهم codebases معقدة
- تنفيذ git workflows تلقائياً
- مراجعة الـ Pull Requests

المستودع يحتوي على شيئين رئيسيين:
1. **الأداة نفسها** (`claude` CLI)
2. **مجموعة plugins رسمية** في مجلد `/plugins` قابلة للتثبيت في أي مشروع

---

## القائمة الكاملة للـ Plugins (10 plugins رسمية)

---

### 1. `frontend-design` — تصميم الواجهات الاحترافية
**النوع:** Skill (يُفعَّل تلقائياً)  
**الوصف:** يوجّه Claude لإنتاج واجهات مميزة تتجنب "المظهر العام للـ AI"

**ما يفعله:**
- يختار اتجاهاً جمالياً واضحاً لكل مشروع
- يُنفّذ اختيارات Typography جريئة وألوان مميزة
- يضيف animations وتفاصيل بصرية عالية التأثير
- يكتب كوداً جاهزاً للإنتاج مباشرة

**التطبيق على مشروع الأسطورة:**
> هذا هو الـ Plugin الأكثر صلة بمشروعك في Phase 3. يحل مشكلة "التصميم العام" ويدفع نحو هوية بصرية مميزة للمتجر.

---

### 2. `feature-dev` — تطوير المميزات المنظّم
**النوع:** Command (`/feature-dev`) + 3 Agents متخصصة  
**الأوامر:** `/feature-dev <وصف المميزة>`

**الـ 7 مراحل:**
| المرحلة | ما يحدث |
|---------|---------|
| 1. Discovery | يفهم المتطلبات ويطرح أسئلة توضيحية |
| 2. Codebase Exploration | يُطلق 2-3 agents بالتوازي لاستكشاف الكود |
| 3. Clarification | يسأل عن القرارات الغامضة |
| 4. Architecture Design | يصمم الحل التقني |
| 5. Implementation | يكتب الكود |
| 6. Review | يراجع الجودة بـ code-reviewer agent |
| 7. Finalization | يوثّق ويختبر |

**الـ Agents الثلاثة:**
- `code-explorer` — يتعمق في الكود الموجود
- `code-architect` — يصمم المعمارية
- `code-reviewer` — يراجع الجودة

**التطبيق على مشروع الأسطورة:**
> استخدمه لتنفيذ كل phase من الـ Development Master Plan. مثال: `/feature-dev CouponContext shared state for cart and checkout` سينفذ P1-01 بالكامل.

---

### 3. `code-review` — مراجعة الكود التلقائية
**النوع:** Command (`/code-review`) + 5 Agents متخصصة  
**الأوامر:** `/code-review` أو `/code-review --comment`

**الـ 5 Agents:**
1. Agent #1 و #2: فحص امتثال CLAUDE.md
2. Agent #3: كشف الـ bugs في التعديلات الجديدة
3. Agent #4: تحليل git blame والتاريخ للسياق
4. Agent #5: فحص comments والتوثيق

**نظام التقييم:**
- كل issue تأخذ درجة ثقة من 0-100
- threshold = 80 — أي issue أقل من 80 يُتجاهل
- يُقلل false positives بشكل كبير

**مثال مخرجاته:**
```markdown
## Code review

Found 3 issues:
1. Missing error handling for OAuth callback
   https://github.com/owner/repo/blob/abc123.../src/auth.ts#L67-L72
2. Memory leak: state not cleaned up
   https://github.com/owner/repo/blob/abc123.../src/cart.ts#L103
```

**التطبيق على مشروع الأسطورة:**
> شغّله بعد كل إصلاح من Phase 0 لضمان عدم إدخال bugs جديدة. مفيد خاصة بعد إصلاح CartContext (CF-01).

---

### 4. `plugin-dev` — بناء Plugins جديدة
**النوع:** Command (`/plugin-dev:create-plugin`) + 7 Skills + 3 Agents

**الـ 7 Skills المتخصصة:**
1. Hook Development — إنشاء hooks متقدمة
2. MCP Integration — ربط MCP servers
3. Plugin Structure — هيكلة المشروع
4. Plugin Settings — إدارة الإعدادات
5. Command Development — بناء slash commands
6. Agent Development — بناء agents ذكية
7. Skill Development — بناء skills مع progressive disclosure

**الـ 8 مراحل لإنشاء Plugin:**
Discovery → Component Planning → Detailed Design → Structure Creation → Component Implementation → Validation → Testing → Documentation

**التطبيق على مشروع الأسطورة:**
> يمكن استخدامه لبناء plugin خاص بـ Arabic E-commerce يحتوي على skills متخصصة في RTL، Arabic typography، وأنماط المتاجر العربية.

---

### 5. `hookify` — قواعد سلوك مخصصة
**النوع:** Commands (`/hookify`, `/hookify:list`, `/hookify:configure`, `/hookify:help`)

**ما يفعله:**
يتيح إنشاء rules تمنع Claude من أنماط سلوكية غير مرغوبة، مثل:
- منع استخدام `rm -rf`
- تحذير عند تعديل ملفات حساسة
- منع console.log في TypeScript files

**مثال:**
```bash
/hookify Don't use inline styles in React components, always use StyleSheet
```
سيُنشئ `.claude/hookify.no-inline-styles.local.md` يُفعَّل تلقائياً في كل session.

**التطبيق على مشروع الأسطورة:**
```
/hookify Never use raw hex values in components, always use theme tokens
/hookify Never call setState inside animation listeners
/hookify Always use composite variant key (id+size+color) in cart operations
```
تُحول نقاط الضعف المكتشفة في الـ audit إلى rules دائمة.

---

### 6. `commit-commands` — أتمتة git
**النوع:** Commands  
**الأوامر:**

| الأمر | ما يفعله |
|-------|---------|
| `/commit` | يحلل التغييرات، يصيغ commit message، ينفّذ الـ commit |
| `/commit-push-pr` | commit + push + فتح PR كامل بوصف شامل |
| `/clean_gone` | يحذف الـ branches المحلية التي حُذفت من remote |

**مثال PR المُولَّد:**
```markdown
## Summary
- Fixed cart variant identity bug (id+size+color composite key)
- Added CouponContext for shared coupon state

## Test Plan
- [ ] Add S and L of same product to cart
- [ ] Delete one variant, verify other remains
- [ ] Apply coupon in cart, verify same discount in checkout
```

---

### 7. `explanatory-output-style` — وضع التعليم
**النوع:** Hook (SessionStart)  
**ما يفعله:** يضيف في بداية كل session تعليمات تجعل Claude يشرح قراراته التقنية

**مثال المخرجات:**
```
★ Insight ─────────────────────────────────────
• Using composite key (productId + size + color) ensures variant-level 
  identity which is the correct mental model for cart line items
• Context providers are chosen over Zustand here because the cart state 
  is needed across deep component trees
─────────────────────────────────────────────────
```

---

### 8. `learning-output-style` — وضع التعلم التفاعلي
**النوع:** Hook (SessionStart)  
**ما يفعله:** يطلب من المطور كتابة الأجزاء المهمة من الكود بنفسه بدل أن يكتبها Claude

يطلب مساهمتك عند:
- Business logic مع approaches متعددة
- Error handling strategies
- Algorithm implementation choices
- Data structure decisions
- UX decisions

---

### 9. `agent-sdk-dev` — بناء تطبيقات Agent SDK
**النوع:** Command (`/new-sdk-app`) + 2 Agents للتحقق

**ما يفعله:**
- يسألك 5 أسئلة (اللغة، اسم المشروع، نوع الـ agent، نقطة البداية، أدوات البناء)
- يُنشئ كل ملفات المشروع
- يثبّت آخر إصدار من SDK
- يُشغّل verifier agent للتحقق من الصحة

**Agents التحقق:**
- `agent-sdk-verifier-py` — للمشاريع Python
- `agent-sdk-verifier-ts` — للمشاريع TypeScript

---

### 10. `claude-opus-4-5-migration` — ترقية إلى Opus 4.5
**النوع:** Skill  
**ما يفعله:** يُحدّث model strings، beta headers، والـ prompts للتوافق مع Opus 4.5

```bash
"Migrate my codebase to Opus 4.5"
```

---

## مقارنة الـ Plugins بأهمية مشروع الأسطورة

| Plugin | الأهمية لمشروعك | متى تستخدمه |
|--------|----------------|-------------|
| `frontend-design` | ⭐⭐⭐⭐⭐ | Phase 3 — Design System |
| `feature-dev` | ⭐⭐⭐⭐⭐ | كل Phase — تطوير Features |
| `hookify` | ⭐⭐⭐⭐⭐ | الآن — تحويل audit findings لـ rules |
| `code-review` | ⭐⭐⭐⭐ | بعد كل Phase — ضمان الجودة |
| `commit-commands` | ⭐⭐⭐ | يومياً — git automation |
| `plugin-dev` | ⭐⭐⭐ | لبناء Arabic E-commerce Plugin |
| `explanatory-output-style` | ⭐⭐ | للتعلم وفهم القرارات |
| `learning-output-style` | ⭐⭐ | للمطور الذي يريد تعلم الكود |
| `agent-sdk-dev` | ⭐ | إذا بنيت AI features في المتجر |
| `claude-opus-4-5-migration` | ⭐ | إذا كنت تستخدم Anthropic API مباشرة |

---

## مقارنة مع مستودعات التجارة الإلكترونية السابقة

| المعيار | claude-code | medusa | vercel/commerce | storefront-ui |
|---------|-------------|--------|-----------------|---------------|
| **النجوم** | 121,000 ⭐ | ~25,000 ⭐ | ~14,000 ⭐ | ~1,800 ⭐ |
| **النوع** | أداة تطوير | منصة تجارة | Storefront Template | مكتبة UI |
| **يعطيك كوداً** | ✅ يكتب الكود | ❌ أنت تقرأه | ❌ أنت تقرأه | ❌ أنت تقرأه |
| **الصلة بالتصميم** | ✅ frontend-design | ❌ | جزئية | ✅ عالية |
| **الصلة بالمعمارية** | ✅ feature-dev | ✅ كمرجع | ✅ كمرجع | ❌ |
| **RTL / عربي** | ❌ | ❌ | ❌ | جزئي |
| **للمتجر مباشرة** | ❌ (أداة) | ✅ (منصة) | ✅ (template) | ✅ (UI) |

### الخلاصة:
- **claude-code** ليس مستودع تجارة إلكترونية — هو **الأداة التي تُساعدك على بناء** مستودعات التجارة الإلكترونية
- المستودعات السابقة (medusa, storefront-ui, vercel/commerce) = **مصادر للتعلم والمرجعية**
- claude-code plugins (خاصة `feature-dev` + `hookify` + `frontend-design`) = **أدوات تسريع التطوير**

---

## خطة تفعيل Plugins على مشروع الأسطورة

### الخطوة 1: تثبيت Claude Code
```bash
# macOS/Linux
curl -fsSL https://claude.ai/install.sh | bash

# ثم في مجلد المشروع
cd artifacts/arabic-shop
claude
```

### الخطوة 2: تفعيل الـ Plugins الأهم

**Plugin 1 — hookify (الأول والأهم)**
```bash
/hookify Never use raw hex color values in components - always use theme token from useColors()
/hookify Never call setState inside Animated addListener callbacks
/hookify Always use composite key productId+selectedSize+selectedColor for all cart operations (add, remove, update, isInCart)
/hookify Never run setInterval inside individual components - use shared context instead
```
هذه الـ rules تحول الـ 25 نقطة debt في الـ audit إلى حواجز دائمة.

**Plugin 2 — feature-dev (لتنفيذ الـ Phases)**
```bash
# لتنفيذ CF-01 (Cart variant identity)
/feature-dev Fix cart variant identity: all cart operations should use composite key (productId + selectedSize + selectedColor), not productId alone

# لتنفيذ CF-02 (CouponContext)
/feature-dev Create CouponContext that unifies coupon state between cart and checkout screens

# لتنفيذ CF-04 (Flash Sale Timer)
/feature-dev Create FlashSaleTimerContext with single setInterval that broadcasts to all ProductCards
```

**Plugin 3 — code-review (للتحقق)**
```bash
# بعد كل إصلاح
/code-review
```

**Plugin 4 — commit-commands (للـ git)**
```bash
/commit-push-pr
```

---

## الملفات الداخلية الجديرة بالدراسة في المستودع

| الملف | لماذا مهم |
|-------|----------|
| `plugins/frontend-design/README.md` | فهم كيف يُنشئ Claude واجهات مميزة |
| `plugins/feature-dev/README.md` | الـ 7 phases workflow كاملة |
| `plugins/plugin-dev/README.md` | بناء plugin خاص بـ Arabic E-commerce |
| `CHANGELOG.md` | متابعة أحدث features (2.1.132) |
| `.claude-plugin/` | هيكل plugin نموذجي |

---

## الخلاصة النهائية

`anthropics/claude-code` هو **أقوى أداة تطوير مفردة** يمكن استخدامها مع مشروع الأسطورة، لكنه يعمل **إلى جانب** مستودعات التجارة الإلكترونية السابقة — وليس بديلاً عنها:

```
مستودعات التجارة (medusa، storefront-ui، vercel/commerce)
          ↓
     مرجعية وتعلم
          ↓
  claude-code plugins (feature-dev، hookify، frontend-design)
          ↓
     تنفيذ وأتمتة
          ↓
    مشروع الأسطورة ✅
```

الـ Plugin الواحد الذي يجب تفعيله **الآن فوراً** هو **`hookify`** — لأنه يتحول من audit إلى قواعد آلية تمنع تكرار نفس الأخطاء في كل جلسة تطوير.

---
*تم إعداد هذا التحليل بعد فحص شامل لجميع ملفات المستودع ومقارنته بسياق مشروع الأسطورة.*
