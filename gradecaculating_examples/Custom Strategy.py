#!/usr/bin/env python3
import math

# ==========================
# 전략 3: 완전 커스터마이징 버전
# ==========================

# 💡 전제
# - 카테고리 총 비율은 고정 (예시)
#   exam: 50%, homework: 30%, quiz: 10%, attendance: 10%
# - 각 카테고리 안에 몇 개의 시험/퀴즈/출석/과제가 있는지는 유저 입력
# - 각 항목 점수는 "항목당 100점 만점"으로 입력
# - 프로그램이:
#   1) 입력받은 개수로 세부 weight 자동 계산
#   2) 유저가 이미 받은 점수 입력
#   3) 네가 만든 '균등 감점 + 희생 전략(+attendance 올림)'으로
#      남은 항목에서 최소 몇 점 받아야 target(예: 93, A)을 만들 수 있는지 계산

# 필요하면 여기 값만 바꿔서 다른 강의에도 적용 가능
CATEGORY_TOTALS = {
    "exam": 50.0,
    "homework": 30.0,
    "quiz": 10.0,
    "attendance": 10.0,
    # 필요하면 assignment 따로 쓸 수 있게 뺴둠 (기본 0%)
    "assignment": 0.0,
}


def ask_int(prompt: str) -> int:
    while True:
        s = input(prompt).strip()
        if s == "":
            return 0
        try:
            n = int(s)
            if n < 0:
                print("0 이상 정수로 입력하세요.")
                continue
            return n
        except ValueError:
            print("정수를 입력하세요.")


def build_weights_dynamic():
    """
    유저에게 각 카테고리별 항목 개수를 받아서
    세부 weight 딕셔너리 생성.
    예: exam 3개 -> exam1, exam2, exam3에 각각 50/3% 할당
    """
    print("=" * 70)
    print("Strategy 3: 완전 커스터마이징 성적 구조 설정")
    print("=" * 70)

    print("\n[고정 카테고리 비율]")
    for k, v in CATEGORY_TOTALS.items():
        if v > 0:
            print(f"  {k:<10}: {v:5.1f}%")

    print("\n각 카테고리별 '항목 개수'를 입력하세요. (없으면 엔터 또는 0)")
    num_exam = ask_int("Exam 개수: ")
    num_hw = ask_int("Homework 개수: ")
    num_quiz = ask_int("Quiz 개수: ")
    num_att = ask_int("Attendance 개수: ")
    num_asg = ask_int("Assignment 개수(별도 관리 필요 시): ")

    counts = {
        "exam": num_exam,
        "homework": num_hw,
        "quiz": num_quiz,
        "attendance": num_att,
        "assignment": num_asg,
    }

    weights = {}

    print("\n[자동 계산된 세부 배점]")
    for cat, total in CATEGORY_TOTALS.items():
        cnt = counts[cat]
        if total <= 0 or cnt <= 0:
            continue

        # 항목당 weight
        w = round(total / cnt, 6)

        for i in range(1, cnt + 1):
            name = f"{cat}{i}"
            weights[name] = w

        print(f"  {cat:<10}: {cnt}개 → 항목당 {w:.4f}%")

    total_weight = sum(weights.values())
    print(f"\n세부 항목 weight 총합: {total_weight:.4f}%")

    if abs(total_weight - 100.0) > 1e-6:
        print("⚠️ 경고: 총합이 100%가 아닙니다. CATEGORY_TOTALS 또는 개수를 다시 확인하세요.\n")

    return weights


def input_completed_scores(weights):
    """
    각 항목에 대해, 이미 받은 점수를 유저에게 입력받음.
    - 0~100 사이
    - 빈칸이면 '아직 안 함'으로 처리
    - attendance는 0 또는 100으로 강제 스냅
    """
    print("\n[진행 상황 입력]")
    print("완료된 항목의 점수를 입력하세요. (0~100)")
    print("엔터만 치면 아직 안 한 항목으로 처리됩니다.")
    print("attendance는 0 또는 100만 인정됩니다.\n")

    completed = {}

    for item in weights.keys():
        while True:
            s = input(f"{item} 점수: ").strip()
            if s == "":
                break
            try:
                score = float(s)

                # attendance는 출석/결석 처리
                if item.startswith("attendance"):
                    score = 100.0 if score >= 50.0 else 0.0

                if score < 0 or score > 100:
                    print("  → 0 이상 100 이하로 입력하세요.")
                    continue

                completed[item] = score
                break
            except ValueError:
                print("  → 숫자를 입력하세요.")
    return completed


def calculate_minimum_scores(weights, completed_scores, target_score):
    """
    네가 만든 전략 2 코드 기반:
    - 현재까지 잃은 점수 계산
    - 목표 달성 가능 여부 확인
    - 남은 항목에 균등 감점 + 희생 전략
    - attendance는 올림 처리 후 surplus 재분배
    """
    print("=" * 70)
    print("균등 감점 + 희생 전략 (attendance 올림 처리)")
    print("=" * 70)

    # 1단계: 현재까지 잃은 점수
    print("\n[1단계] 현재까지 잃은 점수 계산")
    print("-" * 70)

    total_lost = 0.0
    current_score = 0.0

    for item, score in completed_scores.items():
        if item not in weights:
            print(f"⚠️ '{item}'은(는) weight에 없습니다. (무시)")
            continue

        weight = weights[item]
        ratio = score / 100.0
        earned = weight * ratio
        lost = weight * (1 - ratio)

        current_score += earned
        total_lost += lost

        if item.startswith("attendance"):
            status = "출석" if score == 100 else "결석"
            print(f"{item:15s}: {status:4s} → {earned:6.2f}% 획득, {lost:5.2f}% 손실")
        else:
            print(f"{item:15s}: {score:6.1f}/100 → {earned:6.2f}% 획득, {lost:5.2f}% 손실")

    max_possible = 100.0 - total_lost

    print(f"\n{'현재 획득':<10s}: {current_score:6.2f}%")
    print(f"{'총 손실':<10s}: {total_lost:6.2f}%")
    print(f"{'최대 가능':<10s}: {max_possible:6.2f}%")

    # 2단계: 목표 가능 여부
    print("\n[2단계] 목표 달성 가능 여부")
    print("-" * 70)
    print(f"목표 점수: {target_score:.2f}%")

    if max_possible < target_score - 1e-9:
        print("❌ 목표 달성 불가능")
        print(f"   남은 거 다 만점이어도 최대 {max_possible:.2f}%")
        return None

    deduction_allowed = max_possible - target_score
    print("✅ 목표 달성 가능")
    print(f"   앞으로 더 잃어도 되는 여유: {deduction_allowed:.2f}%")

    # 3단계: 남은 항목 분류
    print("\n[3단계] 남은 항목 정리")
    print("-" * 70)

    remaining_items = {}
    remaining_att = {}

    for item, w in weights.items():
        if item in completed_scores:
            continue
        if item.startswith("attendance"):
            remaining_att[item] = w
        else:
            remaining_items[item] = w

    if not remaining_items and not remaining_att:
        print("✅ 남은 항목이 없습니다.")
        return {
            "max_possible": max_possible,
            "deduction_allowed": deduction_allowed,
            "remaining_scores": {},
        }

    print(f"남은 일반 항목: {list(remaining_items.keys())}")
    print(f"남은 attendance: {list(remaining_att.keys())}")
    print(f"남은 배점 합계: {sum(remaining_items.values()) + sum(remaining_att.values()):.2f}%")

    # 4단계: 균등 감점 + 희생 전략
    print("\n[4단계] 균등 감점 + 희생 전략 적용")
    print("-" * 70)

    all_remaining = {**remaining_items, **remaining_att}
    items = all_remaining.copy()
    result = {}
    remaining_deduction = deduction_allowed
    iteration = 0

    while remaining_deduction > 1e-4 and items:
        iteration += 1
        num = len(items)
        equal_d = remaining_deduction / num
        print(f"\n반복 {iteration}: 항목당 {equal_d:.4f}% 감점 시도")

        sacrificed = []
        carry = 0.0

        for name, w in list(items.items()):
            new_w = w - equal_d
            if new_w < 0:
                # 이 항목은 완전 희생(0%)
                print(f"  ❌ {name:15s}: {w:6.2f}% → {new_w:6.2f}% < 0 → 0% (희생)")
                result[name] = 0.0
                carry += -new_w
                sacrificed.append(name)
            else:
                print(f"  ✓ {name:15s}: {w:6.2f}% → {new_w:6.2f}%")
                items[name] = new_w

        for s in sacrificed:
            del items[s]

        remaining_deduction = carry
        if carry > 0:
            print(f"  → 재분배해야 할 감점: {carry:.4f}%")

    # 남아 있는 애들 기록
    for name, v in items.items():
        result[name] = v

    # 5단계: attendance 올림 처리
    print("\n[5단계] attendance 올림 처리")
    print("-" * 70)

    att_total_needed = 0.0
    att_list = []

    for name in remaining_att.keys():
        if name in result:
            att_total_needed += result[name]
            att_list.append((name, result[name]))

    if att_list:
        print(f"  계산상 필요한 attendance 합: {att_total_needed:.4f}%")
        need_count = math.ceil(att_total_needed)
        print(f"  → 출석 최소 {need_count}번 필요 (올림)")

        actual = float(need_count)
        surplus = actual - att_total_needed
        print(f"  → 실제 획득 {actual:.0f}% (여유 {surplus:.4f}%)")

        # 필요 비중 큰 순으로 출석 처리
        att_list.sort(key=lambda x: x[1], reverse=True)

        for i, (name, _) in enumerate(att_list):
            if i < need_count:
                result[name] = 1.0
                print(f"  ✓ {name:15s}: 출석해야 함")
            else:
                result[name] = 0.0
                print(f"  ✗ {name:15s}: 결석 가능")

        attendance_surplus = surplus
    else:
        attendance_surplus = 0.0

    # 6단계: surplus를 다른 항목에 재분배(추가 감점 허용)
    if attendance_surplus > 1e-4:
        print("\n[6단계] attendance 여유를 다른 항목에 감점 여유로 반영")
        print("-" * 70)

        extra_items = {
            k: v
            for k, v in result.items()
            if not k.startswith("attendance") and v > 0
        }

        add_d = attendance_surplus
        sub_iter = 0

        while add_d > 1e-4 and extra_items:
            sub_iter += 1
            num = len(extra_items)
            eq = add_d / num
            print(f"\n추가 반복 {sub_iter}: 항목당 {eq:.4f}% 추가 감점 가능")

            sacrificed = []
            carry = 0.0

            for name, cur in list(extra_items.items()):
                new_v = cur - eq
                if new_v < 0:
                    print(f"  ❌ {name:15s}: {cur:6.4f}% → {new_v:6.4f}% < 0 → 0% (희생)")
                    result[name] = 0.0
                    carry += -new_v
                    sacrificed.append(name)
                else:
                    print(f"  ✓ {name:15s}: {cur:6.4f}% → {new_v:6.4f}%")
                    result[name] = new_v
                    extra_items[name] = new_v

            for s in sacrificed:
                del extra_items[s]

            add_d = carry

    # 최종 출력
    print("\n[최종 결과] 남은 각 항목에 필요한 최소 성적")
    print("=" * 70)
    print(f"{'항목':<18} {'배점':<10} {'최소 필요 비율':<14} {'설명':<20}")
    print("-" * 70)

    final = {}
    for name in weights.keys():
        w = weights[name]

        if name in completed_scores:
            s = completed_scores[name]
            if name.startswith("attendance"):
                status = "출석" if s == 100 else "결석"
                print(f"{name:<18} {w:5.2f}%     완료 → {status}")
            else:
                print(f"{name:<18} {w:5.2f}%     완료 → {s:5.1f}점")
            continue

        min_pct = result.get(name, 0.0)

        if name.startswith("attendance"):
            if min_pct >= 0.5:
                # 출석 필요
                print(f"{name:<18} {w:5.2f}%     1.00%        출석해야 함")
                final[name] = {
                    "weight": w,
                    "min_percentage": 1.0,
                    "min_score": 100.0,
                    "type": "attendance",
                }
            else:
                print(f"{name:<18} {w:5.2f}%     0.00%        결석 가능")
                final[name] = {
                    "weight": w,
                    "min_percentage": 0.0,
                    "min_score": 0.0,
                    "type": "attendance",
                }
        else:
            # min_pct: 이 항목이 '최대로 잃어도 되는 양'이 아니라
            # '이 항목이 최종 점수에 기여해야 하는 최소 비율'
            if min_pct <= 0:
                print(f"{name:<18} {w:5.2f}%     0.00%        이 항목 포기 가능")
                final[name] = {
                    "weight": w,
                    "min_percentage": 0.0,
                    "min_score": 0.0,
                    "type": "regular",
                }
            else:
                # 항목 배점 w 중 min_pct 만큼은 벌어야 한다 → 필요한 점수
                # 필요 점수 = (min_pct / w) * 100
                need_score = (min_pct / w) * 100.0
                if need_score > 100:
                    need_score = 100.0  # 이 경우는 사실상 '만점 필수'
                print(f"{name:<18} {w:5.2f}%     {min_pct:5.2f}%       ≥ {need_score:5.1f}점")
                final[name] = {
                    "weight": w,
                    "min_percentage": min_pct,
                    "min_score": need_score,
                    "type": "regular",
                }

    # 검증
    print("-" * 70)
    total_min = current_score + sum(result.values())
    print(f"검증: 완료 {current_score:.2f}% + 남은 최소 필요 {sum(result.values()):.2f}% = {total_min:.2f}%")
    print(f"목표: {target_score:.2f}%")
    return {
        "max_possible": max_possible,
        "deduction_allowed": deduction_allowed,
        "remaining_scores": final,
    }


def main():
    print("\n" + "🎓" * 25)
    print("Strategy 3: 커스터마이징 성적 계산기")
    print("🎓" * 25 + "\n")

    # 1) 구조 설정
    weights = build_weights_dynamic()
    if not weights:
        print("세부 항목이 없습니다. 프로그램을 종료합니다.")
        return

    # 2) 목표 점수 입력
    while True:
        t = input("\n목표 최종 점수 (예: 93 = A 최소점): ").strip()
        try:
            target = float(t)
            break
        except ValueError:
            print("숫자로 입력하세요.")

    # 3) 완료된 점수 입력
    completed = input_completed_scores(weights)

    # 4) 최소 필요 점수 계산
    calculate_minimum_scores(weights, completed, target)


if __name__ == "__main__":
    main()
