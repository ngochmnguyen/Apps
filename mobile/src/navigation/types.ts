import type { Opportunity } from "../types";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type BrowseStackParamList = {
  Browse: undefined;
  OpportunityDetail: { opportunity: Opportunity };
};

export type MyTripsStackParamList = {
  MyTripsList: undefined;
  OpportunityDetail: { opportunity: Opportunity };
};

export type RootTabParamList = {
  BrowseTab: undefined;
  MyTripsTab: undefined;
  Profile: undefined;
};
