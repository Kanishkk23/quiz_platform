import { Question } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
  questionNumber: number;
}

export function QuestionCard({
  question,
  selectedOptionId,
  onSelectOption,
  questionNumber,
}: QuestionCardProps) {
  const letters = ["A", "B", "C", "D", "E"];

  return (
    <Card className="bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] text-[#0F3D2E]">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Question Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#0F3D2E] bg-[#FFE94A] text-xs font-bold uppercase tracking-wider text-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E]">
            Question {questionNumber}
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E] leading-relaxed">
            {question.text}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {question.options.map((option, index) => {
            const isSelected = selectedOptionId === option.id;
            const letter = letters[index] || `${index + 1}`;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectOption(option.id)}
                className={`w-full text-left flex items-center justify-between p-4 rounded-[12px] border-2 transition-all duration-150 ${
                  isSelected
                    ? "border-[#0F3D2E] bg-[#0F3D2E] text-[#FFFDF5] shadow-[4px_4px_0_#0F3D2E]"
                    : "border-[#0F3D2E] bg-[#FFFDF5] hover:bg-[#E3F9EE] hover:translate-x-1 hover:shadow-[-4px_4px_0_#0F3D2E] text-[#0F3D2E]"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 pr-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black border-2 border-[#0F3D2E] transition-colors ${
                      isSelected
                        ? "bg-[#FFE94A] text-[#0F3D2E]"
                        : "bg-[#E3F9EE] text-[#0F3D2E]"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base font-bold leading-snug">
                    {option.text}
                  </span>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-[#FFE94A]" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-[#0F3D2E]/40" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
