import { env } from "./env-check";
import Holiday from "date-holidays";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs().utc().format();

// weekend
// nfp
// bank holiday
// volatility index
// max pool reached

// # todo:
// approaching market close
// below min equity

export enum AvailabilityItem {
  Weekend = "Weekend",
  NFP = "NFP",
  Holiday = "Holiday",
  NonTradingHour = "Non-Trading Hour",
  MaxPoolReached = "Past Open Limit",
}

interface AvailabilityChecklist {
  [AvailabilityItem.Weekend]: boolean;
  [AvailabilityItem.NFP]: boolean;
  [AvailabilityItem.Holiday]: boolean;
  [AvailabilityItem.NonTradingHour]: boolean;
  [AvailabilityItem.MaxPoolReached]: boolean;
}

export const checkAvailability = (
  date: Date,
  freePoolAmount: number,
): AvailabilityChecklist => {
  return {
    [AvailabilityItem.Weekend]: isWeekend(date),
    [AvailabilityItem.NFP]: isNFP(date),
    [AvailabilityItem.Holiday]: isHoliday(date),
    [AvailabilityItem.NonTradingHour]: isNonTradingHour(
      date,
      env.TRADING_HOUR_START,
      env.TRADING_HOUR_END,
    ),
    [AvailabilityItem.MaxPoolReached]: isMaxPoolReached(freePoolAmount),
  };
};

const isWeekend = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 6 || dayOfWeek === 0; // 6 = Saturday, 0 = Sunday

  return isWeekend;
};

const isNFP = (date: Date): boolean => {
  const todaysDay = dayjs(date).date();
  const todaysWeekday = dayjs(date).day();
  const isNFP = todaysDay <= 7 && todaysWeekday === 5;

  return isNFP;
};

const isHoliday = (date: Date) => {
  // # todo: cache
  type TCountry = "US" | "England" | "Japan" | "Australia";
  const countries: TCountry[] = ["US", "England", "Japan", "Australia"];

  const countryUTCMap: Map<TCountry, number> = new Map()
    .set("US", -5)
    .set("Japan", 9)
    .set("England", 1)
    .set("Australia", 11);

  return countries.some((country) => {
    const offset = countryUTCMap.get(country) as number;
    const localDate = dayjs(date).utc().add(offset, "hour").toDate();

    return isHolidayInCountry(localDate, country);
  });
};

const isHolidayInCountry = (localDate: Date, country: string): boolean => {
  const holidays = new Holiday(country).isHoliday(localDate);

  return (
    holidays && holidays.some((h) => h.type === "public" || h.type === "bank")
  );
};

const isNonTradingHour = (date: Date, startHour: number, endHour: number) => {
  const hour = date.getHours();
  const isOutOfRange = hour < startHour || hour >= endHour;

  return isOutOfRange;
};

const isMaxPoolReached = (freePoolAmount: number) => {
  return freePoolAmount == 0;
};
