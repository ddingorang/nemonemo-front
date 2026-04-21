// useReveal.js — 스크롤 진입 시 페이드인 애니메이션 훅
// Created: 2026-04-21
import { useEffect, useRef, useState } from 'react'

/**
 * 요소가 뷰포트에 진입하면 visible 상태를 true로 변경합니다.
 *
 * @param {object} options
 * @param {number} options.threshold   - 얼마나 보여야 트리거할지 (0~1, 기본 0.1)
 * @param {string} options.rootMargin  - 뷰포트 마진 (기본 '0px 0px -40px 0px')
 * @param {boolean} options.once       - 한 번만 트리거할지 여부 (기본 true)
 * @returns {{ ref, visible }}
 */
export function useReveal({
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  once = true,
} = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, visible }
}

/**
 * 여러 자식 요소에 순차적 딜레이를 줄 때 사용하는 헬퍼
 * index를 받아 Tailwind transition-delay 클래스를 반환합니다.
 *
 * @param {number} index
 * @param {number} step  - 딜레이 간격 (ms, 기본 80)
 */
export function staggerDelay(index, step = 80) {
  return { transitionDelay: `${index * step}ms` }
}

/**
 * reveal 상태에 따라 className을 반환하는 헬퍼
 *
 * @param {boolean} visible
 * @param {string}  base     - 항상 적용되는 클래스
 * @returns {string}
 */
export function revealClass(visible, base = '') {
  const transition = 'transition-all duration-700 ease-out'
  const hidden  = 'opacity-0 translate-y-6'
  const shown   = 'opacity-100 translate-y-0'
  return [base, transition, visible ? shown : hidden].filter(Boolean).join(' ')
}
