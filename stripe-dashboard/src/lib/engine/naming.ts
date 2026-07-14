import type { Rng } from "./prng";

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Lucas",
  "Isabella", "Mason", "Mia", "Logan", "Charlotte", "James", "Amelia",
  "Benjamin", "Harper", "Jacob", "Evelyn", "Michael", "Léa", "Hugo",
  "Chloé", "Louis", "Manon", "Jules", "Camille", "Arthur", "Inès", "Gabriel",
  "Marta", "Diego", "Lucia", "Pablo", "Sofia", "Marco", "Giulia", "Luca",
  "Anna", "Felix", "Clara", "Jonas", "Freya", "Oscar", "Elin", "Lars",
] as const;

const LAST_NAMES = [
  "Smith", "Johnson", "Brown", "Taylor", "Anderson", "Thomas", "Jackson",
  "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson",
  "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Dubois", "Moreau",
  "Laurent", "Simon", "Michel", "Leroy", "Roux", "David", "Bertrand", "Morel",
  "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo",
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner",
  "Andersson", "Johansson", "Karlsson", "Nilsson", "van Dijk", "de Vries",
] as const;

const EMAIL_DOMAINS = [
  "gmail.com", "outlook.com", "yahoo.com", "icloud.com", "proton.me",
  "hotmail.com", "hey.com", "fastmail.com",
] as const;

const CARD_BRANDS = ["visa", "mastercard", "amex"] as const;

const FAILURE_CODES = [
  "card_declined",
  "insufficient_funds",
  "expired_card",
  "incorrect_cvc",
  "processing_error",
  "do_not_honor",
] as const;

export function fakePersonName(rng: Rng): { name: string; email: string } {
  const first = rng.pick(FIRST_NAMES);
  const last = rng.pick(LAST_NAMES);
  const name = `${first} ${last}`;
  const sep = rng.pick([".", "_", ""] as const);
  const suffix = rng.chance(0.4) ? String(rng.int(1, 99)) : "";
  const email = `${first.toLowerCase()}${sep}${last
    .toLowerCase()
    .replace(/[^a-z]/g, "")}${suffix}@${rng.pick(EMAIL_DOMAINS)}`;
  return { name, email };
}

export function fakeCardBrand(rng: Rng): string {
  return rng.weighted(
    CARD_BRANDS.map((b) => ({ b, w: b === "visa" ? 55 : b === "mastercard" ? 35 : 10 })),
    (x) => x.w,
  ).b;
}

export function fakeLast4(rng: Rng): string {
  return String(rng.int(0, 9999)).padStart(4, "0");
}

export function fakeFailureCode(rng: Rng): string {
  return rng.weighted(
    FAILURE_CODES.map((c, i) => ({ c, w: i === 0 ? 40 : i === 1 ? 25 : 10 })),
    (x) => x.w,
  ).c;
}
