export const BrandName = {
  Flipkart: "Flipkart",
  DCBBank: "DCB Bank",
  VLCC: "VLCC",
  Spencers: "Spencers",
  UnityBank: "Unity Bank",
  Tata1mg: "Tata 1mg",
  Sleepwell: "Sleepwell",
  HDFCLife: "HDFC Life",
  Farmrise: "Farmrise",
  NaturesBasket: "Natures Basket",
} as const;

export type BrandName = typeof BrandName[keyof typeof BrandName];

export type IndianCity =
  | "Mumbai"
  | "Delhi"
  | "Noida"
  | "Gurgaon"
  | "Pune"
  | "Kolkata"
  | "Bengaluru"
  | "Jaipur"
  | "Ahmedabad"
  | "Chennai";

export type UserRole = "CupShup" | "Client" | "Vendor";