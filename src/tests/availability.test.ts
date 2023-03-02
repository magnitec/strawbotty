import { poolManager } from "../core/PoolManager";
import { AvailabilityItem, checkAvailability } from "../utils/availability";

describe("Check trading availability", () => {
  it("should return weekend as unavailable", () => {
    const weekendDate = new Date("2022-12-25");
    const freePoolAmount = 5;
    const availability = checkAvailability(weekendDate, freePoolAmount);

    expect(availability[AvailabilityItem.Weekend]).toBe(true);
  });

  it("should return NFP as unavailable", () => {
    const nfpDate = new Date("2022-01-07");
    const freePoolAmount = 5;
    const availability = checkAvailability(nfpDate, freePoolAmount);

    expect(availability[AvailabilityItem.NFP]).toBe(true);
  });

  it("should return Holiday as unavailable when given a holiday date in the US", () => {
    const holidayDate = new Date("2022-07-04T19:00:00.000");
    const freePoolAmount = 5;
    const availability = checkAvailability(holidayDate, freePoolAmount);

    expect(availability[AvailabilityItem.Holiday]).toBe(true);
  });

  it("should return Non-Trading Hour as unavailable", () => {
    const nonTradingHourDate = new Date("2022-02-01T01:00:00");
    const freePoolAmount = 5;
    const availability = checkAvailability(nonTradingHourDate, freePoolAmount);

    expect(availability[AvailabilityItem.NonTradingHour]).toBe(true);
  });

  it("should return Past Open Limit as unavailable", () => {
    const date = new Date("2022-02-01T09:00:00");
    const freePoolAmount = poolManager.getFreePoolAmount();
    const availability = checkAvailability(date, freePoolAmount);

    expect(availability[AvailabilityItem.MaxPoolReached]).toBe(true);
  });
});
