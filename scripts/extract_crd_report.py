"""
CRD Leads Report Extractor
===========================
Converts a monthly "Report CRD_Leads (Mon'YY)" Excel workbook into a clean,
structured JSON file the dashboard can consume.

WHY ANCHOR-BASED PARSING (not fixed row numbers):
The 4 manager sheets (Gaurav, Rajesh, Shalini, Sharda) share the same section
template, but row offsets differ between sheets because Gaurav's sheet has an
extra sub-region (Delhi + East) duplicating every section block. A parser
that reads "row 9" will silently break the moment a section shifts up/down
in a future month's file. Instead, this script searches for known section
header text ("Business Planning and Control", "A/c Bucket", etc.) and reads
the table *relative to* wherever that header actually is.

SCOPE (per user's explicit instructions):
  - The "Pan India" sheet is IGNORED (it's hidden, stale-dated, and has
    #DIV/0! / #REF! errors in it).
  - Sharda's extra embedded "top accounts" table (columns Q onward) is
    IGNORED.
  - The "Incentive Qualifiers" section is IGNORED (empty in every sheet).

OUTPUT SCHEMA (see build_month_record() docstring below for full shape).

USAGE:
    python extract_crd_report.py <path_to_excel_file.xlsx> <YYYY-MM> [output_dir]

Example:
    python extract_crd_report.py "Report_CRD_Leads_June26.xlsx" 2026-06 ./data

This produces ./data/2026-06.json containing one record per the 4 manager
territories (Gaurav, Rajesh, Shalini, Sharda), each internally broken into
its sub-regions for the sections that report at sub-region granularity.
"""

import json
import sys
from pathlib import Path

import openpyxl

# ---------------------------------------------------------------------------
# Config: sheets to process, in territory display order.
# Ignoring "Pan India" entirely per requirements.
# ---------------------------------------------------------------------------
MANAGER_SHEETS = ["Gaurav", "Rajesh", "Shalini", "Sharda"]

MANAGER_TERRITORY_LABEL = {
    "Gaurav": "Delhi + East",
    "Rajesh": "North + West",
    "Shalini": "KA + KL",
    "Sharda": "West - Mumbai",
}

ANCHOR_COL = 2  # Column B, where every section header/label lives

DATA_ISSUE_VALUES = {"#DIV/0!", "#REF!", "#N/A", "#VALUE!", "#NAME?"}


def clean(value):
    """Convert Excel error strings / placeholder dashes to None; pass numbers through."""
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        if stripped in DATA_ISSUE_VALUES or stripped in ("-", "--") or stripped == "":
            return None
        return stripped
    return value


def find_rows(ws, text, col=ANCHOR_COL, max_row=None):
    """Return all row indices where `col` contains a cell matching `text` (case-insensitive,
    substring match, trimmed). Order preserved top-to-bottom."""
    max_row = max_row or ws.max_row
    hits = []
    for r in range(1, max_row + 1):
        val = ws.cell(row=r, column=col).value
        if isinstance(val, str) and text.lower().strip() in val.lower().strip():
            hits.append(r)
    return hits


def row_values(ws, row, min_col=1, max_col=14):
    return [ws.cell(row=row, column=c).value for c in range(min_col, max_col + 1)]


def is_blank_row(ws, row, min_col=2, max_col=9):
    return all(v is None for v in row_values(ws, row, min_col, max_col))


# ---------------------------------------------------------------------------
# Section extractors
# Each returns a list of dicts, one per data row found, tagged with whatever
# region label was in column B of that row.
# ---------------------------------------------------------------------------

def lakhs_to_cr(v):
    """Business Planning / A/c Bucket / Sales Quality / Productivity figures
    in the source workbook are in Rs. Lakhs, not Rs. Crore, based on
    cross-section scale analysis (see CLAUDE.md 'Units' note) -- e.g. a
    combined AOP Target of ~2,678 read as Crore would exceed PVR INOX's
    entire annual company revenue for a single month of ad-sales target
    alone, but is a plausible ~Rs. 26.78 Cr/month when read as Lakhs.
    Financial Control / Billing Challenges figures are NOT affected --
    those are already in Crore in the source file.
    CONFIRM WITH FINANCE BEFORE RELYING ON THIS if not already confirmed."""
    if v is None or isinstance(v, str):
        return v
    return v / 100


def extract_business_planning(ws):
    """Returns list of {region, aopTarget, businessConfirmed, actualRevenue,
    actualPctOfTarget, monthBeginningPct, planningGrade, controlGrade}"""
    anchors = find_rows(ws, "Business Planning and Control")
    if not anchors:
        return []
    start = anchors[0]
    # header row is the next row containing "Regions" in col B
    header_candidates = find_rows(ws, "Regions", max_row=start + 6)
    header_candidates = [r for r in header_candidates if r > start]
    if not header_candidates:
        return []
    header_row = header_candidates[0]

    results = []
    consecutive_blanks = 0
    r = header_row + 1
    while r <= ws.max_row and (r - header_row) <= 10:
        vals = row_values(ws, r, 2, 9)
        region = clean(vals[0])
        if region and vals[1] is not None:  # must have an AOP Target value to count as a real data row
            results.append({
                "region": region,
                "aopTarget": lakhs_to_cr(clean(vals[1])),
                "businessConfirmed": lakhs_to_cr(clean(vals[2])),
                "actualRevenue": lakhs_to_cr(clean(vals[3])),
                "actualPctOfTarget": clean(vals[4]),
                "monthBeginningPct": clean(vals[5]),
                "planningGrade": clean(vals[6]),
                "controlGrade": clean(vals[7]),
            })
            consecutive_blanks = 0
        else:
            consecutive_blanks += 1
            if results and consecutive_blanks >= 2:
                break
        r += 1
    return results


def extract_ac_bucket_blocks(ws):
    """A/c Bucket can appear once (single-region sheet) or twice (Gaurav's
    Delhi/East). Returns list of {region, keyGrowth:{...}, rotating:{...}}.
    Region is inferred from the nearest preceding standalone region-name row
    (used by Gaurav) or falls back to positional order for single-region sheets."""
    anchors = find_rows(ws, "A/c Bucket")
    blocks = []
    for anchor in anchors:
        # header row is anchor itself in this template (labels are in the same row)
        key_row = anchor + 1
        rot_row = anchor + 2
        key_vals = row_values(ws, key_row, 2, 9)
        rot_vals = row_values(ws, rot_row, 2, 9)

        def parse_bucket(vals):
            return {
                "division": clean(vals[1]),
                "targetIndex": clean(vals[2]),
                "pctContributionOfAop": clean(vals[3]),
                "ranking": clean(vals[4]),
                "topAccountsValue": lakhs_to_cr(clean(vals[7])),
                "achievement": clean(vals[8]) if len(vals) > 8 else None,
            }

        # look upward up to 3 rows for a standalone region-label row (col B has
        # a value, col C is empty) — this is how Gaurav's sheet marks Delhi/East
        region_label = None
        for back in range(1, 4):
            probe_row = anchor - back
            if probe_row < 1:
                break
            probe = ws.cell(row=probe_row, column=2).value
            probe_c = ws.cell(row=probe_row, column=3).value
            if isinstance(probe, str) and probe_c is None and probe.strip() not in ("", "Business Planning and Control"):
                region_label = probe.strip()
                break

        blocks.append({
            "region": region_label,  # may be None for single-region sheets; filled in by caller
            "keyGrowth": parse_bucket(key_vals),
            "rotating": parse_bucket(rot_vals),
        })
    return blocks


def extract_price_control_blocks(ws):
    """Returns list of {region, channels:[...], overallDiscountCurrent,
    discountCorrectionOverLY, controlRanking}. Gaurav's sheet has TWO such
    blocks (Delhi, East) between "Price Control/Yield Management" and
    "Sales Quality"; other sheets have one."""
    section_anchors = find_rows(ws, "Price Control/Yield Management")
    if not section_anchors:
        return []
    section_start = section_anchors[0]
    sq_anchors = find_rows(ws, "Sales Quality")
    section_end = sq_anchors[0] if sq_anchors else ws.max_row

    channel_rows = [r for r in find_rows(ws, "Channel", max_row=section_end)
                     if r > section_start]

    blocks = []
    for channel_header_row in channel_rows:
        region_row = channel_header_row - 1
        region_label = clean(ws.cell(row=region_row, column=2).value)

        actual_row = channel_header_row + 1
        discount_correction = clean(ws.cell(row=actual_row, column=11).value)
        overall_discount = clean(ws.cell(row=actual_row, column=12).value)
        ranking_row = actual_row + 1
        ranking = clean(ws.cell(row=ranking_row, column=11).value)

        channels = []
        r = channel_header_row + 2
        while r <= ws.max_row and not is_blank_row(ws, r, 2, 8):
            vals = row_values(ws, r, 2, 8)
            channel_name = clean(vals[0])
            if channel_name:
                channels.append({
                    "channel": channel_name,
                    "lyAvgDiscount": clean(vals[1]),
                    "lyClientCount": clean(vals[2]),
                    "lyContributionPct": clean(vals[3]),
                    "cmAvgDiscount": clean(vals[4]),
                    "cmClientCount": clean(vals[5]),
                    "cmContributionPct": clean(vals[6]),
                })
            r += 1
            if channel_name and channel_name.lower().startswith("overall"):
                break

        blocks.append({
            "region": region_label,
            "channels": channels,
            "discountCorrectionOverLY": discount_correction,
            "overallOfferedDiscount": overall_discount,
            "ranking": ranking,
        })
    return blocks


SALES_QUALITY_SUBSECTIONS = [
    "Off Screen",
    "Innovations",
    "Format Sponsorships",
    "IP sales Deals",
    "Zeouk box deal",
    "Brandscap deal",
]


def extract_sales_quality_blocks(ws):
    """Returns dict: {subsection_name: [{region, ly, lm, cm, ranking}, ...]}"""
    sq_anchors = find_rows(ws, "Sales Quality")
    if not sq_anchors:
        return {}
    sq_start = sq_anchors[0]
    result = {name: [] for name in SALES_QUALITY_SUBSECTIONS}

    for name in SALES_QUALITY_SUBSECTIONS:
        anchors = [r for r in find_rows(ws, name) if r > sq_start]
        if not anchors:
            continue
        header_row = anchors[0]
        r = header_row + 1
        while r <= ws.max_row and not is_blank_row(ws, r, 2, 9):
            vals = row_values(ws, r, 2, 9)
            region = clean(vals[0])
            if region:
                result[name].append({
                    "region": region,
                    "ly": lakhs_to_cr(clean(vals[1])),
                    "lm": lakhs_to_cr(clean(vals[2])),
                    "cm": lakhs_to_cr(clean(vals[3])),
                    "cmPctContribution": clean(vals[6]),
                    "ranking": clean(vals[7]),
                })
            r += 1
    return result


def extract_productivity_blocks(ws):
    """Returns list of {region, targetPerHead, targetPerHeadNational, actual,
    nationalActual, actualPct, ranking}"""
    anchors = find_rows(ws, "Productivity per head")
    blocks = []
    for anchor in anchors:
        label = ws.cell(row=anchor, column=2).value or ""
        region_label = label.split("-", 1)[-1].strip() if "-" in label else None
        data_row = anchor + 2
        vals = row_values(ws, data_row, 2, 8)
        blocks.append({
            "region": region_label,
            "targetPerHead": lakhs_to_cr(clean(vals[0])),
            "targetPerHeadNational": lakhs_to_cr(clean(vals[1])),
            "actual": lakhs_to_cr(clean(vals[2])),
            "nationalActual": lakhs_to_cr(clean(vals[4])),
            "actualPct": clean(vals[5]),
            "ranking": clean(vals[6]),
        })
    return blocks


def extract_financial_and_billing(ws):
    """Territory-level (not sub-region). The "Financial Control" section contains
    TWO tables in sequence, both headed by a row whose col B literally says
    "Region" — the 1st is YTD Income/Collection%, the 2nd is Monthly Income/
    Billing Challenges%. Neither table is reliably preceded by a named anchor
    for the 2nd one (only Gaurav's sheet has "Billing Challenge file (Monty)"),
    so we anchor on "Financial Control" and then take the 1st and 2nd "Region"
    header rows that follow it.
    Returns (financial_control, billing_challenges) — either may be None."""
    fc_anchors = find_rows(ws, "Financial Control")
    if not fc_anchors:
        return None, None
    start = fc_anchors[0]
    region_header_rows = [r for r in find_rows(ws, "Region", max_row=start + 40) if r > start]

    financial_control = None
    if len(region_header_rows) >= 1:
        data_row = region_header_rows[0] + 1
        vals = row_values(ws, data_row, 2, 6)
        financial_control = {
            "territory": clean(vals[0]),
            "ytdIncomeBilled": clean(vals[1]),
            "ytdOS": clean(vals[2]),
            "collectionPct": clean(vals[3]),
            "ranking": clean(vals[4]),
        }

    billing_challenges = None
    if len(region_header_rows) >= 2:
        data_row = region_header_rows[1] + 1
        vals = row_values(ws, data_row, 2, 6)
        billing_challenges = {
            "territory": clean(vals[0]),
            "monthlyIncomeBilled": clean(vals[1]),
            "monthlyBillingChallenges": clean(vals[2]),
            "billingChallengesPct": clean(vals[3]),
            "ranking": clean(vals[4]),
        }

    return financial_control, billing_challenges


# ---------------------------------------------------------------------------
# Assembly
# ---------------------------------------------------------------------------

def build_manager_record(ws, manager_name, month):
    bp_rows = extract_business_planning(ws)
    sub_region_names = [r["region"] for r in bp_rows]  # authoritative region list/order

    ac_blocks = extract_ac_bucket_blocks(ws)
    price_blocks = extract_price_control_blocks(ws)
    sq_blocks = extract_sales_quality_blocks(ws)
    prod_blocks = extract_productivity_blocks(ws)

    # For single-sub-region sheets, region labels are often None on ac_blocks;
    # fall back to positional matching against the business-planning region list.
    def attach_region(blocks, names):
        if len(blocks) == len(names):
            for b, n in zip(blocks, names):
                if not b.get("region"):
                    b["region"] = n
        return blocks

    ac_blocks = attach_region(ac_blocks, sub_region_names)
    price_blocks = attach_region(price_blocks, sub_region_names)
    prod_blocks = attach_region(prod_blocks, sub_region_names)

    sub_regions = []
    for i, name in enumerate(sub_region_names):
        sub_regions.append({
            "regionName": name,
            "businessPlanning": bp_rows[i] if i < len(bp_rows) else None,
            "acBucket": ac_blocks[i] if i < len(ac_blocks) else None,
            "priceControl": price_blocks[i] if i < len(price_blocks) else None,
            "productivity": prod_blocks[i] if i < len(prod_blocks) else None,
            "salesQuality": {
                sub: (sq_blocks.get(sub, [])[i] if i < len(sq_blocks.get(sub, [])) else None)
                for sub in SALES_QUALITY_SUBSECTIONS
            },
        })

    financial_control, billing_challenges = extract_financial_and_billing(ws)
    return {
        "manager": manager_name,
        "territoryLabel": MANAGER_TERRITORY_LABEL[manager_name],
        "month": month,
        "subRegions": sub_regions,
        "financialControl": financial_control,
        "billingChallenges": billing_challenges,
    }


def build_month_record(xlsx_path, month):
    """
    Top-level output shape:
    {
      "month": "2026-06",
      "territories": [
        {
          "manager": "Gaurav",
          "territoryLabel": "Delhi + East",
          "month": "2026-06",
          "subRegions": [
            {
              "regionName": "Delhi",
              "businessPlanning": {aopTarget, businessConfirmed, actualRevenue,
                                    actualPctOfTarget, monthBeginningPct,
                                    planningGrade, controlGrade},
              "acBucket": {keyGrowth: {...}, rotating: {...}},
              "priceControl": {channels: [...], discountCorrectionOverLY,
                                overallOfferedDiscount, ranking},
              "productivity": {targetPerHead, targetPerHeadNational, actual,
                                nationalActual, actualPct, ranking},
              "salesQuality": {"Off Screen": {...}, "Innovations": {...}, ...}
            },
            { "regionName": "East", ... }
          ],
          "financialControl": {territory, ytdIncomeBilled, ytdOS, collectionPct, ranking},
          "billingChallenges": {territory, monthlyIncomeBilled, monthlyBillingChallenges,
                                 billingChallengesPct, ranking}
        },
        ... (Rajesh, Shalini, Sharda)
      ]
    }
    """
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    territories = []
    warnings = []
    for manager in MANAGER_SHEETS:
        if manager not in wb.sheetnames:
            warnings.append(f"Sheet '{manager}' not found in workbook — skipped.")
            continue
        ws = wb[manager]
        record = build_manager_record(ws, manager, month)
        if not record["subRegions"]:
            warnings.append(f"No Business Planning data found for '{manager}' — check sheet layout.")
        territories.append(record)

    return {"month": month, "territories": territories}, warnings


def main():
    if len(sys.argv) < 3:
        print("Usage: python extract_crd_report.py <excel_file> <YYYY-MM> [output_dir]")
        sys.exit(1)

    xlsx_path = sys.argv[1]
    month = sys.argv[2]
    output_dir = Path(sys.argv[3]) if len(sys.argv) > 3 else Path("./data")
    output_dir.mkdir(parents=True, exist_ok=True)

    record, warnings = build_month_record(xlsx_path, month)

    out_path = output_dir / f"{month}.json"
    with open(out_path, "w") as f:
        json.dump(record, f, indent=2, default=str)

    print(f"Wrote {out_path}")
    if warnings:
        print("\nWarnings:")
        for w in warnings:
            print(f"  - {w}")
    else:
        print("No warnings.")


if __name__ == "__main__":
    main()
