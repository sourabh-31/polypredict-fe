export type Market = {
  id: string;
  question: string;
  groupItemTitle?: string;
  outcomes: string;
  outcomePrices: string;
  volume: number;
};

// Custom type extending market to have selected side for preselecting the button in the modal
export type MarketWithSide = Market & {
  selectedSide: "Yes" | "No";
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  image: string;
  description?: string;
  startDate: string;
  endDate: string;
  volume: number;
  active: boolean;
  closed: boolean;
  markets: Market[];
};

export type EventsResponse = Event[];
