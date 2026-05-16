export interface ProgramSegment {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  personAssigned?: string;
}

export interface ServiceInfo {
  title: string;
  serviceDate: string;
  serviceTime: string;
}

export interface Theme {
  id: string;
  name: string;
  logoType: "light" | "dark";
  backgroundImage: string;
  backgroundColour: string;
  primaryForeground: string;
  primaryBackground: string;
  secondaryForeground: string;
  secondaryBackground: string;
  titleColor: string;
  paddingTop: number;
  paddingLeft: number;
  paddingRight: number;
  paddingBottom: number;
}

export const CHURCH_NAME = "Heritage of Faith";
