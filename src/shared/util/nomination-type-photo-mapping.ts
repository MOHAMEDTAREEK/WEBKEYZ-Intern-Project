import { NominationType } from "../enums/nomination.type.enum";

const nominationTypePhotos: Record<NominationType, string> = {
  [NominationType.BestEmployee]: "https://example.com/photos/best_employee.jpg",

  [NominationType.BestTeam]: "https://example.com/photos/best_team.jpg",
};

export function getNominationTypePhoto(nominationType: NominationType): string {
  return nominationTypePhotos[nominationType];
}
