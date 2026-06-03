export function scoreMatch({
  candidate,
  myLearn,
  myTeach,
}: {
  candidate: {
    teach: Set<string>;
    learn: Set<string>;
  };
  myLearn: Set<string>;
  myTeach: Set<string>;
}) {
  let score = 0;

  const teachesMe: string[] = [];
  const learnsFromMe: string[] = [];

  for (const skill of candidate.teach) {
    if (myLearn.has(skill)) {
      score += 10;
      teachesMe.push(skill);
    }
  }

  for (const skill of candidate.learn) {
    if (myTeach.has(skill)) {
      score += 10;
      learnsFromMe.push(skill);
    }
  }

  return {
    score,
    teachesMe,
    learnsFromMe,
  };
}
