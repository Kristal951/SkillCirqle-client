import React from 'react'

const SkillsCard = ({
    title,
    skills,
    icon,
    color,
  }: {
    title: string;
    skills: string[];
    icon: string;
    color: string;
  }) => {
    return (
      <div className="col-span-2 p-6 h-max rounded-md bg-surface">
        <div className="h-full flex flex-col w-full gap-8">
          <div className="w-full flex gap-2 items-center justify-between">
            <div className="w-max h-max flex items-center gap-2">
              <div className="w-10 h-10 flex items-center bg-background rounded-md justify-center">
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>

            <p className="text-text-secondary">{skills.length}/5</p>
          </div>

          <div className="flex flex-wrap gap-4">
            {(skills?.length ?? 0) > 0 ? (
              skills.map((skill, index) => (
                <div
                  key={index}
                  className={`py-1 rounded-full px-4 bg-${color}/20 border border-${color}/30`}
                >
                  <p className={`text-${color}`}>{skill}</p>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h2 className="text-2xl">No skill yet.</h2>
                <p className="text-text-secondary text-sm">
                  Complete Profile Setup to add skil
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default SkillsCard