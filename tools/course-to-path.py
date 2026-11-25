#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""حوّل أي كورس من ملفات assets/data إلى بذرة مسار تعلّم (بنفس صيغة seed/path-nahw-saghir-1-30.json).

كل درس يصبح خطوة: الشرح = نص القصة/المقال + المفردات، والأسئلة = بنك الدرس الجاهز
(أسئلة أصلية موجودة أصلًا في بيانات الكورس). الحفظ يُلغى للنصوص الطويلة (noMem)
وتُعرض الأبيات من صورتها الجاهزة بدل النص.

الاستخدام:
  python3 tools/course-to-path.py assets/data/13-alhamasa.js alhamasa > seed/path-alhamasa.json
"""
import io, json, re, sys


def load_course(path, key):
    src = io.open(path, encoding="utf-8").read()
    m = re.search(re.escape('SITE_COURSES["%s"]' % key) + r"=(\{.*\});?\s*$", src, re.S)
    if not m:
        raise SystemExit("course key %r not found in %s" % (key, path))
    return json.loads(m.group(1))


def lesson_to_step(lesson):
    """يرجع خطوة مسار، أو None إن لم يصلح الدرس خطوة (لا شرح ولا أسئلة)."""
    note_parts, vocab, image, questions = [], [], None, []
    for seg in lesson.get("segments", []):
        for p in seg.get("body", []):
            p = (p or "").strip()
            if p:
                note_parts.append(p)
        for w, meaning in seg.get("vocab", []):
            vocab.append([w, meaning])
        for q in seg.get("questions", []):
            if q.get("question") and q.get("options") and isinstance(q.get("answer"), int):
                questions.append({
                    "question": q["question"],
                    "options": q["options"],
                    "answer": q["answer"],
                })
        if not image:
            for im in seg.get("images", []):
                if im.get("src"):
                    image = im["src"]
                    break
    if not questions or not (note_parts or image):
        return None
    step = {
        "note": "\n\n".join(note_parts),
        "noMem": True,  # النصوص الأدبية الطويلة للفهم لا للحفظ
        "questions": questions,
    }
    if image:
        step["image"] = image
    if vocab:
        step["vocab"] = vocab
    return step


def main():
    course_path, key = sys.argv[1], sys.argv[2]
    course = load_course(course_path, key)
    steps, skipped = [], 0
    for lesson in course.get("lessons", []):
        st = lesson_to_step(lesson)
        if st is None:
            skipped += 1
        else:
            steps.append(st)
    json.dump(steps, io.open(sys.stdout.fileno(), "w", encoding="utf-8", closefd=False),
              ensure_ascii=False, indent=1)
    print("\n# %d steps, %d skipped (no explanation or no questions)" % (len(steps), skipped),
          file=sys.stderr)


if __name__ == "__main__":
    main()
