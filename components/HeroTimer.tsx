"use client";

import { useState } from "react";
import Icon from "./Icon";

const STAR =
  "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z";
const CALENDAR =
  "M7 5h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM4 10h16M9 3v4M15 3v4";

export default function HeroTimer() {
  const [paused, setPaused] = useState(false);

  return (
    <div className={`timer-wrap${paused ? " paused" : ""}`}>
      <div className="float-a">
        <Icon d={STAR} size={30} strokeWidth={2.2} />
      </div>
      <div className="float-b">
        <Icon d={CALENDAR} size={28} strokeWidth={2.2} />
      </div>

      <div className="timer-card">
        <div className="timer-label">
          <span className="timer-dot" />
          시각 타이머 미리보기
        </div>

        <svg
          width="260"
          height="260"
          viewBox="0 0 100 100"
          role="img"
          aria-label="줄어드는 빨간 부채꼴 시각 타이머"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="#f2f7ff"
            stroke="#14213d"
            strokeWidth="2"
          />
          <circle
            className="pie"
            cx="50"
            cy="50"
            r="25"
            fill="none"
            stroke="#e5484d"
            strokeWidth="50"
          />
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#14213d"
            strokeWidth="2"
          />
          <circle cx="50" cy="50" r="3" fill="#14213d" />
        </svg>

        <div className="timer-caption">
          <strong>남은 시간이 눈에 보여요</strong>
          <span>빨간 부분이 다 사라지면 끝이에요</span>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-small"
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "다시 움직이기" : "움직임 멈추기"}
        </button>
      </div>
    </div>
  );
}