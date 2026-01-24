import { Rubric } from '../../types/review';

export const ResearchRubric: Rubric = {
  id: 'research-finalize',
  name: 'Research Finalization Rubric',
  minScoreToPass: 0.8,
  criteria: [
    {
      id: 'comprehensiveness',
      description: 'Does the research cover all key areas (market, competitors, tech stack)?',
      weight: 0.3,
      passThreshold: 0.7
    },
    {
      id: 'evidence-quality',
      description: 'Are claims supported by high-quality, verifiable sources?',
      weight: 0.3,
      passThreshold: 0.8
    },
    {
      id: 'competitor-analysis',
      description: 'Is the competitor matrix detailed and actionable?',
      weight: 0.2,
      passThreshold: 0.7
    },
    {
      id: 'clarity',
      description: 'Is the dossier well-structured and easy to read?',
      weight: 0.2,
      passThreshold: 0.7
    }
  ]
};
