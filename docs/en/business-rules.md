# Eligibility rules (RN-01 to RN-10)

English companion of [`docs/discovery/regras.md`](../discovery/regras.md), the source of truth, which also has a valid and an invalid example for each rule.

The sources follow a hierarchy (ADR-0005): the regulator's rule (CVM Resolution 175, Annex II) is the floor, and a fund regulation can only tighten it or use exceptions the regulator allows. The model regulations are set in ADR-0006: the BMA FIDC Multissetorial regulation is the base, and two Solis funds (ZIG and Warehouse) add a few rules. When two sources set different numbers for the same point, the stricter one applies.

## Simulated fund parameters

| Parameter | Value |
|---|---|
| Net asset value (reference) | BRL 50,000,000.00 |
| CDI (reference) | 14.90% p.a. |
| Reference date | Date the batch is received (fixed at 2026-10-14 in the mock for reproducible tests) |
| Business days | Brazilian national holiday calendar |
| Economic group | CNPJ root (first 8 digits); a CPF is its own group |

## How a batch is evaluated

1. **Whole batch.** If the originator is not enabled (RN-10), the batch is refused with 422.
2. **Receivable rules** (RN-01, 02, 04, 05, 06, 09). Each receivable is checked against all of them. A rejection lists **every** reason, so the originator fixes everything at once.
3. **Portfolio rules** (RN-07, 08, 03). These run only for receivables that passed step 2, **in payload order**. A receivable is accepted only if the portfolio, plus the receivables already accepted in this batch, stays within limits.

A rejected receivable does not fail the batch. The batch is still received (201), and the rejections are listed at `GET /remessas/{id}/rejeicoes`.

| Rule | Topic | Scope | Rejection code | Main source |
|---|---|---|---|---|
| RN-01 | Only trade bills (*duplicatas*) are accepted | Receivable | `RN-01_UNSUPPORTED_RECEIVABLE_TYPE` | BMA 7.24 h |
| RN-02 | Receivable must not be overdue | Receivable | `RN-02_RECEIVABLE_OVERDUE` | BMA 7.25 (ii); ZIG 6.1 III |
| RN-03 | Weighted average term of the portfolio ≤ 75 business days | Portfolio | `RN-03_WEIGHTED_AVERAGE_TERM_EXCEEDED` | BMA 7.25 (iv) |
| RN-04 | Trade bill must carry the 44-digit NF-e invoice key (performed credit) | Receivable | `RN-04_MISSING_INVOICE_EVIDENCE` | BMA 7.25 (iii) |
| RN-05 | Debtor must not have a receivable more than 15 days past due with the fund | Receivable | `RN-05_DEBTOR_IN_DEFAULT` | Warehouse 6.1 II; ZIG 6.1 VI |
| RN-06 | Discount rate ≥ 120% of CDI | Receivable | `RN-06_DISCOUNT_RATE_BELOW_MINIMUM` | Warehouse 6.1 I |
| RN-07 | Exposure to a debtor's economic group ≤ 4% of NAV | Portfolio | `RN-07_DEBTOR_CONCENTRATION_EXCEEDED` | BMA 7.24 b; Annex II art. 45 |
| RN-08 | Exposure to an originator ≤ 7.5% of NAV | Portfolio | `RN-08_ASSIGNOR_CONCENTRATION_EXCEEDED` | BMA 7.24 a |
| RN-09 | The same receivable cannot be assigned twice | Receivable | `RN-09_DUPLICATE_RECEIVABLE` | Annex II art. 36 |
| RN-10 | Only active, approved originators can send batches | Batch (422) | `RN-10_ASSIGNOR_NOT_ENABLED` | ZIG 6.1 I |

## Why these rules matter to the fund

- **Concentration (RN-07, RN-08).** A fund with many debtors lives on diversification. No single default should hurt the portfolio. The regulator allows 20% per debtor; the model fund tightens it to 4%.
- **Performed credit (RN-04) and duplicates (RN-09).** These protect against "cold" trade bills, which have no real sale behind them, and against paying twice for one receivable.
- **Debtor in default (RN-05) and minimum rate (RN-06).** These keep the fund from adding exposure to debtors who already don't pay, and from buying credit that doesn't pay for its risk.
- **Originator enabled (RN-10).** The originator must be analyzed and approved before it can sell to the fund.
