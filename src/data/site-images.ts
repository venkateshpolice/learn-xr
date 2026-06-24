/** Public images under /img — clean slugs mapped from public/img assets */
export const siteImages = {
  hero: "/img/hero.png",
  stemLabs: "/img/stem-labs.png",
  stemLabsInteractive: "/img/stem-labs-interactive.png",
  anatomyLab: "/img/human_anatomy.png",
  anatomyClassroom: "/img/anatomy-classroom.png",
  arMarkerBased: "/img/ar-marker-based.png",
  arWebarHeart: "/img/ar-webar-heart.png",
  arMarkerlessJet: "/img/ar-markerless-jet.png",
  arMarkerlessWeb: "/img/ar-markerless-web.png",
  arEngineExploded: "/img/ar-engine-exploded.png",
  vrSpaceStation: "/img/vr-space-station.png",
  vrIssExplore: "/img/vr-iss-explore.png",
  audience3dLearning: "/img/audience-3d-learning.png",
  audienceExploreLearn: "/img/audience-explore-learn.png",
  audienceClassroom: "/img/audience-classroom.png",
  heartView: "/img/heart_view.png",
} as const;

export type SiteImageKey = keyof typeof siteImages;
