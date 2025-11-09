"""
비례 배분 전략 알고리즘 (attendance 올림 처리)
학생이 남은 과제/시험에서 최소 몇 점 이상 받아야 목표 점수를 달성할 수 있는지 계산

비례 배분 원리:
- 각 항목의 배점에 비례하여 최소 점수 계산
- 달성 비율 = (남은 총 배점 - 감점 가능) / 남은 총 배점
- 각 항목 최소 = 항목 배점 × 달성 비율

attendance 특별 처리:
- attendance는 출석(100점) 또는 결석(0점)만 가능
- 비례 배분으로 계산된 필요량을 개수 기준으로 올림
- 올림으로 생긴 여유는 다른 항목들에 비례 배분으로 추가 감점 재분배
"""

import math

def calculate_minimum_scores_proportional(weights, completed_scores, target_score):
    """
    목표 점수 달성을 위한 각 남은 항목의 최소 필요 점수 계산 (비례 배분)
    """
    
    print("="*70)
    print("비례 배분 전략 (attendance 올림 처리)")
    print("="*70)
    
    # 1단계: 현재까지 잃은 점수 계산
    print("\n[1단계] 현재까지 잃은 점수 계산")
    print("-"*70)
    
    total_lost = 0
    current_score = 0
    
    for item, score in completed_scores.items():
        if item not in weights:
            print(f"⚠️ 경고: '{item}'은 배점에 없는 항목입니다.")
            continue
        
        weight = weights[item]
        score_ratio = score / 100.0
        earned = weight * score_ratio
        lost = weight * (1 - score_ratio)
        
        current_score += earned
        total_lost += lost
        
        if item.startswith("attendance"):
            status = "출석" if score == 100 else "결석"
            print(f"{item:15s}: {status:4s} → {earned:6.2f}% 획득, {lost:5.2f}% 손실")
        else:
            print(f"{item:15s}: {score:6.1f}/100점 → {earned:6.2f}% 획득, {lost:5.2f}% 손실")
    
    max_possible = 100 - total_lost
    
    print(f"\n{'현재 획득':<15s}: {current_score:6.2f}%")
    print(f"{'총 손실':<15s}: {total_lost:6.2f}%")
    print(f"{'최대 가능':<15s}: {max_possible:6.2f}%")
    
    # 2단계: 목표 달성 가능 여부
    print(f"\n[2단계] 목표 달성 가능 여부")
    print("-"*70)
    print(f"목표 점수: {target_score:.2f}%")
    
    if max_possible < target_score:
        print(f"❌ 목표 달성 불가능!")
        print(f"   최대 {max_possible:.2f}%까지만 받을 수 있습니다.")
        return None
    
    deduction_allowed = max_possible - target_score
    print(f"✅ 목표 달성 가능!")
    print(f"   깎여도 되는 여유: {deduction_allowed:.2f}%")
    
    # 3단계: 남은 항목 분류
    print(f"\n[3단계] 남은 항목 확인")
    print("-"*70)
    
    remaining_items = {}
    remaining_attendance = {}
    
    for item, weight in weights.items():
        if item not in completed_scores:
            if item.startswith("attendance"):
                remaining_attendance[item] = weight
            else:
                remaining_items[item] = weight
    
    if not remaining_items and not remaining_attendance:
        print("✅ 모든 항목이 완료되었습니다!")
        return {
            "max_possible": max_possible,
            "deduction_allowed": deduction_allowed,
            "remaining_scores": {}
        }
    
    print(f"남은 항목 (감점 가능): {list(remaining_items.keys())}")
    print(f"남은 attendance: {list(remaining_attendance.keys())}")
    total_remaining = sum(remaining_items.values()) + sum(remaining_attendance.values())
    print(f"남은 배점 합계: {total_remaining:.2f}%")
    
    # 4단계: 비례 배분 적용
    print(f"\n[4단계] 비례 배분 전략")
    print("-"*70)
    
    # 달성 비율 계산
    achievement_ratio = (total_remaining - deduction_allowed) / total_remaining
    print(f"달성 비율 = (남은 총 배점 - 감점 가능) / 남은 총 배점")
    print(f"          = ({total_remaining:.2f}% - {deduction_allowed:.2f}%) / {total_remaining:.2f}%")
    print(f"          = {achievement_ratio:.6f}")
    print(f"\n각 항목은 자신의 배점 × {achievement_ratio:.6f} 만큼 받으면 됨")
    
    result = {}
    
    print(f"\n{'항목':<18} {'배점':<10} {'× 달성비율':<15} {'= 최소 필요':<12}")
    print("-"*70)
    
    # 일반 항목에 비례 배분
    for item_name, weight in remaining_items.items():
        min_pct = weight * achievement_ratio
        result[item_name] = min_pct
        print(f"{item_name:<18} {weight:>6.2f}%     × {achievement_ratio:.6f}     = {min_pct:>6.4f}%")
    
    # attendance 항목에 비례 배분 (일단 계산)
    for item_name, weight in remaining_attendance.items():
        min_pct = weight * achievement_ratio
        result[item_name] = min_pct
        print(f"{item_name:<18} {weight:>6.2f}%     × {achievement_ratio:.6f}     = {min_pct:>6.4f}%")
    
    # 5단계: attendance 올림 처리 (개수 기준)
    print(f"\n[5단계] attendance 올림 처리 (개수 기준)")
    print("-"*70)
    
    attendance_total_needed = 0  # attendance 총 필요 %
    attendance_items = []
    
    # attendance 항목들의 필요 점수 수집
    for item_name in remaining_attendance.keys():
        if item_name in result:
            min_pct = result[item_name]
            attendance_total_needed += min_pct
            attendance_items.append((item_name, min_pct))
    
    attendance_surplus = 0
    
    if attendance_items:
        print(f"attendance 총 필요: {attendance_total_needed:.4f}%")
        
        # 개수로 올림
        attendance_count_needed = math.ceil(attendance_total_needed)
        print(f"→ {attendance_count_needed:.0f}번 출석 필요 (올림)")
        
        # 실제 획득
        attendance_actual = attendance_count_needed
        attendance_surplus = attendance_actual - attendance_total_needed
        print(f"→ 실제 획득: {attendance_actual:.0f}%")
        print(f"→ 여유: {attendance_surplus:.4f}%")
        
        # attendance 항목들을 필요도 순으로 정렬 (높은 것부터)
        attendance_items.sort(key=lambda x: x[1], reverse=True)
        
        # 상위 N개는 출석, 나머지는 결석
        print(f"\n출석 배정:")
        for i, (item_name, min_pct) in enumerate(attendance_items):
            if i < attendance_count_needed:
                result[item_name] = 1
                print(f"  ✓ {item_name:15s}: 출석 필요 (필요도: {min_pct:.4f}%)")
            else:
                result[item_name] = 0
                print(f"  ✗ {item_name:15s}: 결석 가능 (필요도: {min_pct:.4f}%)")
    
    # 6단계: 여유를 다른 항목에 비례 배분으로 추가 감점
    if attendance_surplus > 0.0001:
        print(f"\n[6단계] 여유 재분배 (다른 항목에 비례 배분으로 추가 감점)")
        print("-"*70)
        
        non_attendance_items = {k: v for k, v in result.items() 
                               if not k.startswith("attendance") and v > 0}
        
        if non_attendance_items:
            print(f"추가 감점 대상: {list(non_attendance_items.keys())}")
            
            # 추가 감점 대상들의 총 배점 (현재 필요 점수 기준)
            total_non_attendance = sum(non_attendance_items.values())
            print(f"추가 감점 대상 총 필요량: {total_non_attendance:.4f}%")
            print(f"재분배할 여유: {attendance_surplus:.4f}%")
            
            # 비례 배분으로 추가 감점
            print(f"\n각 항목은 자신의 현재 필요량에 비례하여 추가 감점:")
            print(f"{'항목':<18} {'현재 필요':<12} {'추가 감점':<12} {'= 최종 필요':<12}")
            print("-"*70)
            
            for item_name in non_attendance_items.keys():
                current_needed = result[item_name]
                proportion = current_needed / total_non_attendance
                additional_deduction = attendance_surplus * proportion
                new_needed = current_needed - additional_deduction
                
                result[item_name] = max(0, new_needed)  # 음수 방지
                
                print(f"{item_name:<18} {current_needed:>6.4f}%     - {additional_deduction:>6.4f}%     = {new_needed:>6.4f}%")
        else:
            print(f"\n[6단계] 추가 감점 대상 없음 (모든 항목이 attendance)")
            print(f"여유 {attendance_surplus:.4f}%는 버려짐")
    
    # 7단계: 최종 결과
    if attendance_surplus > 0.0001:
        step_number = 7
    else:
        step_number = 6
        
    print(f"\n[{step_number}단계] 최종 결과")
    print("="*70)
    print(f"{'항목':<18} {'배점':<10} {'최소 필요':<12} {'설명':<30}")
    print("-"*70)
    
    final_scores = {}
    
    for item in weights.keys():
        weight = weights[item]
        
        if item in completed_scores:
            score = completed_scores[item]
            earned_pct = weight * (score / 100.0)
            if item.startswith("attendance"):
                status = "출석" if score == 100 else "결석"
                print(f"{item:<18} {weight:>5.2f}%     ✅ {status}")
            else:
                print(f"{item:<18} {weight:>5.2f}%     ✅ 완료 ({score:.1f}점)")
        else:
            min_pct = result.get(item, 0)
            
            if item.startswith("attendance"):
                if min_pct == 0:
                    print(f"{item:<18} {weight:>5.2f}%     {min_pct:>5.2f}%     결석 가능")
                else:
                    print(f"{item:<18} {weight:>5.2f}%     {min_pct:>5.2f}%     출석 필요")
                    
                final_scores[item] = {
                    "weight": weight,
                    "min_percentage": min_pct,
                    "min_score": min_pct * 100,
                    "type": "attendance"
                }
            else:
                min_score = (min_pct / weight) * 100 if weight > 0 else 0
                
                final_scores[item] = {
                    "weight": weight,
                    "min_percentage": min_pct,
                    "min_score": min_score,
                    "type": "regular"
                }
                
                if min_pct == 0:
                    print(f"{item:<18} {weight:>5.2f}%     {min_pct:>5.2f}%     포기 가능")
                else:
                    print(f"{item:<18} {weight:>5.2f}%     {min_pct:>5.2f}%     {min_score:>5.1f}점 이상")
    
    print("-"*70)
    
    # 검증
    total_min = current_score + sum(result.values())
    print(f"\n검증: {current_score:.2f}% (완료) + {sum(result.values()):.2f}% (최소 필요) = {total_min:.2f}%")
    
    if abs(total_min - target_score) < 0.01:
        print(f"✅ 목표 {target_score:.2f}% 정확히 달성!")
    elif total_min >= target_score - 0.01:
        print(f"✅ 목표 {target_score:.2f}% 달성 (실제: {total_min:.2f}%)")
    
    return {
        "max_possible": max_possible,
        "deduction_allowed": deduction_allowed,
        "remaining_scores": final_scores
    }


# ============================================================================
# 테스트 케이스
# ============================================================================

if __name__ == "__main__":
    
    # 전체 배점 (세분화)
    weights = {
        "exam1": 15,
        "exam2": 15,
        "exam3": 20,
        "homework": 30,
        "quiz1": 1,
        "quiz2": 1,
        "quiz3": 1,
        "quiz4": 1,
        "quiz5": 1,
        "quiz6": 1,
        "quiz7": 1,
        "quiz8": 1,
        "quiz9": 1,
        "quiz10": 1,
        "attendance1": 1,
        "attendance2": 1,
        "attendance3": 1,
        "attendance4": 1,
        "attendance5": 1,
        "attendance6": 1,
        "attendance7": 1,
        "attendance8": 1,
        "attendance9": 1,
        "attendance10": 1
    }
    
    print("\n" + "🎓"*35)
    print("비례 배분 전략 알고리즘 (attendance 올림 처리)")
    print("🎓"*35)
    
    # ========================================================================
    # 테스트 1: exam1만 완료, A학점 목표
    # ========================================================================
    print("\n\n" + "📝"*35)
    print("테스트 1: exam1에서 80/100점, 목표 93점(A학점)")
    print("📝"*35)
    
    completed_1 = {
        "exam1": 80
    }
    
    result_1 = calculate_minimum_scores_proportional(weights, completed_1, 93)
    
    
    # ========================================================================
    # 테스트 2: attendance 8개 완료, 목표 80점
    # ========================================================================
    print("\n\n" + "📝"*35)
    print("테스트 2: attendance 8개 완료, 목표 80점")
    print("📝"*35)
    
    completed_2 = {
        "exam1": 80,
        "exam2": 66.67,
        "homework": 83.33,
        "attendance1": 100, "attendance2": 100, "attendance3": 100, "attendance4": 100,
        "attendance5": 100, "attendance6": 100, "attendance7": 100, "attendance8": 100
    }
    
    result_2 = calculate_minimum_scores_proportional(weights, completed_2, 80)
    
    
    # ========================================================================
    # 테스트 3: quiz 9개, attendance 8개 완료, 목표 80점
    # ========================================================================
    print("\n\n" + "📝"*35)
    print("테스트 3: quiz 9개, attendance 8개 완료, 목표 80점")
    print("📝"*35)
    
    completed_3 = {
        "exam1": 80,
        "exam2": 66.67,
        "homework": 83.33,
        "quiz1": 100, "quiz2": 100, "quiz3": 100, "quiz4": 100, "quiz5": 100,
        "quiz6": 100, "quiz7": 100, "quiz8": 100, "quiz9": 100,
        "attendance1": 100, "attendance2": 100, "attendance3": 100, "attendance4": 100,
        "attendance5": 100, "attendance6": 100, "attendance7": 100, "attendance8": 100
    }
    
    result_3 = calculate_minimum_scores_proportional(weights, completed_3, 80)