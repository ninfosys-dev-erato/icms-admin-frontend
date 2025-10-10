declare module "bikram-sambat" {
  interface DateObject {
    year: number;
    month: number;
    day: number;
  }
  
  export function daysInMonth(year: number, month: number): number;
  export function toBik(year: number, month: number, day: number): DateObject;
  export function toDev(year: number, month: number, day: number): DateObject;
  export function toBik_dev(year: number, month: number, day: number): DateObject;
  export function toBik_euro(year: number, month: number, day: number): DateObject;
  export function toBik_text(year: number, month: number, day: number): string;
  export function toGreg(year: number, month: number, day: number): DateObject;
  export function toGreg_text(year: number, month: number, day: number): string;
}