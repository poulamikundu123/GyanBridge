"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import AssessmentResultsView, { AssessmentResultData } from "./AssessmentResultsView";
import AssessmentQuestionCard, { QuestionItem } from "./AssessmentQuestionCard";

interface CareerAssessmentRunnerProps {
  attemptId: string;
  careerRoleTitle: string;
  testTitle: string;
  durationMinutes: number;
  questions: QuestionItem[];
}

export default function CareerAssessmentRunner({
  attemptId,
  careerRoleTitle,
  testTitle,
  durationMinutes,
  questions,
}: CareerAssessmentRunnerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResultData | null>(null);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        question_id: q.id,
        selectedOptionId: selectedAnswers[q.id] || undefined,
        selected_option_id: selectedAnswers[q.id] || undefined,
        textAnswer: textAnswers[q.id] || undefined,
        text_answer: textAnswers[q.id] || undefined,
      }));

      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          attempt_id: attemptId,
          answers: answersPayload,
        }),
      });

      const data = await res.json();
      if (data.success || data.attemptId || data.attempt_id) {
        setResult(data);
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
      } else {
        alert(data.message || data.detail || "Assessment submission error. Please try again.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Network error: Could not submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (optionId: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleTextChange = (text: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setTextAnswers((prev) => ({
      ...prev,
      [currentQ.id]: text,
    }));
  };

  const handleRetake = () => {
    setResult(null);
    setSelectedAnswers({});
    setTextAnswers({});
    setCurrentIndex(0);
    router.refresh();
  };

  if (result) {
    return <AssessmentResultsView result={result} onRetake={handleRetake} />;
  }

  return (
    <AssessmentQuestionCard
      careerRoleTitle={careerRoleTitle}
      testTitle={testTitle}
      timeLeft={timeLeft}
      formatTime={formatTime}
      submitting={submitting}
      onSubmit={handleSubmit}
      questions={questions}
      currentIndex={currentIndex}
      setCurrentIndex={setCurrentIndex}
      selectedAnswers={selectedAnswers}
      textAnswers={textAnswers}
      onSelectOption={handleSelectOption}
      onTextChange={handleTextChange}
    />
  );
}
