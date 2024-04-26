import { triggerConfetti } from "../confetti";

export function useConfetti(getParent: () => Element) {
  let respondentCount: number | undefined = undefined;

  function updateRespondentCount(newRespondentCount: number) {
    if (!respondentCount || newRespondentCount <= respondentCount) {
      respondentCount = newRespondentCount;
      return;
    }

    const parent = getParent();
    if (!parent) {
      return;
    }
    triggerConfetti(parent);
    respondentCount = newRespondentCount;
  }

  return { updateRespondentCount }
}